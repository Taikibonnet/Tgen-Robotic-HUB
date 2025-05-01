// admin-dashboard.js - Main controller for the admin dashboard
// Handles section switching and displays overview statistics

// Dashboard sections and their corresponding content IDs
const DASHBOARD_SECTIONS = {
    dashboard: 'dashboard-content',
    robots: 'robots-content',
    news: 'news-content',
    categories: 'categories-content',
    users: 'users-content',
    media: 'media-content',
    settings: 'settings-content'
};

// Current active section
let currentSection = 'dashboard';

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Initialize data manager
    if (typeof DataManager === 'undefined') {
        console.error('DataManager not found. Make sure data-manager.js is loaded first.');
        return;
    }
    
    // Set up section switching
    setupSectionNavigation();
    
    // Load initial dashboard stats
    loadDashboardStats();
    
    // Check URL parameters for section selection
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    if (section && DASHBOARD_SECTIONS[section]) {
        switchToSection(section);
    } else {
        // Default to dashboard overview
        switchToSection('dashboard');
    }
});

// Set up navigation between sections
function setupSectionNavigation() {
    // Get all sidebar menu items
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    
    // Add click handler to each menu item
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get section from data attribute or href
            const section = item.dataset.section || item.getAttribute('href').replace(/^.*#/, '');
            
            // Switch to the selected section
            if (DASHBOARD_SECTIONS[section]) {
                switchToSection(section);
                
                // Update URL without reload
                const newUrl = window.location.pathname + '?section=' + section;
                window.history.pushState({ path: newUrl }, '', newUrl);
            }
        });
    });
}

// Switch to the specified dashboard section
function switchToSection(section) {
    if (!DASHBOARD_SECTIONS[section]) {
        console.error(`Section "${section}" not found`);
        return;
    }
    
    // Update current section
    currentSection = section;
    
    // Hide all section contents
    Object.values(DASHBOARD_SECTIONS).forEach(contentId => {
        const contentElement = document.getElementById(contentId);
        if (contentElement) {
            contentElement.style.display = 'none';
        }
    });
    
    // Show selected section content
    const selectedContent = document.getElementById(DASHBOARD_SECTIONS[section]);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Update active class on menu items
    document.querySelectorAll('.sidebar-menu a').forEach(item => {
        item.classList.remove('active');
        
        const itemSection = item.dataset.section || item.getAttribute('href').replace(/^.*#/, '');
        if (itemSection === section) {
            item.classList.add('active');
        }
    });
    
    // Update page title based on section
    document.querySelector('.page-title').textContent = capitalizeFirstLetter(section);
    
    // Load section-specific content
    loadSectionContent(section);
}

// Load content for the specified section
function loadSectionContent(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardStats();
            break;
            
        case 'robots':
            // Robot management is handled by robot-management-enhanced.js
            break;
            
        case 'news':
            loadNewsContent();
            break;
            
        case 'categories':
            loadCategoriesContent();
            break;
            
        case 'users':
            loadUsersContent();
            break;
            
        case 'media':
            loadMediaContent();
            break;
            
        case 'settings':
            loadSettingsContent();
            break;
    }
}

// Load dashboard overview statistics
function loadDashboardStats() {
    // Get stats container
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    // Clear existing stats
    statsGrid.innerHTML = '';
    
    // Get all robots
    const robots = DataManager.getAllRobots();
    
    // Calculate stats
    const totalRobots = robots.length;
    const publishedRobots = robots.filter(robot => robot.status === 'published').length;
    const draftRobots = robots.filter(robot => robot.status === 'draft').length;
    const archivedRobots = robots.filter(robot => robot.status === 'archived').length;
    
    // Calculate total views
    const totalViews = robots.reduce((sum, robot) => sum + (robot.stats?.views || 0), 0);
    
    // Calculate total favorites
    const totalFavorites = robots.reduce((sum, robot) => sum + (robot.stats?.favorites || 0), 0);
    
    // Get categories
    const categories = [...new Set(robots.flatMap(robot => robot.categories || []))];
    const totalCategories = categories.length;
    
    // Get manufacturers
    const manufacturers = [...new Set(robots.map(robot => robot.manufacturer?.name).filter(name => name))];
    const totalManufacturers = manufacturers.length;
    
    // Sample data for demonstration
    const todayDate = new Date().toLocaleDateString();
    
    // Create stat cards
    const stats = [
        {
            title: 'Total Robots',
            value: totalRobots,
            change: '+2 from last week',
            changeType: 'up'
        },
        {
            title: 'Published Robots',
            value: publishedRobots,
            change: publishedRobots > 0 ? `${Math.round(publishedRobots / totalRobots * 100)}% of total` : 'No published robots',
            changeType: 'info'
        },
        {
            title: 'Total Views',
            value: totalViews,
            change: '+15% from last month',
            changeType: 'up'
        },
        {
            title: 'Total Categories',
            value: totalCategories,
            change: 'Across all robots',
            changeType: 'info'
        },
        {
            title: 'Total Manufacturers',
            value: totalManufacturers,
            change: 'Represented in database',
            changeType: 'info'
        },
        {
            title: 'User Favorites',
            value: totalFavorites,
            change: '+5 this week',
            changeType: 'up'
        }
    ];
    
    // Add stat cards to grid
    stats.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        
        statCard.innerHTML = `
            <div class="stat-title">${stat.title}</div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-change ${stat.changeType === 'up' ? 'stat-up' : stat.changeType === 'down' ? 'stat-down' : ''}">
                ${stat.changeType === 'up' ? '↑' : stat.changeType === 'down' ? '↓' : ''} ${stat.change}
            </div>
        `;
        
        statsGrid.appendChild(statCard);
    });
    
    // Recent activity cards
    loadRecentActivity();
}

// Load recent activity for dashboard
function loadRecentActivity() {
    const recentActivityContainer = document.getElementById('recent-activity');
    if (!recentActivityContainer) return;
    
    // Get robots sorted by updated date
    const robots = DataManager.getAllRobots();
    const sortedRobots = [...robots].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
    });
    
    // Take recent 5
    const recentRobots = sortedRobots.slice(0, 5);
    
    // Clear container
    recentActivityContainer.innerHTML = '';
    
    // Add recent activity items
    recentRobots.forEach(robot => {
        const date = new Date(robot.updatedAt || robot.createdAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Get image URL
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
        
        // Create activity item
        activityItem.innerHTML = `
            <div class="activity-image">
                <img src="${imageUrl}" alt="${robot.name}">
            </div>
            <div class="activity-content">
                <div class="activity-title">${robot.name}</div>
                <div class="activity-desc">${robot.updatedAt ? 'Updated' : 'Added'} on ${formattedDate}</div>
            </div>
            <div class="activity-actions">
                <a href="admin-robot-management.html?edit=${robot.id}" class="activity-btn" title="Edit">
                    <i class="fas fa-edit"></i>
                </a>
                <a href="robot-detail.html?slug=${robot.slug}" class="activity-btn" title="View" target="_blank">
                    <i class="fas fa-eye"></i>
                </a>
            </div>
        `;
        
        recentActivityContainer.appendChild(activityItem);
    });
    
    // If no activity, show message
    if (recentRobots.length === 0) {
        recentActivityContainer.innerHTML = `
            <div class="empty-state">
                <p>No recent activity to display.</p>
                <a href="admin-robot-management.html" class="btn btn-primary">Add Your First Robot</a>
            </div>
        `;
    }
}

// News Management
function loadNewsContent() {
    const contentContainer = document.getElementById(DASHBOARD_SECTIONS.news);
    if (!contentContainer) return;
    
    // Sample news content
    contentContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">News Articles</h2>
                <button class="btn btn-primary" id="add-news-btn">Add New Article</button>
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="news-table-body">
                    <tr>
                        <td colspan="5" class="empty-table-message">
                            <div class="empty-state">
                                <p>No news articles found.</p>
                                <button class="btn btn-primary" id="add-first-news-btn">Add Your First Article</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-news-btn')?.addEventListener('click', () => {
        alert('News management feature coming soon!');
    });
    
    document.getElementById('add-first-news-btn')?.addEventListener('click', () => {
        alert('News management feature coming soon!');
    });
}

// Categories Management
function loadCategoriesContent() {
    const contentContainer = document.getElementById(DASHBOARD_SECTIONS.categories);
    if (!contentContainer) return;
    
    // Get all categories from robots
    const robots = DataManager.getAllRobots();
    const allCategories = robots.flatMap(robot => robot.categories || []);
    
    // Count robots per category
    const categoryCount = {};
    allCategories.forEach(category => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Get unique categories
    const uniqueCategories = [...new Set(allCategories)];
    
    // Sort by count (most used first)
    uniqueCategories.sort((a, b) => categoryCount[b] - categoryCount[a]);
    
    contentContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Categories</h2>
                <button class="btn btn-primary" id="add-category-btn">Add New Category</button>
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Category Name</th>
                        <th>Robot Count</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="categories-table-body">
                    ${uniqueCategories.length > 0 ? 
                        uniqueCategories.map(category => `
                            <tr>
                                <td>${category}</td>
                                <td>${categoryCount[category]}</td>
                                <td class="table-actions">
                                    <button class="action-btn edit-category" data-category="${category}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete-category" data-category="${category}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('') : 
                        `
                            <tr>
                                <td colspan="3" class="empty-table-message">
                                    <div class="empty-state">
                                        <p>No categories found.</p>
                                        <button class="btn btn-primary" id="add-first-category-btn">Add Your First Category</button>
                                    </div>
                                </td>
                            </tr>
                        `
                    }
                </tbody>
            </table>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-category-btn')?.addEventListener('click', () => {
        openCategoryModal();
    });
    
    document.getElementById('add-first-category-btn')?.addEventListener('click', () => {
        openCategoryModal();
    });
    
    // Edit category buttons
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            openCategoryModal(category);
        });
    });
    
    // Delete category buttons
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            deleteCategory(category);
        });
    });
}

// Open category modal for add/edit
function openCategoryModal(existingCategory = null) {
    // Create modal HTML
    const modalHtml = `
        <div class="modal-overlay" id="category-modal">
            <div class="modal-container" style="max-width: 500px;">
                <div class="modal-header">
                    <h2 class="modal-title">${existingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                    <button class="modal-close" id="category-modal-close">&times;</button>
                </div>
                <form id="category-form">
                    <div class="modal-body">
                        <div class="form-group">
                            <label class="form-label" for="category-name">Category Name</label>
                            <input type="text" class="form-control" id="category-name" value="${existingCategory || ''}" required>
                        </div>
                        
                        ${existingCategory ? `
                            <div class="form-group">
                                <label class="form-label">Current Usage</label>
                                <div class="info-box">
                                    This category is used by multiple robots. Editing it will update all robots using this category.
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline" id="category-cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Category</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Add modal to document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Get modal elements
    const modal = document.getElementById('category-modal');
    const closeBtn = document.getElementById('category-modal-close');
    const cancelBtn = document.getElementById('category-cancel-btn');
    const form = document.getElementById('category-form');
    
    // Show modal
    modal.classList.add('active');
    
    // Close handlers
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const categoryName = document.getElementById('category-name').value;
        
        if (!categoryName) {
            alert('Category name is required');
            return;
        }
        
        // Process category
        if (existingCategory) {
            updateCategory(existingCategory, categoryName);
        } else {
            addCategory(categoryName);
        }
        
        // Close modal
        closeModal();
        
        // Reload categories content
        loadCategoriesContent();
    });
}

// Add a new category
function addCategory(categoryName) {
    alert(`Category "${categoryName}" would be added to the database`);
    // In a real implementation, you would add the category to a categories collection
}

// Update an existing category
function updateCategory(oldCategory, newCategory) {
    // Update category name in all robots
    const robots = DataManager.getAllRobots();
    
    robots.forEach(robot => {
        if (robot.categories && robot.categories.includes(oldCategory)) {
            const updatedCategories = robot.categories.map(cat => 
                cat === oldCategory ? newCategory : cat
            );
            
            DataManager.updateRobot(robot.id, { categories: updatedCategories });
        }
    });
    
    alert(`Category "${oldCategory}" has been updated to "${newCategory}"`);
}

// Delete a category
function deleteCategory(category) {
    const confirmed = confirm(`Are you sure you want to delete the category "${category}"? This will remove it from all robots using this category.`);
    
    if (!confirmed) return;
    
    // Remove category from all robots
    const robots = DataManager.getAllRobots();
    
    robots.forEach(robot => {
        if (robot.categories && robot.categories.includes(category)) {
            const updatedCategories = robot.categories.filter(cat => cat !== category);
            
            DataManager.updateRobot(robot.id, { categories: updatedCategories });
        }
    });
    
    alert(`Category "${category}" has been deleted`);
    
    // Reload categories content
    loadCategoriesContent();
}

// Users Management
function loadUsersContent() {
    const contentContainer = document.getElementById(DASHBOARD_SECTIONS.users);
    if (!contentContainer) return;
    
    contentContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">User Management</h2>
                <button class="btn btn-primary" id="add-user-btn">Add New User</button>
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Admin User</td>
                        <td>admin@example.com</td>
                        <td>Administrator</td>
                        <td>Today at 9:30 AM</td>
                        <td class="table-actions">
                            <button class="action-btn">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn">
                                <i class="fas fa-user-lock"></i>
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>John Smith</td>
                        <td>john@example.com</td>
                        <td>Editor</td>
                        <td>Yesterday at 3:45 PM</td>
                        <td class="table-actions">
                            <button class="action-btn">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn">
                                <i class="fas fa-user-lock"></i>
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>Sarah Johnson</td>
                        <td>sarah@example.com</td>
                        <td>Viewer</td>
                        <td>Apr 28, 2025</td>
                        <td class="table-actions">
                            <button class="action-btn">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn">
                                <i class="fas fa-user-lock"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        alert('User management feature coming soon!');
    });
}

// Media Library Management
function loadMediaContent() {
    const contentContainer = document.getElementById(DASHBOARD_SECTIONS.media);
    if (!contentContainer) return;
    
    // Get all media
    const mediaData = JSON.parse(localStorage.getItem('tgen_media') || '{}');
    const mediaItems = Object.values(mediaData);
    
    // Style for media grid
    const style = document.createElement('style');
    style.textContent = `
        .media-library-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .media-library-item {
            border-radius: 5px;
            overflow: hidden;
            background-color: var(--dark-3);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
        }
        
        .media-library-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .media-preview {
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--dark-2);
            position: relative;
        }
        
        .media-preview img {
            max-width: 100%;
            max-height: 100%;
        }
        
        .media-info {
            padding: 10px;
        }
        
        .media-title {
            font-size: 0.9rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 5px;
        }
        
        .media-meta {
            font-size: 0.8rem;
            color: var(--gray);
        }
        
        .media-actions {
            position: absolute;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .media-library-item:hover .media-actions {
            opacity: 1;
        }
        
        .media-action-btn {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .media-action-btn:hover {
            background-color: var(--primary);
        }
        
        .upload-container {
            border: 2px dashed rgba(32, 227, 178, 0.3);
            border-radius: 5px;
            padding: 30px;
            text-align: center;
            margin-top: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .upload-container:hover {
            border-color: var(--primary);
            background-color: rgba(32, 227, 178, 0.05);
        }
        
        .upload-icon {
            font-size: 3rem;
            color: var(--primary);
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
    
    contentContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Media Library</h2>
                <button class="btn btn-primary" id="upload-media-btn">Upload New</button>
            </div>
            
            <div class="upload-container" id="drag-drop-area">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <p>Drag and drop files here or click to upload</p>
                <p class="small">JPG, PNG, GIF or MP4 files</p>
                <input type="file" id="file-upload" style="display: none;" multiple accept="image/*,video/*">
            </div>
            
            <div class="media-library-grid" id="media-grid">
                ${mediaItems.length > 0 ? 
                    mediaItems.map(media => mediaItemHTML(media)).join('') : 
                    '<div class="empty-state" style="grid-column: 1/-1;"><p>No media files found.</p></div>'
                }
            </div>
        </div>
    `;
    
    // Add event listeners
    const uploadBtn = document.getElementById('upload-media-btn');
    const fileInput = document.getElementById('file-upload');
    const dragDropArea = document.getElementById('drag-drop-area');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    if (dragDropArea) {
        // Drag and drop functionality
        dragDropArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        dragDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dragDropArea.style.borderColor = var(--primary);
            dragDropArea.style.backgroundColor = 'rgba(32, 227, 178, 0.1)';
        });
        
        dragDropArea.addEventListener('dragleave', () => {
            dragDropArea.style.borderColor = 'rgba(32, 227, 178, 0.3)';
            dragDropArea.style.backgroundColor = 'transparent';
        });
        
        dragDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dragDropArea.style.borderColor = 'rgba(32, 227, 178, 0.3)';
            dragDropArea.style.backgroundColor = 'transparent';
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                handleFileUpload({ target: fileInput });
            }
        });
    }
    
    // Add event listeners for media actions
    document.querySelectorAll('.delete-media-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mediaId = btn.closest('.media-library-item').dataset.id;
            deleteMedia(mediaId);
        });
    });
    
    document.querySelectorAll('.copy-media-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const mediaId = btn.closest('.media-library-item').dataset.id;
            copyMediaId(mediaId);
        });
    });
    
    // Add click event to view media details
    document.querySelectorAll('.media-library-item').forEach(item => {
        item.addEventListener('click', () => {
            const mediaId = item.dataset.id;
            viewMediaDetails(mediaId);
        });
    });
}

// Create HTML for a media item
function mediaItemHTML(media) {
    const isImage = media.fileType.startsWith('image/');
    const fileSize = formatFileSize(estimateBase64Size(media.data));
    const uploadDate = new Date(media.uploadedAt).toLocaleDateString();
    
    return `
        <div class="media-library-item" data-id="${media.id}">
            <div class="media-preview">
                ${isImage ? 
                    `<img src="${media.data}" alt="${media.filename}">` : 
                    `<i class="fas fa-file-video" style="font-size: 3rem; color: var(--gray);"></i>`
                }
                <div class="media-actions">
                    <button class="media-action-btn copy-media-btn" title="Copy ID">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="media-action-btn delete-media-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="media-info">
                <div class="media-title">${media.filename}</div>
                <div class="media-meta">${fileSize} • ${uploadDate}</div>
            </div>
        </div>
    `;
}

// Handle file upload
function handleFileUpload(event) {
    const files = event.target.files;
    
    if (!files || files.length === 0) return;
    
    // Process each file
    Array.from(files).forEach(file => {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 5MB.`);
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const base64Data = e.target.result;
            
            // Store in DataManager
            DataManager.storeMedia(file.name, file.type, base64Data);
            
            // Reload media library
            loadMediaContent();
        };
        
        reader.readAsDataURL(file);
    });
}

// Delete media
function deleteMedia(mediaId) {
    // Check if media is being used by any robots
    const robots = DataManager.getAllRobots();
    let isUsed = false;
    let usedBy = [];
    
    robots.forEach(robot => {
        // Check featured image
        if (robot.media?.featuredImage?.mediaId === mediaId) {
            isUsed = true;
            usedBy.push(robot.name);
        }
        
        // Check additional images
        if (robot.media?.images) {
            robot.media.images.forEach(image => {
                if (image.mediaId === mediaId) {
                    isUsed = true;
                    if (!usedBy.includes(robot.name)) {
                        usedBy.push(robot.name);
                    }
                }
            });
        }
        
        // Check videos
        if (robot.media?.videos) {
            robot.media.videos.forEach(video => {
                if (video.mediaId === mediaId || video.thumbnailMediaId === mediaId) {
                    isUsed = true;
                    if (!usedBy.includes(robot.name)) {
                        usedBy.push(robot.name);
                    }
                }
            });
        }
        
        // Check applications
        if (robot.applications) {
            robot.applications.forEach(app => {
                if (app.imageMediaId === mediaId) {
                    isUsed = true;
                    if (!usedBy.includes(robot.name)) {
                        usedBy.push(robot.name);
                    }
                }
            });
        }
    });
    
    if (isUsed) {
        alert(`This media is being used by the following robots: ${usedBy.join(', ')}. Please remove it from these robots first.`);
        return;
    }
    
    const confirmed = confirm('Are you sure you want to delete this media?');
    
    if (confirmed) {
        DataManager.deleteMedia(mediaId);
        loadMediaContent();
    }
}

// Copy media ID to clipboard
function copyMediaId(mediaId) {
    navigator.clipboard.writeText(mediaId)
        .then(() => {
            showMessage('Media ID copied to clipboard', 'success');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy media ID');
        });
}

// View media details
function viewMediaDetails(mediaId) {
    const media = DataManager.getMediaById(mediaId);
    if (!media) return;
    
    const isImage = media.fileType.startsWith('image/');
    const fileSize = formatFileSize(estimateBase64Size(media.data));
    const uploadDate = new Date(media.uploadedAt).toLocaleDateString();
    
    // Create modal HTML
    const modalHtml = `
        <div class="modal-overlay" id="media-modal">
            <div class="modal-container" style="max-width: 800px;">
                <div class="modal-header">
                    <h2 class="modal-title">Media Details</h2>
                    <button class="modal-close" id="media-modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: flex; gap: 20px;">
                        <div style="flex: 1; max-width: 300px;">
                            <div style="background-color: var(--dark-3); padding: 20px; border-radius: 5px; text-align: center;">
                                ${isImage ? 
                                    `<img src="${media.data}" alt="${media.filename}" style="max-width: 100%; max-height: 300px;">` : 
                                    `<i class="fas fa-file-video" style="font-size: 5rem; color: var(--gray);"></i>`
                                }
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <h3>${media.filename}</h3>
                            <div style="margin: 15px 0;">
                                <div><strong>Type:</strong> ${media.fileType}</div>
                                <div><strong>Size:</strong> ${fileSize}</div>
                                <div><strong>Uploaded:</strong> ${uploadDate}</div>
                                <div><strong>ID:</strong> ${media.id}</div>
                            </div>
                            <button class="btn btn-primary" id="copy-media-id-btn">
                                <i class="fas fa-copy"></i> Copy Media ID
                            </button>
                            <button class="btn btn-danger" id="delete-media-btn">
                                <i class="fas fa-trash"></i> Delete Media
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to document
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer.firstElementChild);
    
    // Get modal elements
    const modal = document.getElementById('media-modal');
    const closeBtn = document.getElementById('media-modal-close');
    const copyBtn = document.getElementById('copy-media-id-btn');
    const deleteBtn = document.getElementById('delete-media-btn');
    
    // Show modal
    modal.classList.add('active');
    
    // Close handler
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        copyMediaId(mediaId);
    });
    
    // Delete button
    deleteBtn.addEventListener('click', () => {
        closeModal();
        deleteMedia(mediaId);
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Estimate base64 size
function estimateBase64Size(base64String) {
    // Remove data URL prefix if present
    const base64 = base64String.split(',')[1] || base64String;
    
    // Calculate size in bytes
    return Math.ceil((base64.length * 3) / 4);
}

// Settings Management
function loadSettingsContent() {
    const contentContainer = document.getElementById(DASHBOARD_SECTIONS.settings);
    if (!contentContainer) return;
    
    contentContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">System Settings</h2>
            </div>
            
            <form id="settings-form">
                <div class="settings-section">
                    <h3>General Settings</h3>
                    <div class="form-group">
                        <label class="form-label">Site Title</label>
                        <input type="text" class="form-control" id="site-title" value="Tgen Robotics Hub">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Site Description</label>
                        <textarea class="form-control" id="site-description">Your comprehensive guide to the world of robots: past achievements, current innovations, and future possibilities.</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Homepage Layout</label>
                        <select class="form-control" id="homepage-layout">
                            <option value="featured">Featured Robots with Hero</option>
                            <option value="grid">Full Grid Layout</option>
                            <option value="magazine">Magazine Style</option>
                        </select>
                    </div>
                    
                    <div class="settings-row">
                        <div class="form-group">
                            <label class="form-label">Items Per Page</label>
                            <input type="number" class="form-control" id="items-per-page" value="6" min="3" max="24">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Default Sort</label>
                            <select class="form-control" id="default-sort">
                                <option value="newest">Newest First</option>
                                <option value="name">Alphabetical</option>
                                <option value="popular" selected>Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Theme Settings</h3>
                    <div class="form-group">
                        <label class="form-label">Primary Color</label>
                        <input type="color" class="form-control color-input" id="primary-color" value="#20e3b2">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Secondary Color</label>
                        <input type="color" class="form-control color-input" id="secondary-color" value="#0cebeb">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Accent Color</label>
                        <input type="color" class="form-control color-input" id="accent-color" value="#ff6b6b">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Font</label>
                        <select class="form-control" id="font-family">
                            <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" selected>Segoe UI (Default)</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="'Roboto', sans-serif">Roboto</option>
                            <option value="'Open Sans', sans-serif">Open Sans</option>
                            <option value="'Montserrat', sans-serif">Montserrat</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Data Management</h3>
                    <div class="form-group">
                        <button type="button" class="btn btn-outline" id="export-data-btn">
                            <i class="fas fa-download"></i> Export All Data
                        </button>
                        <button type="button" class="btn btn-outline" id="import-data-btn">
                            <i class="fas fa-upload"></i> Import Data
                        </button>
                        <button type="button" class="btn btn-danger" id="clear-data-btn">
                            <i class="fas fa-trash"></i> Clear All Data
                        </button>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Storage Usage</label>
                        <div class="progress-bar-container">
                            <div class="progress-bar" id="storage-progress-bar"></div>
                        </div>
                        <div class="progress-info" id="storage-info"></div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                    <button type="button" class="btn btn-outline" id="reset-settings-btn">Reset to Defaults</button>
                </div>
            </form>
        </div>
    `;
    
    // Add styles for settings
    const style = document.createElement('style');
    style.textContent = `
        .settings-section {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .settings-section h3 {
            margin-bottom: 20px;
            color: var(--primary);
        }
        
        .settings-row {
            display: flex;
            gap: 20px;
        }
        
        .settings-row .form-group {
            flex: 1;
        }
        
        .color-input {
            height: 40px;
            padding: 5px;
            width: 100px;
        }
        
        .progress-bar-container {
            height: 10px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 5px;
            overflow: hidden;
            margin-bottom: 5px;
        }
        
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--secondary), var(--primary));
            border-radius: 5px;
            width: 0%;
        }
        
        .progress-info {
            font-size: 0.8rem;
            color: var(--gray);
        }
        
        .form-actions {
            margin-top: 30px;
            display: flex;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
    
    // Update storage usage
    updateStorageUsage();
    
    // Add event listeners
    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });
    
    document.getElementById('export-data-btn')?.addEventListener('click', exportData);
    document.getElementById('import-data-btn')?.addEventListener('click', importData);
    document.getElementById('clear-data-btn')?.addEventListener('click', clearAllData);
    document.getElementById('reset-settings-btn')?.addEventListener('click', resetSettings);
}

// Update storage usage
function updateStorageUsage() {
    // Calculate localStorage usage
    let totalSize = 0;
    
    // Calculate size of all localStorage items
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += localStorage[key].length * 2; // UTF-16 characters = 2 bytes
        }
    }
    
    // Format sizes
    const usedSize = formatFileSize(totalSize);
    const maxSize = formatFileSize(5 * 1024 * 1024); // 5MB typical limit
    
    // Calculate percentage
    const percentage = Math.min(100, (totalSize / (5 * 1024 * 1024)) * 100);
    
    // Update DOM
    const progressBar = document.getElementById('storage-progress-bar');
    const storageInfo = document.getElementById('storage-info');
    
    if (progressBar && storageInfo) {
        progressBar.style.width = `${percentage}%`;
        storageInfo.textContent = `Using ${usedSize} of approximately ${maxSize} (${percentage.toFixed(1)}%)`;
        
        // Add warning color if usage is high
        if (percentage > 80) {
            progressBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ffa56b)';
        }
    }
}

// Save settings
function saveSettings() {
    const settings = {
        siteTitle: document.getElementById('site-title').value,
        siteDescription: document.getElementById('site-description').value,
        homepageLayout: document.getElementById('homepage-layout').value,
        itemsPerPage: document.getElementById('items-per-page').value,
        defaultSort: document.getElementById('default-sort').value,
        primaryColor: document.getElementById('primary-color').value,
        secondaryColor: document.getElementById('secondary-color').value,
        accentColor: document.getElementById('accent-color').value,
        fontFamily: document.getElementById('font-family').value
    };
    
    // Save to localStorage
    localStorage.setItem('tgen_settings', JSON.stringify(settings));
    
    // Show success message
    showMessage('Settings saved successfully', 'success');
}

// Export all data
function exportData() {
    // Collect all data
    const exportData = {
        robots: localStorage.getItem('tgen_robots'),
        media: localStorage.getItem('tgen_media'),
        nextId: localStorage.getItem('tgen_next_id'),
        settings: localStorage.getItem('tgen_settings'),
        exportDate: new Date().toISOString()
    };
    
    // Convert to JSON
    const dataStr = JSON.stringify(exportData);
    
    // Create download link
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileName = 'tgen_robotics_hub_export_' + new Date().toISOString().slice(0, 10) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    showMessage('Data exported successfully', 'success');
}

// Import data
function importData() {
    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!importData.robots) {
                    throw new Error('Invalid import file: missing robots data');
                }
                
                // Confirm import
                const confirmed = confirm('This will replace all existing data. Are you sure you want to proceed?');
                
                if (!confirmed) return;
                
                // Import data
                if (importData.robots) localStorage.setItem('tgen_robots', importData.robots);
                if (importData.media) localStorage.setItem('tgen_media', importData.media);
                if (importData.nextId) localStorage.setItem('tgen_next_id', importData.nextId);
                if (importData.settings) localStorage.setItem('tgen_settings', importData.settings);
                
                showMessage('Data imported successfully. Reloading page...', 'success');
                
                // Reload page after a short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
                
            } catch (error) {
                console.error('Import error:', error);
                showMessage('Error importing data: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    });
    
    fileInput.click();
}

// Clear all data
function clearAllData() {
    const confirmed = confirm('This will delete ALL data including robots, media, and settings. This action cannot be undone. Are you sure?');
    
    if (!confirmed) return;
    
    // Double confirmation for safety
    const confirmText = prompt('Type "DELETE" to confirm data deletion:');
    
    if (confirmText !== 'DELETE') {
        showMessage('Data deletion cancelled', 'info');
        return;
    }
    
    // Clear all data
    localStorage.removeItem('tgen_robots');
    localStorage.removeItem('tgen_media');
    localStorage.removeItem('tgen_next_id');
    localStorage.removeItem('tgen_settings');
    
    showMessage('All data has been deleted. Reloading page...', 'success');
    
    // Reload page after a short delay
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Reset settings to defaults
function resetSettings() {
    const confirmed = confirm('This will reset all settings to their default values. Are you sure?');
    
    if (!confirmed) return;
    
    // Reset form inputs
    document.getElementById('site-title').value = 'Tgen Robotics Hub';
    document.getElementById('site-description').value = 'Your comprehensive guide to the world of robots: past achievements, current innovations, and future possibilities.';
    document.getElementById('homepage-layout').value = 'featured';
    document.getElementById('items-per-page').value = '6';
    document.getElementById('default-sort').value = 'popular';
    document.getElementById('primary-color').value = '#20e3b2';
    document.getElementById('secondary-color').value = '#0cebeb';
    document.getElementById('accent-color').value = '#ff6b6b';
    document.getElementById('font-family').value = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    
    // Save defaults
    saveSettings();
    
    showMessage('Settings reset to defaults', 'success');
}

// Show a message popup
function showMessage(message, type = 'info', duration = 3000) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-popup message-${type}`;
    messageEl.textContent = message;
    
    // Style the element
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.padding = '15px 20px';
    messageEl.style.borderRadius = '5px';
    messageEl.style.zIndex = '9999';
    messageEl.style.opacity = '0';
    messageEl.style.transition = 'opacity 0.3s ease';
    
    // Set colors based on type
    if (type === 'success') {
        messageEl.style.backgroundColor = 'rgba(32, 227, 178, 0.95)';
        messageEl.style.color = '#fff';
    } else if (type === 'error') {
        messageEl.style.backgroundColor = 'rgba(255, 107, 107, 0.95)';
        messageEl.style.color = '#fff';
    } else {
        messageEl.style.backgroundColor = 'rgba(52, 152, 219, 0.95)';
        messageEl.style.color = '#fff';
    }
    
    // Add to body
    document.body.appendChild(messageEl);
    
    // Fade in
    setTimeout(() => {
        messageEl.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, duration);
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}
