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
                imageUrl = robot.media.featuredImage.url;
            }
            // If no featuredImage, try mainImage
            else if (robot.media.mainImage && robot.media.mainImage.url) {
                imageUrl = robot.media.mainImage.url;
            }
            // If no mainImage, try first image in images array
            else if (robot.media.images && robot.media.images.length > 0 && robot.media.images[0].url) {
                imageUrl = robot.media.images[0].url;
            }
        }
        
        // Make sure path is accessible for everyone
        if (imageUrl && !imageUrl.startsWith('http')) {
            // Create directory if needed
            this.ensureRobotsDirectory();
            
            // If not already in robots directory, move it there
            if (!imageUrl.includes('images/robots/')) {
                const fileName = imageUrl.split('/').pop();
                const newPath = 'images/robots/' + fileName;
                
                // Use existing file or default to placeholder
                try {
                    // Just return the proper path - we'll handle file existence elsewhere
                    imageUrl = newPath;
                } catch (e) {
                    console.error('Error with image path:', e);
                    imageUrl = 'images/robots/robot-placeholder.jpg';
                }
            }
        }
        
        return imageUrl;
    },
    
    // Function to handle image errors
    handleImageError: function(img) {
        img.onerror = null; // Prevent infinite loop
        img.src = 'images/robots/robot-placeholder.jpg';
        console.log('Image failed to load, using placeholder:', img.src);
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
    
    // Function to ensure image paths are correct for all users
    fixImagePath: function(path) {
        // If path is already a URL or null, return it unchanged
        if (!path || path.startsWith('http')) {
            return path;
        }
        
        // Make sure robots directory exists
        this.ensureRobotsDirectory();
        
        // Fix relative paths to use the robots directory
        if (path.startsWith('/')) {
            // Absolute path, convert to robots directory
            return 'images/robots/' + path.substring(1).split('/').pop();
        } else if (path.includes('/')) {
            // Relative path with directories, extract filename
            return 'images/robots/' + path.split('/').pop();
        } else {
            // Just a filename
            return 'images/robots/' + path;
        }
    },
    
    // Function to ensure the robots directory exists
    ensureRobotsDirectory: function() {
        // This is handled server-side in practice
        // Just make sure we have a placeholder image
        const testImg = new Image();
        testImg.onerror = () => {
            console.warn('Robot placeholder image may be missing. Please ensure images/robots/robot-placeholder.jpg exists.');
        };
        testImg.src = 'images/robots/robot-placeholder.jpg';
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
                
                // Fix image path for all users
                thumbnail.src = this.fixImagePath(image.url);
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
        
        // Make sure robots directory exists and we have a placeholder
        this.ensureRobotsDirectory();
        
        // Fix any existing robot images in the DOM
        this.fixExistingImages();
    },
    
    // Fix any existing robot images in the DOM
    fixExistingImages: function() {
        const robotImages = document.querySelectorAll('img.robot-image, img.robot-thumbnail, img.robot-main-image');
        
        robotImages.forEach(img => {
            // Set error handler
            img.onerror = () => this.handleImageError(img);
            
            // Fix path if needed
            const currentSrc = img.getAttribute('src');
            if (currentSrc && !currentSrc.startsWith('http') && !currentSrc.includes('images/robots/')) {
                img.src = this.fixImagePath(currentSrc);
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.robotMedia.init();
});
