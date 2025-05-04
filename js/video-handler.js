/**
 * Video Handler Functions
 * This file contains functions for handling robot videos
 */

/**
 * Populates the videos tab with robot video content
 * @param {Object} robot - The robot data object
 */
function populateVideos(robot) {
    const videosContainer = document.getElementById('robot-videos');
    const emptyMessage = document.querySelector('.empty-videos-message');
    
    if (!videosContainer) return;
    
    videosContainer.innerHTML = '';
    
    if (robot.media && robot.media.videos && robot.media.videos.length > 0) {
        // Hide empty message
        if (emptyMessage) {
            emptyMessage.style.display = 'none';
        }
        
        // Add videos
        robot.media.videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            
            let videoPlayerHTML = '';
            
            // Determine video type
            if (video.type === 'url' || isExternalVideoUrl(video.url)) {
                // External video (YouTube, Vimeo, etc.)
                const embedUrl = getEmbedUrl(video.url);
                if (embedUrl) {
                    videoPlayerHTML = `
                        <div class="video-player">
                            <iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe>
                        </div>
                    `;
                } else {
                    // Fallback for unsupported video URLs
                    videoPlayerHTML = `
                        <div class="video-player" style="height: 225px; display: flex; align-items: center; justify-content: center; background-color: #1a1a1a;">
                            <a href="${video.url}" target="_blank" style="color: var(--primary); text-decoration: none;">
                                <i class="fas fa-external-link-alt" style="font-size: 2rem; margin-right: 10px;"></i>
                                Open Video
                            </a>
                        </div>
                    `;
                }
            } else {
                // Uploaded video file
                videoPlayerHTML = `
                    <div class="video-player">
                        <video controls>
                            <source src="${video.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            }
            
            videoItem.innerHTML = `
                ${videoPlayerHTML}
                <div class="video-content">
                    <h3 class="video-title">${video.title || 'Robot Video'}</h3>
                    ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                </div>
            `;
            
            videosContainer.appendChild(videoItem);
        });
    } else {
        // Show empty message
        if (emptyMessage) {
            emptyMessage.style.display = 'block';
        } else {
            // Create a message if it doesn't exist
            const message = document.createElement('p');
            message.className = 'empty-videos-message';
            message.style.gridColumn = '1 / -1';
            message.style.textAlign = 'center';
            message.style.padding = '40px';
            message.style.color = 'var(--gray)';
            message.style.fontStyle = 'italic';
            message.textContent = 'No videos available for this robot.';
            videosContainer.appendChild(message);
        }
    }
}

/**
 * Gets the embed URL from a video URL
 * @param {string} url - The video URL
 * @returns {string|null} - The embed URL or null if not supported
 */
function getEmbedUrl(url) {
    if (!url) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /vimeo.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Facebook
    if (url.includes('facebook.com') && url.includes('/videos/')) {
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
    }
    
    return null;
}

/**
 * Helper function to determine if a URL is an external video
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is an external video
 */
function isExternalVideoUrl(url) {
    if (!url) return false;
    
    const videoPatterns = [
        /youtube\.com/,
        /youtu\.be/,
        /vimeo\.com/,
        /dailymotion\.com/,
        /facebook\.com.*\/videos\//
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
}

// Make sure to call this function from the robot-detail page
// Add this line to the populateRobotData function after the other populate functions
// populateVideos(robot);
