/**
 * Default robot data for Tgen Robotics Hub
 * This file contains the initial robot data to populate the encyclopedia
 */

window.robotsData = {
    robots: [], // Empty array - we want all robots to come from localStorage only
    categories: [
        "Humanoid", 
        "Quadruped", 
        "Industrial", 
        "Service", 
        "Research", 
        "Medical", 
        "Agricultural", 
        "Military"
    ],
    lastUpdated: new Date().toISOString(),
    
    // Helper functions
    getRobotById: function(id) {
        return this.robots.find(robot => robot.id === parseInt(id) || robot.id === id);
    },
    
    getRobotBySlug: function(slug) {
        return this.robots.find(robot => robot.slug === slug);
    },
    
    getRelatedRobots: function(id, limit = 3) {
        const robot = this.getRobotById(id);
        if (!robot) return [];
        
        // Get robots with the same manufacturer or category
        return this.robots
            .filter(r => r.id !== id && (
                r.manufacturer.name === robot.manufacturer.name
            ))
            .sort(() => Math.random() - 0.5) // Shuffle
            .slice(0, limit);
    }
};

// Expose a global function to add and save a new robot to the default data
window.saveRobotToData = function(robotData) {
    // Generate a new ID if not provided
    if (!robotData.id) {
        // Find the highest existing ID and increment by 1
        const highestId = Math.max(...window.robotsData.robots.map(r => r.id), 0);
        robotData.id = highestId + 1;
    }
    
    // Check if we're updating an existing robot
    const existingIndex = window.robotsData.robots.findIndex(r => r.id === robotData.id);
    
    if (existingIndex !== -1) {
        // Update existing robot
        window.robotsData.robots[existingIndex] = robotData;
    } else {
        // Add new robot
        window.robotsData.robots.push(robotData);
    }
    
    // Update lastUpdated timestamp
    window.robotsData.lastUpdated = new Date().toISOString();
    
    // Save to localStorage for persistence
    try {
        localStorage.setItem('tgen_robotics_data', JSON.stringify({
            robots: window.robotsData.robots,
            categories: window.robotsData.categories,
            lastUpdated: window.robotsData.lastUpdated
        }));
        return true;
    } catch (e) {
        console.error('Error saving robot data:', e);
        return false;
    }
};

// Function to initialize data from localStorage if available
window.initRobotsData = function() {
    try {
        const storedData = localStorage.getItem('tgen_robotics_data');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            // Validate data structure
            if (parsedData.robots && Array.isArray(parsedData.robots)) {
                // Use robots from localStorage
                window.robotsData.robots = parsedData.robots;
                
                // Update categories if present
                if (parsedData.categories && Array.isArray(parsedData.categories)) {
                    window.robotsData.categories = [...new Set([...window.robotsData.categories, ...parsedData.categories])];
                }
                
                // Update lastUpdated
                window.robotsData.lastUpdated = parsedData.lastUpdated || window.robotsData.lastUpdated;
            }
        }
    } catch (e) {
        console.error('Error initializing robots data:', e);
    }
};

// Initialize data when the script loads
window.initRobotsData();
