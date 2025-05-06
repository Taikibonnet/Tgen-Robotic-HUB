/**
 * Encyclopedia functionality for Tgen Robotics Hub
 * This script manages the encyclopedia page and ensures it loads robots from localStorage
 */

// Initialize the encyclopedia when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initEncyclopedia();
});

/**
 * Initialize the encyclopedia page
 */
function initEncyclopedia() {
    // Initialize the storage adapter
    if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init();
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
 * Load robots from storage and display them
 */
function loadRobots() {
    const robotGrid = document.getElementById('robot-grid');
    if (!robotGrid) return;
    
    // Clear loading spinner
    robotGrid.innerHTML = '';
    
    // Get robots from various sources
    let robots = getAllRobots();
    
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
 * Get all robots from all available sources
 */
function getAllRobots() {
    let robots = [];
    
    // Get robots from the data.js file if available
    if (window.robotsData && window.robotsData.robots) {
        robots = [...window.robotsData.robots];
    }
    
    // Get robots directly from localStorage
    try {
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
                    console.error('Error parsing robot data:', e);
                }
            }
        }
    } catch (e) {
        console.error('Error accessing localStorage:', e);
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
