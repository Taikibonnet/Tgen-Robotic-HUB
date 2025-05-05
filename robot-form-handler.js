// Global variables for media management
let featuredImageFile = null;
let additionalImageFiles = [];
let videoFiles = [];
let videoUrls = [{ url: '', title: '', description: '' }];

/**
 * Function to initialize robot form handling
 */
function initializeRobotForm() {
    const form = document.getElementById('robot-form');
    
    if (form) {
        // Set up form submission
        form.addEventListener('submit', handleFormSubmit);
        
        // Set up media preview
        setupMediaPreview();
        
        // Set up video URL management
        setupVideoUrlManagement();
        
        // Set up custom specification fields
        initializeCustomSpecFields();
    }
}

/**
 * Set up media preview functionality
 */
function setupMediaPreview() {
    // Featured image preview
    const featuredImageInput = document.getElementById('featured-image');
    const featuredImagePreview = document.getElementById('featured-image-preview');
    
    if (featuredImageInput && featuredImagePreview) {
        featuredImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                featuredImageFile = file;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    featuredImagePreview.innerHTML = `
                        <div style="position: relative; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                            <img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 5px;">
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Additional images preview
    const additionalImagesInput = document.getElementById('additional-images');
    const additionalImagesPreview = document.getElementById('additional-images-preview');
    
    if (additionalImagesInput && additionalImagesPreview) {
        additionalImagesInput.addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                additionalImageFiles = [...additionalImageFiles, ...files];
                
                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const imageContainer = document.createElement('div');
                        imageContainer.style.position = 'relative';
                        imageContainer.style.display = 'inline-block';
                        imageContainer.style.marginRight = '10px';
                        imageContainer.style.marginBottom = '10px';
                        
                        imageContainer.innerHTML = `
                            <img src="${e.target.result}" alt="Preview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
                            <button type="button" class="remove-image" style="position: absolute; top: -5px; right: -5px; background: rgba(255, 107, 107, 0.9); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer;">×</button>
                        `;
                        
                        // Add event listener to remove button
                        const removeBtn = imageContainer.querySelector('.remove-image');
                        removeBtn.addEventListener('click', function() {
                            const index = additionalImageFiles.indexOf(file);
                            if (index > -1) {
                                additionalImageFiles.splice(index, 1);
                            }
                            imageContainer.remove();
                        });
                        
                        additionalImagesPreview.appendChild(imageContainer);
                    };
                    reader.readAsDataURL(file);
                });
            }
        });
    }
}

/**
 * Set up video URL management
 */
function setupVideoUrlManagement() {
    const addVideoUrlBtn = document.getElementById('add-video-url');
    const videoUrlContainer = document.getElementById('video-url-container');
    
    if (addVideoUrlBtn && videoUrlContainer) {
        // Add video URL button
        addVideoUrlBtn.addEventListener('click', function() {
            // Add a new entry to videoUrls array
            videoUrls.push({ url: '', title: '', description: '' });
            
            // Create new video URL group
            const newIndex = videoUrls.length - 1;
            const videoUrlGroup = document.createElement('div');
            videoUrlGroup.className = 'video-url-group';
            videoUrlGroup.dataset.index = newIndex;
            
            videoUrlGroup.innerHTML = `
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="url" class="form-control video-url-input" placeholder="e.g., https://www.youtube.com/watch?v=...">
                    <button type="button" class="btn remove-video-url" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" class="form-control video-title-input" placeholder="Video Title" style="margin-bottom: 10px;">
                <textarea class="form-control video-description-input" placeholder="Video Description (optional)" style="margin-bottom: 20px;"></textarea>
            `;
            
            videoUrlContainer.appendChild(videoUrlGroup);
            
            // Attach event listeners
            attachVideoUrlEventListeners(newIndex);
        });
        
        // Initialize first video URL group
        attachVideoUrlEventListeners(0);
    }
}

/**
 * Attach event listeners to a video URL group
 * @param {number} index - Index of the video URL group
 */
function attachVideoUrlEventListeners(index) {
    const videoUrlGroup = document.querySelector(`.video-url-group[data-index="${index}"]`);
    
    if (videoUrlGroup) {
        const urlInput = videoUrlGroup.querySelector('.video-url-input');
        const titleInput = videoUrlGroup.querySelector('.video-title-input');
        const descInput = videoUrlGroup.querySelector('.video-description-input');
        const removeBtn = videoUrlGroup.querySelector('.remove-video-url');
        
        // Update videoUrls array on input changes
        urlInput.addEventListener('input', function() {
            videoUrls[index].url = this.value;
            
            // Try to auto-fill title from YouTube video
            if (this.value.includes('youtube.com/watch') || this.value.includes('youtu.be/')) {
                // Implement YouTube API call to get video title (optional)
            }
        });
        
        titleInput.addEventListener('input', function() {
            videoUrls[index].title = this.value;
        });
        
        descInput.addEventListener('input', function() {
            videoUrls[index].description = this.value;
        });
        
        // Initialize with any existing values
        if (videoUrls[index]) {
            urlInput.value = videoUrls[index].url || '';
            titleInput.value = videoUrls[index].title || '';
            descInput.value = videoUrls[index].description || '';
        }
        
        // Remove video URL
        if (removeBtn) {
            removeBtn.addEventListener('click', function() {
                if (document.querySelectorAll('.video-url-group').length > 1) {
                    videoUrls.splice(index, 1);
                    videoUrlGroup.remove();
                    
                    // Re-index remaining groups
                    document.querySelectorAll('.video-url-group').forEach((group, idx) => {
                        group.dataset.index = idx;
                        attachVideoUrlEventListeners(idx);
                    });
                } else {
                    // Clear values of the last group instead of removing it
                    urlInput.value = '';
                    titleInput.value = '';
                    descInput.value = '';
                    videoUrls[0] = { url: '', title: '', description: '' };
                }
            });
        }
    }
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const robotId = form.getAttribute('data-robot-id');
    const isEdit = !!robotId;
    
    // Get form values
    const robotData = {
        name: document.getElementById('robot-name').value,
        manufacturer: {
            name: document.getElementById('robot-manufacturer').value,
            country: document.getElementById('robot-country').value || null
        },
        releaseYear: document.getElementById('robot-year').value ? parseInt(document.getElementById('robot-year').value) : null,
        category: document.getElementById('robot-category').value || null,
        summary: document.getElementById('robot-summary').value,
        description: document.getElementById('robot-description').value,
        features: parseListText(document.getElementById('robot-features').value),
        applications: parseListText(document.getElementById('robot-applications').value),
        specifications: {
            dimensions: {
                height: document.getElementById('robot-height').value ? parseFloat(document.getElementById('robot-height').value) : null,
                heightUnit: document.getElementById('robot-height-unit').value
            },
            weight: {
                value: document.getElementById('robot-weight').value ? parseFloat(document.getElementById('robot-weight').value) : null,
                unit: document.getElementById('robot-weight-unit').value
            },
            speed: {
                value: document.getElementById('robot-speed').value ? parseFloat(document.getElementById('robot-speed').value) : null,
                unit: document.getElementById('robot-speed-unit').value
            },
            batteryLife: {
                value: document.getElementById('robot-battery').value ? parseFloat(document.getElementById('robot-battery').value) : null,
                unit: document.getElementById('robot-battery-unit').value
            },
            custom: getCustomSpecifications()
        },
        media: {
            featuredImage: featuredImageFile ? {
                url: URL.createObjectURL(featuredImageFile),
                alt: document.getElementById('robot-name').value
            } : null,
            additionalImages: additionalImageFiles.map(file => ({
                url: URL.createObjectURL(file),
                alt: document.getElementById('robot-name').value
            })),
            videos: videoUrls.filter(video => video.url && video.title).map(video => ({
                url: video.url,
                title: video.title,
                description: video.description
            }))
        },
        slug: generateSlug(document.getElementById('robot-name').value),
        stats: {
            views: isEdit ? getRobotById(robotId).stats?.views || 0 : 0,
            likes: isEdit ? getRobotById(robotId).stats?.likes || 0 : 0
        },
        dateAdded: isEdit ? getRobotById(robotId).dateAdded : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };
    
    // Save the robot
    if (isEdit) {
        updateRobot(robotId, robotData);
    } else {
        addRobot(robotData);
    }
    
    // Close the modal
    closeModal();
    
    // Reload the robot grid
    if (typeof loadRobots === 'function') {
        loadRobots();
    } else if (typeof loadFeaturedRobots === 'function') {
        loadFeaturedRobots();
    }
}

/**
 * Parse list text (bullet points or numbered list) into array
 * @param {string} text - List text
 * @returns {Array} Array of list items
 */
function parseListText(text) {
    if (!text) return [];
    
    return text
        .split('\n')
        .map(line => line.replace(/^[\s•\-*\d.]+/, '').trim())
        .filter(Boolean);
}

/**
 * Get custom specifications from the form
 * @returns {Array} Array of custom specifications
 */
function getCustomSpecifications() {
    const customSpecs = [];
    const specRows = document.querySelectorAll('.custom-spec-row');
    
    specRows.forEach(row => {
        const name = row.querySelector('.custom-spec-name').value;
        const value = row.querySelector('.custom-spec-value').value;
        const unit = row.querySelector('.custom-spec-unit').value;
        
        if (name && value) {
            customSpecs.push({
                name,
                value: parseFloat(value) || value,
                unit: unit || null
            });
        }
    });
    
    return customSpecs;
}

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - Input text
 * @returns {string} URL-friendly slug
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
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

/**
 * Fill the form with robot data for editing
 * @param {Object} robot - Robot data
 */
function fillFormWithRobotData(robot) {
    const form = document.getElementById('robot-form');
    
    if (form && robot) {
        // Set form data-robot-id attribute
        form.setAttribute('data-robot-id', robot.id);
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Robot: ' + robot.name;
        
        // Fill basic info
        document.getElementById('robot-name').value = robot.name || '';
        document.getElementById('robot-manufacturer').value = robot.manufacturer?.name || '';
        document.getElementById('robot-country').value = robot.manufacturer?.country || '';
        document.getElementById('robot-year').value = robot.releaseYear || '';
        document.getElementById('robot-category').value = robot.category || '';
        document.getElementById('robot-summary').value = robot.summary || '';
        
        // Fill description
        document.getElementById('robot-description').value = robot.description || '';
        document.getElementById('robot-features').value = robot.features?.join('\n• ') || '';
        document.getElementById('robot-applications').value = robot.applications?.join('\n• ') || '';
        
        // Fill specifications
        document.getElementById('robot-height').value = robot.specifications?.dimensions?.height || '';
        document.getElementById('robot-height-unit').value = robot.specifications?.dimensions?.heightUnit || 'cm';
        document.getElementById('robot-weight').value = robot.specifications?.weight?.value || '';
        document.getElementById('robot-weight-unit').value = robot.specifications?.weight?.unit || 'kg';
        document.getElementById('robot-speed').value = robot.specifications?.speed?.value || '';
        document.getElementById('robot-speed-unit').value = robot.specifications?.speed?.unit || 'km/h';
        document.getElementById('robot-battery').value = robot.specifications?.batteryLife?.value || '';
        document.getElementById('robot-battery-unit').value = robot.specifications?.batteryLife?.unit || 'hours';
        
        // Fill custom specifications
        const customSpecsContainer = document.getElementById('custom-spec-fields');
        customSpecsContainer.innerHTML = '';
        
        if (robot.specifications?.custom?.length) {
            robot.specifications.custom.forEach(spec => {
                const customSpecRow = document.createElement('div');
                customSpecRow.className = 'custom-spec-row';
                customSpecRow.style.display = 'flex';
                customSpecRow.style.gap = '10px';
                customSpecRow.style.marginBottom = '15px';
                
                customSpecRow.innerHTML = `
                    <input type="text" class="form-control custom-spec-name" placeholder="Specification Name" style="flex: 2;" value="${spec.name || ''}">
                    <input type="text" class="form-control custom-spec-value" placeholder="Value" style="flex: 1;" value="${spec.value || ''}">
                    <input type="text" class="form-control custom-spec-unit" placeholder="Unit" style="flex: 1;" value="${spec.unit || ''}">
                    <button type="button" class="btn remove-custom-spec" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                customSpecsContainer.appendChild(customSpecRow);
                
                // Add event listener to remove button
                const removeBtn = customSpecRow.querySelector('.remove-custom-spec');
                removeBtn.addEventListener('click', function() {
                    customSpecRow.remove();
                });
            });
        }
        
        // Fill media (for now, just show existing images)
        if (robot.media?.featuredImage?.url) {
            document.getElementById('featured-image-preview').innerHTML = `
                <div style="position: relative; display: inline-block; margin-right: 10px; margin-bottom: 10px;">
                    <img src="${robot.media.featuredImage.url}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 5px;">
                    <div class="form-hint" style="margin-top: 5px;">Current featured image (upload new to replace)</div>
                </div>
            `;
        }
        
        const additionalImagesPreview = document.getElementById('additional-images-preview');
        additionalImagesPreview.innerHTML = '';
        
        if (robot.media?.additionalImages?.length) {
            robot.media.additionalImages.forEach(image => {
                const imageContainer = document.createElement('div');
                imageContainer.style.position = 'relative';
                imageContainer.style.display = 'inline-block';
                imageContainer.style.marginRight = '10px';
                imageContainer.style.marginBottom = '10px';
                
                imageContainer.innerHTML = `
                    <img src="${image.url}" alt="${image.alt || 'Additional image'}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">
                    <div class="form-hint" style="font-size: 0.7rem; text-align: center;">Existing</div>
                `;
                
                additionalImagesPreview.appendChild(imageContainer);
            });
        }
        
        // Fill video URLs
        const videoUrlContainer = document.getElementById('video-url-container');
        videoUrlContainer.innerHTML = '';
        
        if (robot.media?.videos?.length) {
            videoUrls = robot.media.videos.map(video => ({
                url: video.url || '',
                title: video.title || '',
                description: video.description || ''
            }));
            
            videoUrls.forEach((video, index) => {
                const videoUrlGroup = document.createElement('div');
                videoUrlGroup.className = 'video-url-group';
                videoUrlGroup.dataset.index = index;
                
                videoUrlGroup.innerHTML = `
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <input type="url" class="form-control video-url-input" placeholder="e.g., https://www.youtube.com/watch?v=..." value="${video.url}">
                        <button type="button" class="btn remove-video-url" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <input type="text" class="form-control video-title-input" placeholder="Video Title" style="margin-bottom: 10px;" value="${video.title}">
                    <textarea class="form-control video-description-input" placeholder="Video Description (optional)" style="margin-bottom: 20px;">${video.description}</textarea>
                `;
                
                videoUrlContainer.appendChild(videoUrlGroup);
                
                // Attach event listeners
                attachVideoUrlEventListeners(index);
            });
        } else {
            // Add empty video URL field
            videoUrls = [{ url: '', title: '', description: '' }];
            
            const videoUrlGroup = document.createElement('div');
            videoUrlGroup.className = 'video-url-group';
            videoUrlGroup.dataset.index = 0;
            
            videoUrlGroup.innerHTML = `
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input type="url" class="form-control video-url-input" placeholder="e.g., https://www.youtube.com/watch?v=...">
                    <button type="button" class="btn remove-video-url" style="background: rgba(255, 107, 107, 0.1); color: var(--accent); padding: 0 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <input type="text" class="form-control video-title-input" placeholder="Video Title" style="margin-bottom: 10px;">
                <textarea class="form-control video-description-input" placeholder="Video Description (optional)" style="margin-bottom: 20px;"></textarea>
            `;
            
            videoUrlContainer.appendChild(videoUrlGroup);
            
            // Attach event listeners
            attachVideoUrlEventListeners(0);
        }
    }
}
