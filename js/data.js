/**
 * Default robot data for Tgen Robotics Hub
 * This file contains the initial robot data to populate the encyclopedia
 */

// Default example robot that will always be displayed for all users
const defaultRobots = [
    {
        id: 1001,
        name: "Optimus",
        slug: "optimus-robot",
        manufacturer: {
            name: "Gen Technologies",
            country: "France",
            website: "https://www.gen-tech.fr/"
        },
        yearIntroduced: 2025,
        summary: "Versatile humanoid robot designed for general-purpose applications in human environments.",
        description: "<p>Optimus is a cutting-edge humanoid robot developed by Gen Technologies. With its advanced AI capabilities and precision engineering, it represents the next generation of robotics designed to work alongside humans in everyday environments.</p><p>Featuring advanced mobility systems and human-like dexterity, Optimus can navigate complex environments, manipulate objects with precision, and interact naturally with humans through advanced speech recognition and response systems.</p><p>Its modular design allows for customization based on specific application needs, making it suitable for a wide range of industries from healthcare and hospitality to manufacturing and education.</p>",
        specifications: {
            physical: {
                height: {
                    value: 1.75,
                    unit: "m"
                },
                weight: {
                    value: 75,
                    unit: "kg"
                },
                payload: {
                    value: 20,
                    unit: "kg"
                }
            },
            performance: {
                battery: {
                    runtime: 180
                },
                speed: {
                    value: 1.8,
                    unit: "m/s"
                },
                degreesOfFreedom: 32
            },
            sensors: [
                { type: "Vision" },
                { type: "LiDAR" },
                { type: "Pressure & Touch" },
                { type: "IMU" }
            ],
            connectivity: ["Wi-Fi", "5G", "Bluetooth 5.2"]
        },
        media: {
            featuredImage: {
                url: "images/robots/optimus.jpg",
                alt: "Optimus humanoid robot"
            },
            images: [
                {
                    url: "images/robots/optimus.jpg",
                    alt: "Optimus humanoid robot",
                    caption: "Optimus can navigate complex environments and perform a wide range of tasks."
                }
            ],
            videos: [
                {
                    type: "url",
                    url: "https://www.youtube.com/watch?v=example",
                    title: "Optimus in Action",
                    description: "See how Optimus navigates and interacts in various environments."
                }
            ]
        },
        applications: [
            {
                title: "Healthcare Assistance",
                description: "Optimus provides support in healthcare settings, assisting with patient care and logistics.",
                image: "images/applications/healthcare.jpg"
            },
            {
                title: "Manufacturing",
                description: "In manufacturing environments, Optimus handles complex assembly tasks and collaborates with human workers.",
                image: "images/applications/manufacturing.jpg"
            }
        ],
        stats: {
            views: 3500,
            favorites: 120
        },
        categories: ["Humanoid", "Service", "Industrial"],
        status: "published",
        createdAt: "2025-04-15T10:30:00Z",
        updatedAt: "2025-05-01T14:45:00Z"
    }
];

window.robotsData = {
    robots: defaultRobots,
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
                // Check if user-added robots exist in localStorage
                if (parsedData.robots.length > defaultRobots.length) {
                    // Add user-defined robots to default robots, ensuring no duplicates
                    parsedData.robots.forEach(storedRobot => {
                        // Skip default robots (based on ID)
                        if (defaultRobots.some(dr => dr.id === storedRobot.id)) {
                            return;
                        }
                        
                        // Add user robot if not already in the array
                        if (!window.robotsData.robots.some(r => r.id === storedRobot.id)) {
                            window.robotsData.robots.push(storedRobot);
                        }
                    });
                }
                
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
