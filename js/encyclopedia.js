/**
 * Encyclopedia functionality for Tgen Robotics Hub
 * This script manages the encyclopedia page and ensures it loads robots from localStorage
 */

// Clear localStorage data on encyclopedia page load to ensure no old robots are displayed
localStorage.removeItem('tgen_robotics_data');

// Initialize the encyclopedia when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Encyclopedia.js: Initializing encyclopedia page');
    
    // Force clear any example robots that might be in memory
    if (window.robotsData) {
        window.robotsData.robots = [];
    }
    
    initEncyclopedia();
});

/**
 * Initialize the encyclopedia page
 */
function initEncyclopedia() {
    // Initialize the storage adapter
    if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init().then(() => {
            loadRobots();
        });
    } else {
        console.warn('Encyclopedia.js: Robot storage adapter not found or init function missing');
        // If robotStorage is not available, make sure robotsData exists
        ensureRobotsDataExists();
        loadRobots();
    }
    
    // Set up search functionality
    const searchInput = document.getElementById('robot-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterRobots, 300));
    }
    
    // Reset filters button
    const resetButton = document.getElementById('reset-filters');
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }
}

/**
 * Ensure robotsData exists even if data.js is not loaded
 */
function ensureRobotsDataExists() {
    if (!window.robotsData) {
        console.log('Encyclopedia.js: Creating default robotsData object');
        window.robotsData = {
            robots: [],
            categories: [],
            lastUpdated: new Date().toISOString(),
            
            getRobotBySlug: function(slug) {
                return this.robots.find(robot => robot.slug === slug);
            },
            
            getRobotById: function(id) {
                const numId = parseInt(id);
                return this.robots.find(robot => 
                    robot.id === numId || robot.id === id || robot.slug === id
                );
            },
            
            getRelatedRobots: function(id, limit = 3) {
                const robot = this.getRobotById(id);
                if (!robot) return [];
                
                return this.robots
                    .filter(r => r.id !== id && (
                        r.manufacturer?.name === robot.manufacturer?.name
                    ))
                    .sort(() => Math.random() - 0.5)
                    .slice(0, limit);
            },
            
            clearRobots: function() {
                this.robots = [];
                console.log("Cleared all robots from memory");
                return true;
            }
        };
    } else {
        // Ensure robots is an empty array
        window.robotsData.robots = [];
    }
}

/**
 * Load robots from storage and display them
 */
function loadRobots() {
    const robotGrid = document.getElementById('robot-grid');
    if (!robotGrid) return;
    
    // Clear loading spinner
    robotGrid.innerHTML = '';
    
    // Get robots from GitHub/localStorage through the robotsData object
    // This ensures we're using the same source of data across the site
    let robots = window.robotsData.robots || [];
    console.log('Encyclopedia.js: Loaded', robots.length, 'robots');
    
    // No robots available
    if (robots.length === 0) {
        document.getElementById('empty-state').style.display = 'block';
        return;
    }
    
    // Sort robots by name
    robots.sort((a, b) => a.name.localeCompare(b.name));
    
    // Add robot cards to the grid
    robots.forEach(robot => {
        const robotCard = createRobotCard(robot);
        robotGrid.appendChild(robotCard);
    });
    
    // Hide empty state
    document.getElementById('empty-state').style.display = 'none';
}

/**
 * Create a robot card element
 */
function createRobotCard(robot) {
    const card = document.createElement('div');
    card.className = 'robot-card';
    card.dataset.slug = robot.slug;
    card.dataset.id = robot.id;
    
    // Use robotMedia handler to get the appropriate image URL if available
    let imageUrl = 'images/robots/robot-placeholder.jpg';
    
    if (window.robotMedia && typeof window.robotMedia.getImageUrl === 'function') {
        imageUrl = window.robotMedia.getImageUrl(robot);
    } else if (robot.media) {
        // Fallback if robotMedia is not available
        if (robot.media.featuredImage && robot.media.featuredImage.url) {
            imageUrl = robot.media.featuredImage.url;
        } else if (robot.media.mainImage && robot.media.mainImage.url) {
            imageUrl = robot.media.mainImage.url;
        } else if (robot.media.images && robot.media.images.length > 0) {
            imageUrl = robot.media.images[0].url;
        }
    }
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${robot.media?.featuredImage?.alt || robot.name}" class="robot-image" onerror="if(window.robotMedia){window.robotMedia.handleImageError(this);}else{this.src='images/robots/robot-placeholder.jpg';}">
        <div class="robot-content">
            <h3 class="robot-title">${robot.name || 'Unnamed Robot'}</h3>
            <p class="robot-desc">${robot.summary || 'No description available.'}</p>
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

/**
 * Filter robots based on search input
 */
function filterRobots() {
    const searchValue = document.getElementById('robot-search').value.toLowerCase();
    
    const robotCards = document.querySelectorAll('.robot-card');
    let visibleCount = 0;
    
    robotCards.forEach(card => {
        const robotName = card.querySelector('.robot-title').textContent.toLowerCase();
        const robotDesc = card.querySelector('.robot-desc').textContent.toLowerCase();
        const manufacturer = card.querySelector('.robot-meta span').textContent.toLowerCase();
        
        // Check if robot matches search
        const matchesSearch = searchValue === '' || 
                              robotName.includes(searchValue) || 
                              robotDesc.includes(searchValue) || 
                              manufacturer.includes(searchValue);
        
        // Show or hide based on filters
        if (matchesSearch) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show empty state if no robots match filters
    document.getElementById('empty-state').style.display = visibleCount === 0 ? 'block' : 'none';
}

/**
 * Reset all filters
 */
function resetFilters() {
    document.getElementById('robot-search').value = '';
    
    const robotCards = document.querySelectorAll('.robot-card');
    robotCards.forEach(card => {
        card.style.display = 'block';
    });
    
    document.getElementById('empty-state').style.display = 'none';
}

/**
 * Utility function to prevent excessive function calls
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}
