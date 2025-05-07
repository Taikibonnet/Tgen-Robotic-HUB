/**
 * Example robot data for Tgen Robotics Hub
 * This file contains sample robot entries that will be displayed in the encyclopedia
 */

// Initialize robotsData global object
window.robotsData = {
    robots: [
        {
            id: 1,
            name: "Atlas",
            slug: "atlas",
            summary: "A dynamic humanoid robot designed for mobility, dexterity, and agile navigation in challenging environments.",
            description: "Atlas is a humanoid robot designed to navigate rough terrain and perform a wide range of physical tasks. With advanced mobility, dexterity, and perception, Atlas can tackle complex environments that would be challenging even for humans. It represents cutting-edge research in robotics and artificial intelligence.",
            manufacturer: {
                name: "Boston Dynamics",
                country: "United States",
                website: "https://www.bostondynamics.com"
            },
            specifications: {
                height: 1.5,
                weight: 80,
                powerSource: "Electric battery",
                sensors: ["3D vision sensors", "IMU", "LIDAR", "Pressure sensors"],
                actuators: ["Hydraulic actuators", "Electric motors"]
            },
            media: {
                featuredImage: {
                    url: "images/robots/robot-example.jpg",
                    alt: "Atlas humanoid robot standing upright"
                },
                images: [
                    {
                        url: "images/robots/robot-example.jpg",
                        alt: "Atlas humanoid robot standing upright",
                        caption: "Atlas in standing position"
                    },
                    {
                        url: "images/robots/featured-robot.jpg",
                        alt: "Atlas robot performing a complex movement",
                        caption: "Atlas demonstrating agility"
                    }
                ],
                videos: [
                    {
                        url: "https://www.youtube.com/watch?v=tF4DML7FIWk",
                        type: "youtube",
                        title: "Atlas: Partners in Parkour",
                        description: "Watch Atlas robots perform parkour maneuvers with incredible agility and coordination."
                    }
                ]
            },
            applications: ["Research", "Disaster response", "Industrial tasks"],
            features: ["Dynamic balancing", "Whole-body mobile manipulation", "Rough terrain navigation"]
        },
        {
            id: 2,
            name: "TGen Assistant",
            slug: "tgen-assistant",
            summary: "An advanced AI-powered robotic assistant designed to support daily tasks and provide information.",
            description: "The TGen Assistant is our flagship robotic companion designed to integrate seamlessly into home and office environments. With advanced natural language processing, visual recognition, and problem-solving capabilities, this robot provides practical assistance while maintaining intuitive interaction. Its modular design allows for customization based on specific user needs.",
            manufacturer: {
                name: "TGen Robotics",
                country: "Japan",
                website: "https://www.tgenrobotics.com"
            },
            specifications: {
                height: 1.2,
                weight: 40,
                powerSource: "Rechargeable lithium-ion battery",
                sensors: ["360° cameras", "Microphone array", "Touch sensors", "Environmental sensors"],
                actuators: ["Precision servo motors", "Articulated fingers"]
            },
            media: {
                featuredImage: {
                    url: "images/robots/featured-robot.jpg",
                    alt: "TGen Assistant robot in home environment"
                },
                images: [
                    {
                        url: "images/robots/featured-robot.jpg",
                        alt: "TGen Assistant in home environment",
                        caption: "TGen Assistant helping in kitchen tasks"
                    },
                    {
                        url: "images/robots/robot-example.jpg",
                        alt: "TGen Assistant interacting with user",
                        caption: "Natural interaction with users"
                    }
                ],
                videos: [
                    {
                        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                        type: "youtube",
                        title: "TGen Assistant Demo",
                        description: "See the TGen Assistant in action performing various tasks around the home."
                    }
                ]
            },
            applications: ["Home automation", "Elderly care", "Office assistant", "Educational companion"],
            features: ["Natural language interaction", "Object recognition", "Task learning", "Remote control via smartphone"]
        }
    ],
    
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
console.log("Robot data loaded:", window.robotsData.robots.length, "robots");
