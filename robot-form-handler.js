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
    
    robotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveRobot();
    });
    
    // Name to slug automation
    const nameInput = document.getElementById('robot-name');
    const slugInput = document.getElementById('robot-slug');
    
    nameInput.addEventListener('blur', function() {
        if (!slugInput.value) {
            slugInput.value = generateSlug(nameInput.value);
        }
    });
    
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
    
    // Setup additional images upload
    const additionalImagesUpload = document.getElementById('additional-images-upload');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
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
    
    // Setup drag and drop for media uploads
    setupDragAndDrop(featuredImageUpload, featuredImagePreview, 'image', false);
    setupDragAndDrop(additionalImagesUpload, additionalImagesPreview, 'image', true);
}

/**
 * Initialize video uploads and URL inputs
 */
function initializeVideoUploads() {
    // Setup video upload
    const videoUpload = document.getElementById('video-upload');
    const videoPreview = document.getElementById('video-preview');
    
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
    
    // Setup video URL inputs
    initializeVideoUrlInputs();
}

/**
 * Initialize video URL inputs
 */
function initializeVideoUrlInputs() {
    const addVideoUrlBtn = document.getElementById('add-video-url');
    const videoUrlContainer = document.getElementById('video-url-container');
    
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
    urlInput.addEventListener('input', function() {
        videoUrls[index].url = this.value;
    });
    
    // Title input change
    titleInput.addEventListener('input', function() {
        videoUrls[index].title = this.value;
    });
    
    // Description input change
    descInput.addEventListener('input', function() {
        videoUrls[index].description = this.value;
    });
    
    // Remove button
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            if (videoUrls.length <= 1) {
                // Just clear the inputs for the first group
                urlInput.value = '';
                titleInput.value = '';
                descInput.value = '';
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
            name: document.getElementById('robot-name').value,
            slug: document.getElementById('robot-slug').value,
            manufacturerName: document.getElementById('manufacturer-name').value,
            manufacturerCountry: document.getElementById('manufacturer-country').value,
            manufacturerWebsite: document.getElementById('manufacturer-website').value,
            yearIntroduced: document.getElementById('year-introduced').value,
            status: document.getElementById('robot-status').value,
            summary: document.getElementById('robot-summary').value,
            description: document.getElementById('robot-description').value
        },
        specifications: {
            physical: {
                height: {
                    value: document.getElementById('spec-height').value || null,
                    unit: document.getElementById('spec-height-unit').value
                },
                weight: {
                    value: document.getElementById('spec-weight').value || null,
                    unit: document.getElementById('spec-weight-unit').value
                },
                payload: {
                    value: document.getElementById('spec-payload').value || null,
                    unit: document.getElementById('spec-payload-unit').value
                },
                maxDeadlift: {
                    value: document.getElementById('spec-deadlift').value || null,
                    unit: document.getElementById('spec-deadlift-unit').value
                }
            },
            performance: {
                batteryRuntime: document.getElementById('spec-battery-runtime').value || null,
                maxSpeed: {
                    value: document.getElementById('spec-speed').value || null,
                    unit: document.getElementById('spec-speed-unit').value
                }
            },
            hardware: {
                hands: document.getElementById('spec-hands').value,
                actuators: document.getElementById('spec-actuators').value,
                sensors: document.getElementById('spec-sensors').value,
                powerSource: document.getElementById('spec-power-source').value,
                processor: document.getElementById('spec-processor').value,
                connectivity: document.getElementById('spec-connectivity').value
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
    customSpecRows.forEach(row => {
        const nameInput = row.querySelector('.custom-spec-name');
        const valueInput = row.querySelector('.custom-spec-value');
        const unitInput = row.querySelector('.custom-spec-unit');
        
        if (nameInput.value && valueInput.value) {
            robotData.specifications.customFields.push({
                name: nameInput.value,
                value: valueInput.value,
                unit: unitInput.value || null
            });
        }
    });
    
    return robotData;
}

/**
 * Generates a URL-friendly slug from a string
 */
function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')       // Replace spaces with -
        .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
        .replace(/\-\-+/g, '-')     // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '');        // Trim - from end of text
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
 * Function to close the modal and reset form
 */
function closeModal() {
    const modal = document.getElementById('robot-modal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Allow scrolling again
    
    // Reset the form
    document.getElementById('robot-form').reset();
    document.getElementById('robot-form').removeAttribute('data-robot-id');
    document.getElementById('modal-title').textContent = 'Add New Robot';
    
    // Clear media previews
    document.getElementById('featured-image-preview').innerHTML = '';
    document.getElementById('additional-images-preview').innerHTML = '';
    document.getElementById('video-preview').innerHTML = '';
    
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
    
    // Clear custom spec fields
    document.getElementById('custom-spec-fields').innerHTML = '';
    
    // Reset to the first tab
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector('.modal-tab[data-tab="basic"]').classList.add('active');
    document.getElementById('tab-basic').classList.add('active');
}
