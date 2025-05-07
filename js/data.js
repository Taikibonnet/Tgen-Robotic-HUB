/**
 * Default robot data for Tgen Robotics Hub
 * This file contains the initial robot data to populate the encyclopedia
 */

window.robotsData = {
    robots: [
        {
            id: 1,
            name: "Spot",
            slug: "spot",
            manufacturer: {
                name: "Boston Dynamics",
                country: "United States",
                website: "https://www.bostondynamics.com/"
            },
            yearIntroduced: 2015,
            summary: "Agile quadruped robot designed for industrial inspections and data collection in challenging environments.",
            description: "<p>Spot is a four-legged robot developed by Boston Dynamics. It is designed to navigate terrain that would be challenging for wheeled robots, making it ideal for industrial inspections, construction monitoring, and other applications where mobility is essential.</p><p>With its advanced sensors and mobility, Spot can be deployed in environments that may be dangerous or inaccessible to humans, such as disaster areas, construction sites, or industrial facilities. The robot can carry payloads of up to 14 kg and has a runtime of approximately 90 minutes on a single charge.</p><p>Spot has been commercially available since 2019 and has been deployed in various industries including construction, oil and gas, utilities, and public safety.</p>",
            specifications: {
                physical: {
                    height: {
                        value: 0.84,
                        unit: "m"
                    },
                    weight: {
                        value: 32.5,
                        unit: "kg"
                    },
                    payload: {
                        value: 14,
                        unit: "kg"
                    }
                },
                performance: {
                    battery: {
                        runtime: 90
                    },
                    speed: {
                        value: 1.6,
                        unit: "m/s"
                    },
                    degreesOfFreedom: 12
                },
                sensors: [
                    { type: "Stereo depth cameras" },
                    { type: "IMU" },
                    { type: "Position/force sensors in legs" }
                ],
                connectivity: ["Wi-Fi", "Ethernet"]
            },
            media: {
                featuredImage: {
                    url: "https://robots.ieee.org/robots/spot/images/spot-image3.jpg",
                    alt: "Boston Dynamics Spot robot standing on grass"
                },
                images: [
                    {
                        url: "https://robots.ieee.org/robots/spot/images/spot-image3.jpg",
                        alt: "Boston Dynamics Spot robot standing on grass",
                        caption: "Spot can traverse various terrains including grass, stairs, and rocky surfaces."
                    },
                    {
                        url: "https://robots.ieee.org/robots/spot/images/spot-image4.jpg",
                        alt: "Spot robot climbing stairs",
                        caption: "Spot's advanced mobility allows it to navigate stairs with ease."
                    }
                ],
                videos: [
                    {
                        type: "youtube",
                        url: "https://www.youtube.com/watch?v=wlkCQXHEgjA",
                        title: "Spot Launch",
                        description: "Boston Dynamics' official launch video for Spot."
                    }
                ]
            },
            applications: [
                {
                    title: "Industrial Inspection",
                    description: "Spot can carry cameras and other sensors to perform inspections in industrial facilities.",
                    image: "https://www.bostondynamics.com/sites/default/files/2020-05/spot-product-page-construction.jpg"
                },
                {
                    title: "Construction Monitoring",
                    description: "The robot can navigate construction sites and capture data to track progress.",
                    image: "https://www.bostondynamics.com/sites/default/files/2020-05/spot-product-page-power.jpg"
                }
            ],
            stats: {
                views: 1205,
                favorites: 48
            },
            status: "published"
        },
        {
            id: 2,
            name: "Atlas",
            slug: "atlas",
            manufacturer: {
                name: "Boston Dynamics",
                country: "United States",
                website: "https://www.bostondynamics.com/"
            },
            yearIntroduced: 2013,
            summary: "Advanced humanoid robot capable of dynamic movements, parkour, and complex physical maneuvers.",
            description: "<p>Atlas is a bipedal humanoid robot developed by Boston Dynamics. It is one of the most advanced humanoid robots in the world, capable of performing dynamic movements such as backflips, handstands, and parkour.</p><p>Originally developed with funding from the U.S. Defense Advanced Research Projects Agency (DARPA), Atlas was designed to assist in emergency situations and disaster response. The robot has advanced mobility, dexterity, and perception capabilities that allow it to navigate challenging environments that would be hazardous for humans.</p><p>Over the years, Atlas has undergone several iterations, with each version showcasing improved capabilities. The latest version is entirely electric and hydraulic, with 28 degrees of freedom and a remarkable sense of balance that allows it to perform acrobatic maneuvers that would be challenging even for trained human athletes.</p>",
            specifications: {
                physical: {
                    height: {
                        value: 1.5,
                        unit: "m"
                    },
                    weight: {
                        value: 80,
                        unit: "kg"
                    }
                },
                performance: {
                    battery: {
                        runtime: 60
                    },
                    degreesOfFreedom: 28
                },
                sensors: [
                    { type: "LiDAR" },
                    { type: "Stereo vision" },
                    { type: "IMU" }
                ],
                connectivity: ["Wi-Fi"]
            },
            media: {
                featuredImage: {
                    url: "https://robots.ieee.org/robots/atlas/images/atlas-photo1.jpg",
                    alt: "Boston Dynamics Atlas humanoid robot standing"
                },
                images: [
                    {
                        url: "https://robots.ieee.org/robots/atlas/images/atlas-photo1.jpg",
                        alt: "Boston Dynamics Atlas humanoid robot standing",
                        caption: "Atlas is a hydraulic-powered humanoid robot designed for mobility research."
                    },
                    {
                        url: "https://robots.ieee.org/robots/atlas/images/atlas-photo2.jpg",
                        alt: "Atlas robot performing parkour",
                        caption: "Atlas can perform complex parkour movements with remarkable agility."
                    }
                ],
                videos: [
                    {
                        type: "youtube",
                        url: "https://www.youtube.com/watch?v=_sBBaNYex3E",
                        title: "Atlas: Partners in Parkour",
                        description: "Two Atlas robots demonstrate advanced parkour abilities."
                    }
                ]
            },
            applications: [
                {
                    title: "Disaster Response",
                    description: "Atlas could potentially be used for search and rescue in dangerous environments.",
                    image: "https://robots.ieee.org/robots/atlas/images/atlas-photo3.jpg"
                },
                {
                    title: "Research & Development",
                    description: "The robot serves as a research platform for advanced bipedal locomotion and balance.",
                    image: "https://robots.ieee.org/robots/atlas/images/atlas-photo4.jpg"
                }
            ],
            stats: {
                views: 1567,
                favorites: 82
            },
            status: "published"
        },
        {
            id: 3,
            name: "ANYmal",
            slug: "anymal",
            manufacturer: {
                name: "ANYbotics",
                country: "Switzerland",
                website: "https://www.anybotics.com/"
            },
            yearIntroduced: 2016,
            summary: "Autonomous quadruped robot designed for industrial inspections in challenging environments.",
            description: "<p>ANYmal is an autonomous quadrupedal robot developed by ANYbotics, a spin-off from ETH Zurich. It is designed to navigate complex environments to perform inspection and monitoring tasks in industrial facilities.</p><p>The robot can operate autonomously or be teleoperated, and is equipped with various sensors for perception and navigation. ANYmal can climb stairs, traverse irregular terrain, and even recover from falls, making it ideal for operational environments that would be challenging for wheeled robots.</p><p>ANYmal has been deployed in various industries including oil and gas, mining, construction, and power generation for applications such as routine inspections, monitoring, and data collection in environments that may be dangerous for humans.</p>",
            specifications: {
                physical: {
                    height: {
                        value: 0.7,
                        unit: "m"
                    },
                    weight: {
                        value: 30,
                        unit: "kg"
                    },
                    payload: {
                        value: 10,
                        unit: "kg"
                    }
                },
                performance: {
                    battery: {
                        runtime: 120
                    },
                    speed: {
                        value: 1.0,
                        unit: "m/s"
                    },
                    degreesOfFreedom: 12
                },
                sensors: [
                    { type: "LiDAR" },
                    { type: "RGB and thermal cameras" },
                    { type: "IMU" }
                ],
                connectivity: ["Wi-Fi", "4G/LTE"]
            },
            media: {
                featuredImage: {
                    url: "https://www.anybotics.com/wp-content/uploads/2022/05/ANYmal-D-Walking-1536x864.jpg",
                    alt: "ANYmal quadruped robot in an industrial setting"
                },
                images: [
                    {
                        url: "https://www.anybotics.com/wp-content/uploads/2022/05/ANYmal-D-Walking-1536x864.jpg",
                        alt: "ANYmal quadruped robot in an industrial setting",
                        caption: "ANYmal is designed for autonomous industrial inspections."
                    },
                    {
                        url: "https://www.anybotics.com/wp-content/uploads/2022/05/anymal-legged-robot-inspection-1536x864.jpeg",
                        alt: "ANYmal performing an inspection task",
                        caption: "ANYmal can navigate complex industrial environments to perform inspection tasks."
                    }
                ],
                videos: [
                    {
                        type: "youtube",
                        url: "https://www.youtube.com/watch?v=bnKOeMoibLU",
                        title: "ANYmal - Autonomous Legged Robot",
                        description: "Overview of ANYmal's capabilities and applications."
                    }
                ]
            },
            applications: [
                {
                    title: "Industrial Inspection",
                    description: "ANYmal can autonomously inspect industrial facilities to identify issues.",
                    image: "https://www.anybotics.com/wp-content/uploads/2022/03/ANYmal-inspection-mission.jpg"
                },
                {
                    title: "Oil & Gas Facility Monitoring",
                    description: "The robot can perform routine inspections of offshore platforms and refineries.",
                    image: "https://www.anybotics.com/wp-content/uploads/2022/05/anymal-legged-robot-inspection-1536x864.jpeg"
                }
            ],
            stats: {
                views: 892,
                favorites: 37
            },
            status: "published"
        }
    ],
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
    lastUpdated: "2023-07-15T12:00:00Z",
    
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
                // Merge with default data - add any robots from localStorage that aren't in the default data
                parsedData.robots.forEach(storedRobot => {
                    const exists = window.robotsData.robots.some(r => r.id === storedRobot.id);
                    if (!exists) {
                        window.robotsData.robots.push(storedRobot);
                    }
                });
                
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
