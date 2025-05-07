/**
 * Robot data for Tgen Robotics Hub
 * This file contains robot entries that will be displayed in the encyclopedia
 * The actual data will be loaded from the GitHub repository
 */

// Initialize robotsData global object
window.robotsData = {
    robots: [],
    
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
    }
};

// Log that the data has been loaded
console.log("Robot data initialized. Data will be loaded from GitHub.");
