// robot-form-handler.js - Handles robot creation, editing, and deletion

// Global variables to store selected files
let featuredImageFile = null;
let additionalImageFiles = [];
let videoFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeRobotManagement();
});

function initializeRobotManagement() {
    // Initialize form event listeners
    initializeFormHandlers();
    initializeMediaUploads();
    initializeCustomSpecFields();
    
    // Load robots for the table
    loadRobots();
    
    // Initialize edit and delete button handlers
    setupActionButtons();
}

function initializeFormHandlers() {
    const robotForm = document.getElementById('robot-form');
    
    robotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveRobot();
    });
    
    // Name to slug automation
    const nameInput = document.getElementById('robot-name');
    const slugInput = document.getElementById('robot-slug');
    
    nameInput.addEventListener('blur', function() {
        if (!slugInput.value) {
            slugInput.value = generateSlug(nameInput.value);
        }
    });
}

function initializeMediaUploads() {
    // Setup featured image upload
    const featuredImageUpload = document.getElementById('featured-image-upload');
    const featuredImagePreview = document.getElementById('featured-image-preview');
    
    featuredImageUpload.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            if (e.target.files && e.target.files[0]) {
                featuredImageFile = e.target.files[0];
                
                // Preview image
                const reader = new FileReader();
                reader.onload = function(e) {
                    featuredImagePreview.innerHTML = `
                        <div class="media-item">
                            <img src="${e.target.result}" alt="Featured Image Preview">
                            <div class="media-remove" data-type="featured">×</div>
                        </div>
                    `;
                    
                    // Add event listener to remove button
                    document.querySelector('.media-remove[data-type="featured"]').addEventListener('click', function(e) {
                        e.stopPropagation();
                        featuredImageFile = null;
                        featuredImagePreview.innerHTML = '';
                    });
                };
                reader.readAsDataURL(featuredImageFile);
            }
        };
        
        input.click();
    });
    
    // Setup additional images upload
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    additionalImagesUpload.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        
        input.onchange = function(e) {
            if (e.target.files && e.target.files.length > 0) {
                // Add new files to the array
                for (const file of e.target.files) {
                    additionalImageFiles.push(file);
                    
                    // Preview image
                    const reader = new FileReader();
                    reader.onload = function(readerEvent) {
                        const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        additionalImagesPreview.innerHTML += `
                            <div class="media-item" id="${imageId}">
                                <img src="${readerEvent.target.result}" alt="Additional Image Preview">
                                <div class="media-remove" data-id="${imageId}">×</div>
                            </div>
                        `;
                        
                        // Add event listener to remove button
                        document.querySelector(`.media-remove[data-id="${imageId}"]`).addEventListener('click', function(e) {
                            e.stopPropagation();
                            const index = additionalImageFiles.findIndex(f => f === file);
                            if (index !== -1) {
                                additionalImageFiles.splice(index, 1);
                            }
                            document.getElementById(imageId).remove();
                        });
                    };
                    reader.readAsDataURL(file);
                }
            }
        };
        
        input.click();
    });
    
    // Allow drag and drop for images
    setupDragAndDrop(featuredImageUpload, featuredImagePreview, 'featured');
    setupDragAndDrop(additionalImagesUpload, additionalImagesPreview, 'additional');
}

function setupDragAndDrop(dropZone, previewZone, type) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.backgroundColor = 'rgba(32, 227, 178, 0.05)';
    }
    
    function unhighlight() {
        dropZone.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        dropZone.style.backgroundColor = 'transparent';
    }
    
    dropZone.addEventListener('drop', function(e) {
        const files = e.dataTransfer.files;
        
        if (files && files.length > 0) {
            if (type === 'featured') {
                // Only use the first file for featured image
                featuredImageFile = files[0];
                
                // Preview image
                const reader = new FileReader();
                reader.onload = function(readerEvent) {
                    previewZone.innerHTML = `
                        <div class="media-item">
                            <img src="${readerEvent.target.result}" alt="Featured Image Preview">
                            <div class="media-remove" data-type="featured">×</div>
                        </div>
                    `;
                    
                    // Add event listener to remove button
                    document.querySelector('.media-remove[data-type="featured"]').addEventListener('click', function(e) {
                        e.stopPropagation();
                        featuredImageFile = null;
                        previewZone.innerHTML = '';
                    });
                };
                reader.readAsDataURL(featuredImageFile);
            } else if (type === 'additional') {
                // Add all files for additional images
                for (const file of files) {
                    additionalImageFiles.push(file);
                    
                    // Preview image
                    const reader = new FileReader();
                    reader.onload = function(readerEvent) {
                        const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        previewZone.innerHTML += `
                            <div class="media-item" id="${imageId}">
                                <img src="${readerEvent.target.result}" alt="Additional Image Preview">
                                <div class="media-remove" data-id="${imageId}">×</div>
                            </div>
                        `;
                        
                        // Add event listener to remove button
                        document.querySelector(`.media-remove[data-id="${imageId}"]`).addEventListener('click', function(e) {
                            e.stopPropagation();
                            const index = additionalImageFiles.findIndex(f => f === file);
                            if (index !== -1) {
                                additionalImageFiles.splice(index, 1);
                            }
                            document.getElementById(imageId).remove();
                        });
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    });
}

function initializeCustomSpecFields() {
    const addCustomSpecBtn = document.getElementById('add-custom-spec');
    const customSpecFields = document.getElementById('custom-spec-fields');
    
    addCustomSpecBtn.addEventListener('click', function() {
        const fieldId = Date.now();
        
        const customFieldHTML = `
            <div class="form-row custom-spec-row" id="custom-spec-${fieldId}">
                <div class="form-col">
                    <div class="form-group">
                        <label class="form-label" for="custom-spec-name-${fieldId}">Specification Name</label>
                        <input type="text" class="form-control custom-spec-name" id="custom-spec-name-${fieldId}">
                    </div>
                </div>
                <div class="form-col" style="flex: 2;">
                    <div class="form-group">
                        <label class="form-label" for="custom-spec-value-${fieldId}">Value</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" class="form-control custom-spec-value" id="custom-spec-value-${fieldId}" style="flex: 3;">
                            <input type="text" class="form-control custom-spec-unit" id="custom-spec-unit-${fieldId}" placeholder="Unit (optional)" style="flex: 1;">
                            <button type="button" class="btn btn-danger remove-custom-spec" data-id="${fieldId}" style="padding: 0 10px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        customSpecFields.insertAdjacentHTML('beforeend', customFieldHTML);
        
        // Add event listener to remove button
        document.querySelector(`.remove-custom-spec[data-id="${fieldId}"]`).addEventListener('click', function() {
            document.getElementById(`custom-spec-${fieldId}`).remove();
        });
    });
}

function saveRobot() {
    // Get form data
    const robotData = collectFormData();
    
    // Validate required fields
    if (!validateRobotData(robotData)) {
        return;
    }
    
    // Determine if we're creating a new robot or updating an existing one
    const robotId = document.getElementById('robot-form').getAttribute('data-robot-id');
    
    if (robotId) {
        // Update existing robot
        updateRobot(robotId, robotData);
    } else {
        // Create new robot
        createRobot(robotData);
    }
}

function collectFormData() {
    const robotData = {
        basic: {
            name: document.getElementById('robot-name').value,
            slug: document.getElementById('robot-slug').value,
            manufacturerName: document.getElementById('manufacturer-name').value,
            manufacturerCountry: document.getElementById('manufacturer-country').value,
            manufacturerWebsite: document.getElementById('manufacturer-website').value,
            yearIntroduced: document.getElementById('year-introduced').value,
            status: document.getElementById('robot-status').value,
            summary: document.getElementById('robot-summary').value,
            description: document.getElementById('robot-description').value
        },
        specifications: {
            physical: {
                height: {
                    value: document.getElementById('spec-height').value || null,
                    unit: document.getElementById('spec-height-unit').value
                },
                weight: {
                    value: document.getElementById('spec-weight').value || null,
                    unit: document.getElementById('spec-weight-unit').value
                },
                payload: {
                    value: document.getElementById('spec-payload').value || null,
                    unit: document.getElementById('spec-payload-unit').value
                },
                maxDeadlift: {
                    value: document.getElementById('spec-deadlift').value || null,
                    unit: document.getElementById('spec-deadlift-unit').value
                }
            },
            performance: {
                batteryRuntime: document.getElementById('spec-battery-runtime').value || null,
                maxSpeed: {
                    value: document.getElementById('spec-speed').value || null,
                    unit: document.getElementById('spec-speed-unit').value
                }
            },
            hardware: {
                hands: document.getElementById('spec-hands').value,
                actuators: document.getElementById('spec-actuators').value,
                sensors: document.getElementById('spec-sensors').value,
                powerSource: document.getElementById('spec-power-source').value,
                processor: document.getElementById('spec-processor').value,
                connectivity: document.getElementById('spec-connectivity').value
            },
            customFields: []
        },
        media: {
            featuredImage: featuredImageFile,
            additionalImages: additionalImageFiles,
            videos: videoFiles
        }
    };
    
    // Collect custom specification fields
    const customSpecRows = document.querySelectorAll('.custom-spec-row');
    customSpecRows.forEach(row => {
        const nameInput = row.querySelector('.custom-spec-name');
        const valueInput = row.querySelector('.custom-spec-value');
        const unitInput = row.querySelector('.custom-spec-unit');
        
        if (nameInput.value && valueInput.value) {
            robotData.specifications.customFields.push({
                name: nameInput.value,
                value: valueInput.value,
                unit: unitInput.value || null
            });
        }
    });
    
    return robotData;
}

function validateRobotData(robotData) {
    // Check required fields
    if (!robotData.basic.name) {
        alert('Robot name is required');
        return false;
    }
    
    if (!robotData.basic.manufacturerName) {
        alert('Manufacturer name is required');
        return false;
    }
    
    if (!robotData.basic.summary) {
        alert('Robot summary is required');
        return false;
    }
    
    return true;
}

function createRobot(robotData) {
    // Generate a simple ID for the new robot
    const newId = window.robotsData.robots.length > 0 
        ? Math.max(...window.robotsData.robots.map(r => r.id)) + 1 
        : 1;
    
    // Format data for storage
    const newRobot = {
        id: newId,
        name: robotData.basic.name,
        slug: robotData.basic.slug || generateSlug(robotData.basic.name),
        manufacturer: {
            name: robotData.basic.manufacturerName,
            country: robotData.basic.manufacturerCountry,
            website: robotData.basic.manufacturerWebsite
        },
        yearIntroduced: parseInt(robotData.basic.yearIntroduced) || new Date().getFullYear(),
        categories: ["Industrial"], // Default category
        summary: robotData.basic.summary,
        description: robotData.basic.description,
        specifications: {
            physical: {
                height: robotData.specifications.physical.height,
                weight: robotData.specifications.physical.weight,
                payload: robotData.specifications.physical.payload,
                maxDeadlift: robotData.specifications.physical.maxDeadlift
            },
            performance: {
                battery: {
                    runtime: parseInt(robotData.specifications.performance.batteryRuntime) || null
                },
                speed: robotData.specifications.performance.maxSpeed
            },
            sensors: [
                { type: robotData.specifications.hardware.sensors, description: "" }
            ],
            connectivity: robotData.specifications.hardware.connectivity ? 
                robotData.specifications.hardware.connectivity.split(',').map(item => item.trim()) : [],
            customFields: robotData.specifications.customFields
        },
        media: {
            featuredImage: {
                // In a real app, the files would be uploaded to a server
                // For this demo, we'll create object URLs for the images
                url: featuredImageFile ? URL.createObjectURL(featuredImageFile) : "images/robot-placeholder.jpg",
                alt: robotData.basic.name
            },
            images: additionalImageFiles.map(file => ({
                url: URL.createObjectURL(file),
                alt: `${robotData.basic.name} - Additional Image`,
                caption: ""
            }))
        },
        status: robotData.basic.status,
        createdAt: new Date().toISOString(),
        stats: {
            views: 0,
            favorites: 0
        }
    };
    
    // Use the storage adapter to add and save the robot
    window.robotStorage.addRobotAndSave(newRobot);
    
    // Update the UI
    loadRobots();
    
    // Close the modal
    closeModal();
    
    // Show success message
    alert('Robot added successfully!');
}

.createObjectURL(file),
                alt: `${robotData.basic.name} - Additional Image`,
                caption: ""
            });
        });
    }
    
    // Update the robot status
    robot.status = robotData.basic.status;
    
    // Update the UI
    loadRobots();
    
    // Close the modal
    closeModal();
    
    // Show success message
    alert('Robot updated successfully!');
}

function deleteRobot(robotId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this robot? This action cannot be undone.')) {
        return;
    }
    
    // Use the storage adapter to delete and save
    const success = window.robotStorage.deleteRobotAndSave(parseInt(robotId));
    
    if (!success) {
        alert('Robot not found');
        return;
    }
    
    // Update the UI
    loadRobots();
    
    // Show success message
    alert('Robot deleted successfully!');
}

function loadRobotForEditing(robotId) {
    // Find the robot
    const robot = window.robotsData.getRobotById(parseInt(robotId));
    
    if (!robot) {
        alert('Robot not found');
        return;
    }
    
    // Set form as editing mode
    document.getElementById('robot-form').setAttribute('data-robot-id', robot.id);
    document.getElementById('modal-title').textContent = 'Edit Robot';
    
    // Populate basic info
    document.getElementById('robot-name').value = robot.name;
    document.getElementById('robot-slug').value = robot.slug;
    document.getElementById('manufacturer-name').value = robot.manufacturer.name;
    document.getElementById('manufacturer-country').value = robot.manufacturer.country || '';
    document.getElementById('manufacturer-website').value = robot.manufacturer.website || '';
    document.getElementById('year-introduced').value = robot.yearIntroduced || '';
    document.getElementById('robot-status').value = robot.status || 'published';
    document.getElementById('robot-summary').value = robot.summary || '';
    document.getElementById('robot-description').value = robot.description || '';
    
    // Populate specifications
    if (robot.specifications) {
        if (robot.specifications.physical) {
            if (robot.specifications.physical.height) {
                document.getElementById('spec-height').value = robot.specifications.physical.height.value || '';
                document.getElementById('spec-height-unit').value = robot.specifications.physical.height.unit || 'm';
            }
            
            if (robot.specifications.physical.weight) {
                document.getElementById('spec-weight').value = robot.specifications.physical.weight.value || '';
                document.getElementById('spec-weight-unit').value = robot.specifications.physical.weight.unit || 'kg';
            }
            
            if (robot.specifications.physical.payload) {
                document.getElementById('spec-payload').value = robot.specifications.physical.payload.value || '';
                document.getElementById('spec-payload-unit').value = robot.specifications.physical.payload.unit || 'kg';
            }
            
            if (robot.specifications.physical.maxDeadlift) {
                document.getElementById('spec-deadlift').value = robot.specifications.physical.maxDeadlift.value || '';
                document.getElementById('spec-deadlift-unit').value = robot.specifications.physical.maxDeadlift.unit || 'kg';
            }
        }
        
        if (robot.specifications.performance) {
            if (robot.specifications.performance.battery) {
                document.getElementById('spec-battery-runtime').value = robot.specifications.performance.battery.runtime || '';
            }
            
            if (robot.specifications.performance.speed) {
                document.getElementById('spec-speed').value = robot.specifications.performance.speed.value || '';
                document.getElementById('spec-speed-unit').value = robot.specifications.performance.speed.unit || 'm/s';
            }
        }
        
        // Hardware fields
        if (robot.specifications.sensors && robot.specifications.sensors.length > 0) {
            document.getElementById('spec-sensors').value = robot.specifications.sensors.map(s => s.type).join(', ');
        }
        
        if (robot.specifications.connectivity) {
            document.getElementById('spec-connectivity').value = Array.isArray(robot.specifications.connectivity) 
                ? robot.specifications.connectivity.join(', ') 
                : robot.specifications.connectivity;
        }
        
        // Custom fields
        if (robot.specifications.customFields && robot.specifications.customFields.length > 0) {
            const customSpecFields = document.getElementById('custom-spec-fields');
            customSpecFields.innerHTML = ''; // Clear existing fields
            
            robot.specifications.customFields.forEach(field => {
                const fieldId = Date.now() + Math.floor(Math.random() * 1000);
                
                const customFieldHTML = `
                    <div class="form-row custom-spec-row" id="custom-spec-${fieldId}">
                        <div class="form-col">
                            <div class="form-group">
                                <label class="form-label" for="custom-spec-name-${fieldId}">Specification Name</label>
                                <input type="text" class="form-control custom-spec-name" id="custom-spec-name-${fieldId}" value="${field.name}">
                            </div>
                        </div>
                        <div class="form-col" style="flex: 2;">
                            <div class="form-group">
                                <label class="form-label" for="custom-spec-value-${fieldId}">Value</label>
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" class="form-control custom-spec-value" id="custom-spec-value-${fieldId}" style="flex: 3;" value="${field.value}">
                                    <input type="text" class="form-control custom-spec-unit" id="custom-spec-unit-${fieldId}" placeholder="Unit (optional)" style="flex: 1;" value="${field.unit || ''}">
                                    <button type="button" class="btn btn-danger remove-custom-spec" data-id="${fieldId}" style="padding: 0 10px;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                customSpecFields.insertAdjacentHTML('beforeend', customFieldHTML);
                
                // Add event listener to remove button
                document.querySelector(`.remove-custom-spec[data-id="${fieldId}"]`).addEventListener('click', function() {
                    document.getElementById(`custom-spec-${fieldId}`).remove();
                });
            });
        }
    }
    
    // Display existing media
    if (robot.media) {
        // Featured image
        if (robot.media.featuredImage && robot.media.featuredImage.url) {
            const featuredImagePreview = document.getElementById('featured-image-preview');
            featuredImagePreview.innerHTML = `
                <div class="media-item">
                    <img src="${robot.media.featuredImage.url}" alt="${robot.media.featuredImage.alt || robot.name}">
                    <div class="media-remove" data-type="featured">×</div>
                </div>
            `;
            
            // Add event listener to remove button
            document.querySelector('.media-remove[data-type="featured"]').addEventListener('click', function(e) {
                e.stopPropagation();
                featuredImageFile = null;
                featuredImagePreview.innerHTML = '';
                
                // This doesn't actually remove the image from the robot data
                // until the form is saved
            });
        }
        
        // Additional images
        if (robot.media.images && robot.media.images.length > 0) {
            const additionalImagesPreview = document.getElementById('additional-images-preview');
            additionalImagesPreview.innerHTML = ''; // Clear existing preview
            
            robot.media.images.forEach((image, index) => {
                const imageId = `existing-img-${index}`;
                additionalImagesPreview.innerHTML += `
                    <div class="media-item" id="${imageId}">
                        <img src="${image.url}" alt="${image.alt || robot.name}">
                        <div class="media-remove" data-id="${imageId}" data-index="${index}">×</div>
                    </div>
                `;
                
                // Will add event listeners after the HTML is added to the DOM
            });
            
            // Add event listeners to remove buttons
            document.querySelectorAll('.media-remove[data-id^="existing-img-"]').forEach(button => {
                button.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.getAttribute('data-index'));
                    const imageId = this.getAttribute('data-id');
                    document.getElementById(imageId).remove();
                    
                    // This doesn't actually remove the image from the robot data
                    // until the form is saved, but we could mark it for removal
                });
            });
        }
    }
    
    // Show the modal
    openModal();
}

function loadRobots() {
    const robotTableBody = document.getElementById('robot-table-body');
    robotTableBody.innerHTML = ''; // Clear existing table
    
    // Get robots from the data
    const robots = window.robotsData.robots || [];
    
    // If no robots, show a message
    if (robots.length === 0) {
        robotTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">
                    No robots found. Click "Add New Robot" to create one.
                </td>
            </tr>
        `;
        return;
    }
    
    // Add robots to the table
    robots.forEach(robot => {
        const featuredImageUrl = robot.media && robot.media.featuredImage ? robot.media.featuredImage.url : 'images/robot-placeholder.jpg';
        const statusClass = `status-${robot.status || 'draft'}`;
        const dateAdded = robot.createdAt ? new Date(robot.createdAt).toISOString().split('T')[0] : 'N/A';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${featuredImageUrl}" alt="${robot.name}" class="robot-thumbnail"></td>
            <td>${robot.name}</td>
            <td>${robot.manufacturer.name}</td>
            <td><span class="status-badge ${statusClass}">${capitalize(robot.status || 'draft')}</span></td>
            <td>${dateAdded}</td>
            <td class="robot-actions-cell">
                <a href="#" class="action-icon edit-icon" data-id="${robot.id}"><i class="fas fa-edit"></i></a>
                <a href="robot-detail.html?slug=${robot.slug}" class="action-icon view-icon"><i class="fas fa-eye"></i></a>
                <a href="#" class="action-icon delete-icon" data-id="${robot.id}"><i class="fas fa-trash"></i></a>
            </td>
        `;
        
        robotTableBody.appendChild(row);
    });
    
    // Re-attach event handlers for the action buttons
    setupActionButtons();
}

function setupActionButtons() {
    // Edit buttons
    document.querySelectorAll('.edit-icon').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const robotId = this.getAttribute('data-id');
            loadRobotForEditing(robotId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-icon').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const robotId = this.getAttribute('data-id');
            deleteRobot(robotId);
        });
    });
}

// Helper functions
function generateSlug(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function openModal() {
    const modal = document.getElementById('robot-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeModal() {
    const modal = document.getElementById('robot-modal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Allow scrolling again
    
    // Reset the form
    document.getElementById('robot-form').reset();
    document.getElementById('robot-form').removeAttribute('data-robot-id');
    document.getElementById('modal-title').textContent = 'Add New Robot';
    
    // Clear media previews
    document.getElementById('featured-image-preview').innerHTML = '';
    document.getElementById('additional-images-preview').innerHTML = '';
    
    // Reset file variables
    featuredImageFile = null;
    additionalImageFiles = [];
    videoFiles = [];
    
    // Clear custom spec fields
    document.getElementById('custom-spec-fields').innerHTML = '';
    
    // Reset to the first tab
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector('.modal-tab[data-tab="basic"]').classList.add('active');
    document.getElementById('tab-basic').classList.add('active');
}
// Add these functions to robot-form-handler.js

// Global variable to store video files
let videoFiles = [];
let videoUrls = [{ url: '', title: '', description: '' }];

// Initialize video uploads
function initializeVideoUploads() {
    // Setup video upload
    const videoUpload = document.getElementById('video-upload');
    const videoPreview = document.getElementById('video-preview');
    
    videoUpload.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.multiple = true;
        
        input.onchange = function(e) {
            if (e.target.files && e.target.files.length > 0) {
                // Add new files to the array
                for (const file of e.target.files) {
                    videoFiles.push(file);
                    
                    // Create video preview
                    const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    const videoElement = document.createElement('video');
                    videoElement.controls = true;
                    videoElement.width = 280;
                    videoElement.style.borderRadius = '5px';
                    videoElement.style.marginBottom = '10px';
                    
                    // Create container
                    const container = document.createElement('div');
                    container.className = 'media-item video-item';
                    container.id = videoId;
                    container.style.width = '280px';
                    container.style.marginRight = '10px';
                    
                    // Create remove button
                    const removeBtn = document.createElement('div');
                    removeBtn.className = 'media-remove';
                    removeBtn.setAttribute('data-id', videoId);
                    removeBtn.innerHTML = '×';
                    
                    // Add elements to container
                    container.appendChild(videoElement);
                    container.appendChild(removeBtn);
                    
                    // Add to preview
                    videoPreview.appendChild(container);
                    
                    // Set source for video
                    const objectURL = URL.createObjectURL(file);
                    videoElement.src = objectURL;
                    
                    // Add event listener to remove button
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = videoFiles.findIndex(f => f === file);
                        if (index !== -1) {
                            videoFiles.splice(index, 1);
                        }
                        document.getElementById(videoId).remove();
                        URL.revokeObjectURL(objectURL);
                    });
                }
            }
        };
        
        input.click();
    });
    
    // Allow drag and drop for videos
    setupDragAndDrop(videoUpload, videoPreview, 'video');
    
    // Setup video URL inputs
    initializeVideoUrlInputs();
}

// Initialize video URL inputs
function initializeVideoUrlInputs() {
    const addVideoUrlBtn = document.getElementById('add-video-url');
    const videoUrlContainer = document.getElementById('video-url-container');
    
    addVideoUrlBtn.addEventListener('click', function() {
        // Add new video URL input group
        const index = videoUrls.length;
        videoUrls.push({ url: '', title: '', description: '' });
        
        const urlGroupHTML = `
            <div class="video-url-group" data-index="${index}">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="url" class="form-control video-url-input" placeholder="e.g., https://www.youtube.com/watch?v=...">
                    <button type="button" class="btn remove-video-url" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" class="form-control video-title-input" placeholder="Video Title" style="margin-bottom: 10px;">
                <textarea class="form-control video-description-input" placeholder="Video Description (optional)" style="margin-bottom: 20px;"></textarea>
            </div>
        `;
        
        videoUrlContainer.insertAdjacentHTML('beforeend', urlGroupHTML);
        
        // Add event listeners for the new elements
        attachVideoUrlEventListeners(index);
    });
    
    // Initialize event listeners for the first URL input
    attachVideoUrlEventListeners(0);
}

// Add event listeners to video URL inputs
function attachVideoUrlEventListeners(index) {
    const group = document.querySelector(`.video-url-group[data-index="${index}"]`);
    if (!group) return;
    
    const urlInput = group.querySelector('.video-url-input');
    const titleInput = group.querySelector('.video-title-input');
    const descInput = group.querySelector('.video-description-input');
    const removeBtn = group.querySelector('.remove-video-url');
    
    // URL input change
    urlInput.addEventListener('input', function() {
        videoUrls[index].url = this.value;
    });
    
    // Title input change
    titleInput.addEventListener('input', function() {
        videoUrls[index].title = this.value;
    });
    
    // Description input change
    descInput.addEventListener('input', function() {
        videoUrls[index].description = this.value;
    });
    
    // Remove button
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (videoUrls.length <= 1) {
                // Just clear the inputs for the first group
                urlInput.value = '';
                titleInput.value = '';
                descInput.value = '';
                videoUrls[index] = { url: '', title: '', description: '' };
            } else {
                // Remove the group
                group.remove();
                videoUrls.splice(index, 1);
                
                // Update data-index attributes for remaining groups
                document.querySelectorAll('.video-url-group').forEach((g, i) => {
                    g.setAttribute('data-index', i);
                    
                    // Update event listeners
                    const inputs = g.querySelectorAll('input, textarea');
                    inputs.forEach(input => {
                        // Remove existing event listeners
                        const newInput = input.cloneNode(true);
                        input.parentNode.replaceChild(newInput, input);
                    });
                    
                    // Reattach event listeners
                    attachVideoUrlEventListeners(i);
                });
            }
        });
    }
}

// Collect video data
function collectVideoData() {
    const videos = [];
    
    // Add video files
    videoFiles.forEach(file => {
        videos.push({
            type: 'file',
            file: file,
            url: URL.createObjectURL(file),
            title: file.name.split('.')[0],
            description: ''
        });
    });
    
    // Add video URLs
    videoUrls.forEach(videoUrl => {
        if (videoUrl.url) {
            videos.push({
                type: 'url',
                url: videoUrl.url,
                title: videoUrl.title || 'Video',
                description: videoUrl.description || '',
                thumbnail: getThumbnailForVideoUrl(videoUrl.url)
            });
        }
    });
    
    return videos;
}

// Function to get thumbnail URL for video URLs (YouTube, Vimeo, etc.)
function getThumbnailForVideoUrl(url) {
    if (!url) return '';
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    
    // Vimeo
    const vimeoRegex = /vimeo.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[1]) {
        // Note: In a real application, you'd need to use the Vimeo API to get the thumbnail
        // For this demo, we'll just return a placeholder
        return 'images/video-placeholder.jpg';
    }
    
    // Default placeholder
    return 'images/video-placeholder.jpg';
}

// Helper function to determine if a URL is an external video (YouTube, Vimeo, etc.)
function isExternalVideoUrl(url) {
    if (!url) return false;
    
    const videoPatterns = [
        /youtube\.com/,
        /youtu\.be/,
        /vimeo\.com/,
        /dailymotion\.com/,
        /facebook\.com.*\/videos\//
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
}
