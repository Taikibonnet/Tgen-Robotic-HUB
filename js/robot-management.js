// robot-management.js - Functionality for the Admin Robot Management page

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
        summary: "Spot is an agile mobile robot that navigates terrain with unprecedented mobility.",
        media: {
            featuredImage: {
                url: "images/sample/spot.jpg",
                alt: "Boston Dynamics Spot"
            }
        },
        status: "published",
        createdAt: "2025-01-15T10:30:00Z"
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
        summary: "ASIMO is one of the most advanced humanoid robots in the world.",
        media: {
            featuredImage: {
                url: "images/sample/asimo.jpg",
                alt: "Honda ASIMO"
            }
        },
        status: "published",
        createdAt: "2025-01-10T14:20:00Z"
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
        summary: "Waymo's autonomous driving technology is designed to navigate safely through complex traffic situations.",
        media: {
            featuredImage: {
                url: "images/sample/waymo.jpg",
                alt: "Waymo Self-Driving Car"
            }
        },
        status: "draft",
        createdAt: "2025-01-20T09:15:00Z"
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
        summary: "Atlas is the most dynamic humanoid robot in the world.",
        media: {
            featuredImage: {
                url: "images/sample/atlas.jpg",
                alt: "Boston Dynamics Atlas"
            }
        },
        status: "published",
        createdAt: "2025-01-05T11:45:00Z"
    },
    {
        id: 5,
        name: "Pepper",
        slug: "pepper",
        manufacturer: {
            name: "SoftBank Robotics",
            country: "Japan"
        },
        categories: ["Humanoid", "Service"],
        summary: "Pepper is designed to recognize human emotions and adapt its behavior accordingly.",
        media: {
            featuredImage: {
                url: "images/sample/pepper.jpg",
                alt: "SoftBank Robotics Pepper"
            }
        },
        status: "archived",
        createdAt: "2024-12-15T10:30:00Z"
    }
];

// DOM Elements
const robotTableBody = document.getElementById('robot-table-body');
const addRobotBtn = document.getElementById('add-robot-btn');
const robotModal = document.getElementById('robot-modal');
const modalClose = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const robotForm = document.getElementById('robot-form');
const modalTitle = document.getElementById('modal-title');

// Tab navigation
const modalTabs = document.querySelectorAll('.modal-tab');
const tabContents = document.querySelectorAll('.tab-content');

// Tags management
let categoryTags = [];
let sensorTags = [];
let connectivityTags = [];
let keywordTags = [];

// Current robot being edited (null for new robots)
let currentRobotId = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadRobotTable();
    setupEventListeners();
    setupFormElements();
});

// Load robots into the table
function loadRobotTable() {
    robotTableBody.innerHTML = '';
    
    sampleRobots.forEach(robot => {
        const row = createRobotTableRow(robot);
        robotTableBody.appendChild(row);
    });
}

// Create a table row for a robot
function createRobotTableRow(robot) {
    const row = document.createElement('tr');
    
    // Format date
    const date = new Date(robot.createdAt);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    // Use a placeholder image if no featured image is available
    const imageUrl = robot.media?.featuredImage?.url || 'images/robot-placeholder.jpg';
    
    // Status badge class
    const statusClass = `status-${robot.status}`;
    
    row.innerHTML = `
        <td><img src="${imageUrl}" alt="${robot.name}" class="robot-thumbnail"></td>
        <td>${robot.name}</td>
        <td>${robot.manufacturer.name}</td>
        <td>${robot.categories.join(', ')}</td>
        <td><span class="status-badge ${statusClass}">${capitalizeFirstLetter(robot.status)}</span></td>
        <td>${formattedDate}</td>
        <td class="robot-actions-cell">
            <div class="action-icon edit-icon" data-id="${robot.id}" title="Edit">
                <i class="fas fa-edit"></i>
            </div>
            <div class="action-icon delete-icon" data-id="${robot.id}" title="Delete">
                <i class="fas fa-trash-alt"></i>
            </div>
        </td>
    `;
    
    return row;
}

// Setup event listeners
function setupEventListeners() {
    // Add robot button
    addRobotBtn.addEventListener('click', () => {
        openRobotForm();
    });
    
    // Close modal buttons
    modalClose.addEventListener('click', closeRobotForm);
    cancelBtn.addEventListener('click', closeRobotForm);
    
    // Edit and delete buttons in the table
    robotTableBody.addEventListener('click', (e) => {
        const editIcon = e.target.closest('.edit-icon');
        const deleteIcon = e.target.closest('.delete-icon');
        
        if (editIcon) {
            const robotId = parseInt(editIcon.dataset.id);
            openRobotForm(robotId);
        }
        
        if (deleteIcon) {
            const robotId = parseInt(deleteIcon.dataset.id);
            confirmDeleteRobot(robotId);
        }
    });
    
    // Tab navigation
    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update active tab
            modalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabId}`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Form submission
    robotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveRobot();
    });
}

// Setup form input functionality
function setupFormElements() {
    // Category input
    const categoryInput = document.getElementById('category-input');
    const categoryTagsContainer = document.getElementById('category-tags');
    
    categoryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && categoryInput.value.trim()) {
            e.preventDefault();
            const category = categoryInput.value.trim();
            if (!categoryTags.includes(category)) {
                categoryTags.push(category);
                renderTags(categoryTagsContainer, categoryTags, 'category');
            }
            categoryInput.value = '';
        }
    });
    
    // Sensor input
    const sensorInput = document.getElementById('sensor-input');
    const sensorTagsContainer = document.getElementById('sensor-tags');
    
    sensorInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && sensorInput.value.trim()) {
            e.preventDefault();
            const sensor = sensorInput.value.trim();
            if (!sensorTags.includes(sensor)) {
                sensorTags.push(sensor);
                renderTags(sensorTagsContainer, sensorTags, 'sensor');
            }
            sensorInput.value = '';
        }
    });
    
    // Connectivity input
    const connectivityInput = document.getElementById('connectivity-input');
    const connectivityTagsContainer = document.getElementById('connectivity-tags');
    
    connectivityInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && connectivityInput.value.trim()) {
            e.preventDefault();
            const connectivity = connectivityInput.value.trim();
            if (!connectivityTags.includes(connectivity)) {
                connectivityTags.push(connectivity);
                renderTags(connectivityTagsContainer, connectivityTags, 'connectivity');
            }
            connectivityInput.value = '';
        }
    });
    
    // Keywords input
    const keywordsInput = document.getElementById('keywords-input');
    const keywordTagsContainer = document.getElementById('keyword-tags');
    
    keywordsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && keywordsInput.value.trim()) {
            e.preventDefault();
            const keyword = keywordsInput.value.trim();
            if (!keywordTags.includes(keyword)) {
                keywordTags.push(keyword);
                renderTags(keywordTagsContainer, keywordTags, 'keyword');
            }
            keywordsInput.value = '';
        }
    });
    
    // File uploads
    setupFileUploads();
    
    // Application management
    const addApplicationBtn = document.getElementById('add-application-btn');
    addApplicationBtn.addEventListener('click', addApplicationField);
    
    // Remove application button
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-application')) {
            e.target.closest('.application-item').remove();
            updateApplicationNumbers();
        }
    });
}

// Render tags in a container
function renderTags(container, tags, type) {
    container.innerHTML = '';
    
    tags.forEach((tag, index) => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <span class="tag-remove" data-type="${type}" data-index="${index}">&times;</span>
        `;
        container.appendChild(tagElement);
    });
    
    // Add event listeners to remove buttons
    container.querySelectorAll('.tag-remove').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            const index = parseInt(button.dataset.index);
            
            switch (type) {
                case 'category':
                    categoryTags.splice(index, 1);
                    renderTags(categoryTagsContainer, categoryTags, 'category');
                    break;
                case 'sensor':
                    sensorTags.splice(index, 1);
                    renderTags(sensorTagsContainer, sensorTags, 'sensor');
                    break;
                case 'connectivity':
                    connectivityTags.splice(index, 1);
                    renderTags(connectivityTagsContainer, connectivityTags, 'connectivity');
                    break;
                case 'keyword':
                    keywordTags.splice(index, 1);
                    renderTags(keywordTagsContainer, keywordTags, 'keyword');
                    break;
            }
        });
    });
}

// Setup file upload functionality
function setupFileUploads() {
    // Featured image upload
    const featuredImageUpload = document.getElementById('featured-image-upload');
    const featuredImagePreview = document.getElementById('featured-image-preview');
    
    featuredImageUpload.addEventListener('click', () => {
        // In a real implementation, this would open a file dialog
        // For demonstration, we'll simulate a file upload
        simulateFileUpload(featuredImagePreview, true);
    });
    
    // Additional images upload
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    additionalImagesUpload.addEventListener('click', () => {
        simulateFileUpload(additionalImagesPreview, false);
    });
    
    // Videos upload
    const videosUpload = document.getElementById('videos-upload');
    const videosPreview = document.getElementById('videos-preview');
    
    videosUpload.addEventListener('click', () => {
        simulateFileUpload(videosPreview, false, true);
    });
}

// Simulate file upload for demonstration
function simulateFileUpload(previewContainer, isSingle = false, isVideo = false) {
    // In a real implementation, this would handle actual file uploads
    // For demonstration, we'll just add a placeholder
    
    // Clear preview if it's for a single image
    if (isSingle) {
        previewContainer.innerHTML = '';
    }
    
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    
    if (isVideo) {
        mediaItem.innerHTML = `
            <img src="images/video-placeholder.jpg" alt="Video Placeholder">
            <div class="media-remove">&times;</div>
        `;
    } else {
        mediaItem.innerHTML = `
            <img src="images/robot-placeholder.jpg" alt="Image Placeholder">
            <div class="media-remove">&times;</div>
        `;
    }
    
    previewContainer.appendChild(mediaItem);
    
    // Add remove functionality
    mediaItem.querySelector('.media-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        mediaItem.remove();
    });
}

// Add a new application field
function addApplicationField() {
    const applicationsContainer = document.getElementById('applications-container');
    const applicationCount = applicationsContainer.children.length + 1;
    
    const applicationItem = document.createElement('div');
    applicationItem.className = 'application-item';
    applicationItem.dataset.index = applicationCount - 1;
    
    applicationItem.innerHTML = `
        <h3>Application ${applicationCount}</h3>
        <div class="form-group">
            <label class="form-label">Title</label>
            <input type="text" class="form-control application-title" placeholder="e.g., Industrial Inspection">
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control application-description" placeholder="Describe how this robot is used for this application"></textarea>
        </div>
        <div class="form-group">
            <label class="form-label">Image</label>
            <div class="media-upload application-image-upload">
                <div class="media-upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <p>Click to upload</p>
            </div>
            <div class="media-preview application-image-preview"></div>
        </div>
        <button type="button" class="btn btn-danger remove-application" style="margin-top: 10px;">Remove Application</button>
    `;
    
    applicationsContainer.appendChild(applicationItem);
    
    // Add click handler for the image upload
    applicationItem.querySelector('.application-image-upload').addEventListener('click', function() {
        simulateFileUpload(applicationItem.querySelector('.application-image-preview'), true);
    });
}

// Update application numbers after removing one
function updateApplicationNumbers() {
    const applicationItems = document.querySelectorAll('.application-item');
    applicationItems.forEach((item, index) => {
        item.dataset.index = index;
        item.querySelector('h3').textContent = `Application ${index + 1}`;
    });
}

// Open the robot form modal for adding or editing
function openRobotForm(robotId = null) {
    currentRobotId = robotId;
    
    // Reset form
    robotForm.reset();
    resetTags();
    resetPreviews();
    
    // Set modal title
    if (robotId) {
        modalTitle.textContent = 'Edit Robot';
        // Find the robot data
        const robot = sampleRobots.find(r => r.id === robotId);
        if (robot) {
            fillFormWithRobotData(robot);
        }
    } else {
        modalTitle.textContent = 'Add New Robot';
    }
    
    // Reset to first tab
    modalTabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    modalTabs[0].classList.add('active');
    tabContents[0].classList.add('active');
    
    // Show modal
    robotModal.classList.add('active');
}

// Close the robot form modal
function closeRobotForm() {
    robotModal.classList.remove('active');
    currentRobotId = null;
}

// Fill form with robot data for editing
function fillFormWithRobotData(robot) {
    // Basic info
    document.getElementById('robot-name').value = robot.name;
    document.getElementById('robot-slug').value = robot.slug;
    document.getElementById('manufacturer-name').value = robot.manufacturer.name;
    document.getElementById('manufacturer-country').value = robot.manufacturer.country || '';
    document.getElementById('manufacturer-website').value = robot.manufacturer.website || '';
    document.getElementById('year-introduced').value = robot.yearIntroduced || '';
    document.getElementById('robot-status').value = robot.status;
    document.getElementById('robot-summary').value = robot.summary;
    document.getElementById('robot-description').value = robot.description || '';
    
    // Categories
    categoryTags = [...robot.categories];
    renderTags(document.getElementById('category-tags'), categoryTags, 'category');
    
    // Specifications
    if (robot.specifications) {
        const specs = robot.specifications;
        
        // Physical
        if (specs.physical) {
            if (specs.physical.height) {
                document.getElementById('spec-height').value = specs.physical.height.value || '';
                document.getElementById('spec-height-unit').value = specs.physical.height.unit || 'm';
            }
            if (specs.physical.width) {
                document.getElementById('spec-width').value = specs.physical.width.value || '';
                document.getElementById('spec-width-unit').value = specs.physical.width.unit || 'm';
            }
            if (specs.physical.length) {
                document.getElementById('spec-length').value = specs.physical.length.value || '';
                document.getElementById('spec-length-unit').value = specs.physical.length.unit || 'm';
            }
            if (specs.physical.weight) {
                document.getElementById('spec-weight').value = specs.physical.weight.value || '';
                document.getElementById('spec-weight-unit').value = specs.physical.weight.unit || 'kg';
            }
        }
        
        // Performance
        if (specs.performance) {
            if (specs.performance.battery) {
                document.getElementById('spec-battery-runtime').value = specs.performance.battery.runtime || '';
            }
            if (specs.performance.speed) {
                document.getElementById('spec-speed').value = specs.performance.speed.value || '';
                document.getElementById('spec-speed-unit').value = specs.performance.speed.unit || 'm/s';
            }
            document.getElementById('spec-dof').value = specs.performance.degreesOfFreedom || '';
        }
        
        // Environment
        document.getElementById('spec-ip-rating').value = specs.ipRating || '';
        
        // Sensors
        if (specs.sensors && specs.sensors.length) {
            sensorTags = specs.sensors.map(s => typeof s === 'string' ? s : s.type);
            renderTags(document.getElementById('sensor-tags'), sensorTags, 'sensor');
        }
        
        // Connectivity
        if (specs.connectivity && specs.connectivity.length) {
            connectivityTags = [...specs.connectivity];
            renderTags(document.getElementById('connectivity-tags'), connectivityTags, 'connectivity');
        }
    }
    
    // Media previews
    if (robot.media) {
        if (robot.media.featuredImage) {
            const featuredPreview = document.getElementById('featured-image-preview');
            featuredPreview.innerHTML = `
                <div class="media-item">
                    <img src="${robot.media.featuredImage.url}" alt="${robot.media.featuredImage.alt || robot.name}">
                    <div class="media-remove">&times;</div>
                </div>
            `;
            
            featuredPreview.querySelector('.media-remove').addEventListener('click', () => {
                featuredPreview.innerHTML = '';
            });
        }
        
        if (robot.media.images && robot.media.images.length) {
            const imagesPreview = document.getElementById('additional-images-preview');
            imagesPreview.innerHTML = '';
            
            robot.media.images.forEach(image => {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.innerHTML = `
                    <img src="${image.url}" alt="${image.alt || robot.name}">
                    <div class="media-remove">&times;</div>
                `;
                imagesPreview.appendChild(mediaItem);
                
                mediaItem.querySelector('.media-remove').addEventListener('click', () => {
                    mediaItem.remove();
                });
            });
        }
        
        if (robot.media.videos && robot.media.videos.length) {
            const videosPreview = document.getElementById('videos-preview');
            videosPreview.innerHTML = '';
            
            robot.media.videos.forEach(video => {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.innerHTML = `
                    <img src="${video.thumbnail || 'images/video-placeholder.jpg'}" alt="${video.title || robot.name}">
                    <div class="media-remove">&times;</div>
                `;
                videosPreview.appendChild(mediaItem);
                
                mediaItem.querySelector('.media-remove').addEventListener('click', () => {
                    mediaItem.remove();
                });
            });
        }
    }
    
    // Applications
    if (robot.applications && robot.applications.length) {
        const applicationsContainer = document.getElementById('applications-container');
        applicationsContainer.innerHTML = '';
        
        robot.applications.forEach((application, index) => {
            const applicationItem = document.createElement('div');
            applicationItem.className = 'application-item';
            applicationItem.dataset.index = index;
            
            applicationItem.innerHTML = `
                <h3>Application ${index + 1}</h3>
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-control application-title" value="${application.title || ''}" placeholder="e.g., Industrial Inspection">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control application-description" placeholder="Describe how this robot is used for this application">${application.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Image</label>
                    <div class="media-upload application-image-upload">
                        <div class="media-upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <p>Click to upload</p>
                    </div>
                    <div class="media-preview application-image-preview">
                        ${application.image ? `
                            <div class="media-item">
                                <img src="${application.image}" alt="${application.title || 'Application'}">
                                <div class="media-remove">&times;</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <button type="button" class="btn btn-danger remove-application" style="margin-top: 10px;">Remove Application</button>
            `;
            
            applicationsContainer.appendChild(applicationItem);
            
            // Add click handler for the image upload
            applicationItem.querySelector('.application-image-upload').addEventListener('click', function() {
                simulateFileUpload(applicationItem.querySelector('.application-image-preview'), true);
            });
            
            // Add remove handler for existing images
            const removeBtn = applicationItem.querySelector('.media-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    this.closest('.media-item').remove();
                });
            }
        });
    }
    
    // SEO/Meta
    if (robot.metaData) {
        document.getElementById('meta-title').value = robot.metaData.title || '';
        document.getElementById('meta-description').value = robot.metaData.description || '';
        
        if (robot.metaData.keywords && robot.metaData.keywords.length) {
            keywordTags = [...robot.metaData.keywords];
            renderTags(document.getElementById('keyword-tags'), keywordTags, 'keyword');
        }
    }
}

// Reset tag arrays and displays
function resetTags() {
    categoryTags = [];
    sensorTags = [];
    connectivityTags = [];
    keywordTags = [];
    
    document.getElementById('category-tags').innerHTML = '';
    document.getElementById('sensor-tags').innerHTML = '';
    document.getElementById('connectivity-tags').innerHTML = '';
    document.getElementById('keyword-tags').innerHTML = '';
}

// Reset media preview containers
function resetPreviews() {
    document.getElementById('featured-image-preview').innerHTML = '';
    document.getElementById('additional-images-preview').innerHTML = '';
    document.getElementById('videos-preview').innerHTML = '';
    
    // Reset applications container to have just one empty application
    const applicationsContainer = document.getElementById('applications-container');
    applicationsContainer.innerHTML = `
        <div class="application-item" data-index="0">
            <h3>Application 1</h3>
            <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" class="form-control application-title" placeholder="e.g., Industrial Inspection">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control application-description" placeholder="Describe how this robot is used for this application"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Image</label>
                <div class="media-upload application-image-upload">
                    <div class="media-upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <p>Click to upload</p>
                </div>
                <div class="media-preview application-image-preview"></div>
            </div>
            <button type="button" class="btn btn-danger remove-application" style="margin-top: 10px;">Remove Application</button>
        </div>
    `;
    
    // Add click handler for the image upload
    document.querySelector('.application-image-upload').addEventListener('click', function() {
        simulateFileUpload(document.querySelector('.application-image-preview'), true);
    });
}

// Save robot data
function saveRobot() {
    // Get form data
    const name = document.getElementById('robot-name').value;
    const slug = document.getElementById('robot-slug').value || slugify(name);
    const manufacturerName = document.getElementById('manufacturer-name').value;
    const manufacturerCountry = document.getElementById('manufacturer-country').value;
    const manufacturerWebsite = document.getElementById('manufacturer-website').value;
    const yearIntroduced = document.getElementById('year-introduced').value;
    const status = document.getElementById('robot-status').value;
    const summary = document.getElementById('robot-summary').value;
    const description = document.getElementById('robot-description').value;
    
    // Create robot object
    const robotData = {
        name,
        slug,
        manufacturer: {
            name: manufacturerName,
            country: manufacturerCountry,
            website: manufacturerWebsite
        },
        yearIntroduced: yearIntroduced ? parseInt(yearIntroduced) : new Date().getFullYear(),
        categories: categoryTags,
        summary,
        description,
        status,
        specifications: {
            physical: {
                height: {
                    value: parseFloat(document.getElementById('spec-height').value) || null,
                    unit: document.getElementById('spec-height-unit').value
                },
                width: {
                    value: parseFloat(document.getElementById('spec-width').value) || null,
                    unit: document.getElementById('spec-width-unit').value
                },
                length: {
                    value: parseFloat(document.getElementById('spec-length').value) || null,
                    unit: document.getElementById('spec-length-unit').value
                },
                weight: {
                    value: parseFloat(document.getElementById('spec-weight').value) || null,
                    unit: document.getElementById('spec-weight-unit').value
                }
            },
            performance: {
                battery: {
                    runtime: parseFloat(document.getElementById('spec-battery-runtime').value) || null
                },
                speed: {
                    value: parseFloat(document.getElementById('spec-speed').value) || null,
                    unit: document.getElementById('spec-speed-unit').value
                },
                degreesOfFreedom: parseFloat(document.getElementById('spec-dof').value) || null
            },
            sensors: sensorTags.map(sensor => ({ type: sensor })),
            connectivity: connectivityTags,
            ipRating: document.getElementById('spec-ip-rating').value
        },
        // Media handling would typically involve actual file uploads
        // For demonstration, we'll just use placeholders
        media: {
            featuredImage: document.getElementById('featured-image-preview').innerHTML ? {
                url: 'images/robot-placeholder.jpg',
                alt: name
            } : null,
            images: Array.from(document.getElementById('additional-images-preview').querySelectorAll('.media-item')).map(() => ({
                url: 'images/robot-placeholder.jpg',
                alt: name
            })),
            videos: Array.from(document.getElementById('videos-preview').querySelectorAll('.media-item')).map(() => ({
                url: 'videos/video-placeholder.mp4',
                title: name,
                thumbnail: 'images/video-placeholder.jpg'
            }))
        },
        // Applications
        applications: Array.from(document.querySelectorAll('.application-item')).map(item => {
            const title = item.querySelector('.application-title').value;
            if (!title) return null; // Skip empty applications
            
            return {
                title,
                description: item.querySelector('.application-description').value,
                image: item.querySelector('.application-image-preview').innerHTML ? 'images/robot-placeholder.jpg' : null
            };
        }).filter(app => app !== null), // Remove empty applications
        
        // SEO/Meta
        metaData: {
            title: document.getElementById('meta-title').value || name,
            description: document.getElementById('meta-description').value || summary,
            keywords: keywordTags
        },
        
        // System fields
        createdAt: new Date().toISOString()
    };
    
    // In a real implementation, this would send data to the backend
    // For demonstration, we'll update the sample data
    
    if (currentRobotId) {
        // Update existing robot
        const index = sampleRobots.findIndex(r => r.id === currentRobotId);
        if (index !== -1) {
            // Preserve the ID and createdAt of the original robot
            robotData.id = currentRobotId;
            robotData.createdAt = sampleRobots[index].createdAt;
            
            sampleRobots[index] = robotData;
            
            // Show success message
            alert(`Robot "${name}" updated successfully!`);
        }
    } else {
        // Add new robot
        robotData.id = Math.max(...sampleRobots.map(r => r.id)) + 1;
        sampleRobots.push(robotData);
        
        // Show success message
        alert(`Robot "${name}" added successfully!`);
    }
    
    // Reload the table
    loadRobotTable();
    
    // Close the form
    closeRobotForm();
}

// Confirm and delete a robot
function confirmDeleteRobot(robotId) {
    const robot = sampleRobots.find(r => r.id === robotId);
    
    if (!robot) return;
    
    const confirmed = confirm(`Are you sure you want to delete "${robot.name}"? This action cannot be undone.`);
    
    if (confirmed) {
        const index = sampleRobots.findIndex(r => r.id === robotId);
        if (index !== -1) {
            sampleRobots.splice(index, 1);
            
            // Reload the table
            loadRobotTable();
            
            // Show success message
            alert(`Robot "${robot.name}" deleted successfully!`);
        }
    }
}

// Helper function to create a slug from a string
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')         // Replace spaces with -
        .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
        .replace(/\-\-+/g, '-')        // Replace multiple - with single -
        .replace(/^-+/, '')            // Trim - from start of text
        .replace(/-+$/, '');           // Trim - from end of text
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
