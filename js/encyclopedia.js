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
    
    // Get robots from localStorage (added through admin interface and default robots)
    let robots = [];
    if (window.robotsData && window.robotsData.robots) {
        robots = window.robotsData.robots;
    }
    
    // Show all robots or filter only for published ones if implemented
    // MODIFIED: Removed the filter to show all robots to all users
    // robots = robots.filter(robot => robot.status === 'published');
    
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
 * Create a robot card element
 */
function createRobotCard(robot) {
    const card = document.createElement('div');
    card.className = 'robot-card';
    card.dataset.slug = robot.slug;
    
    // Use a placeholder image if no featured image is available
    const imageUrl = robot.media?.featuredImage?.url || 'images/robot-placeholder.jpg';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${robot.media?.featuredImage?.alt || robot.name}" class="robot-image">
        <div class="robot-content">
            <h3 class="robot-title">${robot.name}</h3>
            <p class="robot-desc">${robot.summary}</p>
            <div class="robot-meta">
                <span>${robot.manufacturer.name}</span>
            </div>
        </div>
    `;
    
    // Add click event to navigate to robot detail page
    card.addEventListener('click', () => {
        window.location.href = `robot-detail.html?slug=${robot.slug}`;
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
