/**
 * Robot Storage Adapter
 * This file contains functions for storing and retrieving robot data
 * It ensures compatibility between localStorage and GitHub storage
 */

// Comment out this line to prevent clearing localStorage on every page load
// localStorage.removeItem('tgen_robotics_data');

// Initialize the window.robotStorage object
window.robotStorage = (function() {
    // Private storage key
    const STORAGE_KEY = 'tgen_robotics_data';
    
    // Initialize or load data from storage
    async function initializeData() {
        let data;
        
        try {
            // Try using GitHub storage first if available
            if (window.githubStorage && typeof window.githubStorage.init === 'function') {
                console.log('Using GitHub storage for robot data');
                await window.githubStorage.init();
                return window.robotsData;
            }
            
            // Otherwise try localStorage
            console.log('Using localStorage for robot data');
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
            
            // If loading fails or no data exists, initialize with default robots
            data = {
                robots: window.defaultRobots || [], // Use default robots if available
                categories: window.robotsData?.categories || [],
                lastUpdated: new Date().toISOString()
            };
            
            // Save the structure
            saveData(data);
        }
        
        return data;
    }
    
    // Save data to storage
    async function saveData(data) {
        // Update last updated timestamp
        data.lastUpdated = new Date().toISOString();
        
        // Try GitHub storage first
        if (window.githubStorage && typeof window.githubStorage.save === 'function') {
            // Make sure robotsData is updated first
            window.robotsData.robots = data.robots;
            window.robotsData.categories = data.categories;
            window.robotsData.lastUpdated = data.lastUpdated;
            
            // Save using GitHub storage
            const success = await window.githubStorage.save();
            
            if (success) {
                console.log('Saved data to GitHub');
                return true;
            } else {
                console.warn('Failed to save to GitHub, falling back to localStorage');
            }
        }
        
        // Save to localStorage as fallback
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log('Saved data to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }
    
    // Public API
    return {
        // Initialize data and make it available to the window.robotsData object
        init: async function() {
            // Setup default robots if not available
            if (!window.defaultRobots) {
                window.defaultRobots = [
                    {
                        id: 1,
                        name: "Spot",
                        slug: "spot",
                        manufacturer: {
                            name: "Boston Dynamics",
                            country: "USA",
                            website: "https://www.bostondynamics.com"
                        },
                        yearIntroduced: 2019,
                        categories: ["Quadruped", "Mobile Robot"],
                        summary: "Nimble robot dog that can navigate terrain that wheeled robots cannot.",
                        status: "published",
                        createdAt: "2025-04-15T00:00:00.000Z",
                        updatedAt: "2025-04-15T00:00:00.000Z",
                        media: {
                            featuredImage: "images/robots/spot.jpg"
                        }
                    },
                    {
                        id: 2,
                        name: "Atlas",
                        slug: "atlas",
                        manufacturer: {
                            name: "Boston Dynamics",
                            country: "USA",
                            website: "https://www.bostondynamics.com"
                        },
                        yearIntroduced: 2013,
                        categories: ["Humanoid", "Bipedal"],
                        summary: "Advanced humanoid robot designed to perform dynamic movements and tasks.",
                        status: "published",
                        createdAt: "2025-04-10T00:00:00.000Z",
                        updatedAt: "2025-04-10T00:00:00.000Z",
                        media: {
                            featuredImage: "images/robots/atlas.jpg"
                        }
                    },
                    {
                        id: 3,
                        name: "ANYmal",
                        slug: "anymal",
                        manufacturer: {
                            name: "ANYbotics",
                            country: "Switzerland",
                            website: "https://www.anybotics.com"
                        },
                        yearIntroduced: 2016,
                        categories: ["Quadruped", "Industrial"],
                        summary: "Autonomous legged robot designed for industrial inspection tasks.",
                        status: "published",
                        createdAt: "2025-04-08T00:00:00.000Z",
                        updatedAt: "2025-04-08T00:00:00.000Z",
                        media: {
                            featuredImage: "images/robots/anymal.jpg"
                        }
                    }
                ];
            }

            // Make sure window.robotsData exists
            if (!window.robotsData) {
                console.warn('Robot Storage Adapter: robotsData is not defined, creating default');
                window.robotsData = {
                    robots: [],
                    categories: [],
                    lastUpdated: new Date().toISOString()
                };
            }
            
            // Load data from storage
            const data = await initializeData();
            
            // If we got data from initializeData and we're not using GitHub storage
            if (data !== window.robotsData) {
                // Update window.robotsData with the loaded data
                window.robotsData.robots = data.robots || [];
                window.robotsData.categories = data.categories;
                window.robotsData.lastUpdated = data.lastUpdated;
            }
            
            // Ensure robots array is an array (not null or undefined)
            if (!Array.isArray(window.robotsData.robots)) {
                window.robotsData.robots = [];
            }
            
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
            
            if (!window.robotsData.clearRobots) {
                window.robotsData.clearRobots = function() {
                    this.robots = [];
                    console.log("Cleared all robots from memory");
                    return true;
                };
            }
            
            console.log(`Initialized robotsData with ${window.robotsData.robots.length} robots`);
            
            // Save the loaded data back to localStorage if not using GitHub
            if (!window.githubStorage || typeof window.githubStorage.save !== 'function') {
                await this.save();
            }
            
            return window.robotsData;
        },
        
        // Save the current state of window.robotsData
        save: async function() {
            const data = {
                robots: window.robotsData.robots,
                categories: window.robotsData.categories,
                lastUpdated: new Date().toISOString()
            };
            
            return await saveData(data);
        },
        
        // Add a new robot and save
        addRobotAndSave: async function(robot) {
            // Use GitHub storage if available
            if (window.githubStorage && typeof window.githubStorage.addRobotAndSave === 'function') {
                return await window.githubStorage.addRobotAndSave(robot);
            }
            
            // Otherwise use the legacy approach
            // Check if robot already exists
            const existingIndex = window.robotsData.robots.findIndex(r => 
                r.id === robot.id || r.slug === robot.slug
            );
            
            if (existingIndex !== -1) {
                // Update existing robot
                window.robotsData.robots[existingIndex] = robot;
                console.log(`Updated robot: ${robot.name} (${robot.id})`);
            } else {
                // Add the robot to the array
                window.robotsData.robots.push(robot);
                console.log(`Added new robot: ${robot.name} (${robot.id})`);
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
            return await this.save();
        },
        
        // Update an existing robot and save
        updateRobotAndSave: async function(robotId, updatedData) {
            // Use GitHub storage if available
            if (window.githubStorage && typeof window.githubStorage.updateRobotAndSave === 'function') {
                return await window.githubStorage.updateRobotAndSave(robotId, updatedData);
            }
            
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
                ...updatedData,
                updatedAt: new Date().toISOString()
            };
            
            console.log(`Updated robot: ${window.robotsData.robots[index].name} (${robotId})`);
            
            // Update categories if needed
            if (updatedData.categories) {
                updatedData.categories.forEach(category => {
                    if (!window.robotsData.categories.includes(category)) {
                        window.robotsData.categories.push(category);
                    }
                });
            }
            
            // Save to storage
            return await this.save();
        },
        
        // Delete a robot and save
        deleteRobotAndSave: async function(robotId) {
            // Use GitHub storage if available
            if (window.githubStorage && typeof window.githubStorage.deleteRobotAndSave === 'function') {
                return await window.githubStorage.deleteRobotAndSave(robotId);
            }
            
            // Find the robot
            const index = window.robotsData.robots.findIndex(r => 
                r.id === parseInt(robotId) || r.id === robotId || r.slug === robotId
            );
            
            if (index === -1) {
                console.error('Robot not found with ID:', robotId);
                return false;
            }
            
            const robotName = window.robotsData.robots[index].name;
            
            // Remove the robot
            window.robotsData.robots.splice(index, 1);
            console.log(`Deleted robot: ${robotName} (${robotId})`);
            
            // Save to storage
            return await this.save();
        },
        
        // Import data from a JSON file
        importFromJSON: async function(jsonData) {
            try {
                const data = JSON.parse(jsonData);
                
                // Validate data structure
                if (!data.robots || !Array.isArray(data.robots)) {
                    throw new Error('Invalid data structure');
                }
                
                // Update window.robotsData
                window.robotsData.robots = data.robots;
                window.robotsData.categories = data.categories || [];
                window.robotsData.lastUpdated = new Date().toISOString();
                
                // Save to storage
                return await this.save();
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
                lastUpdated: window.robotsData.lastUpdated,
                storageType: window.githubStorage ? 'GitHub' : 'localStorage'
            };
        },
        
        // Clear all stored robots
        clearRobots: async function() {
            // Empty the robots array
            window.robotsData.robots = [];
            
            // Save changes
            return await this.save();
        }
    };
})();

// Initialize data when the script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Robot Storage Adapter: Initializing data');
    window.robotStorage.init();
});