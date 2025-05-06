/**
 * Robot Detail functionality for Tgen Robotics Hub
 * This script manages the robot detail page and ensures it loads robot data from localStorage
 */

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initRobotDetail();
});

/**
 * Initialize the robot detail page
 */
function initRobotDetail() {
    // Initialize the storage adapter
    if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init();
    }
    
    // Get robot slug or ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const robotSlug = urlParams.get('slug');
    const robotId = urlParams.get('id');
    
    if (!robotSlug && !robotId) {
        redirectToEncyclopedia('No robot identifier provided');
        return;
    }
    
    // Get robot data
    const robot = getRobotData(robotSlug || robotId);
    
    if (!robot) {
        redirectToEncyclopedia('Robot not found');
        return;
    }
    
    // Populate robot data
    populateRobotData(robot);
    
    // Set up tabs
    setupTabs();
    
    // Set up favorite button
    setupFavoriteButton(robot);
    
    // Set up share button
    setupShareButton(robot);
    
    // Increment view count
    incrementViewCount(robot);
}

/**
 * Set up tab functionality
 */
function setupTabs() {
    const tabs = document.querySelectorAll('.robot-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
}

/**
 * Get robot data from any available source
 */
function getRobotData(slugOrId) {
    // Try to get from window.robotsData first
    if (window.robotsData) {
        if (window.robotsData.getRobotBySlug && typeof window.robotsData.getRobotBySlug === 'function') {
            const robot = window.robotsData.getRobotBySlug(slugOrId);
            if (robot) return robot;
        }
        
        if (window.robotsData.getRobotById && typeof window.robotsData.getRobotById === 'function') {
            const robot = window.robotsData.getRobotById(slugOrId);
            if (robot) return robot;
        }
        
        // Check robots array directly
        if (window.robotsData.robots) {
            const robot = window.robotsData.robots.find(r => 
                r.slug === slugOrId || r.id === slugOrId || r.id === parseInt(slugOrId)
            );
            if (robot) return robot;
        }
    }
    
    // If not found in window.robotsData, try localStorage
    try {
        // Try direct ID first
        let data = localStorage.getItem(`robot_${slugOrId}`);
        if (data) {
            return JSON.parse(data);
        }
        
        // If not found, check all items for matching slug or ID
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('robot_')) {
                try {
                    const robotData = JSON.parse(localStorage.getItem(key));
                    if (robotData.slug === slugOrId || robotData.id === slugOrId || robotData.id === parseInt(slugOrId)) {
                        return robotData;
                    }
                } catch (e) {
                    // Ignore parse errors
                    console.error('Error parsing robot data:', e);
                }
            }
        }
    } catch (e) {
        console.error('Error accessing localStorage:', e);
    }
    
    // Robot not found
    return null;
}

/**
 * Redirect to encyclopedia with error message
 */
function redirectToEncyclopedia(message) {
    alert(message);
    window.location.href = 'encyclopedia.html';
}

/**
 * Populate the robot detail page with robot data
 */
function populateRobotData(robot) {
    // Set page title
    document.title = `${robot.name} - Tgen Robotics Hub`;
    
    // Basic info
    document.getElementById('robot-name').textContent = robot.name;
    document.getElementById('manufacturer-name').textContent = robot.manufacturer?.name || 'Unknown Manufacturer';
    document.getElementById('manufacturer-website').href = robot.manufacturer?.website || '#';
    document.getElementById('robot-summary').textContent = robot.summary || '';
    document.getElementById('year-introduced').textContent = robot.yearIntroduced || 'N/A';
    document.getElementById('view-count').textContent = robot.stats?.views || 0;
    document.getElementById('favorite-count').textContent = robot.stats?.favorites || 0;
    
    // Description
    const descElement = document.getElementById('robot-description');
    if (descElement) {
        descElement.innerHTML = robot.description || '<p>No description available.</p>';
    }
    
    // Specifications
    populateSpecifications(robot);
    
    // Related robots
    populateRelatedRobots(robot);
}

/**
 * Set up favorite button functionality
 */
function setupFavoriteButton(robot) {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) return;
    
    favoriteBtn.addEventListener('click', function() {
        // In a real application, this would send a request to the server
        // For this demo, we'll just toggle the button state
        if (this.classList.contains('favorited')) {
            this.classList.remove('favorited');
            this.innerHTML = '<i class="far fa-heart"></i><span>Add to Favorites</span>';
            
            // Decrement favorite count
            const favoriteCount = document.getElementById('favorite-count');
            if (favoriteCount) {
                const currentCount = parseInt(favoriteCount.textContent) || 0;
                favoriteCount.textContent = Math.max(0, currentCount - 1);
            }
            
            // Update robot stats in memory
            if (robot.stats) {
                robot.stats.favorites = Math.max(0, (robot.stats.favorites || 0) - 1);
                updateRobotData(robot);
            }
        } else {
            this.classList.add('favorited');
            this.innerHTML = '<i class="fas fa-heart"></i><span>Favorited</span>';
            
            // Increment favorite count
            const favoriteCount = document.getElementById('favorite-count');
            if (favoriteCount) {
                const currentCount = parseInt(favoriteCount.textContent) || 0;
                favoriteCount.textContent = currentCount + 1;
            }
            
            // Update robot stats in memory
            if (robot.stats) {
                robot.stats.favorites = (robot.stats.favorites || 0) + 1;
                updateRobotData(robot);
            }
        }
    });
}

/**
 * Set up share button functionality
 */
function setupShareButton(robot) {
    const shareBtn = document.getElementById('share-btn');
    if (!shareBtn) return;
    
    shareBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: robot.name,
                text: robot.summary,
                url: window.location.href
            })
            .catch(error => console.error('Error sharing:', error));
        } else {
            // Fallback for browsers that don't support the Web Share API
            prompt('Copy this URL to share:', window.location.href);
        }
    });
}

/**
 * Increment view count for the robot
 */
function incrementViewCount(robot) {
    // Update view count in memory
    if (robot.stats) {
        robot.stats.views = (robot.stats.views || 0) + 1;
        
        // Update the view counter in the UI
        const viewCount = document.getElementById('view-count');
        if (viewCount) {
            viewCount.textContent = robot.stats.views;
        }
        
        // Update robot data in storage
        updateRobotData(robot);
    }
}

/**
 * Update robot data in storage
 */
function updateRobotData(robot) {
    // Save using the storage adapter if available
    if (window.robotStorage && window.robotStorage.updateRobotAndSave) {
        window.robotStorage.updateRobotAndSave(robot.id, robot);
    } else {
        // Save directly to localStorage
        try {
            localStorage.setItem(`robot_${robot.id}`, JSON.stringify(robot));
        } catch (e) {
            console.error('Error saving robot data:', e);
        }
    }
}

/**
 * Populate the specifications tab
 */
function populateSpecifications(robot) {
    const specs = robot.specifications || {};
    
    // Physical specifications
    const physicalSpecs = document.getElementById('physical-specs');
    if (physicalSpecs) {
        physicalSpecs.innerHTML = '';
        
        if (specs.physical) {
            // Height
            if (specs.physical.height && specs.physical.height.value) {
                addSpecCard(physicalSpecs, 'Height', specs.physical.height.value, specs.physical.height.unit, 'fas fa-arrows-alt-v');
            }
            
            // Weight
            if (specs.physical.weight && specs.physical.weight.value) {
                addSpecCard(physicalSpecs, 'Weight', specs.physical.weight.value, specs.physical.weight.unit, 'fas fa-weight-hanging');
            }
            
            // Payload
            if (specs.physical.payload && specs.physical.payload.value) {
                addSpecCard(physicalSpecs, 'Payload Capacity', specs.physical.payload.value, specs.physical.payload.unit, 'fas fa-box');
            }
            
            // Max deadlift
            if (specs.physical.maxDeadlift && specs.physical.maxDeadlift.value) {
                addSpecCard(physicalSpecs, 'Maximum Deadlift', specs.physical.maxDeadlift.value, specs.physical.maxDeadlift.unit, 'fas fa-dumbbell');
            }
        }
        
        // If no physical specs, hide the section
        const physicalSection = physicalSpecs.closest('.spec-section');
        if (physicalSection) {
            physicalSection.style.display = physicalSpecs.innerHTML === '' ? 'none' : 'block';
        }
    }
    
    // Performance specifications
    const performanceSpecs = document.getElementById('performance-specs');
    if (performanceSpecs) {
        performanceSpecs.innerHTML = '';
        
        if (specs.performance) {
            // Battery runtime
            if (specs.performance.battery && specs.performance.battery.runtime) {
                addSpecCard(performanceSpecs, 'Battery Runtime', specs.performance.battery.runtime, 'minutes', 'fas fa-battery-full');
            }
            
            // Maximum speed
            if (specs.performance.speed && specs.performance.speed.value) {
                addSpecCard(performanceSpecs, 'Maximum Speed', specs.performance.speed.value, specs.performance.speed.unit, 'fas fa-tachometer-alt');
            }
            
            // Degrees of freedom
            if (specs.performance.degreesOfFreedom) {
                addSpecCard(performanceSpecs, 'Degrees of Freedom', specs.performance.degreesOfFreedom, '', 'fas fa-sync');
            }
        }
        
        // If no performance specs, hide the section
        const performanceSection = performanceSpecs.closest('.spec-section');
        if (performanceSection) {
            performanceSection.style.display = performanceSpecs.innerHTML === '' ? 'none' : 'block';
        }
    }
    
    // Hardware specifications
    const hardwareSpecs = document.getElementById('hardware-specs');
    if (hardwareSpecs) {
        hardwareSpecs.innerHTML = '';
        
        // Sensors
        if (specs.sensors && specs.sensors.length > 0) {
            const sensorTypes = specs.sensors.map(sensor => sensor.type).join(', ');
            addSpecCard(hardwareSpecs, 'Sensors', sensorTypes, '', 'fas fa-eye');
        }
        
        // Connectivity
        if (specs.connectivity && specs.connectivity.length > 0) {
            const connectivityTypes = Array.isArray(specs.connectivity) 
                ? specs.connectivity.join(', ')
                : specs.connectivity;
            addSpecCard(hardwareSpecs, 'Connectivity', connectivityTypes, '', 'fas fa-wifi');
        }
        
        // If no hardware specs, hide the section
        const hardwareSection = hardwareSpecs.closest('.spec-section');
        if (hardwareSection) {
            hardwareSection.style.display = hardwareSpecs.innerHTML === '' ? 'none' : 'block';
        }
    }
    
    // Custom specifications
    const customSpecs = document.getElementById('custom-specs');
    const customSpecsSection = document.getElementById('custom-specs-section');
    
    if (customSpecs && customSpecsSection) {
        customSpecs.innerHTML = '';
        
        if (specs.customFields && specs.customFields.length > 0) {
            specs.customFields.forEach(field => {
                addSpecCard(customSpecs, field.name, field.value, field.unit, 'fas fa-cog');
            });
            
            customSpecsSection.style.display = 'block';
        } else {
            customSpecsSection.style.display = 'none';
        }
    }
}

/**
 * Add a specification card to the container
 */
function addSpecCard(container, title, value, unit, iconClass) {
    const card = document.createElement('div');
    card.className = 'spec-card';
    
    card.innerHTML = `
        <div class="spec-title">
            <i class="${iconClass}"></i>
            <span>${title}</span>
        </div>
        <div class="spec-value">${value}</div>
        ${unit ? `<div class="spec-unit">${unit}</div>` : ''}
    `;
    
    container.appendChild(card);
}

/**
 * Populate the related robots section
 */
function populateRelatedRobots(robot) {
    const relatedRobotsGrid = document.getElementById('related-robots-grid');
    if (!relatedRobotsGrid) return;
    
    relatedRobotsGrid.innerHTML = '';
    
    // Get related robots from window.robotsData helper if available
    let relatedRobots = [];
    if (window.robotsData && window.robotsData.getRelatedRobots) {
        relatedRobots = window.robotsData.getRelatedRobots(robot.id, 3);
    } else {
        // Simple implementation to get related robots
        relatedRobots = getRelatedRobotsManually(robot);
    }
    
    if (relatedRobots.length > 0) {
        relatedRobots.forEach(relatedRobot => {
            const robotCard = createRelatedRobotCard(relatedRobot);
            relatedRobotsGrid.appendChild(robotCard);
        });
    } else {
        // Hide the related robots section if none are available
        const relatedSection = relatedRobotsGrid.closest('.related-robots-section');
        if (relatedSection) {
            relatedSection.style.display = 'none';
        }
    }
}

/**
 * Manual implementation to get related robots
 */
function getRelatedRobotsManually(robot) {
    const relatedRobots = [];
    
    // Get all robots from all available sources
    let allRobots = [];
    
    // From window.robotsData
    if (window.robotsData && window.robotsData.robots) {
        allRobots = [...window.robotsData.robots];
    }
    
    // From localStorage
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('robot_')) {
                try {
                    const robotData = JSON.parse(localStorage.getItem(key));
                    
                    // Check if this robot is already in the array (avoid duplicates)
                    const exists = allRobots.some(r => 
                        r.id === robotData.id || r.slug === robotData.slug
                    );
                    
                    if (!exists) {
                        allRobots.push(robotData);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        }
    } catch (e) {
        console.error('Error accessing localStorage:', e);
    }
    
    // Filter out the current robot
    allRobots = allRobots.filter(r => r.id !== robot.id && r.slug !== robot.slug);
    
    // Sort by relevance: same manufacturer first, then random
    allRobots.sort((a, b) => {
        const aIsSameManufacturer = a.manufacturer?.name === robot.manufacturer?.name;
        const bIsSameManufacturer = b.manufacturer?.name === robot.manufacturer?.name;
        
        if (aIsSameManufacturer && !bIsSameManufacturer) {
            return -1;
        } else if (!aIsSameManufacturer && bIsSameManufacturer) {
            return 1;
        } else {
            return Math.random() - 0.5; // Random sort for remaining robots
        }
    });
    
    // Return top 3 related robots
    return allRobots.slice(0, 3);
}

/**
 * Create a robot card for related robots
 */
function createRelatedRobotCard(robot) {
    const card = document.createElement('div');
    card.className = 'robot-card';
    card.dataset.slug = robot.slug;
    
    // Use appropriate image url from different possible sources
    let imageUrl = 'images/robot-placeholder.jpg';
    if (robot.media) {
        if (robot.media.featuredImage && robot.media.featuredImage.url) {
            imageUrl = robot.media.featuredImage.url;
        } else if (robot.media.mainImage && robot.media.mainImage.url) {
            imageUrl = robot.media.mainImage.url;
        } else if (robot.media.images && robot.media.images.length > 0) {
            imageUrl = robot.media.images[0].url;
        }
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${robot.media?.featuredImage?.alt || robot.name}" class="robot-image">
        <div class="robot-content">
            <h3 class="robot-title">${robot.name}</h3>
            <p class="robot-desc">${robot.summary}</p>
            <div class="robot-meta">
                <span>${robot.manufacturer?.name || 'Unknown Manufacturer'}</span>
            </div>
        </div>
    `;
    
    // Add click event to navigate to robot detail page
    card.addEventListener('click', () => {
        // Use slug if available, otherwise use ID
        const identifier = robot.slug || robot.id;
        window.location.href = `robot-detail.html?slug=${identifier}`;
    });
    
    return card;
}
