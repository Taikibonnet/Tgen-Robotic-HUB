/**
 * Robot Manager Integration
 * This file integrates all robot management functionality
 */

// Global variables
let robotList = [];
let currentPage = 1;
const robotsPerPage = 10;

/**
 * Initialize the robot manager
 */
function initializeRobotManager() {
    // Initialize storage
    window.robotStorage.init();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Load robots
    loadRobots();
    
    // Setup event listeners
    setupEventListeners();
}

/**
 * Load robots from storage and display them
 */
function loadRobots() {
    robotList = window.robotsData.robots;
    
    // Sort robots by created date (newest first)
    robotList.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
    });
    
    // Update the UI
    updateRobotTable();
    updatePagination();
}

/**
 * Display robots in the table
 */
function updateRobotTable() {
    const tableBody = document.getElementById('robot-table-body');
    if (!tableBody) return;
    
    // Clear the table
    tableBody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * robotsPerPage;
    const endIndex = startIndex + robotsPerPage;
    const paginatedRobots = robotList.slice(startIndex, endIndex);
    
    // Check if there are robots to display
    if (paginatedRobots.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 30px;">
                No robots found. Add a new robot to get started.
            </td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Add robots to the table
    paginatedRobots.forEach(robot => {
        const row = document.createElement('tr');
        
        // Format date
        const createdDate = new Date(robot.createdAt);
        const formattedDate = createdDate.toISOString().split('T')[0];
        
        // Get status class
        const statusClass = getStatusClass(robot.status);
        
        row.innerHTML = `
            <td><img src="${robot.media?.featuredImage?.url || 'images/robot-placeholder.jpg'}" alt="${robot.name}" class="robot-thumbnail"></td>
            <td>${robot.name}</td>
            <td>${robot.manufacturer.name}</td>
            <td><span class="status-badge ${statusClass}">${capitalizeFirstLetter(robot.status)}</span></td>
            <td>${formattedDate}</td>
            <td class="robot-actions-cell">
                <a href="#" class="action-icon edit-icon" data-id="${robot.id}"><i class="fas fa-edit"></i></a>
                <a href="robot-detail.html?slug=${robot.slug}" class="action-icon view-icon"><i class="fas fa-eye"></i></a>
                <a href="#" class="action-icon delete-icon" data-id="${robot.id}"><i class="fas fa-trash"></i></a>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    setupActionButtons();
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    // Clear pagination
    pagination.innerHTML = '';
    
    // Calculate total pages
    const totalPages = Math.ceil(robotList.length / robotsPerPage);
    
    // Create pagination items
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        pageItem.textContent = i;
        
        if (i === currentPage) {
            pageItem.classList.add('active');
        }
        
        pageItem.addEventListener('click', function() {
            currentPage = i;
            updateRobotTable();
            updatePagination();
        });
        
        pagination.appendChild(pageItem);
    }
    
    // If no pages, add a disabled item
    if (totalPages === 0) {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item active';
        pageItem.textContent = '1';
        pagination.appendChild(pageItem);
    }
}

/**
 * Set up event listeners for the robot manager
 */
function setupEventListeners() {
    // Add robot button
    const addRobotBtn = document.getElementById('add-robot-btn');
    if (addRobotBtn) {
        addRobotBtn.addEventListener('click', function() {
            openModal();
        });
    }
    
    // Modal close button
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            closeModal();
        });
    }
    
    // Cancel button
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            closeModal();
        });
    }
    
    // Modal overlay click to close
    const modal = document.getElementById('robot-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.modal-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
}

/**
 * Setup event listeners for table action buttons
 */
function setupActionButtons() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.edit-icon');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const robotId = this.getAttribute('data-id');
            editRobot(robotId);
        });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.delete-icon');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const robotId = this.getAttribute('data-id');
            
            if (confirm('Are you sure you want to delete this robot? This action cannot be undone.')) {
                deleteRobot(robotId);
            }
        });
    });
}

/**
 * Opens the modal dialog for adding a new robot
 */
function openModal() {
    const modal = document.getElementById('robot-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Reset form to first tab
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector('.modal-tab[data-tab="basic"]').classList.add('active');
    document.getElementById('tab-basic').classList.add('active');
    
    // Set the title to Add New Robot
    document.getElementById('modal-title').textContent = 'Add New Robot';
}

/**
 * Edit a robot
 */
function editRobot(robotId) {
    const robot = window.robotsData.getRobotById(parseInt(robotId));
    
    if (!robot) {
        alert('Robot not found');
        return;
    }
    
    // Open the modal
    openModal();
    
    // Set the title to Edit Robot
    document.getElementById('modal-title').textContent = 'Edit Robot';
    
    // Set the form's data-robot-id attribute
    document.getElementById('robot-form').setAttribute('data-robot-id', robotId);
    
    // Fill in the form with the robot's data
    populateRobotForm(robot);
}

/**
 * Populate the robot form with data
 */
function populateRobotForm(robot) {
    // Basic info
    document.getElementById('robot-name').value = robot.name;
    document.getElementById('robot-slug').value = robot.slug;
    document.getElementById('manufacturer-name').value = robot.manufacturer.name;
    document.getElementById('manufacturer-country').value = robot.manufacturer.country;
    document.getElementById('manufacturer-website').value = robot.manufacturer.website;
    document.getElementById('year-introduced').value = robot.yearIntroduced;
    document.getElementById('robot-status').value = robot.status;
    document.getElementById('robot-summary').value = robot.summary;
    document.getElementById('robot-description').value = robot.description;
    
    // Specifications
    if (robot.specifications) {
        // Physical
        if (robot.specifications.physical) {
            if (robot.specifications.physical.height) {
                document.getElementById('spec-height').value = robot.specifications.physical.height.value;
                document.getElementById('spec-height-unit').value = robot.specifications.physical.height.unit;
            }
            
            if (robot.specifications.physical.weight) {
                document.getElementById('spec-weight').value = robot.specifications.physical.weight.value;
                document.getElementById('spec-weight-unit').value = robot.specifications.physical.weight.unit;
            }
            
            if (robot.specifications.physical.payload) {
                document.getElementById('spec-payload').value = robot.specifications.physical.payload.value;
                document.getElementById('spec-payload-unit').value = robot.specifications.physical.payload.unit;
            }
            
            if (robot.specifications.physical.maxDeadlift) {
                document.getElementById('spec-deadlift').value = robot.specifications.physical.maxDeadlift.value;
                document.getElementById('spec-deadlift-unit').value = robot.specifications.physical.maxDeadlift.unit;
            }
        }
        
        // Performance
        if (robot.specifications.performance) {
            if (robot.specifications.performance.battery) {
                document.getElementById('spec-battery-runtime').value = robot.specifications.performance.battery.runtime;
            }
            
            if (robot.specifications.performance.speed) {
                document.getElementById('spec-speed').value = robot.specifications.performance.speed.value;
                document.getElementById('spec-speed-unit').value = robot.specifications.performance.speed.unit;
            }
        }
        
        // Hardware
        if (robot.specifications.hardware) {
            document.getElementById('spec-hands').value = robot.specifications.hardware.hands;
            document.getElementById('spec-actuators').value = robot.specifications.hardware.actuators;
            document.getElementById('spec-sensors').value = robot.specifications.hardware.sensors;
            document.getElementById('spec-power-source').value = robot.specifications.hardware.powerSource;
            document.getElementById('spec-processor').value = robot.specifications.hardware.processor;
            document.getElementById('spec-connectivity').value = robot.specifications.hardware.connectivity;
        }
        
        // Custom fields
        if (robot.specifications.customFields && robot.specifications.customFields.length > 0) {
            const customSpecFields = document.getElementById('custom-spec-fields');
            customSpecFields.innerHTML = '';
            
            robot.specifications.customFields.forEach(field => {
                const customSpecRow = document.createElement('div');
                customSpecRow.className = 'custom-spec-row';
                customSpecRow.style.display = 'flex';
                customSpecRow.style.gap = '10px';
                customSpecRow.style.marginBottom = '15px';
                
                customSpecRow.innerHTML = `
                    <input type="text" class="form-control custom-spec-name" placeholder="Specification Name" style="flex: 2;" value="${field.name}">
                    <input type="text" class="form-control custom-spec-value" placeholder="Value" style="flex: 1;" value="${field.value}">
                    <input type="text" class="form-control custom-spec-unit" placeholder="Unit" style="flex: 1;" value="${field.unit || ''}">
                    <button type="button" class="btn remove-custom-spec" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                customSpecFields.appendChild(customSpecRow);
                
                // Add event listener to remove button
                const removeBtn = customSpecRow.querySelector('.remove-custom-spec');
                removeBtn.addEventListener('click', function() {
                    customSpecRow.remove();
                });
            });
        }
    }
    
    // Media
    // Note: For editing, we typically don't pre-populate file inputs as they can't be programmatically
    // set due to security restrictions. Instead, we might show thumbnails of existing images.
    
    // For videos, we need to prepopulate the video URL inputs
    if (robot.media && robot.media.videos && robot.media.videos.length > 0) {
        // Filter for URL type videos
        const videoUrlsFromRobot = robot.media.videos.filter(video => video.type === 'url');
        
        if (videoUrlsFromRobot.length > 0) {
            // Reset videoUrls array
            videoUrls = [];
            
            // Clear existing video URL inputs
            const videoUrlContainer = document.getElementById('video-url-container');
            videoUrlContainer.innerHTML = '';
            
            // Add video URL inputs for each video
            videoUrlsFromRobot.forEach((video, index) => {
                videoUrls.push({
                    url: video.url,
                    title: video.title,
                    description: video.description
                });
                
                const urlGroupHTML = `
                    <div class="video-url-group" data-index="${index}">
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <input type="url" class="form-control video-url-input" placeholder="e.g., https://www.youtube.com/watch?v=..." value="${video.url}">
                            <button type="button" class="btn remove-video-url" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        <input type="text" class="form-control video-title-input" placeholder="Video Title" style="margin-bottom: 10px;" value="${video.title}">
                        <textarea class="form-control video-description-input" placeholder="Video Description (optional)" style="margin-bottom: 20px;">${video.description || ''}</textarea>
                    </div>
                `;
                
                videoUrlContainer.insertAdjacentHTML('beforeend', urlGroupHTML);
                
                // Add event listeners for the new elements
                attachVideoUrlEventListeners(index);
            });
        }
    }
}

/**
 * Delete a robot
 */
function deleteRobot(robotId) {
    // Delete the robot
    const success = window.robotStorage.deleteRobotAndSave(parseInt(robotId));
    
    if (success) {
        // Reload the robots
        loadRobots();
        
        // Show success message
        alert('Robot deleted successfully!');
    } else {
        // Show error message
        alert('Error deleting robot');
    }
}

/**
 * Get the CSS class for a status
 */
function getStatusClass(status) {
    switch (status) {
        case 'published':
            return 'status-published';
        case 'draft':
            return 'status-draft';
        case 'archived':
            return 'status-archived';
        default:
            return '';
    }
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
