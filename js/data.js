/**
 * Robot data for Tgen Robotics Hub
 * This file contains robot entries that will be displayed in the encyclopedia
 * The actual data will be loaded from the GitHub repository
 */

// Initialize robotsData global object with empty robots array
window.robotsData = {
    robots: [], // Empty array - no default robots
    
    categories: [
        "Humanoid",
        "Industrial",
        "Medical",
        "Educational",
        "Entertainment",
        "Military",
        "Agricultural",
        "Household",
        "Service",
        "Research"
    ],
    
    lastUpdated: "2025-05-07T10:00:00Z",
    
    // Helper function to get robot by slug
    getRobotBySlug: function(slug) {
        return this.robots.find(robot => robot.slug === slug);
    },
    
    // Helper function to get robot by ID
    getRobotById: function(id) {
        const numId = parseInt(id);
        return this.robots.find(robot => 
            robot.id === numId || robot.id === id || robot.slug === id
        );
    },
    
    // Helper function to get related robots
    getRelatedRobots: function(id, limit = 3) {
        const robot = this.getRobotById(id);
        if (!robot) return [];
        
        return this.robots
            .filter(r => r.id !== id && (
                r.manufacturer?.name === robot.manufacturer?.name ||
                r.applications?.some(app => robot.applications?.includes(app))
            ))
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);
    },
    
    // Clear all robots (for debugging)
    clearRobots: function() {
        this.robots = [];
        console.log("Cleared all robots from memory");
        return true;
    }
};

// Force clear robots array on initial load
window.robotsData.robots = [];

// Log that the data has been initialized with an empty robot array
console.log("Robot data initialized with empty robots array. Data will be loaded from GitHub.");
