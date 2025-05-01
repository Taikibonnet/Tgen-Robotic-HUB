// robot-admin-connector.js - Connects the admin dashboard with the encyclopedia

document.addEventListener('DOMContentLoaded', () => {
    // Check for edit parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        // We're editing an existing robot
        loadRobotForEditing(parseInt(editId));
    }
    
    // Check for action (view) parameter
    const action = urlParams.get('action');
    const robotId = urlParams.get('id');
    
    if (action === 'view' && robotId) {
        // View a robot from the admin dashboard
        viewRobotFromAdmin(parseInt(robotId));
    }
    
    // Set up navigation links between admin and encyclopedia
    setupNavigationLinks();
});

// Load a robot for editing in the admin form
function loadRobotForEditing(robotId) {
    const robot = DataManager.getRobotById(robotId);
    
    if (!robot) {
        alert('Robot not found');
        return;
    }
    
    // Call the robot form opening function from robot-management.js
    if (typeof openRobotForm === 'function') {
        openRobotForm(robotId);
    } else {
        console.error('openRobotForm function not available');
    }
}

// View a robot from the admin dashboard
function viewRobotFromAdmin(robotId) {
    const robot = DataManager.getRobotById(robotId);
    
    if (!robot) {
        alert('Robot not found');
        return;
    }
    
    // Redirect to the robot detail page
    window.location.href = `robot-detail.html?slug=${robot.slug}`;
}

// Set up navigation links between admin and encyclopedia
function setupNavigationLinks() {
    // Add edit buttons to robot detail page for admin users
    if (isAdminUser() && window.location.pathname.includes('robot-detail.html')) {
        addEditButton();
    }
    
    // Add view links in admin dashboard
    if (window.location.pathname.includes('admin-robot-management.html')) {
        enhanceAdminTable();
    }
}

// Check if current user is an admin
function isAdminUser() {
    const user = DataManager.getCurrentUser();
    return user && user.role === 'admin';
}

// Add edit button to robot detail page
function addEditButton() {
    const actionBar = document.querySelector('.robot-actions');
    
    if (!actionBar) return;
    
    const editButton = document.createElement('div');
    editButton.id = 'edit-robot-btn';
    editButton.className = 'action-icon edit-icon';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Edit Robot';
    
    actionBar.appendChild(editButton);
}

// Enhance admin table with direct view links
function enhanceAdminTable() {
    // This functionality is already implemented in robot-management.js
    // through the preview-icon class
}

// Handle file uploads (for images and videos)
function handleFileUpload(file, onUploaded) {
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Data = e.target.result;
        
        // Store the file in DataManager
        const mediaId = DataManager.storeMedia(file.name, file.type, base64Data);
        
        if (onUploaded && typeof onUploaded === 'function') {
            onUploaded(mediaId, base64Data);
        }
    };
    
    reader.readAsDataURL(file);
}

// Export an API for other modules to use
window.RobotAdminConnector = {
    handleFileUpload,
    isAdminUser,
    loadRobotForEditing,
    viewRobotFromAdmin
};
