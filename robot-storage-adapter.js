/**
 * Robot Storage Adapter
 * This file contains functions for storing and retrieving robot data
 * It uses localStorage for demo purposes, but could be replaced with a real API
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
            // If loading fails or no data exists, create default structure
            data = {
                robots: [],
                categories: [],
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
            const data = initializeData();
            
            // Create or update window.robotsData
            window.robotsData = window.robotsData || {};
            window.robotsData.robots = data.robots;
            window.robotsData.categories = data.categories;
            window.robotsData.lastUpdated = data.lastUpdated;
            
            // Add helper methods to window.robotsData
            window.robotsData.getRobotById = function(id) {
                return this.robots.find(robot => robot.id === parseInt(id));
            };
            
            window.robotsData.getRobotBySlug = function(slug) {
                return this.robots.find(robot => robot.slug === slug);
            };
            
            window.robotsData.getRelatedRobots = function(id, limit = 3) {
                const robot = this.getRobotById(id);
                if (!robot) return [];
                
                // Get robots with the same manufacturer or category
                return this.robots
                    .filter(r => r.id !== id && (
                        r.manufacturer.name === robot.manufacturer.name ||
                        r.categories.some(cat => robot.categories.includes(cat))
                    ))
                    .sort(() => Math.random() - 0.5) // Shuffle
                    .slice(0, limit);
            };
            
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
            // Add the robot to the array
            window.robotsData.robots.push(robot);
            
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
            const index = window.robotsData.robots.findIndex(r => r.id === parseInt(robotId));
            
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
            const index = window.robotsData.robots.findIndex(r => r.id === parseInt(robotId));
            
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
