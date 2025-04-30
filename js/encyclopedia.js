// encyclopedia.js - Functionality for the Robot Encyclopedia page

// Sample robot data for demonstration
// In production, this would be fetched from your backend API
const sampleRobots = [
    {
        id: 1,
        name: "Spot",
        slug: "spot",
        manufacturer: {
            name: "Boston Dynamics",
            country: "USA"
        },
        categories: ["Industrial", "Quadruped", "Autonomous"],
        summary: "Spot is an agile mobile robot that navigates terrain with unprecedented mobility, allowing you to automate routine inspection tasks and data capture safely, accurately, and frequently.",
        media: {
            featuredImage: {
                url: "images/sample/spot.jpg",
                alt: "Boston Dynamics Spot"
            }
        },
        yearIntroduced: 2019,
        stats: {
            views: 1247
        }
    },
    {
        id: 2,
        name: "ASIMO",
        slug: "asimo",
        manufacturer: {
            name: "Honda",
            country: "Japan"
        },
        categories: ["Humanoid", "Research"],
        summary: "ASIMO, an acronym for Advanced Step in Innovative Mobility, was a humanoid robot created by Honda. Standing at 130 cm (4 ft 3 in) tall, ASIMO was seen as one of the most advanced humanoid robots in the world.",
        media: {
            featuredImage: {
                url: "images/sample/asimo.jpg",
                alt: "Honda ASIMO"
            }
        },
        yearIntroduced: 2000,
        stats: {
            views: 987
        }
    },
    {
        id: 3,
        name: "Waymo",
        slug: "waymo",
        manufacturer: {
            name: "Waymo",
            country: "USA"
        },
        categories: ["Autonomous", "Vehicle"],
        summary: "Waymo's autonomous driving technology is designed to navigate safely through complex traffic situations, making transportation more accessible and convenient.",
        media: {
            featuredImage: {
                url: "images/sample/waymo.jpg",
                alt: "Waymo Self-Driving Car"
            }
        },
        yearIntroduced: 2016,
        stats: {
            views: 756
        }
    },
    {
        id: 4,
        name: "Atlas",
        slug: "atlas",
        manufacturer: {
            name: "Boston Dynamics",
            country: "USA"
        },
        categories: ["Humanoid", "Research"],
        summary: "Atlas is the most dynamic humanoid robot, designed to navigate rough terrain and perform complex physical tasks. It can run, jump, backflip, and manipulate objects in its environment.",
        media: {
            featuredImage: {
                url: "images/sample/atlas.jpg",
                alt: "Boston Dynamics Atlas"
            }
        },
        yearIntroduced: 2013,
        stats: {
            views: 1105
        }
    },
    {
        id: 5,
        name: "ANYmal",
        slug: "anymal",
        manufacturer: {
            name: "ANYbotics",
            country: "Switzerland"
        },
        categories: ["Industrial", "Quadruped", "Autonomous"],
        summary: "ANYmal is a four-legged robot designed for autonomous inspection tasks in challenging environments. It's capable of navigating stairs, rough terrain, and tight spaces.",
        media: {
            featuredImage: {
                url: "images/sample/anymal.jpg",
                alt: "ANYbotics ANYmal"
            }
        },
        yearIntroduced: 2016,
        stats: {
            views: 642
        }
    },
    {
        id: 6,
        name: "Pepper",
        slug: "pepper",
        manufacturer: {
            name: "SoftBank Robotics",
            country: "Japan"
        },
        categories: ["Humanoid", "Service"],
        summary: "Pepper is a semi-humanoid robot designed to recognize human emotions and adapt its behavior accordingly. It's used in retail, healthcare, and hospitality to interact with customers.",
        media: {
            featuredImage: {
                url: "images/sample/pepper.jpg",
                alt: "SoftBank Robotics Pepper"
            }
        },
        yearIntroduced: 2014,
        stats: {
            views: 829
        }
    }
];

// Initialize variables
let filteredRobots = [...sampleRobots];
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
    initFilters();
    displayRobots();
    setupEventListeners();
});

// Initialize filter dropdowns with unique values from data
function initFilters() {
    // Get unique categories
    const allCategories = sampleRobots.flatMap(robot => robot.categories);
    const uniqueCategories = [...new Set(allCategories)];
    
    // Populate category filter
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Get unique manufacturers
    const uniqueManufacturers = [...new Set(sampleRobots.map(robot => robot.manufacturer.name))];
    
    // Populate manufacturer filter
    uniqueManufacturers.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer;
        option.textContent = manufacturer;
        manufacturerFilter.appendChild(option);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Filter change events
    categoryFilter.addEventListener('change', applyFilters);
    manufacturerFilter.addEventListener('change', applyFilters);
    searchFilter.addEventListener('input', debounce(applyFilters, 300));
    
    // Pagination click events
    pagination.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-item')) {
            currentPage = parseInt(e.target.textContent);
            displayRobots();
            
            // Update active page
            document.querySelectorAll('.page-item').forEach(item => {
                item.classList.remove('active');
            });
            e.target.classList.add('active');
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
    
    filteredRobots = sampleRobots.filter(robot => {
        // Category filter
        if (categoryValue && !robot.categories.includes(categoryValue)) {
            return false;
        }
        
        // Manufacturer filter
        if (manufacturerValue && robot.manufacturer.name !== manufacturerValue) {
            return false;
        }
        
        // Search filter
        if (searchValue) {
            const searchableText = `${robot.name} ${robot.manufacturer.name} ${robot.summary} ${robot.categories.join(' ')}`.toLowerCase();
            if (!searchableText.includes(searchValue)) {
                return false;
            }
        }
        
        return true;
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
    
    // Use a placeholder image if no featured image is available
    const imageUrl = robot.media.featuredImage?.url || 'images/robot-placeholder.jpg';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${robot.media.featuredImage?.alt || robot.name}" class="robot-image">
        <div class="robot-content">
            <h3 class="robot-title">${robot.name}</h3>
            <p class="robot-desc">${robot.summary}</p>
            <div class="robot-meta">
                <span>${robot.manufacturer.name}</span>
                <span>${robot.categories[0]}</span>
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
document.getElementById('ai-button').addEventListener('click', function() {
    // In a real implementation, this would open your AI assistant interface
    alert('AI Assistant feature coming soon!');
});
