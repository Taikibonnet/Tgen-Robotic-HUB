/**
 * Robot Media Handler
 * This script manages the robot media display and ensures it works consistently for all users
 */

// Initialize the window.robotMedia object 
window.robotMedia = {
    // Function to get the appropriate image URL for a robot
    getImageUrl: function(robot) {
        // Default placeholder image if none found
        let imageUrl = 'images/robots/robot-placeholder.jpg';
        
        if (robot && robot.media) {
            // Check featuredImage first
            if (robot.media.featuredImage && robot.media.featuredImage.url) {
                // For uploaded images that store the full URL
                if (robot.media.featuredImage.url.startsWith('http')) {
                    imageUrl = robot.media.featuredImage.url;
                }
                // For relative paths
                else {
                    // Make sure the path is correct, prepend "images/robots/" if needed
                    if (!robot.media.featuredImage.url.startsWith('images/')) {
                        imageUrl = 'images/robots/' + robot.media.featuredImage.url.replace(/^\//, '');
                    } else {
                        imageUrl = robot.media.featuredImage.url;
                    }
                }
            }
            // If no featuredImage, try mainImage
            else if (robot.media.mainImage && robot.media.mainImage.url) {
                if (robot.media.mainImage.url.startsWith('http')) {
                    imageUrl = robot.media.mainImage.url;
                } 
                else {
                    if (!robot.media.mainImage.url.startsWith('images/')) {
                        imageUrl = 'images/robots/' + robot.media.mainImage.url.replace(/^\//, '');
                    } else {
                        imageUrl = robot.media.mainImage.url;
                    }
                }
            }
            // If no mainImage, try first image in images array
            else if (robot.media.images && robot.media.images.length > 0 && robot.media.images[0].url) {
                if (robot.media.images[0].url.startsWith('http')) {
                    imageUrl = robot.media.images[0].url;
                }
                else {
                    if (!robot.media.images[0].url.startsWith('images/')) {
                        imageUrl = 'images/robots/' + robot.media.images[0].url.replace(/^\//, '');
                    } else {
                        imageUrl = robot.media.images[0].url;
                    }
                }
            }
        }
        
        return imageUrl;
    },
    
    // Function to handle image errors
    handleImageError: function(img) {
        img.onerror = null; // Prevent infinite loop
        img.src = 'images/robots/robot-placeholder.jpg';
    },
    
    // Function to get the appropriate video URL for a robot
    getVideoUrl: function(robot) {
        let videoUrl = '';
        
        if (robot && robot.media && robot.media.videos && robot.media.videos.length > 0) {
            const video = robot.media.videos[0];
            
            if (video.type === 'youtube' && video.url) {
                // Extract the YouTube video ID
                let videoId = '';
                if (video.url.includes('youtube.com/watch?v=')) {
                    videoId = video.url.split('v=')[1];
                } else if (video.url.includes('youtu.be/')) {
                    videoId = video.url.split('youtu.be/')[1];
                }
                
                // Remove any additional parameters
                if (videoId && videoId.includes('&')) {
                    videoId = videoId.split('&')[0];
                }
                
                if (videoId) {
                    // Create embedded URL
                    videoUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (video.type === 'url' && video.url) {
                videoUrl = video.url;
            }
        }
        
        return videoUrl;
    },
    
    // Function to render media gallery
    renderGallery: function(robot, container) {
        if (!robot || !container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Create main image element
        const mainImageUrl = this.getImageUrl(robot);
        const mainImage = document.createElement('img');
        mainImage.className = 'robot-main-image';
        mainImage.src = mainImageUrl;
        mainImage.alt = robot.name || 'Robot image';
        mainImage.onerror = () => this.handleImageError(mainImage);
        
        // Create main image container
        const mainImageContainer = document.createElement('div');
        mainImageContainer.className = 'robot-main-image-container';
        mainImageContainer.appendChild(mainImage);
        container.appendChild(mainImageContainer);
        
        // Create thumbnails container if there are additional images
        if (robot.media && robot.media.images && robot.media.images.length > 1) {
            const thumbnailsContainer = document.createElement('div');
            thumbnailsContainer.className = 'robot-thumbnails-container';
            
            robot.media.images.forEach((image, index) => {
                // Skip if the image URL is the same as the main image
                if (index === 0 && mainImageUrl === image.url) return;
                
                // Create thumbnail
                const thumbnail = document.createElement('img');
                thumbnail.className = 'robot-thumbnail';
                thumbnail.src = image.url.startsWith('http') ? image.url : 
                                image.url.startsWith('images/') ? image.url : 
                                'images/robots/' + image.url.replace(/^\//, '');
                thumbnail.alt = image.alt || `${robot.name} image ${index + 1}`;
                thumbnail.onerror = () => this.handleImageError(thumbnail);
                
                // Add click event to switch main image
                thumbnail.addEventListener('click', () => {
                    mainImage.src = thumbnail.src;
                });
                
                thumbnailsContainer.appendChild(thumbnail);
            });
            
            container.appendChild(thumbnailsContainer);
        }
        
        // Add video if available
        const videoUrl = this.getVideoUrl(robot);
        if (videoUrl) {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'robot-video-container';
            
            // Check if it's a YouTube URL
            if (videoUrl.includes('youtube.com/embed/')) {
                const iframe = document.createElement('iframe');
                iframe.src = videoUrl;
                iframe.width = '100%';
                iframe.height = '315';
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                
                videoContainer.appendChild(iframe);
            } else {
                // For other video types, create a link
                const videoLink = document.createElement('a');
                videoLink.href = videoUrl;
                videoLink.target = '_blank';
                videoLink.className = 'video-link';
                videoLink.innerHTML = `<i class="fas fa-video"></i> Watch Video`;
                
                videoContainer.appendChild(videoLink);
            }
            
            container.appendChild(videoContainer);
        }
    },
    
    // Initialize media handlers
    init: function() {
        console.log('Robot Media Handler: Initializing');
        // Add placeholder robot image
        this.ensurePlaceholderImage();
    },
    
    // Make sure we have a placeholder image
    ensurePlaceholderImage: function() {
        // No need to actually implement this in JavaScript,
        // we just need to make sure the placeholder image exists on the server
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.robotMedia.init();
});
