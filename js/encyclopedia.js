// encyclopedia.js - Functionality for the Robot Encyclopedia page

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
    // Load URL parameters for filters
    loadQueryParams();
    
    // Initialize filters with data
    initFilters();
    
    // Get all robots
    filteredRobots = DataManager.getAllRobots();
    
    // Apply any active filters
    applyFilters();
    
    // Display robots
    displayRobots();
    
    // Setup event listeners
    setupEventListeners();
});

// Load query parameters from URL
function loadQueryParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check for category filter
    if (urlParams.has('category')) {
        const category = urlParams.get('category');
        if (categoryFilter) categoryFilter.value = category;
    }
    
    // Check for manufacturer filter
    if (urlParams.has('manufacturer')) {
        const manufacturer = urlParams.get('manufacturer');
        if (manufacturerFilter) manufacturerFilter.value = manufacturer;
    }
    
    // Check for search query
    if (urlParams.has('search')) {
        const search = urlParams.get('search');
        if (searchFilter) searchFilter.value = search;
    }
    
    // Check for page number
    if (urlParams.has('page')) {
        const page = parseInt(urlParams.get('page'));
        if (!isNaN(page) && page > 0) {
            currentPage = page;
        }
    }
}

// Initialize filter dropdowns with unique values from data
function initFilters() {
    // Clear existing options except the first one
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    while (manufacturerFilter.options.length > 1) {
        manufacturerFilter.remove(1);
    }
    
    // Get unique categories
    const categories = DataManager.getAllCategories();
    
    // Populate category filter
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Get unique manufacturers
    const manufacturers = DataManager.getAllManufacturers();
    
    // Populate manufacturer filter
    manufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerFilter.appendChild(option);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Filter change events
    categoryFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page
        applyFilters();
        updateUrlParams();
    });
    
    manufacturerFilter.addEventListener('change', () => {
        currentPage = 1; // Reset to first page
        applyFilters();
        updateUrlParams();
    });
    
    searchFilter.addEventListener('input', debounce(() => {
        currentPage = 1; // Reset to first page
        applyFilters();
        updateUrlParams();
    }, 300));
    
    // Search on Enter key
    searchFilter.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            currentPage = 1;
            applyFilters();
            updateUrlParams();
        }
    });
    
    // Pagination click events
    pagination.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-item')) {
            currentPage = parseInt(e.target.textContent);
            displayRobots();
            updateUrlParams();
            
            // Update active page
            document.querySelectorAll('.page-item').forEach(item => {
                item.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Scroll to top of results
            window.scrollTo({
                top: document.querySelector('.main-content').offsetTop - 100,
                behavior: 'smooth'
            });
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

// Update URL parameters to reflect current filters
function updateUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set category parameter if selected
    if (categoryFilter.value) {
        urlParams.set('category', categoryFilter.value);
    } else {
        urlParams.delete('category');
    }
    
    // Set manufacturer parameter if selected
    if (manufacturerFilter.value) {
        urlParams.set('manufacturer', manufacturerFilter.value);
    } else {
        urlParams.delete('manufacturer');
    }
    
    // Set search parameter if entered
    if (searchFilter.value) {
        urlParams.set('search', searchFilter.value);
    } else {
        urlParams.delete('search');
    }
    
    // Set page parameter
    if (currentPage > 1) {
        urlParams.set('page', currentPage.toString());
    } else {
        urlParams.delete('page');
    }
    
    // Update URL without reloading the page
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.pushState({}, '', newUrl);
}

// Apply filters to the robot list
function applyFilters() {
    const categoryValue = categoryFilter.value;
    const manufacturerValue = manufacturerFilter.value;
    const searchValue = searchFilter.value.toLowerCase();
    
    let results = DataManager.getAllRobots();
    
    // Filter by status - only show published robots
    results = results.filter(robot => robot.status === 'published');
    
    // Apply category filter
    if (categoryValue) {
        results = results.filter(robot => 
            robot.categories && robot.categories.includes(categoryValue)
        );
    }
    
    // Apply manufacturer filter
    if (manufacturerValue) {
        results = results.filter(robot => 
            robot.manufacturer && robot.manufacturer.name === manufacturerValue
        );
    }
    
    // Apply search filter
    if (searchValue) {
        results = results.filter(robot => {
            const searchableText = `
                ${robot.name || ''}
                ${robot.manufacturer?.name || ''}
                ${robot.summary || ''}
                ${robot.description || ''}
                ${robot.categories ? robot.categories.join(' ') : ''}
            `.toLowerCase();
            
            return searchableText.includes(searchValue);
        });
    }
    
    // Sort by name
    results.sort((a, b) => {
        if (a.name && b.name) {
            return a.name.localeCompare(b.name);
        }
        return 0;
    });
    
    filteredRobots = results;
    
    // Reset to first page when filters change
    currentPage = 1;
    
    // Display robots and update pagination
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
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${robot.name}" class="robot-image">
        <div class="robot-content">
            <h3 class="robot-title">${robot.name}</h3>
            <p class="robot-desc">${truncateText(robot.summary || '', 120)}</p>
            <div class="robot-meta">
                <span>${robot.manufacturer ? robot.manufacturer.name : ''}</span>
                <span>${robot.categories && robot.categories.length > 0 ? robot.categories[0] : ''}</span>
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
        pagination.appendChild(pageItem);
    }
    
    // Hide pagination if there's only one page
    pagination.style.display = totalPages <= 1 ? 'none' : 'flex';
}

// Truncate text to a specific length
function truncateText(text, length = 100) {
    if (!text) return '';
    
    if (text.length <= length) {
        return text;
    }
    
    // Find the last space before the cutoff
    const lastSpace = text.substring(0, length).lastIndexOf(' ');
    const cutoff = lastSpace > 0 ? lastSpace : length;
    
    return text.substring(0, cutoff) + '...';
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
