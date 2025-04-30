// encyclopedia-enhanced.js - Updated encyclopedia script that integrates with DataManager

// Initialize variables
let filteredRobots = [];
const robotsPerPage = 6;
let currentPage = 1;

// DOM Elements
const robotGrid = document.getElementById('robot-grid');
const categoryFilter = document.getElementById('category-filter');
const manufacturerFilter = document.getElementById('manufacturer-filter');
const searchFilter = document.getElementById('search-filter');
const pagination = document.getElementById('pagination');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Wait for DataManager to initialize
    if (typeof DataManager !== 'undefined') {
        // Get all robots from DataManager
        const allRobots = DataManager.getAllRobots();
        filteredRobots = [...allRobots];
        
        initFilters();
        displayRobots();
        setupEventListeners();
    } else {
        console.error('DataManager not found. Make sure data-manager.js is loaded before encyclopedia.js');
        robotGrid.innerHTML = `<div class="error-message">Error: Data management system not available.</div>`;
    }
});

// Initialize filter dropdowns with unique values from data
function initFilters() {
    const allRobots = DataManager.getAllRobots();
    
    // Get unique categories
    const allCategories = allRobots.flatMap(robot => robot.categories || []);
    const uniqueCategories = [...new Set(allCategories)].filter(category => category); // Remove empty values
    
    // Sort categories alphabetically
    uniqueCategories.sort();
    
    // Clear existing options except the first one
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Populate category filter
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Get unique manufacturers
    const uniqueManufacturers = [...new Set(allRobots.map(robot => robot.manufacturer?.name))].filter(name => name);
    
    // Sort manufacturers alphabetically
    uniqueManufacturers.sort();
    
    // Clear existing options except the first one
    while (manufacturerFilter.options.length > 1) {
        manufacturerFilter.remove(1);
    }
    
    // Populate manufacturer filter
    uniqueManufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerFilter.appendChild(option);
    });
    
    // Check URL parameters for pre-selected filters
    const urlParams = new URLSearchParams(window.location.search);
    
    // Apply category filter from URL
    const categoryParam = urlParams.get('category');
    if (categoryParam && uniqueCategories.includes(categoryParam)) {
        categoryFilter.value = categoryParam;
    }
    
    // Apply manufacturer filter from URL
    const manufacturerParam = urlParams.get('manufacturer');
    if (manufacturerParam && uniqueManufacturers.includes(manufacturerParam)) {
        manufacturerFilter.value = manufacturerParam;
    }
    
    // Apply search filter from URL
    const searchParam = urlParams.get('search');
    if (searchParam) {
        searchFilter.value = searchParam;
    }
    
    // Apply filters if any were set from URL
    if (categoryParam || manufacturerParam || searchParam) {
        applyFilters();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Filter change events
    categoryFilter.addEventListener('change', applyFilters);
    manufacturerFilter.addEventListener('change', applyFilters);
    searchFilter.addEventListener('input', debounce(applyFilters, 300));
    
    // Handle search on Enter key
    searchFilter.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Robot card click to navigate to detail page
    robotGrid.addEventListener('click', (e) => {
        const robotCard = e.target.closest('.robot-card');
        if (robotCard) {
            const robotSlug = robotCard.dataset.slug;
            window.location.href = `robot-detail.html?slug=${robotSlug}`;
        }
    });
}

// Apply filters to the robot list
function applyFilters() {
    const categoryValue = categoryFilter.value;
    const manufacturerValue = manufacturerFilter.value;
    const searchValue = searchFilter.value.toLowerCase();
    
    // Update URL with filter parameters
    const urlParams = new URLSearchParams();
    if (categoryValue) urlParams.set('category', categoryValue);
    if (manufacturerValue) urlParams.set('manufacturer', manufacturerValue);
    if (searchValue) urlParams.set('search', searchValue);
    
    // Update URL without reloading page
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    const allRobots = DataManager.getAllRobots();
    
    filteredRobots = allRobots.filter(robot => {
        // Category filter
        if (categoryValue && (!robot.categories || !robot.categories.includes(categoryValue))) {
            return false;
        }
        
        // Manufacturer filter
        if (manufacturerValue && (!robot.manufacturer || robot.manufacturer.name !== manufacturerValue)) {
            return false;
        }
        
        // Search filter
        if (searchValue) {
            const searchableText = `${robot.name || ''} ${robot.manufacturer?.name || ''} ${robot.summary || ''} ${robot.categories?.join(' ') || ''}`.toLowerCase();
            if (!searchableText.includes(searchValue)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Sort by most viewed, then by newest
    filteredRobots.sort((a, b) => {
        const viewsA = a.stats?.views || 0;
        const viewsB = b.stats?.views || 0;
        
        if (viewsB !== viewsA) {
            return viewsB - viewsA; // Sort by views (descending)
        }
        
        // If views are equal, sort by creation date (newest first)
        const dateA = new Date(a.createdAt || '2000-01-01');
        const dateB = new Date(b.createdAt || '2000-01-01');
        return dateB - dateA;
    });
    
    // Reset to first page and update display
    currentPage = 1;
    displayRobots();
    updatePagination();
}

// Display robots based on current page and filters
function displayRobots() {
    // Clear the grid
    robotGrid.innerHTML = '';
    
    // Calculate start and end index for current page
    const startIndex = (currentPage - 1) * robotsPerPage;
    const endIndex = startIndex + robotsPerPage;
    const currentRobots = filteredRobots.slice(startIndex, endIndex);
    
    // Check if no robots match filters
    if (currentRobots.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <h3>No robots found</h3>
            <p>Try adjusting your filters or search criteria.</p>
        `;
        robotGrid.appendChild(noResults);
        return;
    }
    
    // Create robot cards
    currentRobots.forEach(robot => {
        const robotCard = createRobotCard(robot);
        robotGrid.appendChild(robotCard);
    });
}

// Create a robot card element
function createRobotCard(robot) {
    const card = document.createElement('div');
    card.className = 'robot-card';
    card.dataset.slug = robot.slug;
    card.dataset.id = robot.id;
    
    // Get image URL - check for media ID first (for uploaded images)
    let imageUrl = 'images/robot-placeholder.jpg';
    
    if (robot.media && robot.media.featuredImage) {
        if (robot.media.featuredImage.mediaId) {
            const media = DataManager.getMediaById(robot.media.featuredImage.mediaId);
            if (media) {
                imageUrl = media.data;
            }
        } else if (robot.media.featuredImage.url) {
            imageUrl = robot.media.featuredImage.url;
        }
    }
    
    // Format stats
    const views = robot.stats?.views || 0;
    const displayViews = views > 999 ? (views / 1000).toFixed(1) + 'K' : views;
    
    // Get primary category
    const primaryCategory = robot.categories && robot.categories.length > 0 ? robot.categories[0] : 'Uncategorized';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${robot.name}" class="robot-image">
        <div class="robot-content">
            <h3 class="robot-title">${robot.name}</h3>
            <p class="robot-desc">${robot.summary || 'No description available.'}</p>
            <div class="robot-meta">
                <span>${robot.manufacturer?.name || 'Unknown'}</span>
                <span>${primaryCategory}</span>
                <span>${displayViews} views</span>
            </div>
        </div>
    `;
    
    return card;
}

// Update pagination based on filtered robots
function updatePagination() {
    const totalPages = Math.ceil(filteredRobots.length / robotsPerPage);
    
    // Clear pagination
    pagination.innerHTML = '';
    
    // Create page items
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('div');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.textContent = i;
        
        // Add click event
        pageItem.addEventListener('click', () => {
            currentPage = i;
            displayRobots();
            
            // Update active class
            document.querySelectorAll('.page-item').forEach(item => {
                item.classList.remove('active');
            });
            pageItem.classList.add('active');
            
            // Scroll to top of robot grid
            robotGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        pagination.appendChild(pageItem);
    }
    
    // Hide pagination if there's only one page
    pagination.style.display = totalPages <= 1 ? 'none' : 'flex';
}

// Debounce function to limit how often a function can run
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// AI Assistant functionality
document.getElementById('ai-button')?.addEventListener('click', function() {
    // In a real implementation, this would open your AI assistant interface
    alert('AI Assistant feature coming soon!');
});
