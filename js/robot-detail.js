// robot-detail.js - Functionality for the Robot Detail page

// Current robot data
let currentRobot = null;
let currentRating = 0;
let currentGalleryIndex = 0;
let galleryImages = [];

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

// Parse URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams.entries()) {
        params[key] = value;
    }
    
    return params;
}

// Load robot data by slug
function loadRobotData(slug) {
    // Get the robot data from DataManager
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
    DataManager.incrementRobotViews(currentRobot.id);
    
    // Populate the page with robot data
    populateRobotData();
    
    // Update document title
    document.title = currentRobot.metaData?.title || 
        `${currentRobot.name} - ${currentRobot.manufacturer.name} | Tgen Robotics Hub`;
}

// Populate the page with robot data
function populateRobotData() {
    // Hero section
    document.getElementById('robot-name').textContent = currentRobot.name;
    document.getElementById('robot-manufacturer').textContent = currentRobot.manufacturer.name;
    document.getElementById('robot-summary').textContent = currentRobot.summary;
    
    // Featured image
    const featuredImageContainer = document.getElementById('robot-main-image');
    if (currentRobot.media && currentRobot.media.featuredImage) {
        // Check if it's a media ID (for uploaded images) or a direct URL
        if (currentRobot.media.featuredImage.mediaId) {
            const media = DataManager.getMediaById(currentRobot.media.featuredImage.mediaId);
            if (media) {
                featuredImageContainer.src = media.data;
            } else {
                featuredImageContainer.src = 'images/robot-placeholder.jpg';
            }
        } else if (currentRobot.media.featuredImage.url) {
            featuredImageContainer.src = currentRobot.media.featuredImage.url;
        } else {
            featuredImageContainer.src = 'images/robot-placeholder.jpg';
        }
        
        featuredImageContainer.alt = currentRobot.media.featuredImage.alt || currentRobot.name;
    } else {
        featuredImageContainer.src = 'images/robot-placeholder.jpg';
        featuredImageContainer.alt = currentRobot.name;
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
    const videoThumbnail = document.getElementById('video-thumbnail');
    const videoDemoBtn = document.getElementById('video-demo-btn');
    
    if (currentRobot.media && currentRobot.media.videos && currentRobot.media.videos.length > 0) {
        const video = currentRobot.media.videos[0];
        
        // Check if it's a media ID or direct URL for thumbnail
        if (video.thumbnailMediaId) {
            const media = DataManager.getMediaById(video.thumbnailMediaId);
            if (media) {
                videoThumbnail.src = media.data;
            } else {
                videoThumbnail.src = video.thumbnail || 'images/video-placeholder.jpg';
            }
        } else {
            videoThumbnail.src = video.thumbnail || 'images/video-placeholder.jpg';
        }
        
        videoThumbnail.alt = video.title || `${currentRobot.name} Video`;
        
        // Show video button in hero section
        videoDemoBtn.style.display = 'inline-block';
        videoDemoBtn.href = '#overview';
        videoDemoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Switch to overview tab
            tabs.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            document.querySelector('[data-tab="overview"]').classList.add('active');
            document.getElementById('overview').classList.add('active');
            
            // Play video
            playVideo(video);
        });
    } else {
        // Hide video button if no videos
        videoDemoBtn.style.display = 'none';
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
    updateFavoriteStatus();
}

// Play a video (modal or embedded player)
function playVideo(video) {
    // Check if video is a media ID or direct URL
    let videoUrl;
    
    if (video.mediaId) {
        const media = DataManager.getMediaById(video.mediaId);
        if (media) {
            videoUrl = media.data;
        }
    } else if (video.url) {
        videoUrl = video.url;
    }
    
    if (!videoUrl) {
        alert('Video not available');
        return;
    }
    
    // Create a modal for the video
    const videoModal = document.createElement('div');
    videoModal.className = 'video-modal-overlay';
    videoModal.style.position = 'fixed';
    videoModal.style.top = '0';
    videoModal.style.left = '0';
    videoModal.style.width = '100%';
    videoModal.style.height = '100%';
    videoModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    videoModal.style.display = 'flex';
    videoModal.style.alignItems = 'center';
    videoModal.style.justifyContent = 'center';
    videoModal.style.zIndex = '2000';
    
    // For YouTube or Vimeo URLs, use iframe
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com')) {
        let embedUrl;
        
        if (videoUrl.includes('youtube.com')) {
            const videoId = new URLSearchParams(new URL(videoUrl).search).get('v');
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else if (videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('/').pop();
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        } else if (videoUrl.includes('vimeo.com')) {
            const videoId = videoUrl.split('/').pop();
            embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        }
        
        videoModal.innerHTML = `
            <div class="video-container" style="width: 80%; max-width: 800px; position: relative;">
                <div class="video-close" style="position: absolute; top: -40px; right: 0; color: white; font-size: 30px; cursor: pointer;">&times;</div>
                <iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width: 100%; height: 450px;"></iframe>
            </div>
        `;
    } else {
        // For direct video files, use video element
        videoModal.innerHTML = `
            <div class="video-container" style="width: 80%; max-width: 800px; position: relative;">
                <div class="video-close" style="position: absolute; top: -40px; right: 0; color: white; font-size: 30px; cursor: pointer;">&times;</div>
                <video controls autoplay style="width: 100%; max-height: 80vh;">
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }
    
    // Add to body
    document.body.appendChild(videoModal);
    
    // Close button functionality
    const closeBtn = videoModal.querySelector('.video-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(videoModal);
    });
    
    // Close on outside click
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            document.body.removeChild(videoModal);
        }
    });
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
        
        // Check if it's a media ID (for uploaded images) or a direct URL
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
                alt: currentRobot.media.featuredImage.alt || currentRobot.name,
                caption: currentRobot.media.featuredImage.caption || `${currentRobot.name} featured image`
            });
        }
    }
    
    // Add additional images
    if (currentRobot.media && currentRobot.media.images && currentRobot.media.images.length > 0) {
        currentRobot.media.images.forEach(image => {
            let imageUrl;
            
            // Check if it's a media ID or direct URL
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
                    alt: image.alt || currentRobot.name,
                    caption: image.caption || ''
                });
            }
        });
    }
    
    // Add video thumbnails
    if (currentRobot.media && currentRobot.media.videos && currentRobot.media.videos.length > 0) {
        currentRobot.media.videos.forEach(video => {
            let thumbnailUrl;
            
            // Check if it's a media ID or direct URL for thumbnail
            if (video.thumbnailMediaId) {
                const media = DataManager.getMediaById(video.thumbnailMediaId);
                if (media) {
                    thumbnailUrl = media.data;
                }
            } else if (video.thumbnail) {
                thumbnailUrl = video.thumbnail;
            } else {
                thumbnailUrl = 'images/video-placeholder.jpg';
            }
            
            if (thumbnailUrl) {
                galleryImages.push({
                    url: thumbnailUrl,
                    alt: video.title || currentRobot.name,
                    caption: video.title || '',
                    isVideo: true,
                    video: video
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
                if (image.video) {
                    playVideo(image.video);
                }
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
    reviewsContainer.innerHTML = '';
    
    if (!currentRobot.reviews || currentRobot.reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="message">
                <p>No reviews yet for ${currentRobot.name}. Be the first to leave a review!</p>
            </div>
        `;
    } else {
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
}

// Populate related robots
function populateRelatedRobots() {
    const relatedContainer = document.getElementById('related-robots');
    relatedContainer.innerHTML = '';
    
    // Get related robots
    const relatedRobots = DataManager.getRelatedRobots(currentRobot.id, 3);
    
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
    ratingStars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            setRating(rating);
        });
    });
    
    // Lightbox controls
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    }
    
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => navigateLightbox(1));
    }
    
    // Close lightbox on outside click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        
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
    const shareButton = document.querySelector('.share-icon');
    if (shareButton) {
        shareButton.addEventListener('click', shareRobot);
    }
    
    // Edit button (for admin users)
    const editButton = document.getElementById('edit-robot-btn');
    if (editButton) {
        editButton.addEventListener('click', () => {
            if (currentRobot) {
                window.location.href = `admin-robot-management.html?edit=${currentRobot.id}`;
            }
        });
    }
}

// Toggle favorite status
function toggleFavorite() {
    if (!currentRobot) return;
    
    // Toggle favorite status in DataManager
    const isFavorited = DataManager.toggleRobotFavorite(currentRobot.id);
    
    // Update UI
    updateFavoriteStatus();
    
    // Show message
    showMessage(
        isFavorited 
            ? `${currentRobot.name} added to favorites` 
            : `${currentRobot.name} removed from favorites`,
        isFavorited ? 'success' : 'info'
    );
}

// Update favorite button based on current status
function updateFavoriteStatus() {
    if (!currentRobot || !favoriteIcon) return;
    
    const isFavorited = DataManager.isRobotFavorited(currentRobot.id);
    
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
    DataManager.updateRobot(currentRobot.id, currentRobot);
    
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
    if (!galleryImages || galleryImages.length === 0 || !lightbox) return;
    
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
    if (!lightbox) return;
    
    lightbox.classList.remove('active');
    
    // Restore body scrolling
    document.body.style.overflow = '';
}

// Update lightbox image
function updateLightboxImage() {
    if (!lightbox || !lightboxImage || galleryImages.length === 0) return;
    
    const currentImage = galleryImages[currentGalleryIndex];
    
    lightboxImage.src = currentImage.url;
    lightboxImage.alt = currentImage.alt;
    
    // Update caption if available
    const captionElement = lightbox.querySelector('.lightbox-caption');
    if (captionElement) {
        captionElement.textContent = currentImage.caption || '';
    }
    
    // Update navigation buttons visibility
    updateLightboxNavigation();
}

// Update lightbox navigation buttons visibility
function updateLightboxNavigation() {
    if (!lightboxPrev || !lightboxNext) return;
    
    // Check for previous valid image (non-video)
    let prevIndex = currentGalleryIndex - 1;
    while (prevIndex >= 0 && galleryImages[prevIndex].isVideo) {
        prevIndex--;
    }
    
    // Check for next valid image (non-video)
    let nextIndex = currentGalleryIndex + 1;
    while (nextIndex < galleryImages.length && galleryImages[nextIndex].isVideo) {
        nextIndex++;
    }
    
    // Show/hide prev button
    lightboxPrev.style.visibility = prevIndex >= 0 ? 'visible' : 'hidden';
    
    // Show/hide next button
    lightboxNext.style.visibility = nextIndex < galleryImages.length ? 'visible' : 'hidden';
}

// Navigate to previous/next image in lightbox
function navigateLightbox(direction) {
    if (!lightbox || galleryImages.length === 0) return;
    
    let newIndex = currentGalleryIndex + direction;
    
    // Skip video items
    while (newIndex >= 0 && newIndex < galleryImages.length && galleryImages[newIndex].isVideo) {
        newIndex += direction;
    }
    
    // Check if new index is valid
    if (newIndex < 0 || newIndex >= galleryImages.length) {
        return;
    }
    
    currentGalleryIndex = newIndex;
    updateLightboxImage();
}

// Share robot
function shareRobot() {
    if (!currentRobot) return;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: `${currentRobot.name} - Tgen Robotics Hub`,
            text: currentRobot.summary,
            url: window.location.href
        })
        .then(() => {
            console.log('Shared successfully');
        })
        .catch(error => {
            console.error('Error sharing:', error);
            copyToClipboard();
        });
    } else {
        // Fallback to copy to clipboard
        copyToClipboard();
    }
}

// Copy URL to clipboard
function copyToClipboard() {
    const textArea = document.createElement('textarea');
    textArea.value = window.location.href;
    textArea.style.position = 'fixed';  // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        showMessage(
            successful ? 'Link copied to clipboard' : 'Failed to copy link',
            successful ? 'success' : 'error'
        );
    } catch (err) {
        showMessage('Failed to copy link', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Show message popup
function showMessage(message, type = 'info', duration = 3000) {
    // Check if message container exists, create if not
    let messageContainer = document.getElementById('message-container');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.id = 'message-container';
        messageContainer.style.position = 'fixed';
        messageContainer.style.bottom = '20px';
        messageContainer.style.right = '20px';
        messageContainer.style.zIndex = '1000';
        document.body.appendChild(messageContainer);
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // Add styles
    messageElement.style.padding = '10px 15px';
    messageElement.style.marginTop = '10px';
    messageElement.style.borderRadius = '4px';
    messageElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    messageElement.style.animation = 'fadeIn 0.3s ease-out';
    
    // Set colors based on type
    switch (type) {
        case 'success':
            messageElement.style.backgroundColor = '#4CAF50';
            messageElement.style.color = 'white';
            break;
        case 'error':
            messageElement.style.backgroundColor = '#F44336';
            messageElement.style.color = 'white';
            break;
        case 'info':
        default:
            messageElement.style.backgroundColor = '#2196F3';
            messageElement.style.color = 'white';
            break;
    }
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }
    `;
    document.head.appendChild(style);
    
    // Add to container
    messageContainer.appendChild(messageElement);
    
    // Remove after duration
    setTimeout(() => {
        messageElement.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            if (messageContainer.contains(messageElement)) {
                messageContainer.removeChild(messageElement);
            }
        }, 300);
    }, duration);
}

// Truncate text to a specific length
function truncateText(text, maxLength) {
    if (!text) return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}
