/**
 * Robot Media Handler
 * This file handles media files for robots (images, videos)
 * and ensures they persist across all platforms
 */

window.robotMediaHandler = (function() {
    // Media storage path on GitHub
    const MEDIA_PATH = 'images/robots/';
    
    // Default placeholder image
    const DEFAULT_PLACEHOLDER = 'images/robot-placeholder.jpg';
    
    /**
     * Convert a Blob URL to a Data URL for storage
     */
    function blobUrlToDataUrl(blobUrl) {
        return new Promise((resolve, reject) => {
            if (!blobUrl.startsWith('blob:')) {
                // Not a blob URL, just return it
                resolve(blobUrl);
                return;
            }
            
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            xhr.onload = function() {
                const reader = new FileReader();
                reader.onloadend = function() {
                    resolve(reader.result);
                };
                reader.onerror = reject;
                reader.readAsDataURL(xhr.response);
            };
            xhr.onerror = reject;
            xhr.open('GET', blobUrl);
            xhr.send();
        });
    }
    
    /**
     * Save a media file to GitHub
     */
    async function saveMediaToGitHub(mediaData, fileName) {
        // If we have GitHub integration, use it
        if (window.githubStorage && typeof window.githubStorage.saveImage === 'function') {
            return await window.githubStorage.saveImage(mediaData, fileName);
        }
        
        // Otherwise, just return the data URL
        return mediaData;
    }
    
    /**
     * Process media data from a robot form
     * - Convert blob URLs to data URLs
     * - Save images to GitHub if possible
     * - Return the processed media object
     */
    async function processMediaData(formData) {
        const media = {
            featuredImage: null,
            images: [],
            videos: []
        };
        
        // Process main image if available
        if (formData.mainImage) {
            // Convert to data URL if it's a blob
            const dataUrl = await blobUrlToDataUrl(formData.mainImage.url);
            
            // Generate a file name
            const fileName = `${formData.slug}-main-${Date.now()}.jpg`;
            
            // Save to GitHub if possible
            const imageUrl = await saveMediaToGitHub(dataUrl, fileName);
            
            media.featuredImage = {
                url: imageUrl || dataUrl,
                alt: formData.mainImage.alt || formData.name
            };
        }
        
        // Process gallery images
        if (formData.galleryImages && formData.galleryImages.length > 0) {
            for (let i = 0; i < formData.galleryImages.length; i++) {
                const image = formData.galleryImages[i];
                
                // Convert to data URL if it's a blob
                const dataUrl = await blobUrlToDataUrl(image.url);
                
                // Generate a file name
                const fileName = `${formData.slug}-gallery-${i}-${Date.now()}.jpg`;
                
                // Save to GitHub if possible
                const imageUrl = await saveMediaToGitHub(dataUrl, fileName);
                
                media.images.push({
                    url: imageUrl || dataUrl,
                    alt: image.alt || `${formData.name} image ${i + 1}`,
                    caption: image.caption || ''
                });
            }
        }
        
        // Process videos
        if (formData.videos && formData.videos.length > 0) {
            for (const video of formData.videos) {
                // Only include videos with a URL
                if (video.url) {
                    media.videos.push({
                        type: video.type,
                        url: video.url,
                        title: video.title || '',
                        description: video.description || ''
                    });
                }
            }
        }
        
        return media;
    }
    
    /**
     * Create a robot card element
     */
    function createRobotCard(robot, clickHandler) {
        const card = document.createElement('div');
        card.className = 'robot-card';
        card.dataset.slug = robot.slug;
        
        // Use a placeholder image if no featured image is available
        let imageUrl = DEFAULT_PLACEHOLDER;
        if (robot.media) {
            if (robot.media.featuredImage && robot.media.featuredImage.url) {
                imageUrl = robot.media.featuredImage.url;
            } else if (robot.media.mainImage && robot.media.mainImage.url) {
                imageUrl = robot.media.mainImage.url;
            } else if (robot.media.images && robot.media.images.length > 0) {
                imageUrl = robot.media.images[0].url;
            }
        }
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${robot.media?.featuredImage?.alt || robot.name}" class="robot-image" onerror="this.src='${DEFAULT_PLACEHOLDER}'">
            <div class="robot-content">
                <h3 class="robot-title">${robot.name || 'Unnamed Robot'}</h3>
                <p class="robot-desc">${robot.summary || 'No description available.'}</p>
                <div class="robot-meta">
                    <span>${robot.manufacturer?.name || 'Unknown Manufacturer'}</span>
                </div>
            </div>
        `;
        
        // Add click event handler if provided
        if (clickHandler) {
            card.addEventListener('click', () => clickHandler(robot));
        } else {
            // Default click handler navigates to robot detail page
            card.addEventListener('click', () => {
                window.location.href = `robot-detail.html?slug=${robot.slug}`;
            });
        }
        
        return card;
    }
    
    /**
     * Display robot media in a container
     */
    function displayRobotMedia(robot, container) {
        if (!robot || !robot.media || !container) return;
        
        // Clear the container
        container.innerHTML = '';
        
        // Create the media section
        const mediaSection = document.createElement('div');
        mediaSection.className = 'robot-media-section';
        
        // Add the main image if available
        if (robot.media.featuredImage && robot.media.featuredImage.url) {
            const mainImage = document.createElement('div');
            mainImage.className = 'robot-main-image';
            mainImage.innerHTML = `
                <img src="${robot.media.featuredImage.url}" alt="${robot.media.featuredImage.alt || robot.name}" 
                     onerror="this.src='${DEFAULT_PLACEHOLDER}'">
            `;
            mediaSection.appendChild(mainImage);
        }
        
        // Add the gallery if available
        if (robot.media.images && robot.media.images.length > 0) {
            const gallery = document.createElement('div');
            gallery.className = 'robot-image-gallery';
            
            robot.media.images.forEach(image => {
                // Skip the main image if it's already displayed
                if (robot.media.featuredImage && image.url === robot.media.featuredImage.url) {
                    return;
                }
                
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.innerHTML = `
                    <img src="${image.url}" alt="${image.alt || robot.name}" 
                         onerror="this.src='${DEFAULT_PLACEHOLDER}'">
                    ${image.caption ? `<div class="gallery-caption">${image.caption}</div>` : ''}
                `;
                gallery.appendChild(galleryItem);
            });
            
            if (gallery.children.length > 0) {
                mediaSection.appendChild(gallery);
            }
        }
        
        // Add videos if available
        if (robot.media.videos && robot.media.videos.length > 0) {
            const videos = document.createElement('div');
            videos.className = 'robot-videos';
            
            robot.media.videos.forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.className = 'video-item';
                
                // Different handling based on video type
                if (video.type === 'youtube') {
                    const youtubeId = extractYouTubeId(video.url);
                    if (youtubeId) {
                        videoItem.innerHTML = `
                            <div class="video-container">
                                <iframe 
                                    width="100%" 
                                    height="315" 
                                    src="https://www.youtube.com/embed/${youtubeId}" 
                                    title="${video.title || 'YouTube video'}"
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen>
                                </iframe>
                            </div>
                            ${video.title ? `<h3 class="video-title">${video.title}</h3>` : ''}
                            ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                        `;
                        videos.appendChild(videoItem);
                    }
                } else if (video.type === 'mp4') {
                    videoItem.innerHTML = `
                        <div class="video-container">
                            <video controls width="100%">
                                <source src="${video.url}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        ${video.title ? `<h3 class="video-title">${video.title}</h3>` : ''}
                        ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                    `;
                    videos.appendChild(videoItem);
                } else if (video.type === 'external' || video.type === 'url') {
                    videoItem.innerHTML = `
                        <div class="video-link">
                            <a href="${video.url}" target="_blank" class="btn">
                                <i class="fas fa-external-link-alt"></i> 
                                ${video.title || 'Watch Video'}
                            </a>
                        </div>
                        ${video.description ? `<p class="video-description">${video.description}</p>` : ''}
                    `;
                    videos.appendChild(videoItem);
                }
            });
            
            if (videos.children.length > 0) {
                mediaSection.appendChild(videos);
            }
        }
        
        // Add the media section to the container
        container.appendChild(mediaSection);
    }
    
    /**
     * Extract YouTube video ID from URL
     */
    function extractYouTubeId(url) {
        if (!url) return null;
        
        const regex = /(?:youtube\.com\/(?:[^\\/]+\/.+\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\.be\\/)([^\\\"&?\\/\\s]{11})/i;
        const match = url.match(regex);
        
        return match ? match[1] : null;
    }
    
    // Return the public API
    return {
        processMediaData,
        createRobotCard,
        displayRobotMedia,
        blobUrlToDataUrl,
        extractYouTubeId
    };
})();
