/**
 * Encyclopedia functionality for Tgen Robotics Hub
 * This script manages the encyclopedia page and ensures it loads robots from localStorage
 */

// Initialize the encyclopedia when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Encyclopedia.js: Initializing encyclopedia page');
    initEncyclopedia();
});

/**
 * Initialize the encyclopedia page
 */
function initEncyclopedia() {
    // Initialize the storage adapter
    if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init();
    } else {
        console.warn('Encyclopedia.js: Robot storage adapter not found or init function missing');
        // If robotStorage is not available, make sure robotsData exists
        ensureRobotsDataExists();
    }
    
    // Load robots
    loadRobots();
    
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
            }
        };
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
    
    // Get robots from localStorage only (not from the default example data)
    let robots = getRobotsFromStorage();
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
}

/**
 * Get robots from localStorage only, ignoring the default example robots
 */
function getRobotsFromStorage() {
    let robots = [];
    
    // Get robots directly from localStorage
    try {
        // Look in the main storage key
        const mainStorage = localStorage.getItem('tgen_robotics_data');
        if (mainStorage) {
            try {
                const data = JSON.parse(mainStorage);
                if (data.robots && Array.isArray(data.robots)) {
                    console.log('Encyclopedia.js: Found', data.robots.length, 'robots in localStorage main storage');
                    
                    // Use only robots from localStorage, skipping default examples
                    robots = [...data.robots];
                }
            } catch (e) {
                console.error('Encyclopedia.js: Error parsing main storage:', e);
            }
        }
        
        // Also check legacy individual robot entries
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('robot_')) {
                try {
                    const robotData = JSON.parse(localStorage.getItem(key));
                    
                    // Check if this robot is already in the array (avoid duplicates)
                    const exists = robots.some(robot => 
                        robot.id === robotData.id || robot.slug === robotData.slug
                    );
                    
                    if (!exists) {
                        robots.push(robotData);
                    }
                } catch (e) {
                    // Ignore parse errors
                    console.error('Encyclopedia.js: Error parsing robot data:', e);
                }
            }
        }
    } catch (e) {
        console.error('Encyclopedia.js: Error accessing localStorage:', e);
    }
    
    return robots;
}

/**
 * Create a robot card element
 */
function createRobotCard(robot) {
    const card = document.createElement('div');
    card.className = 'robot-card';
    card.dataset.slug = robot.slug;
    card.dataset.id = robot.id;
    
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
        <img src="${imageUrl}" alt="${robot.media?.featuredImage?.alt || robot.name}" class="robot-image" onerror="this.src='images/robot-placeholder.jpg'">
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
