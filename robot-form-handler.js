// Global variables for storing uploaded files
let featuredImageFile = null;
let additionalImageFiles = [];
let videoFiles = [];
let videoUrls = [{ url: '', title: '', description: '' }];

/**
 * Initializes all form handlers and UI elements
 */
function initializeFormHandlers() {
    const robotForm = document.getElementById('robot-form');
    
    if (robotForm) {
        robotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRobot();
        });
    }
    
    // Name to slug automation
    const nameInput = document.getElementById('robot-name');
    const slugInput = document.getElementById('robot-slug');
    
    if (nameInput && slugInput) {
        nameInput.addEventListener('blur', function() {
            if (!slugInput.value) {
                slugInput.value = generateSlug(nameInput.value);
            }
        });
    }
    
    // Initialize media uploads
    initializeMediaUploads();
    
    // Initialize video uploads
    initializeVideoUploads();
    
    // Initialize custom specification fields
    initializeCustomSpecFields();
}

/**
 * Initializes media uploads for featured and additional images
 */
function initializeMediaUploads() {
    // Setup featured image upload
    const featuredImageUpload = document.getElementById('featured-image-upload');
    const featuredImagePreview = document.getElementById('featured-image-preview');
    
    if (featuredImageUpload && featuredImagePreview) {
        featuredImageUpload.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = function(e) {
                if (e.target.files && e.target.files[0]) {
                    featuredImageFile = e.target.files[0];
                    
                    // Create preview
                    featuredImagePreview.innerHTML = '';
                    const container = document.createElement('div');
                    container.className = 'media-item';
                    
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(featuredImageFile);
                    
                    const removeBtn = document.createElement('div');
                    removeBtn.className = 'media-remove';
                    removeBtn.innerHTML = '×';
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        featuredImageFile = null;
                        featuredImagePreview.innerHTML = '';
                        URL.revokeObjectURL(img.src);
                    });
                    
                    container.appendChild(img);
                    container.appendChild(removeBtn);
                    featuredImagePreview.appendChild(container);
                }
            };
            
            input.click();
        });
        
        // Setup drag and drop for featured image
        setupDragAndDrop(featuredImageUpload, featuredImagePreview, 'image', false);
    }
    
    // Setup additional images upload
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    if (additionalImagesUpload && additionalImagesPreview) {
        additionalImagesUpload.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            
            input.onchange = function(e) {
                if (e.target.files && e.target.files.length > 0) {
                    // Add new files to the array
                    for (const file of e.target.files) {
                        additionalImageFiles.push(file);
                        
                        // Create preview
                        const imgId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        const container = document.createElement('div');
                        container.className = 'media-item';
                        container.id = imgId;
                        
                        const img = document.createElement('img');
                        const objectURL = URL.createObjectURL(file);
                        img.src = objectURL;
                        
                        const removeBtn = document.createElement('div');
                        removeBtn.className = 'media-remove';
                        removeBtn.setAttribute('data-id', imgId);
                        removeBtn.innerHTML = '×';
                        
                        container.appendChild(img);
                        container.appendChild(removeBtn);
                        additionalImagesPreview.appendChild(container);
                        
                        // Add event listener to remove button
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const index = additionalImageFiles.findIndex(f => f === file);
                            if (index !== -1) {
                                additionalImageFiles.splice(index, 1);
                            }
                            document.getElementById(imgId).remove();
                            URL.revokeObjectURL(objectURL);
                        });
                    }
                }
            };
            
            input.click();
        });
        
        // Setup drag and drop for additional images
        setupDragAndDrop(additionalImagesUpload, additionalImagesPreview, 'image', true);
    }
}

/**
 * Initialize video uploads and URL inputs
 */
function initializeVideoUploads() {
    // Setup video upload
    const videoUpload = document.getElementById('video-upload');
    const videoPreview = document.getElementById('video-preview');
    
    if (videoUpload && videoPreview) {
        videoUpload.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'video/*';
            input.multiple = true;
            
            input.onchange = function(e) {
                if (e.target.files && e.target.files.length > 0) {
                    // Add new files to the array
                    for (const file of e.target.files) {
                        videoFiles.push(file);
                        
                        // Create video preview
                        const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        const videoElement = document.createElement('video');
                        videoElement.controls = true;
                        videoElement.width = 280;
                        videoElement.style.borderRadius = '5px';
                        videoElement.style.marginBottom = '10px';
                        
                        // Create container
                        const container = document.createElement('div');
                        container.className = 'media-item video-item';
                        container.id = videoId;
                        container.style.width = '280px';
                        container.style.marginRight = '10px';
                        
                        // Create remove button
                        const removeBtn = document.createElement('div');
                        removeBtn.className = 'media-remove';
                        removeBtn.setAttribute('data-id', videoId);
                        removeBtn.innerHTML = '×';
                        
                        // Add elements to container
                        container.appendChild(videoElement);
                        container.appendChild(removeBtn);
                        
                        // Add to preview
                        videoPreview.appendChild(container);
                        
                        // Set source for video
                        const objectURL = URL.createObjectURL(file);
                        videoElement.src = objectURL;
                        
                        // Add event listener to remove button
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const index = videoFiles.findIndex(f => f === file);
                            if (index !== -1) {
                                videoFiles.splice(index, 1);
                            }
                            document.getElementById(videoId).remove();
                            URL.revokeObjectURL(objectURL);
                        });
                    }
                }
            };
            
            input.click();
        });
        
        // Allow drag and drop for videos
        setupDragAndDrop(videoUpload, videoPreview, 'video');
    }
    
    // Setup video URL inputs
    initializeVideoUrlInputs();
}

/**
 * Initialize video URL inputs
 */
function initializeVideoUrlInputs() {
    const addVideoUrlBtn = document.getElementById('add-video-url');
    const videoUrlContainer = document.getElementById('video-url-container');
    
    if (addVideoUrlBtn && videoUrlContainer) {
        addVideoUrlBtn.addEventListener('click', function() {
            // Add new video URL input group
            const index = videoUrls.length;
            videoUrls.push({ url: '', title: '', description: '' });
            
            const urlGroupHTML = `
                <div class="video-url-group" data-index="${index}">
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="url" class="form-control video-url-input" placeholder="e.g., https://www.youtube.com/watch?v=...">
                        <button type="button" class="btn remove-video-url" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <input type="text" class="form-control video-title-input" placeholder="Video Title" style="margin-bottom: 10px;">
                    <textarea class="form-control video-description-input" placeholder="Video Description (optional)" style="margin-bottom: 20px;"></textarea>
                </div>
            `;
            
            videoUrlContainer.insertAdjacentHTML('beforeend', urlGroupHTML);
            
            // Add event listeners for the new elements
            attachVideoUrlEventListeners(index);
        });
        
        // Initialize event listeners for the first URL input
        attachVideoUrlEventListeners(0);
    }
}

/**
 * Initialize custom specification fields
 */
function initializeCustomSpecFields() {
    const addCustomSpecBtn = document.getElementById('add-custom-spec');
    const customSpecFields = document.getElementById('custom-spec-fields');
    
    if (addCustomSpecBtn && customSpecFields) {
        addCustomSpecBtn.addEventListener('click', function() {
            const customSpecRow = document.createElement('div');
            customSpecRow.className = 'custom-spec-row';
            customSpecRow.style.display = 'flex';
            customSpecRow.style.gap = '10px';
            customSpecRow.style.marginBottom = '15px';
            
            customSpecRow.innerHTML = `
                <input type="text" class="form-control custom-spec-name" placeholder="Specification Name" style="flex: 2;">
                <input type="text" class="form-control custom-spec-value" placeholder="Value" style="flex: 1;">
                <input type="text" class="form-control custom-spec-unit" placeholder="Unit" style="flex: 1;">
                <button type="button" class="btn remove-custom-spec" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            customSpecFields.appendChild(customSpecRow);
            
            // Add event listener to remove button
            const removeBtn = customSpecRow.querySelector('.remove-custom-spec');
            removeBtn.addEventListener('click', function() {
                customSpecRow.remove();
            });
        });
    }
}

/**
 * Add event listeners to video URL inputs
 */
function attachVideoUrlEventListeners(index) {
    const group = document.querySelector(`.video-url-group[data-index="${index}"]`);
    if (!group) return;
    
    const urlInput = group.querySelector('.video-url-input');
    const titleInput = group.querySelector('.video-title-input');
    const descInput = group.querySelector('.video-description-input');
    const removeBtn = group.querySelector('.remove-video-url');
    
    // URL input change
    if (urlInput) {
        urlInput.addEventListener('input', function() {
            videoUrls[index].url = this.value;
        });
    }
    
    // Title input change
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            videoUrls[index].title = this.value;
        });
    }
    
    // Description input change
    if (descInput) {
        descInput.addEventListener('input', function() {
            videoUrls[index].description = this.value;
        });
    }
    
    // Remove button
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (videoUrls.length <= 1) {
                // Just clear the inputs for the first group
                if (urlInput) urlInput.value = '';
                if (titleInput) titleInput.value = '';
                if (descInput) descInput.value = '';
                videoUrls[index] = { url: '', title: '', description: '' };
            } else {
                // Remove the group
                group.remove();
                videoUrls.splice(index, 1);
                
                // Update data-index attributes for remaining groups
                document.querySelectorAll('.video-url-group').forEach((g, i) => {
                    g.setAttribute('data-index', i);
                    
                    // Update event listeners
                    const inputs = g.querySelectorAll('input, textarea');
                    inputs.forEach(input => {
                        // Remove existing event listeners
                        const newInput = input.cloneNode(true);
                        input.parentNode.replaceChild(newInput, input);
                    });
                    
                    // Reattach event listeners
                    attachVideoUrlEventListeners(i);
                });
            }
        });
    }
}

/**
 * Collects video data from forms
 */
function collectVideoData() {
    const videos = [];
    
    // Add video files
    videoFiles.forEach(file => {
        videos.push({
            type: 'file',
            file: file,
            url: URL.createObjectURL(file),
            title: file.name.split('.')[0],
            description: ''
        });
    });
    
    // Add video URLs
    videoUrls.forEach(videoUrl => {
        if (videoUrl.url) {
            videos.push({
                type: 'url',
                url: videoUrl.url,
                title: videoUrl.title || 'Video',
                description: videoUrl.description || '',
                thumbnail: getThumbnailForVideoUrl(videoUrl.url)
            });
        }
    });
    
    return videos;
}

/**
 * Function to get thumbnail URL for video URLs (YouTube, Vimeo, etc.)
 */
function getThumbnailForVideoUrl(url) {
    if (!url) return '';
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    
    // Vimeo
    const vimeoRegex = /vimeo.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch && vimeoMatch[1]) {
        // Note: In a real application, you'd need to use the Vimeo API to get the thumbnail
        // For this demo, we'll just return a placeholder
        return 'images/video-placeholder.jpg';
    }
    
    // Default placeholder
    return 'images/video-placeholder.jpg';
}

/**
 * Sets up drag and drop functionality for file uploads
 */
function setupDragAndDrop(dropZone, previewElement, fileType, multiple = false) {
    if (!dropZone || !previewElement) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.backgroundColor = 'rgba(32, 227, 178, 0.05)';
    }
    
    function unhighlight() {
        dropZone.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        dropZone.style.backgroundColor = 'transparent';
    }
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (fileType === 'image') {
            if (multiple) {
                // For additional images (multiple)
                handleAdditionalImages(files);
            } else {
                // For featured image (single)
                handleFeaturedImage(files[0]);
            }
        } else if (fileType === 'video') {
            // For videos
            handleVideos(files);
        }
    }
    
    function handleFeaturedImage(file) {
        if (!file || !file.type.startsWith('image/')) return;
        
        featuredImageFile = file;
        
        // Create preview
        previewElement.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'media-item';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        
        const removeBtn = document.createElement('div');
        removeBtn.className = 'media-remove';
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            featuredImageFile = null;
            previewElement.innerHTML = '';
            URL.revokeObjectURL(img.src);
        });
        
        container.appendChild(img);
        container.appendChild(removeBtn);
        previewElement.appendChild(container);
    }
    
    function handleAdditionalImages(files) {
        for (const file of files) {
            if (!file || !file.type.startsWith('image/')) continue;
            
            additionalImageFiles.push(file);
            
            // Create preview
            const imgId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const container = document.createElement('div');
            container.className = 'media-item';
            container.id = imgId;
            
            const img = document.createElement('img');
            const objectURL = URL.createObjectURL(file);
            img.src = objectURL;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'media-remove';
            removeBtn.setAttribute('data-id', imgId);
            removeBtn.innerHTML = '×';
            
            container.appendChild(img);
            container.appendChild(removeBtn);
            previewElement.appendChild(container);
            
            // Add event listener to remove button
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = additionalImageFiles.findIndex(f => f === file);
                if (index !== -1) {
                    additionalImageFiles.splice(index, 1);
                }
                document.getElementById(imgId).remove();
                URL.revokeObjectURL(objectURL);
            });
        }
    }
    
    function handleVideos(files) {
        for (const file of files) {
            if (!file || !file.type.startsWith('video/')) continue;
            
            videoFiles.push(file);
            
            // Create video preview
            const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const videoElement = document.createElement('video');
            videoElement.controls = true;
            videoElement.width = 280;
            videoElement.style.borderRadius = '5px';
            videoElement.style.marginBottom = '10px';
            
            // Create container
            const container = document.createElement('div');
            container.className = 'media-item video-item';
            container.id = videoId;
            container.style.width = '280px';
            container.style.marginRight = '10px';
            
            // Create remove button
            const removeBtn = document.createElement('div');
            removeBtn.className = 'media-remove';
            removeBtn.setAttribute('data-id', videoId);
            removeBtn.innerHTML = '×';
            
            // Add elements to container
            container.appendChild(videoElement);
            container.appendChild(removeBtn);
            
            // Add to preview
            previewElement.appendChild(container);
            
            // Set source for video
            const objectURL = URL.createObjectURL(file);
            videoElement.src = objectURL;
            
            // Add event listener to remove button
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = videoFiles.findIndex(f => f === file);
                if (index !== -1) {
                    videoFiles.splice(index, 1);
                }
                document.getElementById(videoId).remove();
                URL.revokeObjectURL(objectURL);
            });
        }
    }
}

/**
 * Collects all form data into a structured object
 */
function collectFormData() {
    const robotData = {
        basic: {
            name: document.getElementById('robot-name')?.value || '',
            slug: document.getElementById('robot-slug')?.value || generateSlug(document.getElementById('robot-name')?.value || ''),
            manufacturerName: document.getElementById('manufacturer-name')?.value || '',
            manufacturerCountry: document.getElementById('manufacturer-country')?.value || '',
            manufacturerWebsite: document.getElementById('manufacturer-website')?.value || '',
            yearIntroduced: document.getElementById('year-introduced')?.value || '',
            status: document.getElementById('robot-status')?.value || 'draft',
            summary: document.getElementById('robot-summary')?.value || '',
            description: document.getElementById('robot-description')?.value || ''
        },
        specifications: {
            physical: {
                height: {
                    value: document.getElementById('spec-height')?.value || null,
                    unit: document.getElementById('spec-height-unit')?.value || 'm'
                },
                weight: {
                    value: document.getElementById('spec-weight')?.value || null,
                    unit: document.getElementById('spec-weight-unit')?.value || 'kg'
                }
            },
            performance: {
                batteryRuntime: document.getElementById('spec-battery-runtime')?.value || null,
                speed: {
                    value: document.getElementById('spec-speed')?.value || null,
                    unit: document.getElementById('spec-speed-unit')?.value || 'm/s'
                }
            },
            customFields: []
        },
        media: {
            featuredImage: featuredImageFile,
            additionalImages: additionalImageFiles,
            videos: collectVideoData() // This collects the video data
        }
    };
    
    // Collect custom specification fields
    const customSpecRows = document.querySelectorAll('.custom-spec-row');
    if (customSpecRows) {
        customSpecRows.forEach(row => {
            const nameInput = row.querySelector('.custom-spec-name');
            const valueInput = row.querySelector('.custom-spec-value');
            const unitInput = row.querySelector('.custom-spec-unit');
            
            if (nameInput && valueInput && nameInput.value && valueInput.value) {
                robotData.specifications.customFields.push({
                    name: nameInput.value,
                    value: valueInput.value,
                    unit: unitInput ? unitInput.value || null : null
                });
            }
        });
    }
    
    return robotData;
}

/**
 * Creates a robot data object from form data
 */
function createRobotDataObject(formData) {
    // Get current date
    const now = new Date();
    const dateStr = now.toISOString();
    
    // Generate a new ID if this is a new robot
    const robotForm = document.getElementById('robot-form');
    const robotId = robotForm?.getAttribute('data-robot-id') || 
                   Math.floor(Math.random() * 10000) + 100; // Simple ID generation
    
    // Process featured image
    let featuredImageData = null;
    if (formData.media.featuredImage) {
        featuredImageData = {
            url: URL.createObjectURL(formData.media.featuredImage),
            alt: formData.basic.name
        };
    } else {
        featuredImageData = {
            url: 'images/robot-placeholder.jpg',
            alt: formData.basic.name
        };
    }
    
    // Process additional images
    const additionalImagesData = [];
    formData.media.additionalImages.forEach((imageFile, index) => {
        additionalImagesData.push({
            url: URL.createObjectURL(imageFile),
            alt: `${formData.basic.name} - Image ${index + 1}`,
            caption: `${formData.basic.name} - Image ${index + 1}`
        });
    });
    
    // Process videos
    const videosData = [];
    formData.media.videos.forEach(video => {
        if (video.type === 'file') {
            videosData.push({
                type: 'file',
                url: video.url,
                title: video.title || 'Video',
                description: video.description || '',
                thumbnail: 'images/video-placeholder.jpg'
            });
        } else if (video.type === 'url') {
            videosData.push({
                type: 'url',
                url: video.url,
                title: video.title || 'Video',
                description: video.description || '',
                thumbnail: video.thumbnail || 'images/video-placeholder.jpg'
            });
        }
    });
    
    // Construct the complete robot data object
    const robotData = {
        id: parseInt(robotId),
        name: formData.basic.name,
        slug: formData.basic.slug,
        manufacturer: {
            name: formData.basic.manufacturerName,
            country: formData.basic.manufacturerCountry,
            website: formData.basic.manufacturerWebsite
        },
        yearIntroduced: parseInt(formData.basic.yearIntroduced) || null,
        categories: ['Robotic'], // Default category
        summary: formData.basic.summary,
        description: formData.basic.description,
        status: formData.basic.status,
        specifications: {
            physical: formData.specifications.physical,
            performance: formData.specifications.performance,
            customFields: formData.specifications.customFields
        },
        media: {
            featuredImage: featuredImageData,
            images: additionalImagesData,
            videos: videosData
        },
        createdAt: dateStr,
        updatedAt: dateStr
    };
    
    return robotData;
}

/**
 * Save robot data to storage
 */
function saveRobot() {
    // Collect form data
    const formData = collectFormData();
    
    // Validate required fields
    if (!formData.basic.name || !formData.basic.manufacturerName || !formData.basic.summary) {
        alert('Please fill in all required fields (Name, Manufacturer, and Summary)');
        return;
    }
    
    // Get the robot ID if editing an existing robot
    const robotForm = document.getElementById('robot-form');
    const robotId = robotForm?.getAttribute('data-robot-id');
    
    // Create robot data object
    const robotData = createRobotDataObject(formData);
    
    let success = false;
    
    // Save to storage
    if (robotId) {
        // Updating existing robot
        success = window.robotStorage.updateRobotAndSave(robotId, robotData);
    } else {
        // Adding new robot
        success = window.robotStorage.addRobotAndSave(robotData);
    }
    
    if (success) {
        alert(robotId ? 'Robot updated successfully!' : 'Robot added successfully!');
        // Close the modal
        closeModal();
        // Reload robots to update the UI
        if (typeof loadRobots === 'function') {
            loadRobots();
        }
    } else {
        alert('Error ' + (robotId ? 'updating' : 'adding') + ' robot. Please try again.');
    }
}

/**
 * Generates a URL-friendly slug from a string
 */
function generateSlug(text) {
    if (!text) return '';
    
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[^\w-]+/g, '')   // Remove all non-word chars
        .replace(/--+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '');        // Trim - from end of text
}

/**
 * Function to close the modal and reset form
 */
function closeModal() {
    const modal = document.getElementById('robot-modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Allow scrolling again
    
    // Reset the form
    const robotForm = document.getElementById('robot-form');
    if (robotForm) {
        robotForm.reset();
        robotForm.removeAttribute('data-robot-id');
    }
    
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Robot';
    }
    
    // Clear media previews
    const featuredImagePreview = document.getElementById('featured-image-preview');
    if (featuredImagePreview) {
        featuredImagePreview.innerHTML = '';
    }
    
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    if (additionalImagesPreview) {
        additionalImagesPreview.innerHTML = '';
    }
    
    const videoPreview = document.getElementById('video-preview');
    if (videoPreview) {
        videoPreview.innerHTML = '';
    }
    
    // Reset video URL inputs
    const videoUrlContainer = document.getElementById('video-url-container');
    if (videoUrlContainer) {
        videoUrlContainer.innerHTML = `
            <div class="video-url-group" data-index="0">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="url" class="form-control video-url-input" placeholder="e.g., https://www.youtube.com/watch?v=...">
                    <button type="button" class="btn remove-video-url" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" class="form-control video-title-input" placeholder="Video Title" style="margin-bottom: 10px;">
                <textarea class="form-control video-description-input" placeholder="Video Description (optional)" style="margin-bottom: 20px;"></textarea>
            </div>
        `;
        
        // Reattach event listeners
        attachVideoUrlEventListeners(0);
    }
    
    // Reset file variables
    featuredImageFile = null;
    additionalImageFiles = [];
    videoFiles = [];
    videoUrls = [{ url: '', title: '', description: '' }];
    
    // Reset custom spec fields
    const customSpecFields = document.getElementById('custom-spec-fields');
    if (customSpecFields) {
        customSpecFields.innerHTML = '';
    }
    
    // Reset to the first tab
    const tabs = document.querySelectorAll('.modal-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabs.length > 0 && tabContents.length > 0) {
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        const firstTab = document.querySelector('.modal-tab[data-tab="basic"]');
        const firstContent = document.getElementById('tab-basic');
        
        if (firstTab) firstTab.classList.add('active');
        if (firstContent) firstContent.classList.add('active');
    }
}
