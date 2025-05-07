/**
 * Media Display Functionality for Tgen Robotics Hub
 * This script manages the display of images and videos in robot details pages
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMediaDisplay();
});

/**
 * Initialize media display functionality
 */
function initMediaDisplay() {
    // Get robot data from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const robotSlug = urlParams.get('slug') || urlParams.get('id');
    
    if (!robotSlug) return;
    
    // Get robot data
    const robot = window.robotsData?.getRobotBySlug ? 
                  window.robotsData.getRobotBySlug(robotSlug) : 
                  getRobotDataFromLocalStorage(robotSlug);
    
    if (!robot) return;
    
    // Initialize media display
    displayMainImage(robot);
    displayGallery(robot);
    displayVideos(robot);
    
    // Initialize lightbox if any images are present
    if (document.querySelectorAll('.gallery-item').length > 0) {
        initLightbox();
    }
}

/**
 * Get robot data from localStorage if standard methods aren't available
 */
function getRobotDataFromLocalStorage(id) {
    // Try to get robot data directly from localStorage
    try {
        const robotData = localStorage.getItem(`robot_${id}`);
        return robotData ? JSON.parse(robotData) : null;
    } catch (e) {
        console.error('Error getting robot data from localStorage:', e);
        return null;
    }
}

/**
 * Display the main image for the robot
 */
function displayMainImage(robot) {
    const mainImagePlaceholder = document.querySelector('.main-image-placeholder');
    if (!mainImagePlaceholder) return;
    
    // Use robotMedia to get image URL if available
    if (window.robotMedia && typeof window.robotMedia.getImageUrl === 'function') {
        const imageUrl = window.robotMedia.getImageUrl(robot);
        
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = robot.name;
            img.onerror = function() {
                if (window.robotMedia && typeof window.robotMedia.handleImageError === 'function') {
                    window.robotMedia.handleImageError(img);
                } else {
                    img.src = 'images/robots/robot-placeholder.jpg';
                }
            };
            
            mainImagePlaceholder.innerHTML = '';
            mainImagePlaceholder.appendChild(img);
            return;
        }
    }
    // Fallback implementation if robotMedia not available
    else if (robot.media) {
        let mainImageUrl = '';
        
        // Check different possible image sources based on data structure
        if (robot.media.featuredImage && robot.media.featuredImage.url) {
            mainImageUrl = robot.media.featuredImage.url;
        } else if (robot.media.mainImage && robot.media.mainImage.url) {
            mainImageUrl = robot.media.mainImage.url;
        } else if (robot.media.images && robot.media.images.length > 0) {
            mainImageUrl = robot.media.images[0].url;
        }
        
        // Fix path for non-admin users
        if (mainImageUrl && !mainImageUrl.startsWith('http') && !mainImageUrl.startsWith('images/robots/')) {
            if (mainImageUrl.startsWith('images/')) {
                const parts = mainImageUrl.split('/');
                if (parts.length >= 2 && parts[1] !== 'robots') {
                    mainImageUrl = 'images/robots/' + parts[parts.length - 1];
                }
            } else if (mainImageUrl.startsWith('/')) {
                mainImageUrl = 'images/robots/' + mainImageUrl.substring(1);
            } else {
                mainImageUrl = 'images/robots/' + mainImageUrl;
            }
        }
        
        // If we found an image, display it
        if (mainImageUrl) {
            const img = document.createElement('img');
            img.src = mainImageUrl;
            img.alt = robot.name;
            img.onerror = function() {
                this.src = 'images/robots/robot-placeholder.jpg';
            };
            
            mainImagePlaceholder.innerHTML = '';
            mainImagePlaceholder.appendChild(img);
            return;
        }
    }
    
    // If no image was found or displayed, use placeholder
    mainImagePlaceholder.innerHTML = `
        <img src="images/robots/robot-placeholder.jpg" alt="${robot.name || 'Robot'}" />
    `;
}

/**
 * Display gallery images for the robot
 */
function displayGallery(robot) {
    const galleryContainer = document.querySelector('.gallery-container');
    if (!galleryContainer) return;
    
    // Clear gallery container
    galleryContainer.innerHTML = '';
    
    // Check if robot has gallery images
    if (robot.media && robot.media.images && robot.media.images.length > 0) {
        // Skip the first image if it's already used as the main image
        const startIndex = (robot.media.featuredImage || robot.media.mainImage) ? 1 : 0;
        
        // Add each gallery image
        for (let i = startIndex; i < robot.media.images.length; i++) {
            const image = robot.media.images[i];
            
            // Fix image path for non-admin users
            let imageUrl = image.url;
            
            if (window.robotMedia && typeof window.robotMedia.fixImagePath === 'function') {
                imageUrl = window.robotMedia.fixImagePath(image.url);
            } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('images/robots/')) {
                if (imageUrl.startsWith('images/')) {
                    const parts = imageUrl.split('/');
                    if (parts.length >= 2 && parts[1] !== 'robots') {
                        imageUrl = 'images/robots/' + parts[parts.length - 1];
                    }
                } else if (imageUrl.startsWith('/')) {
                    imageUrl = 'images/robots/' + imageUrl.substring(1);
                } else {
                    imageUrl = 'images/robots/' + imageUrl;
                }
            }
            
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.dataset.index = i;
            
            const imgElement = document.createElement('img');
            imgElement.src = imageUrl;
            imgElement.alt = image.alt || robot.name;
            imgElement.onerror = function() {
                if (window.robotMedia && typeof window.robotMedia.handleImageError === 'function') {
                    window.robotMedia.handleImageError(this);
                } else {
                    this.src = 'images/robots/robot-placeholder.jpg';
                }
            };
            
            galleryItem.appendChild(imgElement);
            
            if (image.caption) {
                const captionDiv = document.createElement('div');
                captionDiv.className = 'gallery-caption';
                captionDiv.textContent = image.caption;
                galleryItem.appendChild(captionDiv);
            }
            
            galleryContainer.appendChild(galleryItem);
        }
    }
    
    // Hide gallery section if no images
    const gallerySection = galleryContainer.closest('.robot-gallery, .tab-content');
    if (gallerySection && galleryContainer.children.length === 0) {
        gallerySection.style.display = 'none';
    } else if (gallerySection) {
        gallerySection.style.display = 'block';
    }
}

/**
 * Display videos for the robot
 */
function displayVideos(robot) {
    const videoContainer = document.querySelector('.video-container');
    if (!videoContainer) return;
    
    // Clear video container
    videoContainer.innerHTML = '';
    
    // Check if robot has videos
    if (robot.media && robot.media.videos && robot.media.videos.length > 0) {
        // Add each video
        robot.media.videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            
            let videoContent = '';
            let videoUrl = '';
            
            // Use robotMedia helper if available
            if (window.robotMedia && typeof window.robotMedia.getVideoUrl === 'function' && video.url) {
                videoUrl = window.robotMedia.getVideoUrl({ media: { videos: [video] } });
            } 
            // Fallback if robotMedia not available
            else {
                // Handle different video types
                if (video.type === 'youtube' && video.url) {
                    // Extract YouTube video ID
                    const videoId = getYouTubeVideoId(video.url);
                    if (videoId) {
                        videoUrl = `https://www.youtube.com/embed/${videoId}`;
                    }
                } else if (video.type === 'mp4' && video.url) {
                    videoUrl = video.url;
                } else if (video.type === 'vimeo' && video.url) {
                    // Extract Vimeo video ID
                    const videoId = getVimeoVideoId(video.url);
                    if (videoId) {
                        videoUrl = `https://player.vimeo.com/video/${videoId}`;
                    }
                } else if (video.type === 'external' && video.url) {
                    videoUrl = video.url;
                }
            }
            
            // Create appropriate video element based on URL
            if (videoUrl) {
                if (videoUrl.includes('youtube.com/embed/') || videoUrl.includes('player.vimeo.com/')) {
                    videoContent = `
                        <div class="video-wrapper">
                            <iframe 
                                src="${videoUrl}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen
                            ></iframe>
                        </div>
                    `;
                } else if (video.type === 'mp4') {
                    videoContent = `
                        <div class="video-wrapper">
                            <video controls>
                                <source src="${videoUrl}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    `;
                } else {
                    videoContent = `
                        <div class="video-wrapper">
                            <a href="${videoUrl}" target="_blank" class="video-link">
                                <i class="fas fa-video"></i> Watch Video
                            </a>
                        </div>
                    `;
                }
            }
            
            // Add video info
            const videoInfo = `
                <div class="video-info">
                    ${video.title ? `<h3 class="video-title">${video.title}</h3>` : ''}
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                </div>
            `;
            
            videoItem.innerHTML = videoContent + videoInfo;
            videoContainer.appendChild(videoItem);
        });
    }
    
    // Hide video section if no videos
    const videoSection = videoContainer.closest('.robot-videos, .tab-content');
    if (videoSection && videoContainer.children.length === 0) {
        videoSection.style.display = 'none';
    } else if (videoSection) {
        videoSection.style.display = 'block';
    }
}

/**
 * Initialize lightbox functionality for gallery images
 */
function initLightbox() {
    // Create lightbox elements if they don't exist
    if (!document.querySelector('.media-lightbox')) {
        const lightbox = document.createElement('div');
        lightbox.className = 'media-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-caption"></div>
                <div class="lightbox-nav">
                    <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                    <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);
        
        // Close lightbox on click outside of content
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close button functionality
        lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
        
        // Navigation functionality
        lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrevImage);
        lightbox.querySelector('.lightbox-next').addEventListener('click', showNextImage);
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        });
    }
    
    // Add click event to all gallery images
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            openLightbox(this);
        });
    });
}

// Current lightbox image index
let currentImageIndex = 0;
let galleryItems = [];

/**
 * Open lightbox with the selected image
 */
function openLightbox(galleryItem) {
    // Get all gallery items again to ensure we have the latest
    galleryItems = document.querySelectorAll('.gallery-item');
    
    // Find index of clicked item
    for (let i = 0; i < galleryItems.length; i++) {
        if (galleryItems[i] === galleryItem) {
            currentImageIndex = i;
            break;
        }
    }
    
    // Update lightbox content
    updateLightboxContent();
    
    // Show lightbox
    const lightbox = document.querySelector('.media-lightbox');
    lightbox.classList.add('active');
    
    // Prevent page scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
}

/**
 * Close the lightbox
 */
function closeLightbox() {
    const lightbox = document.querySelector('.media-lightbox');
    lightbox.classList.remove('active');
    
    // Restore page scrolling
    document.body.style.overflow = '';
}

/**
 * Show the previous image in the lightbox
 */
function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + galleryItems.length) % galleryItems.length;
    updateLightboxContent();
}

/**
 * Show the next image in the lightbox
 */
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % galleryItems.length;
    updateLightboxContent();
}

/**
 * Update the lightbox content based on the current image index
 */
function updateLightboxContent() {
    const galleryItem = galleryItems[currentImageIndex];
    const img = galleryItem.querySelector('img');
    const caption = galleryItem.querySelector('.gallery-caption');
    
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    
    if (caption) {
        lightboxCaption.textContent = caption.textContent;
        lightboxCaption.style.display = 'block';
    } else {
        lightboxCaption.style.display = 'none';
    }
}

/**
 * Extract YouTube video ID from URL
 */
function getYouTubeVideoId(url) {
    if (!url) return null;
    
    // Try to match YouTube URL patterns
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\.be\/)([^\"&?\\/\\s]{11})/i;
    const match = url.match(regex);
    
    return match ? match[1] : null;
}

/**
 * Extract Vimeo video ID from URL
 */
function getVimeoVideoId(url) {
    if (!url) return null;
    
    // Try to match Vimeo URL patterns
    const regex = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/i;
    const match = url.match(regex);
    
    return match ? match[1] : null;
}
