/**
 * Robot Storage Adapter
 * This file contains functions for storing and retrieving robot data
 * It ensures compatibility between localStorage and the default data in data.js
 */

// Initialize the window.robotStorage object
window.robotStorage = (function() {
    // Private storage key
    const STORAGE_KEY = 'tgen_robotics_data';
    
    // Initialize or load data from localStorage
    function initializeData() {
        let data;
        
        try {
            // Try to load data from localStorage
            const storedData = localStorage.getItem(STORAGE_KEY);
            
            if (storedData) {
                data = JSON.parse(storedData);
                
                // Validate data structure
                if (!data.robots || !Array.isArray(data.robots)) {
                    throw new Error('Invalid data structure');
                }
            } else {
                throw new Error('No data found');
            }
        } catch (error) {
            console.log('Initializing default robot data structure');
            
            // If loading fails or no data exists, create empty structure
            // Do NOT use default robots from data.js - start with an empty array
            data = {
                robots: [],
                categories: window.robotsData?.categories || [],
                lastUpdated: new Date().toISOString()
            };
            
            // Save the default structure
            saveData(data);
        }
        
        return data;
    }
    
    // Save data to localStorage
    function saveData(data) {
        // Update last updated timestamp
        data.lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }
    
    // Public API
    return {
        // Initialize data and make it available to the window.robotsData object
        init: function() {
            // If robotsData doesn't exist yet, create it first (handles when data.js isn't loaded)
            if (!window.robotsData) {
                window.robotsData = {
                    robots: [],
                    categories: [],
                    lastUpdated: new Date().toISOString()
                };
            }
            
            const data = initializeData();
            
            // Update window.robotsData with the data from localStorage
            window.robotsData.robots = data.robots;
            window.robotsData.categories = data.categories;
            window.robotsData.lastUpdated = data.lastUpdated;
            
            // Add helper methods to window.robotsData if they don't exist
            if (!window.robotsData.getRobotById) {
                window.robotsData.getRobotById = function(id) {
                    const numId = parseInt(id);
                    return this.robots.find(robot => 
                        robot.id === numId || robot.id === id || robot.slug === id
                    );
                };
            }
            
            if (!window.robotsData.getRobotBySlug) {
                window.robotsData.getRobotBySlug = function(slug) {
                    return this.robots.find(robot => robot.slug === slug);
                };
            }
            
            if (!window.robotsData.getRelatedRobots) {
                window.robotsData.getRelatedRobots = function(id, limit = 3) {
                    const robot = this.getRobotById(id);
                    if (!robot) return [];
                    
                    // Get robots with the same manufacturer or category
                    return this.robots
                        .filter(r => r.id !== id && (
                            r.manufacturer?.name === robot.manufacturer?.name
                        ))
                        .sort(() => Math.random() - 0.5) // Shuffle
                        .slice(0, limit);
                };
            }
            
            console.log(`Initialized robotsData with ${window.robotsData.robots.length} robots`);
            return data;
        },
        
        // Save the current state of window.robotsData
        save: function() {
            const data = {
                robots: window.robotsData.robots,
                categories: window.robotsData.categories,
                lastUpdated: new Date().toISOString()
            };
            
            return saveData(data);
        },
        
        // Add a new robot and save
        addRobotAndSave: function(robot) {
            // Check if robot already exists
            const existingIndex = window.robotsData.robots.findIndex(r => 
                r.id === robot.id || r.slug === robot.slug
            );
            
            if (existingIndex !== -1) {
                // Update existing robot
                window.robotsData.robots[existingIndex] = robot;
            } else {
                // Add the robot to the array
                window.robotsData.robots.push(robot);
            }
            
            // Add any new categories
            if (robot.categories) {
                robot.categories.forEach(category => {
                    if (!window.robotsData.categories.includes(category)) {
                        window.robotsData.categories.push(category);
                    }
                });
            }
            
            // Save to storage
            return this.save();
        },
        
        // Update an existing robot and save
        updateRobotAndSave: function(robotId, updatedData) {
            // Find the robot
            const index = window.robotsData.robots.findIndex(r => 
                r.id === parseInt(robotId) || r.id === robotId || r.slug === robotId
            );
            
            if (index === -1) {
                console.error('Robot not found with ID:', robotId);
                return false;
            }
            
            // Update the robot data
            window.robotsData.robots[index] = {
                ...window.robotsData.robots[index],
                ...updatedData
            };
            
            // Update categories if needed
            if (updatedData.categories) {
                updatedData.categories.forEach(category => {
                    if (!window.robotsData.categories.includes(category)) {
                        window.robotsData.categories.push(category);
                    }
                });
            }
            
            // Save to storage
            return this.save();
        },
        
        // Delete a robot and save
        deleteRobotAndSave: function(robotId) {
            // Find the robot
            const index = window.robotsData.robots.findIndex(r => 
                r.id === parseInt(robotId) || r.id === robotId || r.slug === robotId
            );
            
            if (index === -1) {
                console.error('Robot not found with ID:', robotId);
                return false;
            }
            
            // Remove the robot
            window.robotsData.robots.splice(index, 1);
            
            // Save to storage
            return this.save();
        },
        
        // Import data from a JSON file
        importFromJSON: function(jsonData) {
            try {
                const data = JSON.parse(jsonData);
                
                // Validate data structure
                if (!data.robots || !Array.isArray(data.robots)) {
                    throw new Error('Invalid data structure');
                }
                
                // Update window.robotsData
                window.robotsData.robots = data.robots;
                
                // Update categories
                window.robotsData.categories = data.categories || [];
                
                // Save to storage
                return this.save();
            } catch (error) {
                console.error('Error importing data:', error);
                return false;
            }
        },
        
        // Export data to a JSON string
        exportToJSON: function() {
            const data = {
                robots: window.robotsData.robots,
                categories: window.robotsData.categories,
                lastUpdated: new Date().toISOString()
            };
            
            return JSON.stringify(data, null, 2);
        },
        
        // Get storage stats
        getStats: function() {
            return {
                robotCount: window.robotsData.robots.length,
                categoryCount: window.robotsData.categories.length,
                lastUpdated: window.robotsData.lastUpdated
            };
        }
    };
})();

// Initialize data when the script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Robot Storage Adapter: Initializing data');
    window.robotStorage.init();
});
