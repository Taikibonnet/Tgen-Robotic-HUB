// data.js - Sample robot data for Tgen Robotics Hub
// This file contains all the sample data needed to run the site without a backend

// Sample robot data
const robots = [
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
                url: "images/robots/spot.jpg",
                alt: "Boston Dynamics Spot"
            },
            images: [
                { url: "images/robots/spot-1.jpg", alt: "Spot in warehouse", caption: "Spot performing inspection in a warehouse" },
                { url: "images/robots/spot-2.jpg", alt: "Spot climbing stairs", caption: "Spot climbing stairs" },
                { url: "images/robots/spot-3.jpg", alt: "Spot with camera attachment", caption: "Spot equipped with additional cameras" }
            ],
            videos: [
                { 
                    url: "videos/spot-demo.mp4", 
                    title: "Spot Robot Demo", 
                    description: "See Spot in action in various environments",
                    thumbnail: "images/robots/spot-video.jpg"
                }
            ]
        },
        applications: [
            {
                title: "Industrial Inspection",
                description: "Automate routine inspections in industrial facilities. Spot can navigate complex environments and capture consistent data for preventative maintenance.",
                image: "images/robots/spot-app-inspection.jpg"
            },
            {
                title: "Construction Monitoring",
                description: "Capture site data consistently and frequently to track progress, improve safety, and document site conditions throughout the project lifecycle.",
                image: "images/robots/spot-app-construction.jpg"
            },
            {
                title: "Public Safety",
                description: "Assess hazardous situations, provide situational awareness, and handle dangerous materials in emergency response scenarios.",
                image: "images/robots/spot-app-safety.jpg"
            }
        ],
        reviews: [
            {
                user: {
                    name: "John Davis",
                    avatar: "images/avatars/user1.jpg"
                },
                rating: 5,
                date: "2025-03-15T10:30:00Z",
                content: "We've been using Spot for inspection tasks at our manufacturing facility for six months now, and it has significantly improved our efficiency. The ability to navigate stairs and tight spaces makes it perfect for our needs. Battery life is good enough for a full shift of inspections."
            },
            {
                user: {
                    name: "Sarah Chen",
                    avatar: "images/avatars/user2.jpg"
                },
                rating: 4,
                date: "2025-02-28T14:20:00Z",
                content: "Spot has been a valuable addition to our construction site monitoring. It consistently captures data that helps us track progress and identify issues early. The only downside is the learning curve for programming complex routes, but once set up, it works flawlessly."
            }
        ],
        relatedRobots: [2, 4, 5],
        stats: {
            views: 1247,
            favorites: 86
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
        summary: "Atlas is the most dynamic humanoid robot in the world, designed to push the limits of whole-body mobility and enable a variety of physically demanding tasks.",
        description: `<p>Atlas is one of the most dynamic humanoid robots ever built. Standing at approximately 1.5 meters tall, Atlas is a research platform designed to push the limits of whole-body mobility.</p>
        <p>The robot's advanced control system and state-of-the-art hardware give it the power and balance to demonstrate human-level agility. Atlas uses its whole body to perform dynamic behaviors including parkour, backflips, and complex dance routines.</p>
        <p>With an advanced control system and compact, high-performance hardware, Atlas has one of the world's most compact mobile hydraulic systems. Stereo vision, range sensing, and other sensors give Atlas the ability to manipulate objects in its environment and navigate rough terrain.</p>`,
        specifications: {
            physical: {
                height: { value: 1.5, unit: "m" },
                width: { value: 0.76, unit: "m" },
                weight: { value: 89, unit: "kg" }
            },
            performance: {
                battery: {
                    runtime: 60
                },
                degreesOfFreedom: 28
            },
            sensors: [
                { type: "Stereo Vision", description: "3D depth perception" },
                { type: "LIDAR", description: "Laser-based range finding" },
                { type: "IMU", description: "Inertial Measurement Unit" }
            ],
            connectivity: ["WiFi", "Ethernet"]
        },
        media: {
            featuredImage: {
                url: "images/robots/atlas.jpg",
                alt: "Boston Dynamics Atlas"
            },
            images: [
                { url: "images/robots/atlas-1.jpg", alt: "Atlas performing parkour", caption: "Atlas demonstrating parkour abilities" },
                { url: "images/robots/atlas-2.jpg", alt: "Atlas backflip", caption: "Atlas performing a backflip" }
            ]
        },
        applications: [
            {
                title: "Research",
                description: "Atlas serves as a research platform for advancing bipedal robotics and control systems.",
                image: "images/robots/atlas-app-research.jpg"
            },
            {
                title: "Disaster Response",
                description: "The humanoid form factor allows Atlas to operate in environments designed for humans, making it suitable for disaster response scenarios.",
                image: "images/robots/atlas-app-disaster.jpg"
            }
        ],
        reviews: [
            {
                user: {
                    name: "Dr. Robert Chen",
                    avatar: "images/avatars/user3.jpg"
                },
                rating: 5,
                date: "2025-01-10T09:15:00Z",
                content: "As a robotics researcher, I've been following Atlas's development for years. The advancements in dynamic control and balance are simply remarkable. It's pushing the boundaries of what's possible in humanoid robotics."
            }
        ],
        relatedRobots: [1, 3],
        stats: {
            views: 1105,
            favorites: 93
        }
    },
    {
        id: 3,
        name: "ASIMO",
        slug: "asimo",
        manufacturer: {
            name: "Honda",
            country: "Japan",
            website: "https://global.honda"
        },
        yearIntroduced: 2000,
        categories: ["Humanoid", "Research"],
        summary: "ASIMO, an acronym for Advanced Step in Innovative Mobility, was a humanoid robot created by Honda. Standing at 130 cm tall, ASIMO was seen as one of the most advanced humanoid robots of its time.",
        description: `<p>ASIMO was a revolutionary humanoid robot developed by Honda that demonstrated remarkable mobility and dexterity for its time. Standing at 130 cm (4 ft 3 in) tall and weighing 54 kg (119 lb), ASIMO was designed to operate in human environments.</p>
        <p>ASIMO could walk or run on two feet at speeds up to 9 kilometers per hour (5.6 mph). The robot could navigate stairs, turn smoothly, and maintain balance on uneven surfaces. Its multi-fingered hands allowed it to grasp and manipulate objects, shake hands, and perform various tasks.</p>
        <p>While Honda officially retired ASIMO in 2018, its technology continues to influence Honda's robotic developments. ASIMO represented a significant milestone in humanoid robotics and served as an inspiration for future generations of robots.</p>`,
        specifications: {
            physical: {
                height: { value: 1.3, unit: "m" },
                width: { value: 0.45, unit: "m" },
                weight: { value: 54, unit: "kg" }
            },
            performance: {
                battery: {
                    runtime: 60
                },
                speed: { value: 2.5, unit: "m/s" },
                degreesOfFreedom: 34
            },
            sensors: [
                { type: "Vision Sensors", description: "For object and gesture recognition" },
                { type: "Floor Surface Sensors", description: "For terrain adaptation" },
                { type: "Ultrasonic Sensors", description: "For obstacle detection" }
            ],
            connectivity: ["WiFi", "Proprietary protocols"]
        },
        media: {
            featuredImage: {
                url: "images/robots/asimo.jpg",
                alt: "Honda ASIMO"
            },
            images: [
                { url: "images/robots/asimo-1.jpg", alt: "ASIMO walking", caption: "ASIMO demonstrating walking abilities" },
                { url: "images/robots/asimo-2.jpg", alt: "ASIMO using hands", caption: "ASIMO's dexterous hand capabilities" }
            ]
        },
        applications: [
            {
                title: "Human-Robot Interaction",
                description: "ASIMO was designed to function in human environments and interact with people.",
                image: "images/robots/asimo-app-interaction.jpg"
            },
            {
                title: "Research Platform",
                description: "ASIMO served as a platform for advancing humanoid robotics, particularly in balance and mobility.",
                image: "images/robots/asimo-app-research.jpg"
            }
        ],
        reviews: [
            {
                user: {
                    name: "Takashi Yamamoto",
                    avatar: "images/avatars/user4.jpg"
                },
                rating: 5,
                date: "2024-12-05T14:30:00Z",
                content: "I was fortunate enough to see ASIMO in person many times. Even though newer robots have surpassed some of its capabilities, ASIMO remains an iconic achievement in robotics history that inspired many engineers, including myself."
            }
        ],
        relatedRobots: [2, 6],
        stats: {
            views: 987,
            favorites: 72
        }
    },
    {
        id: 4,
        name: "ANYmal",
        slug: "anymal",
        manufacturer: {
            name: "ANYbotics",
            country: "Switzerland",
            website: "https://www.anybotics.com"
        },
        yearIntroduced: 2016,
        categories: ["Industrial", "Quadruped", "Autonomous"],
        summary: "ANYmal is a four-legged robot designed for autonomous inspection tasks in challenging environments. It's capable of navigating stairs, rough terrain, and tight spaces.",
        description: `<p>ANYmal is a quadrupedal robot designed by ANYbotics for autonomous operation in challenging environments. With its four articulated legs, ANYmal can navigate complex terrains that would defeat traditional wheeled robots.</p>
        <p>The robot is equipped with a variety of sensors including LiDAR, cameras, and gas detectors, making it ideal for inspection tasks in industrial facilities, power plants, and offshore platforms. It can climb stairs, step over obstacles, and move in restricted spaces.</p>
        <p>ANYmal operates autonomously, using sophisticated algorithms to map its environment and plan paths. It can perform routine inspection tasks without human intervention, collecting data and detecting anomalies.</p>`,
        specifications: {
            physical: {
                height: { value: 0.7, unit: "m" },
                width: { value: 0.5, unit: "m" },
                length: { value: 0.8, unit: "m" },
                weight: { value: 30, unit: "kg" }
            },
            performance: {
                battery: {
                    runtime: 120
                },
                speed: { value: 1.0, unit: "m/s" },
                payload: { value: 10, unit: "kg" },
                degreesOfFreedom: 12
            },
            sensors: [
                { type: "LiDAR", description: "3D environment scanning" },
                { type: "Cameras", description: "Visual inspection and navigation" },
                { type: "Gas Sensors", description: "Optional for leak detection" }
            ],
            connectivity: ["WiFi", "4G LTE", "Bluetooth"]
        },
        media: {
            featuredImage: {
                url: "images/robots/anymal.jpg",
                alt: "ANYbotics ANYmal"
            },
            images: [
                { url: "images/robots/anymal-1.jpg", alt: "ANYmal in industrial setting", caption: "ANYmal performing inspection in an industrial facility" },
                { url: "images/robots/anymal-2.jpg", alt: "ANYmal climbing stairs", caption: "ANYmal navigating stairs" }
            ]
        },
        applications: [
            {
                title: "Industrial Inspection",
                description: "ANYmal can perform routine inspections in industrial facilities, checking equipment status and detecting anomalies.",
                image: "images/robots/anymal-app-inspection.jpg"
            },
            {
                title: "Offshore Platform Monitoring",
                description: "The robot is suitable for inspections on offshore platforms, even in harsh weather conditions.",
                image: "images/robots/anymal-app-offshore.jpg"
            }
        ],
        reviews: [
            {
                user: {
                    name: "Michael Weber",
                    avatar: "images/avatars/user5.jpg"
                },
                rating: 4,
                date: "2025-02-10T11:25:00Z",
                content: "We deployed ANYmal at our manufacturing plant for routine inspections. Its ability to navigate tight spaces and climb stairs has been invaluable. The only improvement I'd suggest is longer battery life for extended missions."
            }
        ],
        relatedRobots: [1, 5],
        stats: {
            views: 642,
            favorites: 58
        }
    },
    {
        id: 5,
        name: "Vision 60",
        slug: "vision-60",
        manufacturer: {
            name: "Ghost Robotics",
            country: "USA",
            website: "https://www.ghostrobotics.io"
        },
        yearIntroduced: 2018,
        categories: ["Quadruped", "Military", "Autonomous"],
        summary: "A rugged, mid-sized quadrupedal unmanned ground vehicle (Q-UGV) designed for all-terrain operation in challenging environments.",
        description: `<p>The Vision 60 is a rugged, adaptable quadrupedal robot platform designed for military, homeland, and enterprise applications. It's engineered to navigate challenging terrain and operate in extreme environments where traditional unmanned vehicles cannot access.</p>
        <p>With its advanced sensors and payload capabilities, the Vision 60 can perform a wide range of mission tasks including patrol, reconnaissance, mapping, and communications relay. It features a modular payload system that allows for easy customization based on mission requirements.</p>
        <p>The robot is designed to be highly durable and can operate in a wide range of temperatures and weather conditions. Its proprietary locomotion technology enables it to traverse rough terrain, climb stairs, and recover from falls or kicks.</p>`,
        specifications: {
            physical: {
                height: { value: 0.75, unit: "m" },
                width: { value: 0.5, unit: "m" },
                length: { value: 1.0, unit: "m" },
                weight: { value: 32, unit: "kg" }
            },
            performance: {
                battery: {
                    runtime: 180
                },
                speed: { value: 1.8, unit: "m/s" },
                payload: { value: 15, unit: "kg" },
                degreesOfFreedom: 12,
                operatingTemperature: { min: -30, max: 60, unit: "°C" }
            },
            sensors: [
                { type: "LiDAR", description: "Optional for navigation" },
                { type: "Cameras", description: "Multiple configurations available" },
                { type: "IMU", description: "For stabilization and navigation" }
            ],
            connectivity: ["Military-grade encrypted communications", "WiFi", "Radio"]
        },
        media: {
            featuredImage: {
                url: "images/robots/vision60.jpg",
                alt: "Ghost Robotics Vision 60"
            },
            images: [
                { url: "images/robots/vision60-1.jpg", alt: "Vision 60 in field", caption: "Vision 60 operating in field conditions" },
                { url: "images/robots/vision60-2.jpg", alt: "Vision 60 with payload", caption: "Vision 60 with mission-specific payload" }
            ]
        },
        applications: [
            {
                title: "Security Patrol",
                description: "Vision 60 can autonomously patrol perimeters and secure areas, providing real-time monitoring.",
                image: "images/robots/vision60-app-security.jpg"
            },
            {
                title: "Reconnaissance",
                description: "The robot can be deployed to scout areas and gather intelligence in environments too dangerous for humans.",
                image: "images/robots/vision60-app-recon.jpg"
            }
        ],
        reviews: [
            {
                user: {
                    name: "Classified",
                    avatar: "images/avatars/secure.jpg"
                },
                rating: 5,
                date: "2025-01-20T08:45:00Z",
                content: "The Vision 60 has proven to be an extremely valuable asset in our operations. Its durability and versatility in difficult terrain have exceeded our expectations. The modular payload system allows us to quickly adapt it to different mission requirements."
            }
        ],
        relatedRobots: [1, 4],
        stats: {
            views: 528,
            favorites: 47
        }
    },
    {
        id: 6,
        name: "Pepper",
        slug: "pepper",
        manufacturer: {
            name: "SoftBank Robotics",
            country: "Japan",
            website: "https://www.softbankrobotics.com"
        },
        yearIntroduced: 2014,
        categories: ["Humanoid", "Service"],
        summary: "Pepper is a semi-humanoid robot designed to recognize human emotions and adapt its behavior accordingly. It's used in retail, healthcare, and hospitality to interact with customers.",
        description: `<p>Pepper is a semi-humanoid robot designed by SoftBank Robotics (formerly Aldebaran Robotics) to serve as a day-to-day companion and assistant. Standing 120 cm tall and weighing 28 kg, Pepper has a distinctive appearance with a white body, a tablet mounted on its chest, and expressive eyes.</p>
        <p>What sets Pepper apart is its ability to recognize basic human emotions through facial expression analysis, body language, and verbal cues. The robot can adapt its behavior based on the perceived mood of the person it's interacting with, making it well-suited for customer service roles.</p>
        <p>Pepper has been deployed in various settings including retail stores, airports, hospitals, and care homes. It can provide information, guide customers, conduct surveys, and entertain people. The robot's friendly appearance and interactive capabilities make it particularly effective for initial customer engagement.</p>`,
        specifications: {
            physical: {
                height: { value: 1.2, unit: "m" },
                width: { value: 0.48, unit: "m" },
                weight: { value: 28, unit: "kg" }
            },
            performance: {
                battery: {
                    runtime: 720,
                    chargingTime: 480
                },
                speed: { value: 0.83, unit: "m/s" },
                degreesOfFreedom: 20
            },
            sensors: [
                { type: "3D Camera", description: "For face and object recognition" },
                { type: "Touch Sensors", description: "On head and hands" },
                { type: "Gyroscope", description: "For balance and movement" },
                { type: "Microphones", description: "For voice recognition" }
            ],
            connectivity: ["WiFi", "Ethernet"]
        },
        media: {
            featuredImage: {
                url: "images/robots/pepper.jpg",
                alt: "SoftBank Robotics Pepper"
            },
            images: [
                { url: "images/robots/pepper-1.jpg", alt: "Pepper in retail", caption: "Pepper interacting with customers in a retail environment" },
                { url: "images/robots/pepper-2.jpg", alt: "Pepper in healthcare", caption: "Pepper assisting in a healthcare setting" }
            ]
        },
        applications: [
            {
                title: "Retail Assistant",
                description: "Pepper can greet customers, provide product information, and guide shoppers in retail environments.",
                image: "images/robots/pepper-app-retail.jpg"
            },
            {
                title: "Healthcare Support",
                description: "In healthcare settings, Pepper can provide information, entertainment, and companionship to patients.",
                image: "images/robots/pepper-app-healthcare.jpg"
            },
            {
                title: "Hospitality",
                description: "Pepper can welcome guests, provide information, and enhance customer experience in hotels and reception areas.",
                image: "images/robots/pepper-app-hospitality.jpg"
            }
        ],
        reviews: [
            {
                user: {
                    name: "Yuki Tanaka",
                    avatar: "images/avatars/user6.jpg"
                },
                rating: 4,
                date: "2025-02-15T16:10:00Z",
                content: "We've been using Pepper in our department store for over a year. It's been excellent for attracting customers and providing basic information. While it sometimes struggles with complex queries, its friendly appearance and basic emotion recognition make it a valuable addition to our customer service team."
            }
        ],
        relatedRobots: [3],
        stats: {
            views: 829,
            favorites: 61
        }
    },
    {
        id: 7,
        name: "Waymo Autonomous Vehicle",
        slug: "waymo",
        manufacturer: {
            name: "Waymo",
            country: "USA",
            website: "https://waymo.com"
        },
        yearIntroduced: 2016,
        categories: ["Autonomous", "Vehicle"],
        summary: "Waymo's autonomous driving technology is designed to navigate safely through complex traffic situations, making transportation more accessible and convenient.",
        description: `<p>Waymo operates a commercial self-driving taxi service, Waymo One, in Phoenix, Arizona. The company's autonomous driving technology has been developed over more than a decade, starting as Google's Self-Driving Car Project in 2009 before becoming Waymo in 2016.</p>
        <p>Waymo's vehicles use a combination of sensors including LiDAR, radar, and cameras to create a detailed 3D map of their surroundings. The company's advanced AI software can recognize and predict the behavior of other road users, including pedestrians, cyclists, and other vehicles.</p>
        <p>Safety is a primary focus for Waymo, with vehicles designed to handle a wide range of driving scenarios and edge cases. The system is constantly learning and improving through both real-world driving and simulation testing.</p>`,
        specifications: {
            physical: {
                length: { value: 4.5, unit: "m" },
                width: { value: 2.1, unit: "m" },
                height: { value: 1.8, unit: "m" },
                weight: { value: 2200, unit: "kg" }
            },
            performance: {
                battery: {
                    runtime: 480
                },
                speed: { value: 25, unit: "m/s" }
            },
            sensors: [
                { type: "LiDAR", description: "360° 3D mapping" },
                { type: "Radar", description: "Long-range object detection" },
                { type: "Cameras", description: "Visual recognition" },
                { type: "Ultrasonic", description: "Short-range detection" }
            ],
            connectivity: ["5G", "WiFi", "GPS"]
        },
        media: {
            featuredImage: {
                url: "images/robots/waymo.jpg",
                alt: "Waymo Self-Driving Car"
            },
            images: [
                { url: "images/robots/waymo-1.jpg", alt: "Waymo vehicle", caption: "Waymo autonomous vehicle in operation" },
                { url: "images/robots/waymo-2.jpg", alt: "Waymo sensor system", caption: "Waymo's sensor suite including LiDAR" }
            ]
        },
        applications: [
            {
                title: "Autonomous Ride-Hailing",
                description: "Waymo One provides autonomous taxi services, allowing passengers to summon a self-driving vehicle via an app.",
                image: "images/robots/waymo-app-taxi.jpg"
            },
            {
                title: "Autonomous Delivery",
                description: "Waymo Via focuses on autonomous delivery and logistics, including package delivery and trucking.",
                image: "images/robots/waymo-app-delivery.jpg"
            }
        ],
        reviews: [
            {
                user: {
                    name: "Elena Martinez",
                    avatar: "images/avatars/user7.jpg"
                },
                rating: 5,
                date: "2025-03-05T10:30:00Z",
                content: "I've used Waymo One several times in Phoenix and the experience has been incredible. The vehicle navigated complex intersections and traffic situations smoothly. As someone who was initially skeptical about autonomous vehicles, I'm now convinced they're the future of transportation."
            }
        ],
        relatedRobots: [],
        stats: {
            views: 756,
            favorites: 65
        }
    }
];

// Sample news articles
const news = [
    {
        id: 1,
        title: "New Breakthrough in Soft Robotics Enables Enhanced Dexterity",
        slug: "soft-robotics-breakthrough",
        date: "2025-04-25T09:30:00Z",
        author: "Dr. Sarah Johnson",
        category: "Research",
        tags: ["Soft Robotics", "Materials Science", "Medical Robotics"],
        summary: "Researchers have developed a new material that allows soft robots to manipulate objects with unprecedented precision.",
        content: `<p>A team of researchers from MIT and Stanford University has developed a groundbreaking new material that could revolutionize soft robotics. The material, a composite hydrogel with embedded magnetic nanoparticles, allows for unprecedented precision in the manipulation of delicate objects.</p>
        
        <p>"Traditional robotic grippers struggle with delicate objects," explains lead researcher Dr. Emily Chen. "They either grip too hard and damage the object or too softly and drop it. Our new material adapts to the shape and fragility of objects automatically, much like human fingers do."</p>
        
        <p>The breakthrough could have significant implications for medical robotics, where delicate tissue manipulation is essential. The team demonstrated their technology by having a soft robotic gripper successfully manipulate a raw egg, a live butterfly, and even perform simulated surgical sutures.</p>
        
        <p>The material works through a combination of pressure sensors and a network of magnetically controlled microstructures that can instantly adjust their rigidity. When the gripper detects contact with an object, it automatically adjusts its stiffness to apply just the right amount of pressure.</p>
        
        <p>Industry experts are already excited about the potential applications. "This could be a game-changer for robotic surgery, prosthetics, and any application where gentle but secure handling is needed," says robotics industry analyst Michael Torres.</p>
        
        <p>The research team is now working on scaling up the technology and exploring commercial applications. They expect the first medical devices using this technology to be in clinical trials within two years.</p>`,
        image: "images/news/soft-robotics.jpg",
        relatedRobots: []
    },
    {
        id: 2,
        title: "Robotics Adoption in Healthcare Reaches New Heights",
        slug: "healthcare-robotics-adoption",
        date: "2025-04-22T14:45:00Z",
        author: "Maria Reynolds",
        category: "Industry",
        tags: ["Healthcare", "Medical Robotics", "Automation"],
        summary: "Hospitals worldwide are increasing their use of robotic systems for surgery and patient care.",
        content: `<p>A recent industry report reveals that the adoption of robotics in healthcare settings has increased by 45% in the past year alone, marking an unprecedented surge in the integration of robotic technologies in hospitals and care facilities worldwide.</p>
        
        <p>The growth is particularly notable in surgical robotics, with systems like the da Vinci Surgical System now being used in over 5,000 hospitals globally. These systems allow for minimally invasive procedures with greater precision, resulting in shorter recovery times for patients.</p>
        
        <p>"We're seeing hospitals that were once hesitant to adopt robotics now embracing these technologies enthusiastically," says healthcare technology analyst Jennifer Park. "The evidence for improved patient outcomes has become too compelling to ignore."</p>
        
        <p>Beyond surgery, robots are increasingly being used for logistics, patient monitoring, and even direct patient care. Autonomous mobile robots now deliver medications, meals, and supplies in many hospitals, freeing up healthcare workers for more specialized tasks.</p>
        
        <p>In rehabilitation settings, exoskeletons and therapy robots are helping patients recover from strokes and injuries with highly personalized exercise regimens that adapt to the patient's progress.</p>
        
        <p>The COVID-19 pandemic accelerated this trend, as hospitals looked for ways to reduce infection risks and handle staffing shortages. Robots capable of disinfecting rooms with UV light became common, as did telepresence robots that allow doctors to examine patients remotely.</p>
        
        <p>Industry projections suggest this trend will continue, with the healthcare robotics market expected to reach $35 billion by 2027. Major investments are flowing into companies developing next-generation nursing assistant robots and AI-enhanced diagnostic systems.</p>
        
        <p>"We're just at the beginning of this revolution," says Dr. Robert Chen, Chief of Surgery at Metropolitan Hospital. "In ten years, robotics will be integrated into virtually every aspect of healthcare delivery."</p>`,
        image: "images/news/healthcare-robotics.jpg",
        relatedRobots: []
    },
    {
        id: 3,
        title: "AI Advancements Enable Robots to Learn from Natural Language",
        slug: "ai-natural-language-robots",
        date: "2025-04-18T11:15:00Z",
        author: "James Wilson",
        category: "AI",
        tags: ["Artificial Intelligence", "Natural Language Processing", "Robot Learning"],
        summary: "New machine learning techniques allow robots to understand and respond to complex verbal instructions.",
        content: `<p>A significant breakthrough in artificial intelligence is enabling robots to learn new tasks through natural language instructions, dramatically simplifying human-robot interaction and expanding the capabilities of robots in various fields.</p>
        
        <p>Researchers at OpenAI and the University of California, Berkeley have developed a new learning architecture that allows robots to interpret complex verbal instructions and translate them into actions without explicit programming.</p>
        
        <p>"In the past, teaching a robot a new task required either programming it explicitly or guiding it through physical demonstrations," explains Dr. Maya Patel, lead researcher on the project. "With our new system, called Natural Language Action Translation (NLAT), you can simply tell the robot what to do in regular conversational language."</p>
        
        <p>In demonstrations, robots equipped with NLAT were able to learn to perform complex tasks such as preparing a sandwich, sorting recycling, and even basic crafts like origami—all through verbal instructions alone.</p>
        
        <p>The system works by combining large language models with reinforcement learning algorithms that translate natural language into a sequence of actions. The robot also asks clarifying questions when instructions are ambiguous, creating a more natural interaction.</p>
        
        <p>"What's particularly exciting is that NLAT allows robots to generalize from previous instructions," notes Dr. Patel. "Once a robot learns what 'pick up' means, it can apply that action to new objects without additional training."</p>
        
        <p>This advancement could make robots much more accessible to the general public and useful in homes and businesses where users don't have technical expertise. It also dramatically reduces the time needed to deploy robots for new tasks.</p>
        
        <p>Early versions of NLAT are already being implemented in warehouse robots and home assistant robots, with consumer products expected to incorporate the technology within the next year.</p>`,
        image: "images/news/ai-robots.jpg",
        relatedRobots: []
    }
];

// Sample user data (for demo purposes)
const users = [
    {
        id: 1,
        email: "demo@tgenrobotics.com",
        password: "demo1234", // In a real app, this would be hashed
        firstName: "Demo",
        lastName: "User",
        role: "user",
        profileImage: "images/avatars/default.jpg",
        preferences: {
            theme: "dark",
            favoriteCategories: ["Humanoid", "Autonomous"]
        },
        activity: {
            favoriteRobots: [1, 2],
            recentlyViewed: [
                { robotId: 1, timestamp: "2025-04-29T15:30:00Z" },
                { robotId: 3, timestamp: "2025-04-28T10:15:00Z" },
                { robotId: 2, timestamp: "2025-04-27T14:45:00Z" }
            ]
        }
    },
    {
        id: 2,
        email: "admin@tgenrobotics.com",
        password: "admin1234", // In a real app, this would be hashed
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        profileImage: "images/avatars/admin.jpg",
        preferences: {
            theme: "dark",
            favoriteCategories: ["Industrial", "Research"]
        },
        activity: {
            favoriteRobots: [4, 5],
            recentlyViewed: [
                { robotId: 5, timestamp: "2025-04-29T16:20:00Z" },
                { robotId: 4, timestamp: "2025-04-28T11:30:00Z" },
                { robotId: 1, timestamp: "2025-04-27T09:15:00Z" }
            ]
        }
    }
];

// Helper functions

// Get a robot by ID
function getRobotById(id) {
    return robots.find(robot => robot.id === id);
}

// Get a robot by slug
function getRobotBySlug(slug) {
    return robots.find(robot => robot.slug === slug);
}

// Get news article by ID
function getNewsById(id) {
    return news.find(article => article.id === id);
}

// Get news article by slug
function getNewsBySlug(slug) {
    return news.find(article => article.slug === slug);
}

// Get related robots
function getRelatedRobots(robotId) {
    const robot = getRobotById(robotId);
    if (!robot || !robot.relatedRobots) return [];
    
    return robot.relatedRobots.map(id => getRobotById(id)).filter(r => r !== undefined);
}

// Filter robots by category
function filterRobotsByCategory(category) {
    if (!category) return [...robots];
    return robots.filter(robot => robot.categories.includes(category));
}

// Filter robots by manufacturer
function filterRobotsByManufacturer(manufacturer) {
    if (!manufacturer) return [...robots];
    return robots.filter(robot => robot.manufacturer.name === manufacturer);
}

// Search robots
function searchRobots(query) {
    if (!query) return [...robots];
    
    const lowerQuery = query.toLowerCase();
    return robots.filter(robot => {
        const searchText = `${robot.name} ${robot.manufacturer.name} ${robot.summary} ${robot.categories.join(' ')}`.toLowerCase();
        return searchText.includes(lowerQuery);
    });
}

// Get all unique categories
function getAllCategories() {
    const categories = new Set();
    robots.forEach(robot => {
        if (robot.categories) {
            robot.categories.forEach(category => categories.add(category));
        }
    });
    return Array.from(categories).sort();
}

// Get all unique manufacturers
function getAllManufacturers() {
    const manufacturers = new Set();
    robots.forEach(robot => {
        if (robot.manufacturer && robot.manufacturer.name) {
            manufacturers.add(robot.manufacturer.name);
        }
    });
    return Array.from(manufacturers).sort();
}

// Export all the data and functions
window.robotsData = {
    robots,
    news,
    users,
    getRobotById,
    getRobotBySlug,
    getNewsById,
    getNewsBySlug,
    getRelatedRobots,
    filterRobotsByCategory,
    filterRobotsByManufacturer,
    searchRobots,
    getAllCategories,
    getAllManufacturers
};
