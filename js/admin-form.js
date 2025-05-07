/**
 * Admin Form Functionality for Tgen Robotics Hub
 * This script manages the robot creation and editing form in the admin section
 */

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAdminForm();
});

// Global variables to store media files
const mediaFiles = {
    mainImage: null,
    galleryImages: [],
    videos: []
};

/**
 * Initialize the admin form
 */
function initAdminForm() {
    // Initialize the storage adapter if available
    if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init();
    }
    
    // Set up file upload listeners
    setupMainImageUpload();
    setupGalleryImagesUpload();
    setupVideoInputs();
    
    // Setup form submission
    setupFormSubmission();
    
    // Check for robot ID in URL (edit mode)
    const urlParams = new URLSearchParams(window.location.search);
    const robotId = urlParams.get('id');
    
    if (robotId) {
        // Load robot data for editing
        loadRobotData(robotId);
    }
}

/**
 * Setup main image upload functionality
 */
function setupMainImageUpload() {
    const mainImageInput = document.getElementById('mainImage');
    const mainImagePreview = document.getElementById('mainImagePreview');
    
    if (!mainImageInput || !mainImagePreview) return;
    
    // Setup upload area if it exists
    const uploadArea = mainImageInput.closest('.form-section').querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            mainImageInput.click();
        });
        
        // Setup drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                mainImageInput.files = e.dataTransfer.files;
                handleMainImageChange(e);
            }
        });
    }
    
    // Handle file selection
    mainImageInput.addEventListener('change', handleMainImageChange);
    
    function handleMainImageChange(e) {
        const file = e.target.files[0];
        
        if (file) {
            // Check file type
            if (!file.type.match('image.*')) {
                alert('Please select an image file');
                return;
            }
            
            // Store the file
            mediaFiles.mainImage = file;
            
            // Create preview
            const reader = new FileReader();
            reader.onload = function(e) {
                mainImagePreview.innerHTML = '';
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Main image preview" class="preview-img">
                    <div class="preview-remove">&times;</div>
                `;
                
                mainImagePreview.appendChild(previewItem);
                
                // Add remove functionality
                previewItem.querySelector('.preview-remove').addEventListener('click', function() {
                    mainImagePreview.innerHTML = '';
                    mainImageInput.value = '';
                    mediaFiles.mainImage = null;
                });
            };
            
            reader.readAsDataURL(file);
        }
    }
}

/**
 * Setup gallery images upload functionality
 */
function setupGalleryImagesUpload() {
    const galleryImagesInput = document.getElementById('galleryImages');
    const galleryPreview = document.getElementById('galleryPreview');
    
    if (!galleryImagesInput || !galleryPreview) return;
    
    // Setup upload area if it exists
    const uploadArea = galleryImagesInput.closest('.form-section').querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            galleryImagesInput.click();
        });
        
        // Setup drag and drop
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                galleryImagesInput.files = e.dataTransfer.files;
                handleGalleryImagesChange(e);
            }
        });
    }
    
    // Handle file selection
    galleryImagesInput.addEventListener('change', handleGalleryImagesChange);
    
    function handleGalleryImagesChange(e) {
        const files = e.target.files;
        
        if (files.length) {
            // Iterate through each selected file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // Check file type
                if (!file.type.match('image.*')) {
                    continue;
                }
                
                // Store the file
                mediaFiles.galleryImages.push(file);
                
                // Create preview
                const reader = new FileReader();
                reader.onload = (function(theFile) {
                    return function(e) {
                        const previewItem = document.createElement('div');
                        previewItem.className = 'preview-item';
                        previewItem.innerHTML = `
                            <img src="${e.target.result}" alt="Gallery image preview" class="preview-img">
                            <div class="preview-remove">&times;</div>
                        `;
                        
                        galleryPreview.appendChild(previewItem);
                        
                        // Add remove functionality
                        previewItem.querySelector('.preview-remove').addEventListener('click', function() {
                            const index = mediaFiles.galleryImages.indexOf(theFile);
                            if (index > -1) {
                                mediaFiles.galleryImages.splice(index, 1);
                            }
                            previewItem.remove();
                        });
                    };
                })(file);
                
                reader.readAsDataURL(file);
            }
        }
    }
}

/**
 * Setup video inputs functionality
 */
function setupVideoInputs() {
    // Add video button
    const addVideoBtn = document.getElementById('addVideoBtn');
    const videoInputsContainer = document.getElementById('videoInputsContainer');
    
    if (!addVideoBtn || !videoInputsContainer) return;
    
    // Initialize first video input
    setupVideoInput(videoInputsContainer.querySelector('.video-input'));
    
    // Add video button click handler
    addVideoBtn.addEventListener('click', function() {
        const videoInput = document.createElement('div');
        videoInput.className = 'video-input';
        videoInput.innerHTML = `
            <div class="form-group">
                <label>Video Type</label>
                <select class="video-type" name="videoType[]">
                    <option value="youtube">YouTube Link</option>
                    <option value="mp4">Upload MP4</option>
                    <option value="external">External Link</option>
                </select>
            </div>
            
            <div class="form-group video-url-input">
                <label>Video URL</label>
                <input type="text" class="video-url" name="videoUrl[]" placeholder="https://www.youtube.com/watch?v=...">
            </div>
            
            <div class="form-group video-file-input" style="display: none;">
                <label>Upload MP4</label>
                <input type="file" class="video-file" name="videoFile[]" accept="video/mp4">
            </div>
            
            <div class="form-group">
                <label>Video Title (optional)</label>
                <input type="text" class="video-title" name="videoTitle[]" placeholder="Video title">
            </div>
            
            <div class="form-group">
                <label>Video Description (optional)</label>
                <textarea class="video-description" name="videoDescription[]" placeholder="Video description"></textarea>
            </div>
            
            <div class="video-preview"></div>
            
            <button type="button" class="remove-video-btn">Remove</button>
        `;
        
        videoInputsContainer.appendChild(videoInput);
        setupVideoInput(videoInput);
    });
}

/**
 * Setup a video input
 */
function setupVideoInput(videoInput) {
    if (!videoInput) return;
    
    const videoType = videoInput.querySelector('.video-type');
    const videoUrlInput = videoInput.querySelector('.video-url-input');
    const videoFileInput = videoInput.querySelector('.video-file-input');
    const videoUrl = videoInput.querySelector('.video-url');
    const videoFile = videoInput.querySelector('.video-file');
    const videoTitle = videoInput.querySelector('.video-title');
    const videoPreview = videoInput.querySelector('.video-preview');
    const removeBtn = videoInput.querySelector('.remove-video-btn');
    
    // Handle video type change
    videoType.addEventListener('change', function() {
        if (this.value === 'mp4') {
            videoUrlInput.style.display = 'none';
            videoFileInput.style.display = 'block';
        } else {
            videoUrlInput.style.display = 'block';
            videoFileInput.style.display = 'none';
        }
        
        // Clear preview
        videoPreview.innerHTML = '';
    });
    
    // Handle video URL input
    if (videoUrl) {
        videoUrl.addEventListener('input', function() {
            if (videoType.value === 'youtube') {
                generateYouTubePreview(this.value);
            } else if (videoType.value === 'external') {
                // Clear preview for external links
                videoPreview.innerHTML = '';
            }
        });
    }
    
    // Handle video file input
    if (videoFile) {
        videoFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            
            if (file) {
                // Check file type
                if (!file.type.match('video/mp4')) {
                    alert('Please select an MP4 video file');
                    return;
                }
                
                // Create video preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    videoPreview.innerHTML = `
                        <video controls>
                            <source src="${e.target.result}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Handle remove button
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            videoInput.remove();
        });
    }
    
    // Function to generate YouTube preview
    function generateYouTubePreview(url) {
        const youtubeId = extractYouTubeId(url);
        
        if (youtubeId) {
            videoPreview.innerHTML = `
                <iframe 
                    width="100%" 
                    height="180" 
                    src="https://www.youtube.com/embed/${youtubeId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                ></iframe>
            `;
        } else {
            videoPreview.innerHTML = '';
        }
    }
    
    // Function to extract YouTube video ID
    function extractYouTubeId(url) {
        if (!url) return null;
        
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/\s]{11})/i;
        const match = url.match(regex);
        
        return match ? match[1] : null;
    }
}

/**
 * Setup form submission
 */
function setupFormSubmission() {
    const robotForm = document.getElementById('robot-form');
    
    if (!robotForm) return;
    
    robotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get robot data from form
        const robotData = collectFormData();
        
        // Validate robot data
        if (!validateRobotData(robotData)) {
            return;
        }
        
        // Get robot ID from URL (if any)
        const urlParams = new URLSearchParams(window.location.search);
        const robotId = urlParams.get('id');
        
        // Save robot data
        saveRobotData(robotData, robotId);
    });
}

/**
 * Collect form data
 */
function collectFormData() {
    const formData = {
        name: document.getElementById('robot-name').value.trim(),
        slug: document.getElementById('robot-slug').value.trim(),
        manufacturer: {
            name: document.getElementById('manufacturer-name').value.trim(),
            country: document.getElementById('manufacturer-country').value.trim(),
            website: document.getElementById('manufacturer-website').value.trim()
        },
        yearIntroduced: document.getElementById('year-introduced').value.trim(),
        status: document.getElementById('robot-status').value,
        summary: document.getElementById('robot-summary').value.trim(),
        description: document.getElementById('robot-description').value.trim(),
        categories: [],
        specifications: {
            physical: {
                height: {
                    value: document.getElementById('spec-height').value.trim(),
                    unit: document.getElementById('spec-height-unit').value
                },
                weight: {
                    value: document.getElementById('spec-weight').value.trim(),
                    unit: document.getElementById('spec-weight-unit').value
                }
            },
            performance: {
                battery: {
                    runtime: document.getElementById('spec-battery-runtime').value.trim()
                },
                speed: {
                    value: document.getElementById('spec-speed').value.trim(),
                    unit: document.getElementById('spec-speed-unit').value
                }
            }
        },
        media: {
            featuredImage: null,
            images: [],
            videos: []
        },
        stats: {
            views: 0,
            favorites: 0
        }
    };
    
    // Generate slug if not provided
    if (!formData.slug) {
        formData.slug = formData.name.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
    }
    
    // Process media data
    processMediaData(formData);
    
    return formData;
}

/**
 * Process media data and add to form data
 */
function processMediaData(formData) {
    // Process main image
    if (mediaFiles.mainImage) {
        formData.media.featuredImage = {
            url: URL.createObjectURL(mediaFiles.mainImage),
            alt: formData.name
        };
    }
    
    // Process gallery images
    mediaFiles.galleryImages.forEach(file => {
        formData.media.images.push({
            url: URL.createObjectURL(file),
            alt: formData.name,
            caption: ''
        });
    });
    
    // Process videos
    const videoInputs = document.querySelectorAll('.video-input');
    
    videoInputs.forEach(videoInput => {
        const videoType = videoInput.querySelector('.video-type').value;
        const videoUrl = videoInput.querySelector('.video-url').value.trim();
        const videoFile = videoInput.querySelector('.video-file').files[0];
        const videoTitle = videoInput.querySelector('.video-title').value.trim();
        const videoDescription = videoInput.querySelector('.video-description')?.value.trim() || '';
        
        if ((videoType !== 'mp4' && videoUrl) || (videoType === 'mp4' && videoFile)) {
            const video = {
                type: videoType,
                title: videoTitle,
                description: videoDescription
            };
            
            if (videoType === 'mp4' && videoFile) {
                video.url = URL.createObjectURL(videoFile);
            } else {
                video.url = videoUrl;
            }
            
            formData.media.videos.push(video);
        }
    });
}

/**
 * Validate robot data
 */
function validateRobotData(robotData) {
    // Check required fields
    if (!robotData.name) {
        alert('Please enter a robot name');
        return false;
    }
    
    if (!robotData.manufacturer.name) {
        alert('Please enter a manufacturer name');
        return false;
    }
    
    if (!robotData.summary) {
        alert('Please enter a summary');
        return false;
    }
    
    return true;
}

/**
 * Save robot data
 */
function saveRobotData(robotData, robotId) {
    // Create a new ID if this is a new robot
    if (!robotId) {
        robotId = Date.now().toString();
        robotData.id = robotId;
    } else {
        robotData.id = robotId;
    }
    
    // Convert blob URLs to data URLs
    convertBlobUrlsToDataUrls(robotData)
        .then(processedData => {
            // Ensure images are in the robots folder
            fixImagePaths(processedData);
            
            // Save to localStorage directly
            localStorage.setItem(`robot_${robotId}`, JSON.stringify(processedData));
            
            // If using the storage adapter
            if (window.robotStorage) {
                if (robotId && window.robotStorage.updateRobotAndSave) {
                    window.robotStorage.updateRobotAndSave(robotId, processedData);
                } else if (window.robotStorage.addRobotAndSave) {
                    window.robotStorage.addRobotAndSave(processedData);
                }
            }
            
            // Alert success
            alert('Robot saved successfully!');
            
            // Redirect to robot detail page
            window.location.href = `robot-detail.html?slug=${processedData.slug}`;
        })
        .catch(error => {
            console.error('Error saving robot data:', error);
            alert('An error occurred while saving the robot data. Please try again.');
        });
}

/**
 * Fix image paths to ensure they use the robots folder
 */
function fixImagePaths(robotData) {
    // Fix featured image path
    if (robotData.media.featuredImage && robotData.media.featuredImage.url) {
        // For data URLs, we'll keep as is since they'll be handled by the media handler
        if (!robotData.media.featuredImage.url.startsWith('data:')) {
            // If it's a regular URL and not already in the robots folder, fix it
            if (!robotData.media.featuredImage.url.includes('images/robots/')) {
                // Extract filename or use a default name based on the robot
                let filename = robotData.slug + '-main.jpg';
                if (robotData.media.featuredImage.url.includes('/')) {
                    filename = robotData.media.featuredImage.url.split('/').pop();
                }
                robotData.media.featuredImage.url = 'images/robots/' + filename;
            }
        }
    }
    
    // Fix gallery images paths
    if (robotData.media.images && robotData.media.images.length > 0) {
        robotData.media.images.forEach((image, index) => {
            if (image.url && !image.url.startsWith('data:')) {
                if (!image.url.includes('images/robots/')) {
                    let filename = robotData.slug + '-' + (index + 1) + '.jpg';
                    if (image.url.includes('/')) {
                        filename = image.url.split('/').pop();
                    }
                    image.url = 'images/robots/' + filename;
                }
            }
        });
    }
    
    return robotData;
}

/**
 * Convert Blob URLs to Data URLs
 */
async function convertBlobUrlsToDataUrls(robotData) {
    const clonedData = JSON.parse(JSON.stringify(robotData));
    
    // Convert featuredImage URL if it's a Blob URL
    if (clonedData.media.featuredImage && clonedData.media.featuredImage.url.startsWith('blob:')) {
        clonedData.media.featuredImage.url = await blobUrlToDataUrl(clonedData.media.featuredImage.url);
    }
    
    // Convert gallery image URLs
    for (let i = 0; i < clonedData.media.images.length; i++) {
        if (clonedData.media.images[i].url.startsWith('blob:')) {
            clonedData.media.images[i].url = await blobUrlToDataUrl(clonedData.media.images[i].url);
        }
    }
    
    // Convert video URLs
    for (let i = 0; i < clonedData.media.videos.length; i++) {
        if (clonedData.media.videos[i].url.startsWith('blob:')) {
            clonedData.media.videos[i].url = await blobUrlToDataUrl(clonedData.media.videos[i].url);
        }
    }
    
    return clonedData;
}

/**
 * Convert a Blob URL to a Data URL
 */
function blobUrlToDataUrl(blobUrl) {
    return new Promise((resolve, reject) => {
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
 * Load robot data for editing
 */
function loadRobotData(robotId) {
    // Try to get robot data
    let robot = null;
    
    // First try to get from localStorage directly
    try {
        const robotData = localStorage.getItem(`robot_${robotId}`);
        if (robotData) {
            robot = JSON.parse(robotData);
        }
    } catch (e) {
        console.error('Error loading robot data from localStorage:', e);
    }
    
    // If not found, try robotsData
    if (!robot && window.robotsData && typeof window.robotsData.getRobotById === 'function') {
        robot = window.robotsData.getRobotById(robotId);
    }
    
    if (!robot) {
        alert('Robot not found');
        window.location.href = 'admin-robot-management.html';
        return;
    }
    
    // Update form title
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Robot';
    }
    
    // Populate form fields
    document.getElementById('robot-name').value = robot.name || '';
    document.getElementById('robot-slug').value = robot.slug || '';
    document.getElementById('manufacturer-name').value = robot.manufacturer?.name || '';
    document.getElementById('manufacturer-country').value = robot.manufacturer?.country || '';
    document.getElementById('manufacturer-website').value = robot.manufacturer?.website || '';
    document.getElementById('year-introduced').value = robot.yearIntroduced || '';
    document.getElementById('robot-status').value = robot.status || 'draft';
    document.getElementById('robot-summary').value = robot.summary || '';
    document.getElementById('robot-description').value = robot.description || '';
    
    // Populate specs
    document.getElementById('spec-height').value = robot.specifications?.physical?.height?.value || '';
    document.getElementById('spec-height-unit').value = robot.specifications?.physical?.height?.unit || 'm';
    document.getElementById('spec-weight').value = robot.specifications?.physical?.weight?.value || '';
    document.getElementById('spec-weight-unit').value = robot.specifications?.physical?.weight?.unit || 'kg';
    document.getElementById('spec-battery-runtime').value = robot.specifications?.performance?.battery?.runtime || '';
    document.getElementById('spec-speed').value = robot.specifications?.performance?.speed?.value || '';
    document.getElementById('spec-speed-unit').value = robot.specifications?.performance?.speed?.unit || 'm/s';
    
    // Populate images
    if (robot.media?.featuredImage?.url) {
        const mainImagePreview = document.getElementById('mainImagePreview');
        if (mainImagePreview) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${robot.media.featuredImage.url}" alt="${robot.media.featuredImage.alt || robot.name}" class="preview-img">
                <div class="preview-remove">&times;</div>
            `;
            
            mainImagePreview.appendChild(previewItem);
            
            // Add remove functionality
            previewItem.querySelector('.preview-remove').addEventListener('click', function() {
                mainImagePreview.innerHTML = '';
                mediaFiles.mainImage = null;
            });
        }
    }
    
    // Populate gallery images
    if (robot.media?.images && robot.media.images.length > 0) {
        const galleryPreview = document.getElementById('galleryPreview');
        if (galleryPreview) {
            robot.media.images.forEach((image, index) => {
                // Skip the first image if it's already used as the main image
                if (index === 0 && robot.media.featuredImage?.url === image.url) {
                    return;
                }
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${image.url}" alt="${image.alt || robot.name}" class="preview-img">
                    <div class="preview-remove">&times;</div>
                `;
                
                galleryPreview.appendChild(previewItem);
                
                // Add remove functionality
                previewItem.querySelector('.preview-remove').addEventListener('click', function() {
                    previewItem.remove();
                });
            });
        }
    }
    
    // Populate videos
    if (robot.media?.videos && robot.media.videos.length > 0) {
        const videoInputsContainer = document.getElementById('videoInputsContainer');
        if (videoInputsContainer) {
            // Remove the default video input
            videoInputsContainer.innerHTML = '';
            
            // Add video inputs for each video
            robot.media.videos.forEach(video => {
                const videoInput = document.createElement('div');
                videoInput.className = 'video-input';
                videoInput.innerHTML = `
                    <div class="form-group">
                        <label>Video Type</label>
                        <select class="video-type" name="videoType[]">
                            <option value="youtube"${video.type === 'youtube' ? ' selected' : ''}>YouTube Link</option>
                            <option value="mp4"${video.type === 'mp4' ? ' selected' : ''}>Upload MP4</option>
                            <option value="external"${video.type === 'external' ? ' selected' : ''}>External Link</option>
                        </select>
                    </div>
                    
                    <div class="form-group video-url-input" style="display: ${video.type !== 'mp4' ? 'block' : 'none'};">
                        <label>Video URL</label>
                        <input type="text" class="video-url" name="videoUrl[]" placeholder="https://www.youtube.com/watch?v=..." value="${video.url || ''}">
                    </div>
                    
                    <div class="form-group video-file-input" style="display: ${video.type === 'mp4' ? 'block' : 'none'};">
                        <label>Upload MP4</label>
                        <input type="file" class="video-file" name="videoFile[]" accept="video/mp4">
                    </div>
                    
                    <div class="form-group">
                        <label>Video Title (optional)</label>
                        <input type="text" class="video-title" name="videoTitle[]" placeholder="Video title" value="${video.title || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label>Video Description (optional)</label>
                        <textarea class="video-description" name="videoDescription[]" placeholder="Video description">${video.description || ''}</textarea>
                    </div>
                    
                    <div class="video-preview">
                        ${video.type === 'youtube' ? generateYouTubePreview(video.url) : ''}
                        ${video.type === 'mp4' ? generateMP4Preview(video.url) : ''}
                    </div>
                    
                    <button type="button" class="remove-video-btn">Remove</button>
                `;
                
                videoInputsContainer.appendChild(videoInput);
                setupVideoInput(videoInput);
            });
        }
    }
}

/**
 * Generate YouTube preview HTML
 */
function generateYouTubePreview(url) {
    const youtubeId = extractYouTubeId(url);
    
    if (youtubeId) {
        return `
            <iframe 
                width="100%" 
                height="180" 
                src="https://www.youtube.com/embed/${youtubeId}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen
            ></iframe>
        `;
    }
    
    return '';
}

/**
 * Generate MP4 preview HTML
 */
function generateMP4Preview(url) {
    if (url) {
        return `
            <video controls width="100%" height="180">
                <source src="${url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        `;
    }
    
    return '';
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeId(url) {
    if (!url) return null;
    
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/\s]{11})/i;
    const match = url.match(regex);
    
    return match ? match[1] : null;
}
