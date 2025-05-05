// Namespace for the application
window.tgenApp = window.tgenApp || {};

// Robot data storage module
(function() {
    // The key for local storage
    const ROBOTS_STORAGE_KEY = 'tgen_robots_data';
    
    // Sample robots data
    const sampleRobotsData = {
        robots: []
    };
    
    // Initialize data in local storage if not exists
    function initStorage() {
        if (!localStorage.getItem(ROBOTS_STORAGE_KEY)) {
            localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(sampleRobotsData));
        }
        
        // Initialize the robotsData global variable
        window.robotsData = JSON.parse(localStorage.getItem(ROBOTS_STORAGE_KEY));
    }
    
    // Get all robots
    function getAllRobots() {
        const data = JSON.parse(localStorage.getItem(ROBOTS_STORAGE_KEY));
        return data.robots || [];
    }
    
    // Get robot by ID
    function getRobotById(id) {
        const robots = getAllRobots();
        return robots.find(robot => robot.id === id);
    }
    
    // Get robot by slug
    function getRobotBySlug(slug) {
        const robots = getAllRobots();
        return robots.find(robot => robot.slug === slug);
    }
    
    // Add a new robot
    function addRobot(robotData) {
        const data = JSON.parse(localStorage.getItem(ROBOTS_STORAGE_KEY));
        
        // Generate unique ID
        robotData.id = 'robot_' + Date.now();
        
        // Add robot to the array
        data.robots.push(robotData);
        
        // Save to local storage
        localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(data));
        
        // Update the global robotsData variable
        window.robotsData = data;
        
        return robotData;
    }
    
    // Update an existing robot
    function updateRobot(id, robotData) {
        const data = JSON.parse(localStorage.getItem(ROBOTS_STORAGE_KEY));
        
        // Find the robot index
        const robotIndex = data.robots.findIndex(robot => robot.id === id);
        
        if (robotIndex !== -1) {
            // Update robot data (preserve ID)
            robotData.id = id;
            data.robots[robotIndex] = robotData;
            
            // Save to local storage
            localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(data));
            
            // Update the global robotsData variable
            window.robotsData = data;
            
            return robotData;
        }
        
        return null;
    }
    
    // Delete a robot
    function deleteRobot(id) {
        const data = JSON.parse(localStorage.getItem(ROBOTS_STORAGE_KEY));
        
        // Filter out the robot
        data.robots = data.robots.filter(robot => robot.id !== id);
        
        // Save to local storage
        localStorage.setItem(ROBOTS_STORAGE_KEY, JSON.stringify(data));
        
        // Update the global robotsData variable
        window.robotsData = data;
        
        return true;
    }
    
    // User management (simplified)
    function getCurrentUser() {
        return JSON.parse(localStorage.getItem('tgen_current_user')) || null;
    }
    
    function setCurrentUser(user) {
        localStorage.setItem('tgen_current_user', JSON.stringify(user));
    }
    
    function logout() {
        localStorage.removeItem('tgen_current_user');
    }
    
    // Initialize when script is loaded
    initStorage();
    
    // Export functions to global namespace
    window.initStorage = initStorage;
    window.getAllRobots = getAllRobots;
    window.getRobotById = getRobotById;
    window.getRobotBySlug = getRobotBySlug;
    window.addRobot = addRobot;
    window.updateRobot = updateRobot;
    window.deleteRobot = deleteRobot;
    
    // User management
    window.tgenApp.getCurrentUser = getCurrentUser;
    window.tgenApp.setCurrentUser = setCurrentUser;
    window.tgenApp.logout = logout;
})();
