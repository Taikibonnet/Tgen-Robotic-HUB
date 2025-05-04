// robot-storage-adapter.js - Provides persistent storage for robots using localStorage

// Initialize the storage on page load
document.addEventListener('DOMContentLoaded', function() {
    initRobotStorage();
});

// Initialize the robot storage
function initRobotStorage() {
    // Check if we have robots in localStorage
    if (!localStorage.getItem('tgen_robots')) {
        // If not, use the sample data from data.js
        saveRobotsToStorage(window.robotsData.robots);
    } else {
        // If we have stored robots, load them
        loadRobotsFromStorage();
    }
    
    // Override the data.js functions to work with our storage
    overrideRobotDataFunctions();
}

// Save robots to localStorage
function saveRobotsToStorage(robots) {
    try {
        // We need to handle the URL.createObjectURL data for images
        // In a real application, images would be uploaded to a server
        const robotsToStore = robots.map(robot => {
            // Create a deep copy to avoid modifying the original
            const robotCopy = JSON.parse(JSON.stringify(robot));
            
            // Ensure we have default values for all properties
            robotCopy.media = robotCopy.media || {};
            robotCopy.media.featuredImage = robotCopy.media.featuredImage || {};
            robotCopy.media.images = robotCopy.media.images || [];
            
            // Store original media URLs to avoid losing them
            // In a real application, these would be server URLs
            if (!robotCopy.media.featuredImage.persistedUrl && robotCopy.media.featuredImage.url) {
                robotCopy.media.featuredImage.persistedUrl = robotCopy.media.featuredImage.url;
            }
            
            robotCopy.media.images.forEach(image => {
                if (!image.persistedUrl && image.url) {
                    image.persistedUrl = image.url;
                }
            });
            
            return robotCopy;
        });
        
        localStorage.setItem('tgen_robots', JSON.stringify(robotsToStore));
    } catch (error) {
        console.error('Error saving robots to storage:', error);
    }
}

// Load robots from localStorage
function loadRobotsFromStorage() {
    try {
        const storedRobots = JSON.parse(localStorage.getItem('tgen_robots') || '[]');
        
        // Restore the robots with proper URLs
        const restoredRobots = storedRobots.map(robot => {
            // Create a deep copy
            const robotCopy = JSON.parse(JSON.stringify(robot));
            
            // Restore featured image URL
            if (robotCopy.media && robotCopy.media.featuredImage) {
                if (robotCopy.media.featuredImage.persistedUrl) {
                    robotCopy.media.featuredImage.url = robotCopy.media.featuredImage.persistedUrl;
                }
            }
            
            // Restore additional images URLs
            if (robotCopy.media && robotCopy.media.images) {
                robotCopy.media.images.forEach(image => {
                    if (image.persistedUrl) {
                        image.url = image.persistedUrl;
                    }
                });
            }
            
            return robotCopy;
        });
        
        // Replace the robots in the main data object
        window.robotsData.robots = restoredRobots;
    } catch (error) {
        console.error('Error loading robots from storage:', error);
        // If there's an error, revert to the sample data
        window.robotsData.robots = window.robotsData.robots || [];
    }
}

// Override the robot data functions to work with our storage
function overrideRobotDataFunctions() {
    // Store the original functions
    const originalGetRobotById = window.robotsData.getRobotById;
    const originalGetRobotBySlug = window.robotsData.getRobotBySlug;
    
    // Override getRobotById
    window.robotsData.getRobotById = function(id) {
        // First try to get from memory
        const robot = originalGetRobotById(id);
        
        // If not found, try to reload from storage
        if (!robot) {
            loadRobotsFromStorage();
            return originalGetRobotById(id);
        }
        
        return robot;
    };
    
    // Override getRobotBySlug
    window.robotsData.getRobotBySlug = function(slug) {
        // First try to get from memory
        const robot = originalGetRobotBySlug(slug);
        
        // If not found, try to reload from storage
        if (!robot) {
            loadRobotsFromStorage();
            return originalGetRobotBySlug(slug);
        }
        
        return robot;
    };
    
    // Add a function to save changes
    window.robotsData.saveChanges = function() {
        saveRobotsToStorage(window.robotsData.robots);
    };
    
    // Override any function that modifies robots to automatically save changes
    const originalFunctions = {
        filterRobotsByCategory: window.robotsData.filterRobotsByCategory,
        filterRobotsByManufacturer: window.robotsData.filterRobotsByManufacturer,
        searchRobots: window.robotsData.searchRobots
    };
    
    // No need to override these functions as they don't modify data
}

// Function to add a new robot and save to storage
function addRobotAndSave(robot) {
    // Add the robot to the data
    window.robotsData.robots.push(robot);
    
    // Save to storage
    saveRobotsToStorage(window.robotsData.robots);
    
    return robot;
}

// Function to update a robot and save to storage
function updateRobotAndSave(robotId, updatedData) {
    // Find the robot
    const robotIndex = window.robotsData.robots.findIndex(r => r.id === robotId);
    
    if (robotIndex === -1) {
        return null;
    }
    
    // Update the robot
    window.robotsData.robots[robotIndex] = {
        ...window.robotsData.robots[robotIndex],
        ...updatedData
    };
    
    // Save to storage
    saveRobotsToStorage(window.robotsData.robots);
    
    return window.robotsData.robots[robotIndex];
}

// Function to delete a robot and save to storage
function deleteRobotAndSave(robotId) {
    // Find the robot
    const robotIndex = window.robotsData.robots.findIndex(r => r.id === robotId);
    
    if (robotIndex === -1) {
        return false;
    }
    
    // Remove the robot
    window.robotsData.robots.splice(robotIndex, 1);
    
    // Save to storage
    saveRobotsToStorage(window.robotsData.robots);
    
    return true;
}

// Export additional functions
window.robotStorage = {
    addRobotAndSave,
    updateRobotAndSave,
    deleteRobotAndSave,
    saveRobotsToStorage
};
