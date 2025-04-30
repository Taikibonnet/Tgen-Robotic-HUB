// data-manager.js - A client-side data management system that simulates a backend
// This will handle CRUD operations for robots and store data in localStorage

// Global object for data management
const DataManager = {
    // Storage keys
    STORAGE_KEYS: {
        ROBOTS: 'tgen_robots',
        MEDIA: 'tgen_media',
        NEXT_ID: 'tgen_next_id',
        USER: 'tgen_user'
    },

    // Initialize the data store with sample data if empty
    init() {
        // Initialize robots if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.ROBOTS)) {
            localStorage.setItem(this.STORAGE_KEYS.ROBOTS, JSON.stringify(sampleRobots));
        }

        // Initialize media storage if not exists
        if (!localStorage.getItem(this.STORAGE_KEYS.MEDIA)) {
            localStorage.setItem(this.STORAGE_KEYS.MEDIA, JSON.stringify({}));
        }

        // Initialize ID counter
        if (!localStorage.getItem(this.STORAGE_KEYS.NEXT_ID)) {
            const maxId = Math.max(...this.getAllRobots().map(robot => robot.id), 0);
            localStorage.setItem(this.STORAGE_KEYS.NEXT_ID, (maxId + 1).toString());
        }

        return this;
    },

    // Get all robots
    getAllRobots() {
        const robotsJson = localStorage.getItem(this.STORAGE_KEYS.ROBOTS);
        return robotsJson ? JSON.parse(robotsJson) : [];
    },

    // Get robot by ID
    getRobotById(id) {
        const robots = this.getAllRobots();
        return robots.find(robot => robot.id === id) || null;
    },

    // Get robot by slug
    getRobotBySlug(slug) {
        const robots = this.getAllRobots();
        return robots.find(robot => robot.slug === slug) || null;
    },

    // Create a new robot
    createRobot(robotData) {
        const robots = this.getAllRobots();
        
        // Generate a new ID
        const nextId = parseInt(localStorage.getItem(this.STORAGE_KEYS.NEXT_ID));
        
        // Ensure slug is unique
        let slug = robotData.slug || this.slugify(robotData.name);
        let slugCounter = 1;
        
        while (this.getRobotBySlug(slug)) {
            slug = `${this.slugify(robotData.name)}-${slugCounter}`;
            slugCounter++;
        }
        
        // Create the robot object
        const newRobot = {
            id: nextId,
            slug: slug,
            ...robotData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add to the array
        robots.push(newRobot);
        
        // Save back to storage
        localStorage.setItem(this.STORAGE_KEYS.ROBOTS, JSON.stringify(robots));
        localStorage.setItem(this.STORAGE_KEYS.NEXT_ID, (nextId + 1).toString());
        
        return newRobot;
    },

    // Update an existing robot
    updateRobot(id, robotData) {
        const robots = this.getAllRobots();
        const index = robots.findIndex(robot => robot.id === id);
        
        if (index === -1) {
            throw new Error(`Robot with ID ${id} not found`);
        }
        
        // Handle slug updates - ensure uniqueness
        if (robotData.slug && robotData.slug !== robots[index].slug) {
            let newSlug = robotData.slug;
            let slugCounter = 1;
            
            while (this.getRobotBySlug(newSlug) && this.getRobotBySlug(newSlug).id !== id) {
                newSlug = `${robotData.slug}-${slugCounter}`;
                slugCounter++;
            }
            
            robotData.slug = newSlug;
        }
        
        // Update the robot
        robots[index] = {
            ...robots[index],
            ...robotData,
            updatedAt: new Date().toISOString()
        };
        
        // Save back to storage
        localStorage.setItem(this.STORAGE_KEYS.ROBOTS, JSON.stringify(robots));
        
        return robots[index];
    },

    // Delete a robot
    deleteRobot(id) {
        const robots = this.getAllRobots();
        const filtered = robots.filter(robot => robot.id !== id);
        
        if (filtered.length === robots.length) {
            throw new Error(`Robot with ID ${id} not found`);
        }
        
        localStorage.setItem(this.STORAGE_KEYS.ROBOTS, JSON.stringify(filtered));
        return true;
    },

    // Store a media file (base64 encoded)
    storeMedia(filename, fileType, base64Data) {
        const media = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MEDIA) || '{}');
        
        // Generate a unique ID for the media
        const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        media[mediaId] = {
            id: mediaId,
            filename,
            fileType,
            data: base64Data,
            uploadedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.STORAGE_KEYS.MEDIA, JSON.stringify(media));
        
        return mediaId;
    },

    // Get media by ID
    getMediaById(mediaId) {
        const media = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MEDIA) || '{}');
        return media[mediaId] || null;
    },

    // Delete media by ID
    deleteMedia(mediaId) {
        const media = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.MEDIA) || '{}');
        
        if (!media[mediaId]) {
            return false;
        }
        
        delete media[mediaId];
        localStorage.setItem(this.STORAGE_KEYS.MEDIA, JSON.stringify(media));
        
        return true;
    },

    // Helper method to generate a slug
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')         // Replace spaces with -
            .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
            .replace(/\-\-+/g, '-')        // Replace multiple - with single -
            .replace(/^-+/, '')            // Trim - from start of text
            .replace(/-+$/, '');           // Trim - from end of text
    },

    // Clear all data (for testing)
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEYS.ROBOTS);
        localStorage.removeItem(this.STORAGE_KEYS.MEDIA);
        localStorage.removeItem(this.STORAGE_KEYS.NEXT_ID);
        this.init();
    }
};

// Sample data (fallback if no data exists in localStorage)
const sampleRobots = [
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
        categories: ["Industrial", "Quadruped", "Autonomous"],
        summary: "Spot is an agile mobile robot that navigates terrain with unprecedented mobility, allowing you to automate routine inspection tasks and data capture safely, accurately, and frequently.",
        description: `<p>Spot is a quadruped robot developed by Boston Dynamics. It is known for its ability to climb stairs, navigate rough terrain, and operate in environments that are challenging for wheeled vehicles. Spot can be operated remotely, or taught routes that it can then navigate autonomously.</p>
        <p>The robot is designed to go where wheeled robots cannot, while carrying payloads with endurance far beyond aerial drones. With 360° vision and obstacle avoidance, Spot can be driven remotely or taught routes to follow autonomously.</p>
        <p>Spot's advanced mobility, combined with its ability to carry various sensors and payloads, makes it ideal for industrial inspections, construction progress monitoring, and public safety applications. The robot can be equipped with specialized hardware and software for specific applications through its payload ports.</p>
        <p>Boston Dynamics released Spot for commercial use in June 2020, making it available for companies and research institutions to purchase for various applications. Since then, Spot has been deployed in numerous industries, from construction sites to nuclear facilities, showcasing its versatility and utility.</p>`,
        specifications: {
            physical: {
                height: { value: 0.84, unit: "m" },
                width: { value: 0.43, unit: "m" },
                length: { value: 1.1, unit: "m" },
                weight: { value: 32.5, unit: "kg" }
            },
            performance: {
                battery: {
                    runtime: 90,
                    capacity: 605,
                    chargingTime: 120
                },
                speed: { value: 1.6, unit: "m/s" },
                payload: { value: 14, unit: "kg" },
                degreesOfFreedom: 12,
                maxIncline: 30,
                operatingTemperature: { min: -20, max: 45, unit: "°C" }
            },
            sensors: [
                { type: "Cameras", description: "5 stereo pairs" },
                { type: "IMU", description: "Inertial Measurement Unit" },
                { type: "Position/Force Sensors", description: "In all joints" }
            ],
            connectivity: ["WiFi", "Ethernet", "Bluetooth"],
            ipRating: "IP54"
        },
        media: {
            featuredImage: {
                url: "images/sample/spot.jpg",
                alt: "Boston Dynamics Spot"
            },
            images: [
                { url: "images/sample/spot-1.jpg", alt: "Spot in warehouse", caption: "Spot performing inspection in a warehouse" },
                { url: "images/sample/spot-2.jpg", alt: "Spot climbing stairs", caption: "Spot climbing stairs" }
            ],
            videos: []
        },
        applications: [
            {
                title: "Industrial Inspection",
                description: "Automate routine inspections in industrial facilities. Spot can navigate complex environments and capture consistent data for preventative maintenance.",
                image: "images/sample/spot-app-inspection.jpg"
            },
            {
                title: "Construction Monitoring",
                description: "Capture site data consistently and frequently to track progress, improve safety, and document site conditions throughout the project lifecycle.",
                image: "images/sample/spot-app-construction.jpg"
            }
        ],
        status: "published",
        stats: {
            views: 1247,
            favorites: 85
        },
        metaData: {
            title: "Spot - Boston Dynamics | Tgen Robotics Hub",
            description: "Learn about Spot, the agile quadruped robot from Boston Dynamics designed for industrial inspection and automation.",
            keywords: ["spot", "boston dynamics", "quadruped", "robot", "industrial robot", "autonomous robot"]
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
        categories: ["Humanoid", "Research"],
        summary: "Atlas is the most dynamic humanoid robot, designed to navigate rough terrain and perform complex physical tasks like running, jumping, and backflips.",
        description: `<p>Atlas is one of the most dynamic humanoid robots ever built. Standing at approximately 1.5 meters tall, Atlas is a research platform designed to push the limits of whole-body mobility.</p>
        <p>The robot's advanced control system and state-of-the-art hardware give it the power and balance to demonstrate human-level agility. Atlas uses its whole body to perform dynamic behaviors including parkour, backflips, and complex dance routines.</p>
        <p>With an advanced control system and compact, high-performance hardware, Atlas has one of the world's most compact mobile hydraulic systems. Stereo vision, range sensing, and other sensors give Atlas the ability to manipulate objects in its environment and navigate rough terrain.</p>`,
        media: {
            featuredImage: {
                url: "images/sample/atlas.jpg",
                alt: "Boston Dynamics Atlas"
            }
        },
        status: "published",
        stats: {
            views: 987,
            favorites: 120
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
        categories: ["Industrial", "Quadruped", "Autonomous"],
        summary: "ANYmal is a four-legged robot designed for autonomous operation in challenging environments. It can navigate stairs, climb over obstacles, and move in complex environments.",
        media: {
            featuredImage: {
                url: "images/sample/anymal.jpg",
                alt: "ANYbotics ANYmal"
            }
        },
        status: "published",
        stats: {
            views: 642,
            favorites: 43
        }
    }
];

// Initialize data manager
document.addEventListener('DOMContentLoaded', () => {
    DataManager.init();
});
