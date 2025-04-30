// robot-detail-enhanced.js - Updated script that integrates with DataManager

// DOM Elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const favoriteIcon = document.getElementById('favorite-icon');
const robotName = document.getElementById('robot-name');
const robotManufacturer = document.getElementById('robot-manufacturer');
const robotSummary = document.getElementById('robot-summary');
const robotMainImage = document.getElementById('robot-main-image');
const robotCategories = document.getElementById('robot-categories');
const overviewText = document.getElementById('overview-text');
const videoThumbnail = document.getElementById('video-thumbnail');
const videoPlayButton = document.getElementById('play-button');
const videoSection = document.querySelector('.video-container');
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
    // Check if DataManager is available
    if (typeof DataManager === 'undefined') {
        document.querySelector('.robot-content').innerHTML = `
            <div class="container">
                <div class="message message-error">
                    <h2>Error</h2>
                    <p>Data management system not available. Please make sure data-manager.js is loaded before robot-detail.js.</p>
                    <a href="index.html" class="btn btn-primary" style="margin-top: 20px;">Return to Homepage</a>
                </div>
            </div>
        `;
        return;
    }
    
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
    // Get robot data from DataManager
    currentRobot = DataManager.getRobotBySlug(slug);
    
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
    
    // Increment view count
    if (!currentRobot.stats) {
        currentRobot.stats = { views: 0, favorites: 0 };
    }
    currentRobot.stats.views = (currentRobot.stats.views || 0) + 1;
    
    // Update the robot
    DataManager.updateRobot(currentRobot.id, { stats: currentRobot.stats });
    
    // Populate the page with robot data
    populateRobotData();
    
    // Update document title
    document.title = `${currentRobot.name} - ${currentRobot.manufacturer.name} | Tgen Robotics Hub`;
}

// Populate the page with robot data
function populateRobotData() {
    // Hero section
    robotName.textContent = currentRobot.name;
    robotManufacturer.textContent = currentRobot.manufacturer.name;
    robotSummary.textContent = currentRobot.summary;
    
    // Featured image
    if (currentRobot.media && currentRobot.media.featuredImage) {
        if (currentRobot.media.featuredImage.mediaId) {
            // Get image from DataManager
            const media = DataManager.getMediaById(currentRobot.media.featuredImage.mediaId);
            if (media) {
                robotMainImage.src = media.data;
                robotMainImage.alt = currentRobot.media.featuredImage.alt || currentRobot.name;
            } else {
                robotMainImage.src = 'images/robot-placeholder.jpg';
                robotMainImage.alt = currentRobot.name;
            }
        } else if (currentRobot.media.featuredImage.url) {
            robotMainImage.src = currentRobot.media.featuredImage.url;
            robotMainImage.alt = currentRobot.media.featuredImage.alt || currentRobot.name;
        }
    } else {
        robotMainImage.src = 'images/robot-placeholder.jpg';
        robotMainImage.alt = currentRobot.name;
    }
    
    // Categories
    robotCategories.innerHTML = '';
    
    if (currentRobot.categories && currentRobot.categories.length > 0) {
        currentRobot.categories.forEach(category => {
            const categoryElement = document.createElement('span');
            categoryElement.className = 'robot-category';
            categoryElement.textContent = category;
            robotCategories.appendChild(categoryElement);
        });
    }
    
    // Overview tab
    if (currentRobot.description) {
        overviewText.innerHTML = currentRobot.description;
    } else {
        overviewText.innerHTML = `<p>No detailed description available for ${currentRobot.name}.</p>`;
    }
    
    // Show/hide video section
    if (currentRobot.media && currentRobot.media.videos && currentRobot.media.videos.length > 0) {
        videoSection.style.display = 'block';
        
        const video = currentRobot.media.videos[0];
        
        // Check if we have a stored video or just a URL
        if (video.mediaId) {
            // We could display a video player here if supported, but for now just show placeholder
            videoThumbnail.src = video.thumbnail || 'images/video-placeholder.jpg';
            videoThumbnail.alt = video.title || currentRobot.name;
        } else if (video.url) {
            videoThumbnail.src = video.thumbnail || 'images/video-placeholder.jpg';
            videoThumbnail.alt = video.title || currentRobot.name;
        }
        
        // Show video button in hero section
        document.getElementById('video-demo-btn').style.display = 'inline-block';
        document.getElementById('video-demo-btn').addEventListener('click', function(e) {
            e.preventDefault();
            
            // Switch to overview tab
            tabs.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            document.querySelector('[data-tab="overview"]').classList.add('active');
            document.getElementById('overview').classList.add('active');
            
            // Add smooth scroll to video section
            videoSection.scrollIntoView({ behavior: 'smooth' });
        });
        
        // Add click handler to play button
        videoPlayButton.addEventListener('click', function() {
            // In a real implementation, this would open a video player
            alert('Video playback would be implemented here with a proper media player');
        });
    } else {
        videoSection.style.display = 'none';
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
        let imageUrl;
        const altText = currentRobot.media.featuredImage.alt || currentRobot.name;
        
        if (currentRobot.media.featuredImage.mediaId) {
            const media = DataManager.getMediaById(currentRobot.media.featuredImage.mediaId);
            if (media) {
                imageUrl = media.data;
            }
        } else if (currentRobot.media.featuredImage.url) {
            imageUrl = currentRobot.media.featuredImage.url;
        }
        
        if (imageUrl) {
            galleryImages.push({
                url: imageUrl,
                alt: altText,
                caption: currentRobot.media.featuredImage.caption || `${currentRobot.name} featured image`
            });
        }
    }
    
    // Add additional images
    if (currentRobot.media && currentRobot.media.images && currentRobot.media.images.length > 0) {
        currentRobot.media.images.forEach(image => {
            let imageUrl;
            const altText = image.alt || currentRobot.name;
            
            if (image.mediaId) {
                const media = DataManager.getMediaById(image.mediaId);
                if (media) {
                    imageUrl = media.data;
                }
            } else if (image.url) {
                imageUrl = image.url;
            }
            
            if (imageUrl) {
                galleryImages.push({
                    url: imageUrl,
                    alt: altText,
                    caption: image.caption || ''
                });
            }
        });
    }
    
    // Add video thumbnails
    if (currentRobot.media && currentRobot.media.videos && currentRobot.media.videos.length > 0) {
        currentRobot.media.videos.forEach(video => {
            let thumbnailUrl = 'images/video-placeholder.jpg';
            
            if (video.thumbnailMediaId) {
                const media = DataManager.getMediaById(video.thumbnailMediaId);
                if (media) {
                    thumbnailUrl = media.data;
                }
            } else if (video.thumbnail) {
                thumbnailUrl = video.thumbnail;
            }
            
            galleryImages.push({
                url: thumbnailUrl,
                alt: video.title || currentRobot.name,
                caption: video.title || '',
                isVideo: true,
                videoUrl: video.url,
                videoMediaId: video.mediaId
            });
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
                alert('Video playback would be implemented here with a proper media player');
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
    
    // Clear container
    if (!applicationsContainer) {
        console.error('Applications container not found');
        return;
    }
    
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
        
        // Get image URL
        let imageUrl = 'images/application-placeholder.jpg';
        
        if (app.imageMediaId) {
            const media = DataManager.getMediaById(app.imageMediaId);
            if (media) {
                imageUrl = media.data;
            }
        } else if (app.image) {
            imageUrl = app.image;
        }
        
        appCard.innerHTML = `
            <img src="${imageUrl}" alt="${app.title}" class="application-image">
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
    
    // Clear container
    if (!reviewsContainer) {
        console.error('Reviews container not found');
        return;
    }
    
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
        
        // Get avatar
        let avatarUrl = 'images/default-avatar.jpg';
        if (review.user.avatar) {
            avatarUrl = review.user.avatar;
        }
        
        reviewElement.innerHTML = `
            <div class="review-header">
                <div class="review-author">
                    <img src="${avatarUrl}" alt="${review.user.name}" class="review-avatar">
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
    
    // Clear container
    if (!relatedContainer) {
        console.error('Related robots container not found');
        return;
    }
    
    relatedContainer.innerHTML = '';
    
    // Get all robots except the current one
    let allRobots = DataManager.getAllRobots().filter(robot => robot.id !== currentRobot.id);
    
    // Filter by matching categories if possible
    if (currentRobot.categories && currentRobot.categories.length > 0) {
        const categoryMatches = allRobots.filter(robot => 
            robot.categories && 
            robot.categories.some(category => currentRobot.categories.includes(category))
        );
        
        // Use category matches if we have enough, otherwise use all robots
        if (categoryMatches.length >= 3) {
            allRobots = categoryMatches;
        }
    }
    
    // Get up to 3 random robots
    const shuffled = allRobots.sort(() => 0.5 - Math.random());
    const relatedRobots = shuffled.slice(0, 3);
    
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
        
        // Get image URL
        let imageUrl = 'images/robot-placeholder.jpg';
        
        if (robot.media && robot.media.featuredImage) {
            if (robot.media.featuredImage.mediaId) {
                const media = DataManager.getMediaById(robot.media.featuredImage.mediaId);
                if (media) {
                    imageUrl = media.data;
                }
            } else if (robot.media.featuredImage.url) {
                imageUrl = robot.media.featuredImage.url;
            }
        }
        
        relatedCard.innerHTML = `
            <img src="${imageUrl}" alt="${robot.name}" class="related-image">
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
    if (favoriteIcon) {
        favoriteIcon.addEventListener('click', toggleFavorite);
    }
    
    // Review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', submitReview);
    }
    
    // Rating stars selection
    if (ratingStars) {
        ratingStars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                setRating(rating);
            });
        });
    }
    
    // Lightbox controls
    if (lightbox) {
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
    }
    
    // Share button
    const shareIcon = document.querySelector('.share-icon');
    if (shareIcon) {
        shareIcon.addEventListener('click', shareRobot);
    }
}

// Toggle favorite status
function toggleFavorite() {
    if (!currentRobot) return;
    
    // In a real implementation with user accounts, this would interact with a backend API
    // For demonstration, we'll just toggle the icon and update the local robot data
    
    // Initialize stats if not exists
    if (!currentRobot.stats) {
        currentRobot.stats = { views: 0, favorites: 0 };
    }
    
    const isFavorited = favoriteIcon.classList.contains('fas');
    
    if (isFavorited) {
        favoriteIcon.classList.remove('fas');
        favoriteIcon.classList.add('far');
        currentRobot.stats.favorites = Math.max(0, (currentRobot.stats.favorites || 0) - 1);
        showMessage(`Removed ${currentRobot.name} from favorites`, 'info');
    } else {
        favoriteIcon.classList.remove('far');
        favoriteIcon.classList.add('fas');
        currentRobot.stats.favorites = (currentRobot.stats.favorites || 0) + 1;
        showMessage(`Added ${currentRobot.name} to favorites`, 'success');
    }
    
    // Update the robot data
    DataManager.updateRobot(currentRobot.id, { stats: currentRobot.stats });
}

// Check if robot is in favorites (mock implementation for now)
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
    
    if (!currentRobot) return;
    
    const content = document.getElementById('review-content').value;
    
    if (currentRating === 0) {
        showMessage('Please select a rating before submitting', 'error');
        return;
    }
    
    if (!content.trim()) {
        showMessage('Please enter your review before submitting', 'error');
        return;
    }
    
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
    
    // Update the robot in DataManager
    DataManager.updateRobot(currentRobot.id, { reviews: currentRobot.reviews });
    
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
    
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: url
        })
        .then(() => {
            console.log('Successfully shared');
        })
        .catch(error => {
            console.error('Error sharing:', error);
            copyToClipboard(url);
        });
    } else {
        // Fallback to clipboard copy
        copyToClipboard(url);
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    // Create a temporary input element
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    
    // Select and copy the URL
    input.select();
    document.execCommand('copy');
    
    // Remove the temporary input
    document.body.removeChild(input);
    
    // Show success message
    showMessage('Link copied to clipboard', 'success');
}

// Show a temporary message
function showMessage(message, type = 'info', duration = 3000) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type} fade-in`;
    messageElement.textContent = message;
    
    // Style the element
    messageElement.style.position = 'fixed';
    messageElement.style.top = '20px';
    messageElement.style.right = '20px';
    messageElement.style.padding = '15px 20px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.zIndex = '2000';
    messageElement.style.opacity = '0';
    messageElement.style.transition = 'opacity 0.3s ease';
    
    // Set colors based on type
    if (type === 'success') {
        messageElement.style.backgroundColor = 'rgba(32, 227, 178, 0.95)';
        messageElement.style.color = '#fff';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = 'rgba(255, 107, 107, 0.95)';
        messageElement.style.color = '#fff';
    } else {
        messageElement.style.backgroundColor = 'rgba(52, 152, 219, 0.95)';
        messageElement.style.color = '#fff';
    }
    
    // Add to body
    document.body.appendChild(messageElement);
    
    // Fade in
    setTimeout(() => {
        messageElement.style.opacity = '1';
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, duration);
}

// Get URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    }
    
    return params;
}

// Truncate text to a specific length
function truncateText(text, length = 100) {
    if (!text) return '';
    
    if (text.length <= length) {
        return text;
    }
    
    return text.substring(0, length) + '...';
}
