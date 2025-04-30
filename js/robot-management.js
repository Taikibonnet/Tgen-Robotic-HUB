// robot-management-enhanced.js - Enhanced version that integrates with DataManager

// DOM Elements
const robotTableBody = document.getElementById('robot-table-body');
const addRobotBtn = document.getElementById('add-robot-btn');
const robotModal = document.getElementById('robot-modal');
const modalClose = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const robotForm = document.getElementById('robot-form');
const modalTitle = document.getElementById('modal-title');
const paginationContainer = document.getElementById('pagination');

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

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;

// File upload storage
let uploadedFiles = {
    featuredImage: null,
    additionalImages: [],
    videos: [],
    applicationImages: {}
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadRobotTable();
    setupEventListeners();
    setupFormElements();
    updatePagination();
});

// Load robots into the table with pagination
function loadRobotTable() {
    // Clear the table
    robotTableBody.innerHTML = '';
    
    // Get all robots
    const allRobots = DataManager.getAllRobots();
    
    // Sort by most recently updated
    allRobots.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRobots = allRobots.slice(startIndex, endIndex);
    
    // Create rows
    paginatedRobots.forEach(robot => {
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
    
    // Status badge class
    const statusClass = `status-${robot.status || 'draft'}`;
    
    row.innerHTML = `
        <td><img src="${imageUrl}" alt="${robot.name}" class="robot-thumbnail"></td>
        <td>${robot.name}</td>
        <td>${robot.manufacturer.name}</td>
        <td>${robot.categories ? robot.categories.join(', ') : ''}</td>
        <td><span class="status-badge ${statusClass}">${capitalizeFirstLetter(robot.status || 'draft')}</span></td>
        <td>${formattedDate}</td>
        <td class="robot-actions-cell">
            <div class="action-icon edit-icon" data-id="${robot.id}" title="Edit">
                <i class="fas fa-edit"></i>
            </div>
            <div class="action-icon preview-icon" data-slug="${robot.slug}" title="View">
                <i class="fas fa-eye"></i>
            </div>
            <div class="action-icon delete-icon" data-id="${robot.id}" title="Delete">
                <i class="fas fa-trash-alt"></i>
            </div>
        </td>
    `;
    
    return row;
}

// Update pagination controls
function updatePagination() {
    const allRobots = DataManager.getAllRobots();
    const totalPages = Math.ceil(allRobots.length / itemsPerPage);
    
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('div');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.textContent = i;
        pageItem.addEventListener('click', () => {
            currentPage = i;
            loadRobotTable();
            updatePagination();
        });
        paginationContainer.appendChild(pageItem);
    }
    
    // Hide pagination if only one page
    paginationContainer.style.display = totalPages <= 1 ? 'none' : 'flex';
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
    
    // Edit, preview and delete buttons in the table
    robotTableBody.addEventListener('click', (e) => {
        const editIcon = e.target.closest('.edit-icon');
        const deleteIcon = e.target.closest('.delete-icon');
        const previewIcon = e.target.closest('.preview-icon');
        
        if (editIcon) {
            const robotId = parseInt(editIcon.dataset.id);
            openRobotForm(robotId);
        }
        
        if (deleteIcon) {
            const robotId = parseInt(deleteIcon.dataset.id);
            confirmDeleteRobot(robotId);
        }
        
        if (previewIcon) {
            const slug = previewIcon.dataset.slug;
            window.open(`robot-detail.html?slug=${slug}`, '_blank');
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
            const applicationItem = e.target.closest('.application-item');
            const index = applicationItem.dataset.index;
            
            // Remove any stored images for this application
            if (uploadedFiles.applicationImages[index]) {
                delete uploadedFiles.applicationImages[index];
            }
            
            applicationItem.remove();
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
        createFileInput((file, base64) => {
            // Store the file
            uploadedFiles.featuredImage = {
                file,
                base64
            };
            
            // Show preview
            featuredImagePreview.innerHTML = `
                <div class="media-item">
                    <img src="${base64}" alt="${file.name}">
                    <div class="media-remove" data-type="featured">&times;</div>
                </div>
            `;
            
            // Add remove functionality
            featuredImagePreview.querySelector('.media-remove').addEventListener('click', () => {
                uploadedFiles.featuredImage = null;
                featuredImagePreview.innerHTML = '';
            });
        });
    });
    
    // Additional images upload
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    additionalImagesUpload.addEventListener('click', () => {
        createFileInput((file, base64) => {
            // Store the file
            const fileIndex = uploadedFiles.additionalImages.length;
            uploadedFiles.additionalImages.push({
                file,
                base64
            });
            
            // Create preview item
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.index = fileIndex;
            
            mediaItem.innerHTML = `
                <img src="${base64}" alt="${file.name}">
                <div class="media-remove" data-type="additional" data-index="${fileIndex}">&times;</div>
            `;
            
            additionalImagesPreview.appendChild(mediaItem);
            
            // Add remove functionality
            mediaItem.querySelector('.media-remove').addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                uploadedFiles.additionalImages.splice(index, 1);
                mediaItem.remove();
                
                // Update indices for all remaining items
                const items = additionalImagesPreview.querySelectorAll('.media-item');
                items.forEach((item, i) => {
                    item.dataset.index = i;
                    item.querySelector('.media-remove').dataset.index = i;
                });
            });
        });
    });
    
    // Videos upload
    const videosUpload = document.getElementById('videos-upload');
    const videosPreview = document.getElementById('videos-preview');
    
    videosUpload.addEventListener('click', () => {
        createFileInput((file, base64) => {
            // Only accept video files
            if (!file.type.startsWith('video/')) {
                alert('Please select a video file.');
                return;
            }
            
            // Store the file
            const fileIndex = uploadedFiles.videos.length;
            uploadedFiles.videos.push({
                file,
                base64
            });
            
            // Create preview item (thumbnail for video)
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.index = fileIndex;
            
            // Use a video placeholder image
            mediaItem.innerHTML = `
                <img src="images/video-placeholder.jpg" alt="${file.name}">
                <div class="media-remove" data-type="video" data-index="${fileIndex}">&times;</div>
                <div class="media-label">${file.name}</div>
            `;
            
            videosPreview.appendChild(mediaItem);
            
            // Style the label
            const label = mediaItem.querySelector('.media-label');
            label.style.position = 'absolute';
            label.style.bottom = '0';
            label.style.left = '0';
            label.style.right = '0';
            label.style.background = 'rgba(0,0,0,0.7)';
            label.style.color = 'white';
            label.style.padding = '5px';
            label.style.fontSize = '10px';
            label.style.whiteSpace = 'nowrap';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';
            
            // Add remove functionality
            mediaItem.querySelector('.media-remove').addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                uploadedFiles.videos.splice(index, 1);
                mediaItem.remove();
                
                // Update indices for all remaining items
                const items = videosPreview.querySelectorAll('.media-item');
                items.forEach((item, i) => {
                    item.dataset.index = i;
                    item.querySelector('.media-remove').dataset.index = i;
                });
            });
        }, 'video/*');  // Accept only video files
    });
    
    // Handle application image uploads
    document.addEventListener('click', (e) => {
        const uploadBtn = e.target.closest('.application-image-upload');
        if (!uploadBtn) return;
        
        const applicationItem = uploadBtn.closest('.application-item');
        const index = applicationItem.dataset.index;
        const previewContainer = applicationItem.querySelector('.application-image-preview');
        
        createFileInput((file, base64) => {
            // Store the file
            uploadedFiles.applicationImages[index] = {
                file,
                base64
            };
            
            // Show preview
            previewContainer.innerHTML = `
                <div class="media-item">
                    <img src="${base64}" alt="${file.name}">
                    <div class="media-remove" data-type="application" data-index="${index}">&times;</div>
                </div>
            `;
            
            // Add remove functionality
            previewContainer.querySelector('.media-remove').addEventListener('click', () => {
                delete uploadedFiles.applicationImages[index];
                previewContainer.innerHTML = '';
            });
        });
    });
}

// Create a file input element and trigger click
function createFileInput(onFileSelected, accept = 'image/*') {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.addEventListener('change', () => {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const base64 = e.target.result;
                onFileSelected(file, base64);
            };
            
            reader.readAsDataURL(file);
        }
        
        // Remove the input element
        document.body.removeChild(input);
    });
    
    // Trigger click
    input.click();
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
    resetUploads();
    
    // Set modal title
    if (robotId) {
        modalTitle.textContent = 'Edit Robot';
        // Find the robot data
        const robot = DataManager.getRobotById(robotId);
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

// Clear all uploaded files
function resetUploads() {
    uploadedFiles = {
        featuredImage: null,
        additionalImages: [],
        videos: [],
        applicationImages: {}
    };
}

// Close the robot form modal
function closeRobotForm() {
    robotModal.classList.remove('active');
    currentRobotId = null;
}

// Fill form with robot data for editing
function fillFormWithRobotData(robot) {
    // Basic info
    document.getElementById('robot-name').value = robot.name || '';
    document.getElementById('robot-slug').value = robot.slug || '';
    document.getElementById('manufacturer-name').value = robot.manufacturer.name || '';
    document.getElementById('manufacturer-country').value = robot.manufacturer.country || '';
    document.getElementById('manufacturer-website').value = robot.manufacturer.website || '';
    document.getElementById('year-introduced').value = robot.yearIntroduced || '';
    document.getElementById('robot-status').value = robot.status || 'draft';
    document.getElementById('robot-summary').value = robot.summary || '';
    document.getElementById('robot-description').value = robot.description || '';
    
    // Categories
    if (robot.categories && robot.categories.length) {
        categoryTags = [...robot.categories];
        renderTags(document.getElementById('category-tags'), categoryTags, 'category');
    }
    
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
        // Featured image
        if (robot.media.featuredImage) {
            const featuredPreview = document.getElementById('featured-image-preview');
            let imageUrl;
            
            // Check if it's a media ID or direct URL
            if (robot.media.featuredImage.mediaId) {
                const media = DataManager.getMediaById(robot.media.featuredImage.mediaId);
                if (media) {
                    imageUrl = media.data;
                }
            } else if (robot.media.featuredImage.url) {
                imageUrl = robot.media.featuredImage.url;
            }
            
            if (imageUrl) {
                featuredPreview.innerHTML = `
                    <div class="media-item">
                        <img src="${imageUrl}" alt="${robot.media.featuredImage.alt || robot.name}">
                        <div class="media-remove" data-type="featured">&times;</div>
                    </div>
                `;
                
                featuredPreview.querySelector('.media-remove').addEventListener('click', () => {
                    featuredPreview.innerHTML = '';
                });
            }
        }
        
        // Additional images
        if (robot.media.images && robot.media.images.length) {
            const imagesPreview = document.getElementById('additional-images-preview');
            imagesPreview.innerHTML = '';
            
            robot.media.images.forEach((image, index) => {
                let imageUrl;
                
                // Check if it's a media ID or direct URL
                if (image.mediaId) {
                    const media = DataManager.getMediaById(image.mediaId);
                    if (media) {
                        imageUrl = media.data;
                    }
                } else if (image.url) {
                    imageUrl = image.url;
                }
                
                if (imageUrl) {
                    const mediaItem = document.createElement('div');
                    mediaItem.className = 'media-item';
                    mediaItem.dataset.index = index;
                    
                    mediaItem.innerHTML = `
                        <img src="${imageUrl}" alt="${image.alt || robot.name}">
                        <div class="media-remove" data-type="additional" data-index="${index}">&times;</div>
                    `;
                    
                    imagesPreview.appendChild(mediaItem);
                    
                    mediaItem.querySelector('.media-remove').addEventListener('click', function() {
                        mediaItem.remove();
                    });
                }
            });
        }
        
        // Videos
        if (robot.media.videos && robot.media.videos.length) {
            const videosPreview = document.getElementById('videos-preview');
            videosPreview.innerHTML = '';
            
            robot.media.videos.forEach((video, index) => {
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.dataset.index = index;
                
                // Use thumbnail if available, otherwise use a placeholder
                let thumbnailUrl = 'images/video-placeholder.jpg';
                if (video.thumbnail) {
                    if (video.thumbnailMediaId) {
                        const media = DataManager.getMediaById(video.thumbnailMediaId);
                        if (media) {
                            thumbnailUrl = media.data;
                        }
                    } else {
                        thumbnailUrl = video.thumbnail;
                    }
                }
                
                mediaItem.innerHTML = `
                    <img src="${thumbnailUrl}" alt="${video.title || robot.name}">
                    <div class="media-remove" data-type="video" data-index="${index}">&times;</div>
                    <div class="media-label">${video.title || 'Video ' + (index + 1)}</div>
                `;
                
                // Style the label
                const label = mediaItem.querySelector('.media-label');
                label.style.position = 'absolute';
                label.style.bottom = '0';
                label.style.left = '0';
                label.style.right = '0';
                label.style.background = 'rgba(0,0,0,0.7)';
                label.style.color = 'white';
                label.style.padding = '5px';
                label.style.fontSize = '10px';
                label.style.whiteSpace = 'nowrap';
                label.style.overflow = 'hidden';
                label.style.textOverflow = 'ellipsis';
                
                videosPreview.appendChild(mediaItem);
                
                mediaItem.querySelector('.media-remove').addEventListener('click', function() {
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
                        ${application.image ? getApplicationImagePreview(application, index) : ''}
                    </div>
                </div>
                <button type="button" class="btn btn-danger remove-application" style="margin-top: 10px;">Remove Application</button>
            `;
            
            applicationsContainer.appendChild(applicationItem);
            
            // Add remove handler for existing images
            const removeBtn = applicationItem.querySelector('.media-remove');
            if (removeBtn) {
                removeBtn.addEventListener('click', function() {
                    applicationItem.querySelector('.application-image-preview').innerHTML = '';
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

// Helper function to get application image preview HTML
function getApplicationImagePreview(application, index) {
    let imageUrl;
    
    // Check if it's a media ID or direct URL
    if (application.imageMediaId) {
        const media = DataManager.getMediaById(application.imageMediaId);
        if (media) {
            imageUrl = media.data;
        }
    } else if (application.image) {
        imageUrl = application.image;
    }
    
    if (imageUrl) {
        return `
            <div class="media-item">
                <img src="${imageUrl}" alt="${application.title || 'Application'}">
                <div class="media-remove" data-type="application" data-index="${index}">&times;</div>
            </div>
        `;
    }
    
    return '';
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
}

// Save robot data
async function saveRobot() {
    // Get form data
    const name = document.getElementById('robot-name').value;
    if (!name) {
        alert('Robot name is required');
        return;
    }
    
    const slug = document.getElementById('robot-slug').value || DataManager.slugify(name);
    const manufacturerName = document.getElementById('manufacturer-name').value;
    if (!manufacturerName) {
        alert('Manufacturer name is required');
        return;
    }
    
    const manufacturerCountry = document.getElementById('manufacturer-country').value;
    const manufacturerWebsite = document.getElementById('manufacturer-website').value;
    const yearIntroduced = document.getElementById('year-introduced').value;
    const status = document.getElementById('robot-status').value;
    const summary = document.getElementById('robot-summary').value;
    if (!summary) {
        alert('Summary is required');
        return;
    }
    
    const description = document.getElementById('robot-description').value;
    
    // Show loading indicator
    const saveBtnOriginalText = document.querySelector('.modal-footer .btn-primary').textContent;
    document.querySelector('.modal-footer .btn-primary').textContent = 'Saving...';
    document.querySelector('.modal-footer .btn-primary').disabled = true;
    
    try {
        // Process media uploads
        const media = {
            featuredImage: null,
            images: [],
            videos: []
        };
        
        // Process featured image
        if (uploadedFiles.featuredImage) {
            const file = uploadedFiles.featuredImage.file;
            const base64 = uploadedFiles.featuredImage.base64;
            
            // Store in DataManager
            const mediaId = DataManager.storeMedia(file.name, file.type, base64);
            
            media.featuredImage = {
                mediaId,
                alt: name
            };
        } else if (currentRobotId) {
            // Keep existing featured image if editing
            const robot = DataManager.getRobotById(currentRobotId);
            if (robot && robot.media && robot.media.featuredImage) {
                media.featuredImage = robot.media.featuredImage;
            }
        }
        
        // Process additional images
        const existingImagesContainer = document.getElementById('additional-images-preview');
        const existingImages = existingImagesContainer.querySelectorAll('.media-item');
        
        // Process uploaded images
        for (const imageData of uploadedFiles.additionalImages) {
            const file = imageData.file;
            const base64 = imageData.base64;
            
            // Store in DataManager
            const mediaId = DataManager.storeMedia(file.name, file.type, base64);
            
            media.images.push({
                mediaId,
                alt: file.name
            });
        }
        
        // Keep existing images (if editing)
        if (currentRobotId) {
            const robot = DataManager.getRobotById(currentRobotId);
            if (robot && robot.media && robot.media.images) {
                // Add existing images that are still in the preview
                // This is a bit complex because we don't have a direct reference, 
                // so we're checking by position in the preview
                const existingCount = existingImages.length - uploadedFiles.additionalImages.length;
                if (existingCount > 0) {
                    for (let i = 0; i < Math.min(existingCount, robot.media.images.length); i++) {
                        media.images.push(robot.media.images[i]);
                    }
                }
            }
        }
        
        // Process videos
        const existingVideosContainer = document.getElementById('videos-preview');
        const existingVideos = existingVideosContainer.querySelectorAll('.media-item');
        
        // Process uploaded videos
        for (const videoData of uploadedFiles.videos) {
            const file = videoData.file;
            const base64 = videoData.base64;
            
            // Store in DataManager
            const mediaId = DataManager.storeMedia(file.name, file.type, base64);
            
            media.videos.push({
                mediaId,
                title: file.name,
                description: '',
                thumbnail: 'images/video-placeholder.jpg'
            });
        }
        
        // Keep existing videos (if editing)
        if (currentRobotId) {
            const robot = DataManager.getRobotById(currentRobotId);
            if (robot && robot.media && robot.media.videos) {
                // Add existing videos that are still in the preview
                const existingCount = existingVideos.length - uploadedFiles.videos.length;
                if (existingCount > 0) {
                    for (let i = 0; i < Math.min(existingCount, robot.media.videos.length); i++) {
                        media.videos.push(robot.media.videos[i]);
                    }
                }
            }
        }
        
        // Process applications
        const applications = [];
        const applicationItems = document.querySelectorAll('.application-item');
        
        for (const item of applicationItems) {
            const index = item.dataset.index;
            const title = item.querySelector('.application-title').value;
            if (!title) continue; // Skip empty applications
            
            const description = item.querySelector('.application-description').value;
            let imageData = null;
            
            // Check for uploaded image
            if (uploadedFiles.applicationImages[index]) {
                const file = uploadedFiles.applicationImages[index].file;
                const base64 = uploadedFiles.applicationImages[index].base64;
                
                // Store in DataManager
                const mediaId = DataManager.storeMedia(file.name, file.type, base64);
                
                imageData = { mediaId };
            } else if (currentRobotId) {
                // Check for existing image
                const robot = DataManager.getRobotById(currentRobotId);
                if (robot && robot.applications && robot.applications[index]) {
                    imageData = { 
                        image: robot.applications[index].image,
                        imageMediaId: robot.applications[index].imageMediaId
                    };
                }
            }
            
            applications.push({
                title,
                description,
                ...(imageData || {})
            });
        }
        
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
            media,
            applications,
            metaData: {
                title: document.getElementById('meta-title').value || name,
                description: document.getElementById('meta-description').value || summary,
                keywords: keywordTags
            },
            stats: {
                views: 0, 
                favorites: 0
            }
        };
        
        // Save the robot
        if (currentRobotId) {
            // Update existing robot
            DataManager.updateRobot(currentRobotId, robotData);
            showMessage(`Robot "${name}" updated successfully!`);
        } else {
            // Add new robot
            DataManager.createRobot(robotData);
            showMessage(`Robot "${name}" added successfully!`);
        }
        
        // Reload the table
        loadRobotTable();
        updatePagination();
        
        // Close the form
        closeRobotForm();
    } catch (error) {
        console.error('Error saving robot:', error);
        alert(`Error saving robot: ${error.message}`);
    } finally {
        // Restore button text
        document.querySelector('.modal-footer .btn-primary').textContent = saveBtnOriginalText;
        document.querySelector('.modal-footer .btn-primary').disabled = false;
    }
}

// Confirm and delete a robot
function confirmDeleteRobot(robotId) {
    const robot = DataManager.getRobotById(robotId);
    
    if (!robot) return;
    
    const confirmed = confirm(`Are you sure you want to delete "${robot.name}"? This action cannot be undone.`);
    
    if (confirmed) {
        try {
            DataManager.deleteRobot(robotId);
            
            // Reload the table
            loadRobotTable();
            updatePagination();
            
            // Show success message
            showMessage(`Robot "${robot.name}" deleted successfully!`);
        } catch (error) {
            console.error('Error deleting robot:', error);
            alert(`Error deleting robot: ${error.message}`);
        }
    }
}

// Show a temporary message popup
function showMessage(message, type = 'success', duration = 3000) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-popup message-${type}`;
    messageEl.textContent = message;
    
    // Style the message
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
