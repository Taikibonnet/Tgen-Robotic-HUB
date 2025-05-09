/**
 * Improved Admin Form Integration
 * This file improves the robot form functionality for better GitHub integration
 */

// Global variables to store form data
let currentRobotId = null;
let isEditMode = false;

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Form: Initializing');
    
    // Initialize storage
    if (window.githubStorage && typeof window.githubStorage.init === 'function') {
        window.githubStorage.init().then(() => {
            initializeForm();
        });
    } else if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init().then(() => {
            initializeForm();
        });
    } else {
        console.warn('Admin Form: No storage adapter found, initializing form directly');
        initializeForm();
    }
    
    // Check if GitHub token is set
    checkGitHubToken();
});

/**
 * Check if GitHub token is set
 */
function checkGitHubToken() {
    const token = localStorage.getItem('github_token');
    
    if (!token) {
        const tokenInput = prompt('Please enter your GitHub token to enable adding/editing robots:');
        
        if (tokenInput && tokenInput.trim() !== '') {
            localStorage.setItem('github_token', tokenInput);
            
            if (window.githubStorage && typeof window.githubStorage.setToken === 'function') {
                window.githubStorage.setToken(tokenInput);
            }
            
            alert('GitHub token set successfully!');
        } else {
            alert('No GitHub token provided. You will not be able to save changes.');
        }
    } else {
        // Set the token in the storage module
        if (window.githubStorage && typeof window.githubStorage.setToken === 'function') {
            window.githubStorage.setToken(token);
        }
    }
}

/**
 * Initialize the form and check for edit mode
 */
function initializeForm() {
    // Check if we're editing a robot
    const urlParams = new URLSearchParams(window.location.search);
    const robotId = urlParams.get('id');
    
    if (robotId) {
        loadRobotForEditing(robotId);
    }
    
    // Set up form submission handler
    const form = document.getElementById('robot-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRobot();
        });
    }
    
    // Add slug generator
    initializeSlugGenerator();
    
    // Initialize category management
    initializeCategoryManagement();
}

/**
 * Initialize slug generator from name
 */
function initializeSlugGenerator() {
    const nameInput = document.getElementById('robot-name');
    const slugInput = document.getElementById('robot-slug');
    
    if (nameInput && slugInput) {
        nameInput.addEventListener('blur', function() {
            if (!slugInput.value || slugInput.value.trim() === '') {
                slugInput.value = generateSlug(nameInput.value);
            }
        });
    }
}

/**
 * Generate a URL-friendly slug
 */
function generateSlug(text) {
    if (!text) return '';
    
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\\s+/g, '-')       // Replace spaces with -
        .replace(/[^\\w-]+/g, '')    // Remove all non-word chars
        .replace(/--+/g, '-')       // Replace multiple - with single -
        .replace(/^-+/, '')         // Trim - from start of text
        .replace(/-+$/, '');        // Trim - from end of text
}

/**
 * Initialize category management
 */
function initializeCategoryManagement() {
    const categoriesList = document.getElementById('categories-list');
    
    if (!categoriesList) return;
    
    // Populate available categories
    updateCategoriesList();
    
    // Add event listener for new category
    const addCategoryBtn = document.getElementById('add-category-btn');
    const newCategoryInput = document.getElementById('new-category');
    
    if (addCategoryBtn && newCategoryInput) {
        addCategoryBtn.addEventListener('click', function() {
            const category = newCategoryInput.value.trim();
            
            if (category) {
                // Check if category already exists
                if (!window.robotsData.categories.includes(category)) {
                    window.robotsData.categories.push(category);
                }
                
                // Clear input
                newCategoryInput.value = '';
                
                // Update categories list
                updateCategoriesList();
            }
        });
    }
}

/**
 * Update the categories list
 */
function updateCategoriesList() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    // Clear the list
    categoriesList.innerHTML = '';
    
    // Initialize categories if not exist
    if (!window.robotsData.categories) {
        window.robotsData.categories = [];
    }
    
    // Add each category
    window.robotsData.categories.forEach(category => {
        const item = document.createElement('div');
        item.className = 'category-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'category-' + generateSlug(category);
        checkbox.className = 'category-checkbox';
        checkbox.value = category;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = category;
        
        item.appendChild(checkbox);
        item.appendChild(label);
        categoriesList.appendChild(item);
    });
}

/**
 * Load a robot for editing
 */
function loadRobotForEditing(robotId) {
    // Get the robot data
    const robot = window.robotsData.getRobotById(robotId);
    
    if (!robot) {
        alert('Robot not found.');
        return;
    }
    
    // Set edit mode
    isEditMode = true;
    currentRobotId = robotId;
    
    // Update form title
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
        formTitle.textContent = 'Edit Robot: ' + robot.name;
    }
    
    // Populate form fields
    populateForm(robot);
}

/**
 * Populate the form with robot data
 */
function populateForm(robot) {
    // Basic info
    setValue('robot-name', robot.name);
    setValue('robot-slug', robot.slug);
    setValue('manufacturer-name', robot.manufacturer?.name || '');
    setValue('manufacturer-country', robot.manufacturer?.country || '');
    setValue('manufacturer-website', robot.manufacturer?.website || '');
    setValue('year-introduced', robot.yearIntroduced || '');
    setValue('robot-status', robot.status || 'published');
    setValue('robot-summary', robot.summary || '');
    setValue('robot-description', robot.description || '');
    
    // Specifications
    if (robot.specifications) {
        if (robot.specifications.physical) {
            if (robot.specifications.physical.height) {
                setValue('spec-height', robot.specifications.physical.height.value || '');
                setValue('spec-height-unit', robot.specifications.physical.height.unit || 'm');
            }
            
            if (robot.specifications.physical.weight) {
                setValue('spec-weight', robot.specifications.physical.weight.value || '');
                setValue('spec-weight-unit', robot.specifications.physical.weight.unit || 'kg');
            }
        }
        
        if (robot.specifications.performance) {
            setValue('spec-battery-runtime', robot.specifications.performance.batteryRuntime || '');
            
            if (robot.specifications.performance.speed) {
                setValue('spec-speed', robot.specifications.performance.speed.value || '');
                setValue('spec-speed-unit', robot.specifications.performance.speed.unit || 'm/s');
            }
        }
    }
    
    // Categories
    if (robot.categories && Array.isArray(robot.categories)) {
        setTimeout(() => {
            robot.categories.forEach(category => {
                const checkbox = document.getElementById('category-' + generateSlug(category));
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }, 100); // Small delay to ensure categories are loaded
    }
    
    // Media
    if (robot.media) {
        // Featured image
        if (robot.media.featuredImage) {
            const url = typeof robot.media.featuredImage === 'string' ? 
                      robot.media.featuredImage : 
                      robot.media.featuredImage.url;
            
            if (url) {
                const featuredImagePreview = document.getElementById('featured-image-preview');
                
                if (featuredImagePreview) {
                    featuredImagePreview.innerHTML = '';
                    const container = document.createElement('div');
                    container.className = 'media-item';
                    
                    const img = document.createElement('img');
                    img.src = url;
                    
                    const removeBtn = document.createElement('div');
                    removeBtn.className = 'media-remove';
                    removeBtn.innerHTML = '×';
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        window.featuredImageFile = null;
                        featuredImagePreview.innerHTML = '';
                    });
                    
                    container.appendChild(img);
                    container.appendChild(removeBtn);
                    featuredImagePreview.appendChild(container);
                }
            }
        }
        
        // Additional images
        if (robot.media.images && Array.isArray(robot.media.images)) {
            const additionalImagesPreview = document.getElementById('additional-images-preview');
            
            if (additionalImagesPreview) {
                additionalImagesPreview.innerHTML = '';
                
                robot.media.images.forEach((image, index) => {
                    const url = typeof image === 'string' ? image : image.url;
                    
                    if (url) {
                        const container = document.createElement('div');
                        container.className = 'media-item';
                        const imgId = 'img-' + Date.now() + '-' + index;
                        container.id = imgId;
                        
                        const img = document.createElement('img');
                        img.src = url;
                        
                        const removeBtn = document.createElement('div');
                        removeBtn.className = 'media-remove';
                        removeBtn.innerHTML = '×';
                        removeBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            
                            // Remove image from robot.media.images
                            if (robot.media.images) {
                                const filteredImages = robot.media.images.filter((_, i) => i !== index);
                                robot.media.images = filteredImages;
                            }
                            
                            container.remove();
                        });
                        
                        container.appendChild(img);
                        container.appendChild(removeBtn);
                        additionalImagesPreview.appendChild(container);
                    }
                });
            }
        }
        
        // Videos
        if (robot.media.videos && Array.isArray(robot.media.videos) && window.videoUrls) {
            // Filter out URL-based videos
            const urlVideos = robot.media.videos.filter(video => 
                video.type === 'url' || video.type === 'youtube' || (video.url && !video.data)
            );
            
            if (urlVideos.length > 0) {
                window.videoUrls = urlVideos.map(video => ({
                    url: video.url || '',
                    title: video.title || '',
                    description: video.description || ''
                }));
                
                // Update video URL inputs
                const videoUrlContainer = document.getElementById('video-url-container');
                if (videoUrlContainer) {
                    videoUrlContainer.innerHTML = '';
                    
                    window.videoUrls.forEach((video, index) => {
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
                        
                        // Add event listeners
                        const urlInput = videoUrlGroup.querySelector('.video-url-input');
                        const titleInput = videoUrlGroup.querySelector('.video-title-input');
                        const descInput = videoUrlGroup.querySelector('.video-description-input');
                        const removeBtn = videoUrlGroup.querySelector('.remove-video-url');
                        
                        if (urlInput) {
                            urlInput.addEventListener('input', function() {
                                window.videoUrls[index].url = this.value;
                            });
                        }
                        
                        if (titleInput) {
                            titleInput.addEventListener('input', function() {
                                window.videoUrls[index].title = this.value;
                            });
                        }
                        
                        if (descInput) {
                            descInput.addEventListener('input', function() {
                                window.videoUrls[index].description = this.value;
                            });
                        }
                        
                        if (removeBtn) {
                            removeBtn.addEventListener('click', function() {
                                window.videoUrls.splice(index, 1);
                                videoUrlGroup.remove();
                                
                                // Update indexes
                                const groups = videoUrlContainer.querySelectorAll('.video-url-group');
                                groups.forEach((group, i) => {
                                    group.dataset.index = i;
                                });
                            });
                        }
                    });
                }
            }
        }
    }
}

/**
 * Set the value of a form element
 */
function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

/**
 * Save the robot data
 */
async function saveRobot() {
    try {
        // Check if GitHub token is set
        const token = localStorage.getItem('github_token');
        if (!token) {
            alert('GitHub token is not set. Please set it to enable saving changes.');
            const newToken = prompt('Please enter your GitHub token:');
            if (newToken && newToken.trim() !== '') {
                localStorage.setItem('github_token', newToken);
                if (window.githubStorage && typeof window.githubStorage.setToken === 'function') {
                    window.githubStorage.setToken(newToken);
                }
            } else {
                return;
            }
        }
        
        // Collect form data
        const robotData = collectFormData();
        
        // Validate required fields
        if (!robotData.name || !robotData.summary) {
            alert('Please fill in all required fields (Name and Summary)');
            return;
        }
        
        // Get media data from upload handler
        const mediaData = window.uploadHandler?.getFormData();
        
        // Create robot object
        const robot = {
            id: isEditMode ? currentRobotId : Date.now(),
            name: robotData.name,
            slug: robotData.slug || generateSlug(robotData.name),
            manufacturer: {
                name: robotData.manufacturerName || 'Unknown',
                country: robotData.manufacturerCountry || '',
                website: robotData.manufacturerWebsite || ''
            },
            yearIntroduced: parseInt(robotData.yearIntroduced) || new Date().getFullYear(),
            categories: robotData.categories || ['Robot'],
            summary: robotData.summary,
            description: robotData.description,
            specifications: {
                physical: {
                    height: {
                        value: parseFloat(robotData.height) || null,
                        unit: robotData.heightUnit || 'm'
                    },
                    weight: {
                        value: parseFloat(robotData.weight) || null,
                        unit: robotData.weightUnit || 'kg'
                    }
                },
                performance: {
                    batteryRuntime: parseInt(robotData.batteryRuntime) || null,
                    speed: {
                        value: parseFloat(robotData.speed) || null,
                        unit: robotData.speedUnit || 'm/s'
                    }
                }
            },
            media: {
                featuredImage: mediaData?.featuredImage || window.featuredImageFile || null,
                additionalImages: mediaData?.additionalImages || window.additionalImageFiles || [],
                videos: window.videoUrls?.filter(v => v.url) || []
            },
            status: robotData.status || 'published',
            createdAt: isEditMode ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('Saving robot:', robot);
        
        // Use GitHub storage if available
        let success = false;
        
        if (window.githubStorage) {
            // Set token again just to be sure
            if (token && typeof window.githubStorage.setToken === 'function') {
                window.githubStorage.setToken(token);
            }
            
            if (isEditMode) {
                success = await window.githubStorage.updateRobotAndSave(currentRobotId, robot);
            } else {
                success = await window.githubStorage.addRobotAndSave(robot);
            }
        } else if (window.robotStorage) {
            if (isEditMode) {
                success = await window.robotStorage.updateRobotAndSave(currentRobotId, robot);
            } else {
                success = await window.robotStorage.addRobotAndSave(robot);
            }
        } else {
            alert('Error: No storage adapter available');
            return;
        }
        
        if (success) {
            alert(isEditMode ? 'Robot updated successfully!' : 'Robot added successfully!');
            // Redirect to robot detail page
            window.location.href = `robot-detail.html?slug=${robot.slug}`;
        } else {
            alert('Error ' + (isEditMode ? 'updating' : 'adding') + ' robot. Please try again.');
        }
    } catch (error) {
        console.error('Error saving robot:', error);
        alert('An error occurred while saving the robot: ' + error.message);
    }
}

/**
 * Collect form data
 */
function collectFormData() {
    return {
        name: document.getElementById('robot-name')?.value || '',
        slug: document.getElementById('robot-slug')?.value || '',
        manufacturerName: document.getElementById('manufacturer-name')?.value || '',
        manufacturerCountry: document.getElementById('manufacturer-country')?.value || '',
        manufacturerWebsite: document.getElementById('manufacturer-website')?.value || '',
        yearIntroduced: document.getElementById('year-introduced')?.value || '',
        status: document.getElementById('robot-status')?.value || 'published',
        summary: document.getElementById('robot-summary')?.value || '',
        description: document.getElementById('robot-description')?.value || '',
        height: document.getElementById('spec-height')?.value || null,
        heightUnit: document.getElementById('spec-height-unit')?.value || 'm',
        weight: document.getElementById('spec-weight')?.value || null,
        weightUnit: document.getElementById('spec-weight-unit')?.value || 'kg',
        batteryRuntime: document.getElementById('spec-battery-runtime')?.value || null,
        speed: document.getElementById('spec-speed')?.value || null,
        speedUnit: document.getElementById('spec-speed-unit')?.value || 'm/s',
        categories: collectSelectedCategories()
    };
}

/**
 * Collect selected categories
 */
function collectSelectedCategories() {
    const checkboxes = document.querySelectorAll('.category-checkbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}
