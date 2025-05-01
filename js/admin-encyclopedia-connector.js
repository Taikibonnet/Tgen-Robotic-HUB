// admin-encyclopedia-connector.js - Connector between admin and public encyclopedia

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for encyclopedia view buttons
    initViewButtons();
    
    // Add publish/unpublish event handlers
    initPublishHandlers();
});

// Initialize view buttons to link to encyclopedia
function initViewButtons() {
    // Get all "View in Encyclopedia" buttons
    const viewButtons = document.querySelectorAll('.action-icon.view-icon');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // If this button is not already a link (in case we're initializing twice)
            if (!this.getAttribute('href')) {
                e.preventDefault();
                
                // Get the robot data
                const row = this.closest('tr');
                const name = row.querySelector('td:nth-child(2)').textContent.trim();
                
                // Get slug or generate from name
                let slug = name.toLowerCase().replace(/\s+/g, '-');
                
                // Redirect to encyclopedia detail page
                window.location.href = `robot-detail.html?slug=${slug}`;
            }
        });
    });
}

// Initialize handlers for publishing robots to encyclopedia
function initPublishHandlers() {
    // Handle status changes
    const statusSelects = document.querySelectorAll('#robot-status');
    
    statusSelects.forEach(select => {
        // Store original value
        let originalValue = select.value;
        
        select.addEventListener('change', function() {
            const newValue = this.value;
            
            // If changing from draft to published
            if (originalValue === 'draft' && newValue === 'published') {
                // Show confirmation message
                if (confirm('Publishing this robot will make it visible in the encyclopedia. Continue?')) {
                    originalValue = newValue;
                    // When a robot is published, we should ensure it appears in the encyclopedia
                    syncRobotToEncyclopedia();
                } else {
                    // Revert to original value if user cancels
                    this.value = originalValue;
                }
            }
            
            // If changing from published to draft or archived
            if (originalValue === 'published' && (newValue === 'draft' || newValue === 'archived')) {
                if (confirm('This robot will no longer be visible in the public encyclopedia. Continue?')) {
                    originalValue = newValue;
                    // When a robot is unpublished, we should remove it from the encyclopedia or mark it as hidden
                    removeRobotFromEncyclopedia();
                } else {
                    // Revert to original value if user cancels
                    this.value = originalValue;
                }
            }
        });
    });
}

// Sync robot data to the encyclopedia data store
function syncRobotToEncyclopedia() {
    // Get the current robot data from the form
    const robotData = getRobotFormData();
    
    if (robotData) {
        // Add or update the robot in the DataManager
        if (robotData.id) {
            // If the robot has an ID, update it
            DataManager.updateRobot(robotData.id, robotData);
        } else {
            // Otherwise create a new robot
            DataManager.createRobot(robotData);
        }
        
        console.log('Robot data synced to encyclopedia:', robotData);
    }
}

// Remove robot from encyclopedia or mark as hidden
function removeRobotFromEncyclopedia() {
    // Get the current robot ID
    const robotId = document.getElementById('robot-id')?.value;
    
    if (robotId) {
        // Get the robot data
        const robot = DataManager.getRobotById(parseInt(robotId));
        
        if (robot) {
            // Update the status to match what was selected
            robot.status = document.getElementById('robot-status').value;
            DataManager.updateRobot(robot.id, robot);
            
            console.log('Robot updated in encyclopedia:', robot);
        }
    }
}

// Get robot data from the form
function getRobotFormData() {
    // Get form elements
    const nameInput = document.getElementById('robot-name');
    const slugInput = document.getElementById('robot-slug');
    const manufacturerNameInput = document.getElementById('manufacturer-name');
    const manufacturerCountryInput = document.getElementById('manufacturer-country');
    const manufacturerWebsiteInput = document.getElementById('manufacturer-website');
    const yearIntroducedInput = document.getElementById('year-introduced');
    const statusSelect = document.getElementById('robot-status');
    const summaryTextarea = document.getElementById('robot-summary');
    const descriptionTextarea = document.getElementById('robot-description');
    
    // Check for required fields
    if (!nameInput || !manufacturerNameInput || !summaryTextarea) {
        console.error('Required form fields not found');
        return null;
    }
    
    // Get categories
    const categoryTags = document.querySelectorAll('#category-tags .tag');
    const categories = Array.from(categoryTags).map(tag => tag.textContent.trim().replace('×', '').trim());
    
    // Create the robot data object
    const robotData = {
        name: nameInput.value,
        slug: slugInput.value || DataManager.slugify(nameInput.value),
        manufacturer: {
            name: manufacturerNameInput.value,
            country: manufacturerCountryInput?.value || '',
            website: manufacturerWebsiteInput?.value || ''
        },
        yearIntroduced: yearIntroducedInput?.value ? parseInt(yearIntroducedInput.value) : null,
        categories: categories,
        summary: summaryTextarea.value,
        description: descriptionTextarea.value,
        status: statusSelect?.value || 'draft'
    };
    
    return robotData;
}

// Add a "Save & View in Encyclopedia" button to the robot form
function addSaveAndViewButton() {
    const formFooter = document.querySelector('.modal-footer');
    
    if (formFooter) {
        // Create the button
        const saveAndViewBtn = document.createElement('button');
        saveAndViewBtn.type = 'button';
        saveAndViewBtn.className = 'btn btn-primary';
        saveAndViewBtn.textContent = 'Save & View in Encyclopedia';
        
        // Add event listener
        saveAndViewBtn.addEventListener('click', function() {
            // First save the robot
            const saveBtn = document.querySelector('.modal-footer button[type="submit"]');
            saveBtn.click();
            
            // Then redirect to the encyclopedia
            setTimeout(function() {
                const slug = document.getElementById('robot-slug').value || 
                              DataManager.slugify(document.getElementById('robot-name').value);
                              
                window.location.href = `robot-detail.html?slug=${slug}`;
            }, 500);  // Small delay to ensure save completes
        });
        
        // Insert before the save button
        formFooter.insertBefore(saveAndViewBtn, formFooter.firstChild);
    }
}

// Call this function when the robot edit modal is opened
function onRobotModalOpen() {
    addSaveAndViewButton();
}

// Add a custom event listener for when robot modal opens
document.addEventListener('robotModalOpened', onRobotModalOpen);
