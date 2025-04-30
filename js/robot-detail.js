// robot-detail.js - Functionality for the Robot Detail page

// Sample data for demonstration
// In production, this would be fetched from your backend API
const sampleRobots = [
    {
        id: 1,
        slug: "spot",
        name: "Spot",
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
                { url: "images/sample/spot-2.jpg", alt: "Spot climbing stairs", caption: "Spot climbing stairs" },
                { url: "images/sample/spot-3.jpg", alt: "Spot with camera attachment", caption: "Spot equipped with additional cameras" },
                { url: "images/sample/spot-4.jpg", alt: "Spot on construction site", caption: "Spot on a construction site" },
                { url: "images/sample/spot-5.jpg", alt: "Spot opening door", caption: "Spot demonstrating door opening capability" },
                { url: "images/sample/spot-6.jpg", alt: "Spot with manipulator arm", caption: "Spot with manipulator arm attachment" }
            ],
            videos: [
                { 
                    url: "videos/spot-demo.mp4", 
                    title: "Spot Robot Demo", 
                    description: "See Spot in action in various environments",
                    thumbnail: "images/sample/spot-video.jpg"
                }
            ]
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
            },
            {
                title: "Public Safety",
                description: "Assess hazardous situations, provide situational awareness, and handle dangerous materials in emergency response scenarios.",
                image: "images/sample/spot-app-safety.jpg"
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
        relatedRobots: [2, 4, 5] // IDs of related robots
    },
    {
        id: 2,
        slug: "atlas",
        name: "Atlas",
        manufacturer: {
            name: "Boston Dynamics",
            country: "USA",
            website: "https://www.bostondynamics.com"
        },
        yearIntroduced: 2013,
        categories: ["Humanoid", "Research"],
        summary: "Atlas is a research platform designed to push the limits of whole-body mobility and enable a variety of physically demanding tasks.",
        description: `<p>Atlas is one of the most dynamic humanoid robots ever built. Standing at approximately 1.5 meters tall, Atlas is a research platform designed to push the limits of whole-body mobility.</p>
        <p>The robot's advanced control system and state-of-the-art hardware give it the power and balance to demonstrate human-level agility. Atlas uses its whole body to perform dynamic behaviors including parkour, backflips, and complex dance routines.</p>
        <p>With an advanced control system and compact, high-performance hardware, Atlas has one of the world's most compact mobile hydraulic systems. Stereo vision, range sensing, and other sensors give Atlas the ability to manipulate objects in its environment and navigate rough terrain.</p>`,
        media: {
            featuredImage: {
                url: "images/sample/atlas.jpg",
                alt: "Boston Dynamics Atlas"
            }
        }
    },
    {
        id: 4,
        slug: "anymal",
        name: "ANYmal",
        manufacturer: {
            name: "ANYbotics",
            country: "Switzerland",
            website: "https://www.anybotics.com"
        },
        yearIntroduced: 2016,
        categories: ["Industrial", "Quadruped", "Autonomous"],
        summary: "An autonomous four-legged robot designed for industrial inspection tasks in challenging environments.",
        description: `<p>ANYmal is a four-legged robot designed specifically for autonomous operation in challenging environments. It can navigate stairs, climb over obstacles, and move in complex environments that would defeat traditional wheeled robots.</p>
        <p>The robot is equipped with a variety of sensors including cameras, LIDAR, and other measurement devices, making it ideal for inspection tasks in industrial facilities, power plants, and other complex environments.</p>`,
        media: {
            featuredImage: {
                url: "images/sample/anymal.jpg",
                alt: "ANYbotics ANYmal"
            }
        }
    },
    {
        id: 5,
        slug: "vision-60",
        name: "Vision 60",
        manufacturer: {
            name: "Ghost Robotics",
            country: "USA",
            website: "https://www.ghostrobotics.io"
        },
        yearIntroduced: 2018,
        categories: ["Quadruped", "Military", "Autonomous"],
        summary: "A rugged, mid-sized quadrupedal unmanned ground vehicle (Q-UGV) for all-terrain operation.",
        description: `<p>The Vision 60 is a rugged, adaptable quadrupedal robot platform designed for military, homeland, and enterprise applications. It's engineered to navigate challenging terrain and operate in extreme environments where traditional unmanned vehicles cannot access.</p>
        <p>With its advanced sensors and payload capabilities, the Vision 60 can perform a wide range of mission tasks including patrol, reconnaissance, mapping, and communications relay.</p>`,
        media: {
            featuredImage: {
                url: "images/sample/vision60.jpg",
                alt: "Ghost Robotics Vision 60"
            }
        }
    }
];

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const favoriteIcon = document.getElementById('favorite-icon');
const reviewForm = document.getElementById('review-form');
const ratingStars = document.querySelectorAll('.rating-selector .star');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');

// Current robot data
let currentRobot = null;
let currentRating = 0;
let currentGalleryIndex = 0;
let galleryImages = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Get the robot slug from URL
    const params = getUrlParams();
    const slug = params.slug;
    
    if (slug) {
        // Load robot data
        loadRobotData(slug);
    } else {
        // Redirect to encyclopedia if no slug provided
        window.location.href = 'encyclopedia.html';
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Load robot data by slug
function loadRobotData(slug) {
    // In a real implementation, this would make an API call
    // For demonstration, we'll use the sample data
    currentRobot = sampleRobots.find(robot => robot.slug === slug);
    
    if (!currentRobot) {
        // Robot not found, show error and link to return to encyclopedia
        document.querySelector('.robot-content').innerHTML = `
            <div class="container">
                <div class="message message-error">
                    <h2>Robot Not Found</h2>
                    <p>The robot you're looking for doesn't exist or has been removed.</p>
                    <a href="encyclopedia.html" class="btn btn-primary" style="margin-top: 20px;">Return to Encyclopedia</a>
                </div>
            </div>
        `;
        return;
    }
    
    // Populate the page with robot data
    populateRobotData();
    
    // Update document title
    document.title = `${currentRobot.name} - ${currentRobot.manufacturer.name} | Tgen Robotics Hub`;
}

// Populate the page with robot data
function populateRobotData() {
    // Hero section
    document.getElementById('robot-name').textContent = currentRobot.name;
    document.getElementById('robot-manufacturer').textContent = currentRobot.manufacturer.name;
    document.getElementById('robot-summary').textContent = currentRobot.summary;
    
    // Featured image
    if (currentRobot.media && currentRobot.media.featuredImage) {
        document.getElementById('robot-main-image').src = currentRobot.media.featuredImage.url;
        document.getElementById('robot-main-image').alt = currentRobot.media.featuredImage.alt || currentRobot.name;
    }
    
    // Categories
    const categoriesContainer = document.getElementById('robot-categories');
    categoriesContainer.innerHTML = '';
    
    if (currentRobot.categories && currentRobot.categories.length > 0) {
        currentRobot.categories.forEach(category => {
            const categoryElement = document.createElement('span');
            categoryElement.className = 'robot-category';
            categoryElement.textContent = category;
            categoriesContainer.appendChild(categoryElement);
        });
    }
    
    // Overview tab
    if (currentRobot.description) {
        document.getElementById('overview-text').innerHTML = currentRobot.description;
    } else {
        document.getElementById('overview-text').innerHTML = `<p>No detailed description available for ${currentRobot.name}.</p>`;
    }
    
    // Video thumbnail
    if (currentRobot.media && currentRobot.media.videos && currentRobot.media.videos.length > 0) {
        const video = currentRobot.media.videos[0];
        document.getElementById('video-thumbnail').src = video.thumbnail;
        document.getElementById('video-thumbnail').alt = video.title;
        
        // Show video button in hero section
        document.getElementById('video-demo-btn').style.display = 'inline-block';
        document.getElementById('video-demo-btn').href = '#overview';
        document.getElementById('video-demo-btn').addEventListener('click', function(e) {
            e.preventDefault();
            
            // Switch to overview tab
            tabs.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            document.querySelector('[data-tab="overview"]').classList.add('active');
            document.getElementById('overview').classList.add('active');
            
            // Simulate video playback
            alert('Video playback functionality would be implemented here');
        });
    } else {
        // Hide video button if no videos
        document.getElementById('video-demo-btn').style.display = 'none';
    }
    
    // Specifications tab
    populateSpecifications();
    
    // Gallery tab
    populateGallery();
    
    // Applications tab
    populateApplications();
    
    // Reviews tab
    populateReviews();
    
    // Related robots
    populateRelatedRobots();
    
    // Check if robot is in favorites
    checkFavoriteStatus();
}

// Populate specifications tab
function populateSpecifications() {
    if (!currentRobot.specifications) {
        document.getElementById('specs').innerHTML = `
            <div class="message">
                <p>No specifications available for ${currentRobot.name}.</p>
            </div>
        `;
        return;
    }
    
    const specs = currentRobot.specifications;
    
    // Physical specs
    if (specs.physical) {
        if (specs.physical.height && specs.physical.height.value) {
            document.getElementById('spec-height').textContent = `${specs.physical.height.value} ${specs.physical.height.unit}`;
        } else {
            document.getElementById('spec-height').textContent = 'N/A';
        }
        
        if (specs.physical.width && specs.physical.width.value) {
            document.getElementById('spec-width').textContent = `${specs.physical.width.value} ${specs.physical.width.unit}`;
        } else {
            document.getElementById('spec-width').textContent = 'N/A';
        }
        
        if (specs.physical.length && specs.physical.length.value) {
            document.getElementById('spec-length').textContent = `${specs.physical.length.value} ${specs.physical.length.unit}`;
        } else {
            document.getElementById('spec-length').textContent = 'N/A';
        }
        
        if (specs.physical.weight && specs.physical.weight.value) {
            document.getElementById('spec-weight').textContent = `${specs.physical.weight.value} ${specs.physical.weight.unit}`;
        } else {
            document.getElementById('spec-weight').textContent = 'N/A';
        }
    }
    
    // Performance specs
    if (specs.performance) {
        if (specs.performance.battery && specs.performance.battery.runtime) {
            document.getElementById('spec-runtime').textContent = `${specs.performance.battery.runtime} minutes`;
        } else {
            document.getElementById('spec-runtime').textContent = 'N/A';
        }
        
        if (specs.performance.speed && specs.performance.speed.value) {
            document.getElementById('spec-speed').textContent = `${specs.performance.speed.value} ${specs.performance.speed.unit}`;
        } else {
            document.getElementById('spec-speed').textContent = 'N/A';
        }
        
        if (specs.performance.degreesOfFreedom) {
            document.getElementById('spec-dof').textContent = specs.performance.degreesOfFreedom;
        } else {
            document.getElementById('spec-dof').textContent = 'N/A';
        }
        
        if (specs.performance.operatingTemperature) {
            const temp = specs.performance.operatingTemperature;
            document.getElementById('spec-temp').textContent = `${temp.min} to ${temp.max} ${temp.unit}`;
        } else {
            document.getElementById('spec-temp').textContent = 'N/A';
        }
    }
    
    // IP Rating
    document.getElementById('spec-ip').textContent = specs.ipRating || 'N/A';
    
    // Sensors
    const sensorsContainer = document.getElementById('spec-sensors');
    sensorsContainer.innerHTML = '';
    
    if (specs.sensors && specs.sensors.length > 0) {
        specs.sensors.forEach(sensor => {
            const sensorElement = document.createElement('div');
            sensorElement.className = 'spec-item';
            
            const sensorType = typeof sensor === 'string' ? sensor : sensor.type;
            const sensorDesc = typeof sensor === 'object' && sensor.description ? sensor.description : '';
            
            sensorElement.innerHTML = `
                <div class="spec-label">${sensorType}</div>
                <div class="spec-value">${sensorDesc}</div>
            `;
            
            sensorsContainer.appendChild(sensorElement);
        });
    } else {
        sensorsContainer.innerHTML = '<div class="spec-item"><div class="spec-value">No sensor information available</div></div>';
    }
    
    // Connectivity
    const connectivityContainer = document.getElementById('spec-connectivity');
    connectivityContainer.innerHTML = '';
    
    if (specs.connectivity && specs.connectivity.length > 0) {
        specs.connectivity.forEach(item => {
            const connectivityElement = document.createElement('div');
            connectivityElement.className = 'spec-item';
            
            connectivityElement.innerHTML = `
                <div class="spec-label">${item}</div>
                <div class="spec-value">Yes</div>
            `;
            
            connectivityContainer.appendChild(connectivityElement);
        });
    } else {
        connectivityContainer.innerHTML = '<div class="spec-item"><div class="spec-value">No connectivity information available</div></div>';
    }
}

// Populate gallery tab
function populateGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';
    
    // Collect all images for gallery
    galleryImages = [];
    
    // Add featured image
    if (currentRobot.media && currentRobot.media.featuredImage) {
        galleryImages.push({
            url: currentRobot.media.featuredImage.url,
            alt: currentRobot.media.featuredImage.alt || currentRobot.name,
            caption: currentRobot.media.featuredImage.caption || `${currentRobot.name} featured image`
        });
    }
    
    // Add additional images
    if (currentRobot.media && currentRobot.media.images && currentRobot.media.images.length > 0) {
        currentRobot.media.images.forEach(image => {
            galleryImages.push({
                url: image.url,
                alt: image.alt || currentRobot.name,
                caption: image.caption || ''
            });
        });
    }
    
    // Add video thumbnails
    if (currentRobot.media && currentRobot.media.videos && currentRobot.media.videos.length > 0) {
        currentRobot.media.videos.forEach(video => {
            if (video.thumbnail) {
                galleryImages.push({
                    url: video.thumbnail,
                    alt: video.title || currentRobot.name,
                    caption: video.title || '',
                    isVideo: true,
                    videoUrl: video.url
                });
            }
        });
    }
    
    // If no images, show message
    if (galleryImages.length === 0) {
        galleryGrid.innerHTML = `
            <div class="message" style="grid-column: 1 / -1;">
                <p>No images available for ${currentRobot.name}.</p>
            </div>
        `;
        return;
    }
    
    // Create gallery items
    galleryImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.index = index;
        
        if (image.isVideo) {
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.alt}">
                <div class="play-overlay"><i class="fas fa-play"></i></div>
            `;
            
            // Add video play overlay styles
            const style = document.createElement('style');
            style.textContent = `
                .play-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                }
            `;
            document.head.appendChild(style);
            
            // Add click event for video
            galleryItem.addEventListener('click', function() {
                // In a real implementation, this would open a video player
                alert('Video playback functionality would be implemented here');
            });
        } else {
            galleryItem.innerHTML = `<img src="${image.url}" alt="${image.alt}">`;
            
            // Add click event for lightbox
            galleryItem.addEventListener('click', function() {
                openLightbox(index);
            });
        }
        
        galleryGrid.appendChild(galleryItem);
    });
}

// Populate applications tab
function populateApplications() {
    const applicationsContainer = document.getElementById('application-cards');
    applicationsContainer.innerHTML = '';
    
    if (!currentRobot.applications || currentRobot.applications.length === 0) {
        applicationsContainer.innerHTML = `
            <div class="message" style="grid-column: 1 / -1;">
                <p>No application information available for ${currentRobot.name}.</p>
            </div>
        `;
        return;
    }
    
    currentRobot.applications.forEach(app => {
        const appCard = document.createElement('div');
        appCard.className = 'application-card';
        
        appCard.innerHTML = `
            <img src="${app.image || 'images/application-placeholder.jpg'}" alt="${app.title}" class="application-image">
            <div class="application-content">
                <h3 class="application-title">${app.title}</h3>
                <p class="application-desc">${app.description}</p>
                <a href="#" class="btn btn-outline">Learn More</a>
            </div>
        `;
        
        applicationsContainer.appendChild(appCard);
    });
}

// Populate reviews tab
function populateReviews() {
    const reviewsContainer = document.getElementById('reviews-container');
    reviewsContainer.innerHTML = '';
    
    if (!currentRobot.reviews || currentRobot.reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="message">
                <p>No reviews yet for ${currentRobot.name}. Be the first to leave a review!</p>
            </div>
        `;
        return;
    }
    
    currentRobot.reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review';
        
        // Format date
        const date = new Date(review.date);
        const formattedDate = date.toLocaleDateString();
        
        // Create star rating
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        
        reviewElement.innerHTML = `
            <div class="review-header">
                <div class="review-author">
                    <img src="${review.user.avatar || 'images/default-avatar.jpg'}" alt="${review.user.name}" class="review-avatar">
                    <div>
                        <div class="review-name">${review.user.name}</div>
                        <div class="review-date">${formattedDate}</div>
                    </div>
                </div>
                <div class="review-rating">${stars}</div>
            </div>
            <div class="review-content">
                <p>${review.content}</p>
            </div>
        `;
        
        reviewsContainer.appendChild(reviewElement);
    });
}

// Populate related robots
function populateRelatedRobots() {
    const relatedContainer = document.getElementById('related-robots');
    relatedContainer.innerHTML = '';
    
    if (!currentRobot.relatedRobots || currentRobot.relatedRobots.length === 0) {
        relatedContainer.innerHTML = `
            <div class="message" style="grid-column: 1 / -1;">
                <p>No related robots available for ${currentRobot.name}.</p>
            </div>
        `;
        return;
    }
    
    // Get related robots data
    const relatedRobots = currentRobot.relatedRobots
        .map(id => sampleRobots.find(robot => robot.id === id))
        .filter(robot => robot !== undefined);
    
    if (relatedRobots.length === 0) {
        relatedContainer.innerHTML = `
            <div class="message" style="grid-column: 1 / -1;">
                <p>No related robots available for ${currentRobot.name}.</p>
            </div>
        `;
        return;
    }
    
    relatedRobots.forEach(robot => {
        const relatedCard = document.createElement('div');
        relatedCard.className = 'related-card';
        
        relatedCard.innerHTML = `
            <img src="${robot.media?.featuredImage?.url || 'images/robot-placeholder.jpg'}" alt="${robot.name}" class="related-image">
            <div class="related-content">
                <h3 class="related-title">${robot.name}</h3>
                <div class="related-manufacturer">${robot.manufacturer.name}</div>
                <p class="related-desc">${truncateText(robot.summary, 100)}</p>
                <a href="robot-detail.html?slug=${robot.slug}" class="btn btn-outline">View Details</a>
            </div>
        `;
        
        relatedContainer.appendChild(relatedCard);
    });
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Favorite button
    favoriteIcon.addEventListener('click', toggleFavorite);
    
    // Review form submission
    reviewForm.addEventListener('submit', submitReview);
    
    // Rating stars selection
    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            setRating(rating);
        });
    });
    
    // Lightbox controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    
    // Close lightbox on outside click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    });
    
    // Share button
    document.querySelector('.share-icon').addEventListener('click', shareRobot);
}

// Toggle favorite status
function toggleFavorite() {
    // In a real implementation, this would interact with an API
    // For demonstration, we'll just toggle the icon
    const isFavorited = favoriteIcon.classList.contains('fas');
    
    if (isFavorited) {
        favoriteIcon.classList.remove('fas');
        favoriteIcon.classList.add('far');
        showMessage(`${currentRobot.name} removed from favorites`, 'info');
    } else {
        favoriteIcon.classList.remove('far');
        favoriteIcon.classList.add('fas');
        showMessage(`${currentRobot.name} added to favorites`, 'success');
    }
}

// Check if robot is in favorites (mock implementation)
function checkFavoriteStatus() {
    // In a real implementation, this would check against user's favorites
    // For demonstration, we'll just use a random boolean
    const isFavorited = false; // Math.random() > 0.5;
    
    if (isFavorited) {
        favoriteIcon.classList.remove('far');
        favoriteIcon.classList.add('fas');
    } else {
        favoriteIcon.classList.remove('fas');
        favoriteIcon.classList.add('far');
    }
}

// Set rating in review form
function setRating(rating) {
    currentRating = rating;
    
    // Update stars display
    ratingStars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Submit review
function submitReview(e) {
    e.preventDefault();
    
    const content = document.getElementById('review-content').value;
    
    if (currentRating === 0) {
        showMessage('Please select a rating before submitting', 'error');
        return;
    }
    
    if (!content.trim()) {
        showMessage('Please enter your review before submitting', 'error');
        return;
    }
    
    // In a real implementation, this would send data to the API
    // For demonstration, we'll just show a success message and add to local review list
    
    // Create new review object
    const newReview = {
        user: {
            name: 'You',
            avatar: 'images/default-avatar.jpg'
        },
        rating: currentRating,
        date: new Date().toISOString(),
        content: content
    };
    
    // Add to current robot's reviews
    if (!currentRobot.reviews) {
        currentRobot.reviews = [];
    }
    
    currentRobot.reviews.unshift(newReview);
    
    // Refresh reviews display
    populateReviews();
    
    // Reset form
    reviewForm.reset();
    setRating(0);
    
    // Show success message
    showMessage('Your review has been submitted successfully', 'success');
}

// Open lightbox
function openLightbox(index) {
    if (!galleryImages || galleryImages.length === 0) return;
    
    // Skip video items
    while (index < galleryImages.length && galleryImages[index].isVideo) {
        index++;
    }
    
    if (index >= galleryImages.length) return;
    
    currentGalleryIndex = index;
    updateLightboxImage();
    
    // Show lightbox
    lightbox.classList.add('active');
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
}

// Navigate through lightbox images
function navigateLightbox(direction) {
    let newIndex = currentGalleryIndex + direction;
    
    // Handle wrapping
    if (newIndex < 0) {
        newIndex = galleryImages.length - 1;
    } else if (newIndex >= galleryImages.length) {
        newIndex = 0;
    }
    
    // Skip video items
    while (newIndex < galleryImages.length && galleryImages[newIndex].isVideo) {
        newIndex += direction;
        
        // Handle wrapping again
        if (newIndex < 0) {
            newIndex = galleryImages.length - 1;
        } else if (newIndex >= galleryImages.length) {
            newIndex = 0;
        }
    }
    
    currentGalleryIndex = newIndex;
    updateLightboxImage();
}

// Update lightbox image
function updateLightboxImage() {
    const image = galleryImages[currentGalleryIndex];
    
    lightboxImage.src = image.url;
    lightboxImage.alt = image.alt;
    
    // Update caption if present
    // In a real implementation, you would add a caption element to the lightbox
}

// Share robot
function shareRobot() {
    // In a real implementation, this would open a share dialog
    // For demonstration, we'll just copy the URL to clipboard
    
    const url = window.location.href;
    
    // Create a temporary input element
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    
    // Select and copy the URL
    input.select();
    document.execCommand('copy');
    
    // Remove the temporary input
    document.body.removeChild(input);
    
    // Show success message
    showMessage('Link copied to clipboard', 'success');
}
