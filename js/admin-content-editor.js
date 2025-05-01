// admin-content-editor.js - Handles content editing functionality for the admin dashboard

class AdminContentEditor {
    constructor() {
        this.currentRobotId = null;
        this.currentRobotData = null;
        this.editorInstance = null;
        this.editableFields = [
            'name', 'manufacturer', 'categories', 'summary', 
            'description', 'specifications', 'applications', 'media'
        ];
        
        // Initialize the editor
        this.init();
    }
    
    init() {
        // Add event listeners for content editing
        this.setupEventListeners();
        
        // Check if we're on the admin dashboard
        if (document.querySelector('.robot-editor-container')) {
            this.setupEditor();
            
            // Check if we have a robot ID in the URL
            const urlParams = new URLSearchParams(window.location.search);
            const robotId = urlParams.get('robotId');
            
            if (robotId) {
                this.loadRobotForEditing(parseInt(robotId));
            }
        }
    }
    
    setupEventListeners() {
        // Event delegation for edit buttons
        document.addEventListener('click', (e) => {
            // Check if we clicked on an edit button
            if (e.target.closest('.edit-icon')) {
                const row = e.target.closest('tr');
                if (row) {
                    const robotId = row.dataset.robotId || row.dataset.id;
                    if (robotId) {
                        this.loadRobotForEditing(parseInt(robotId));
                    } else {
                        console.error('Robot ID not found');
                    }
                }
            }
            
            // Check for save button
            if (e.target.matches('#save-robot-btn')) {
                this.saveRobotData();
            }
            
            // Check for cancel button
            if (e.target.matches('#cancel-edit-btn')) {
                this.cancelEditing();
            }
        });
    }
    
    setupEditor() {
        // Find the robot editor container
        const editorContainer = document.querySelector('.robot-editor-container');
        if (!editorContainer) return;
        
        // Clear existing content
        editorContainer.innerHTML = this.createEditorHTML();
        
        // Initialize rich text editor
        this.initRichTextEditor();
    }
    
    createEditorHTML() {
        return `
            <div class="editor-header">
                <h2 class="editor-title">Robot Editor</h2>
                <div class="editor-actions">
                    <button class="btn" id="cancel-edit-btn">Cancel</button>
                    <button class="btn btn-primary" id="save-robot-btn">Save Changes</button>
                </div>
            </div>
            <div class="editor-tabs">
                <button class="editor-tab active" data-tab="basic">Basic Info</button>
                <button class="editor-tab" data-tab="details">Details</button>
                <button class="editor-tab" data-tab="specs">Specifications</button>
                <button class="editor-tab" data-tab="media">Media</button>
                <button class="editor-tab" data-tab="applications">Applications</button>
            </div>
            <div class="editor-content">
                <!-- Basic Info Tab -->
                <div class="editor-tab-content active" id="tab-basic">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Robot Name</label>
                            <input type="text" class="form-control" id="robot-name" placeholder="Enter robot name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Slug (URL)</label>
                            <input type="text" class="form-control" id="robot-slug" placeholder="Enter URL slug">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Manufacturer Name</label>
                            <input type="text" class="form-control" id="manufacturer-name" placeholder="Enter manufacturer name">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Manufacturer Country</label>
                            <input type="text" class="form-control" id="manufacturer-country" placeholder="Enter country">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Manufacturer Website</label>
                            <input type="text" class="form-control" id="manufacturer-website" placeholder="Enter website URL">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Year Introduced</label>
                            <input type="number" class="form-control" id="year-introduced" placeholder="Year">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categories</label>
                        <div class="tags-input-container" id="categories-container">
                            <div class="tags-container" id="category-tags"></div>
                            <input type="text" class="tags-input" id="category-input" placeholder="Add category and press Enter">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status</label>
                        <select class="form-control" id="robot-status">
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>
                
                <!-- Details Tab -->
                <div class="editor-tab-content" id="tab-details">
                    <div class="form-group">
                        <label class="form-label">Summary</label>
                        <textarea class="form-control" id="robot-summary" placeholder="Enter a short summary"></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description</label>
                        <div id="robot-description-editor"></div>
                    </div>
                </div>
                
                <!-- Specifications Tab -->
                <div class="editor-tab-content" id="tab-specs">
                    <div class="specs-section">
                        <h3 class="specs-section-title">Physical Dimensions</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Height</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="spec-height" step="0.01">
                                    <select class="form-control" id="spec-height-unit">
                                        <option value="m">meters</option>
                                        <option value="cm">centimeters</option>
                                        <option value="in">inches</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Width</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="spec-width" step="0.01">
                                    <select class="form-control" id="spec-width-unit">
                                        <option value="m">meters</option>
                                        <option value="cm">centimeters</option>
                                        <option value="in">inches</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Length</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="spec-length" step="0.01">
                                    <select class="form-control" id="spec-length-unit">
                                        <option value="m">meters</option>
                                        <option value="cm">centimeters</option>
                                        <option value="in">inches</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Weight</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="spec-weight" step="0.01">
                                    <select class="form-control" id="spec-weight-unit">
                                        <option value="kg">kilograms</option>
                                        <option value="g">grams</option>
                                        <option value="lb">pounds</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="specs-section">
                        <h3 class="specs-section-title">Performance</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Battery Runtime</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="spec-battery-runtime">
                                    <select class="form-control" id="spec-battery-runtime-unit">
                                        <option value="minutes">minutes</option>
                                        <option value="hours">hours</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Max Speed</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="spec-speed" step="0.01">
                                    <select class="form-control" id="spec-speed-unit">
                                        <option value="m/s">meters/second</option>
                                        <option value="km/h">km/hour</option>
                                        <option value="mph">miles/hour</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Degrees of Freedom</label>
                                <input type="number" class="form-control" id="spec-dof">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Max Payload</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" id="spec-payload" step="0.01">
                                    <select class="form-control" id="spec-payload-unit">
                                        <option value="kg">kilograms</option>
                                        <option value="g">grams</option>
                                        <option value="lb">pounds</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="specs-section">
                        <h3 class="specs-section-title">Environmental</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">IP Rating</label>
                                <input type="text" class="form-control" id="spec-ip" placeholder="e.g., IP54">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Operating Temperature Range</label>
                                <div class="form-row">
                                    <input type="number" class="form-control" id="spec-temp-min" placeholder="Min °C">
                                    <span class="form-separator">to</span>
                                    <input type="number" class="form-control" id="spec-temp-max" placeholder="Max °C">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="specs-section">
                        <h3 class="specs-section-title">Sensors & Connectivity</h3>
                        <div class="form-group">
                            <label class="form-label">Sensors</label>
                            <div class="tags-input-container" id="sensors-container">
                                <div class="tags-container" id="sensor-tags"></div>
                                <input type="text" class="tags-input" id="sensor-input" placeholder="Add sensor and press Enter">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Connectivity</label>
                            <div class="tags-input-container" id="connectivity-container">
                                <div class="tags-container" id="connectivity-tags"></div>
                                <input type="text" class="tags-input" id="connectivity-input" placeholder="Add connectivity option and press Enter">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Media Tab -->
                <div class="editor-tab-content" id="tab-media">
                    <div class="form-group">
                        <label class="form-label">Featured Image</label>
                        <div class="media-upload-container">
                            <div class="media-preview" id="featured-image-preview">
                                <img src="images/upload-placeholder.jpg" id="featured-image">
                            </div>
                            <div class="media-upload-actions">
                                <button class="btn" id="upload-featured-image">Upload Image</button>
                                <input type="file" id="featured-image-input" accept="image/*" style="display: none;">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Additional Images</label>
                        <div class="media-gallery" id="additional-images-gallery">
                            <!-- Images will be added here dynamically -->
                        </div>
                        <div class="media-upload-actions">
                            <button class="btn" id="upload-additional-image">Add Image</button>
                            <input type="file" id="additional-image-input" accept="image/*" multiple style="display: none;">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Video URL (YouTube/Vimeo)</label>
                        <input type="text" class="form-control" id="video-url" placeholder="Enter video URL">
                    </div>
                </div>
                
                <!-- Applications Tab -->
                <div class="editor-tab-content" id="tab-applications">
                    <div id="applications-container">
                        <!-- Application items will be added here dynamically -->
                    </div>
                    <button class="btn" id="add-application">Add Application</button>
                    
                    <!-- Application Template (Hidden) -->
                    <template id="application-template">
                        <div class="application-item">
                            <div class="application-header">
                                <h3 class="application-title">Application</h3>
                                <button class="btn-icon remove-application" title="Remove">×</button>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Title</label>
                                <input type="text" class="form-control application-title-input" placeholder="Application title">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea class="form-control application-description" placeholder="Describe the application"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Image</label>
                                <div class="media-upload-container">
                                    <div class="media-preview application-image-preview">
                                        <img src="images/upload-placeholder.jpg" class="application-image">
                                    </div>
                                    <div class="media-upload-actions">
                                        <button class="btn upload-application-image">Upload Image</button>
                                        <input type="file" class="application-image-input" accept="image/*" style="display: none;">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            
            <div class="save-notification" id="save-notification">Changes saved successfully!</div>
        `;
    }
    
    initRichTextEditor() {
        // Check if the rich text editor element exists
        const editorElement = document.getElementById('robot-description-editor');
        if (!editorElement) return;
        
        // Initialize the rich text editor (this is a simplified example)
        // In a real implementation, you might use a library like TinyMCE, CKEditor, etc.
        this.editorInstance = {
            setContent: (content) => {
                editorElement.innerHTML = `<textarea class="form-control rich-editor" id="robot-description" rows="10">${content || ''}</textarea>`;
            },
            getContent: () => {
                return document.getElementById('robot-description').value;
            }
        };
        
        // Set default content
        this.editorInstance.setContent('');
        
        // Setup tab navigation
        this.setupTabNavigation();
        
        // Setup category tags input
        this.setupTagsInput('category-input', 'category-tags');
        
        // Setup sensor tags input
        this.setupTagsInput('sensor-input', 'sensor-tags');
        
        // Setup connectivity tags input
        this.setupTagsInput('connectivity-input', 'connectivity-tags');
        
        // Setup media upload handlers
        this.setupMediaUploads();
        
        // Setup applications
        this.setupApplications();
    }
    
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.editor-tab');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all tab content
                document.querySelectorAll('.editor-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show the corresponding tab content
                const tabId = tab.dataset.tab;
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }
    
    setupTagsInput(inputId, tagsContainerId) {
        const input = document.getElementById(inputId);
        const tagsContainer = document.getElementById(tagsContainerId);
        
        if (!input || !tagsContainer) return;
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                
                const tag = input.value.trim();
                if (tag) {
                    this.addTag(tag, tagsContainer);
                    input.value = '';
                }
            }
        });
        
        // Handle tag removal
        tagsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                e.target.parentElement.remove();
            }
        });
    }
    
    addTag(tagText, container) {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            ${tagText}
            <span class="tag-remove">×</span>
        `;
        container.appendChild(tag);
    }
    
    setupMediaUploads() {
        // Featured image upload
        const uploadFeaturedBtn = document.getElementById('upload-featured-image');
        const featuredInput = document.getElementById('featured-image-input');
        
        if (uploadFeaturedBtn && featuredInput) {
            uploadFeaturedBtn.addEventListener('click', () => {
                featuredInput.click();
            });
            
            featuredInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    this.handleImageUpload(file, 'featured-image');
                }
            });
        }
        
        // Additional images upload
        const uploadAdditionalBtn = document.getElementById('upload-additional-image');
        const additionalInput = document.getElementById('additional-image-input');
        
        if (uploadAdditionalBtn && additionalInput) {
            uploadAdditionalBtn.addEventListener('click', () => {
                additionalInput.click();
            });
            
            additionalInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    Array.from(e.target.files).forEach(file => {
                        this.addGalleryImage(file);
                    });
                }
            });
        }
    }
    
    handleImageUpload(file, imageId) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = document.getElementById(imageId);
            if (img) {
                img.src = e.target.result;
                img.dataset.file = file.name;
                img.dataset.type = file.type;
            }
        };
        
        reader.readAsDataURL(file);
    }
    
    addGalleryImage(file) {
        const gallery = document.getElementById('additional-images-gallery');
        if (!gallery) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'gallery-item';
            imageItem.innerHTML = `
                <img src="${e.target.result}" class="gallery-image" data-file="${file.name}" data-type="${file.type}">
                <button class="gallery-remove" title="Remove">×</button>
            `;
            
            // Add remove handler
            const removeBtn = imageItem.querySelector('.gallery-remove');
            removeBtn.addEventListener('click', () => {
                imageItem.remove();
            });
            
            gallery.appendChild(imageItem);
        };
        
        reader.readAsDataURL(file);
    }
    
    setupApplications() {
        const addApplicationBtn = document.getElementById('add-application');
        const applicationsContainer = document.getElementById('applications-container');
        const applicationTemplate = document.getElementById('application-template');
        
        if (!addApplicationBtn || !applicationsContainer || !applicationTemplate) return;
        
        // Add application button handler
        addApplicationBtn.addEventListener('click', () => {
            this.addApplication();
        });
        
        // Application container event delegation for remove buttons
        applicationsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-application')) {
                const applicationItem = e.target.closest('.application-item');
                if (applicationItem) {
                    applicationItem.remove();
                }
            }
            
            if (e.target.classList.contains('upload-application-image')) {
                const applicationItem = e.target.closest('.application-item');
                const input = applicationItem.querySelector('.application-image-input');
                if (input) {
                    input.click();
                }
            }
        });
        
        // Handle application image uploads
        applicationsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('application-image-input')) {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const applicationItem = e.target.closest('.application-item');
                    const image = applicationItem.querySelector('.application-image');
                    
                    if (image) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            image.src = e.target.result;
                            image.dataset.file = file.name;
                            image.dataset.type = file.type;
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        });
    }
    
    addApplication(appData = null) {
        const applicationsContainer = document.getElementById('applications-container');
        const applicationTemplate = document.getElementById('application-template');
        
        if (!applicationsContainer || !applicationTemplate) return;
        
        // Clone the template content
        const clone = document.importNode(applicationTemplate.content, true);
        
        // Fill with data if provided
        if (appData) {
            const titleInput = clone.querySelector('.application-title-input');
            const descriptionInput = clone.querySelector('.application-description');
            const image = clone.querySelector('.application-image');
            
            if (titleInput) titleInput.value = appData.title || '';
            if (descriptionInput) descriptionInput.value = appData.description || '';
            if (image && appData.image) image.src = appData.image;
        }
        
        // Add to the container
        applicationsContainer.appendChild(clone);
    }
    
    loadRobotForEditing(robotId) {
        // Get robot data from DataManager
        this.currentRobotData = DataManager.getRobotById(robotId);
        this.currentRobotId = robotId;
        
        if (!this.currentRobotData) {
            console.error(`Robot with ID ${robotId} not found`);
            return;
        }
        
        // Make sure the editor is set up
        const editorContainer = document.querySelector('.robot-editor-container');
        if (!editorContainer) {
            // If we're not on the editor page, redirect to it
            window.location.href = `admin-content-editor.html?robotId=${robotId}`;
            return;
        }
        
        // Initialize the editor if needed
        if (!this.editorInstance) {
            this.setupEditor();
        }
        
        // Fill the form with robot data
        this.populateEditorForm();
    }
    
    populateEditorForm() {
        if (!this.currentRobotData) return;
        
        // Basic Info Tab
        document.getElementById('robot-name').value = this.currentRobotData.name || '';
        document.getElementById('robot-slug').value = this.currentRobotData.slug || '';
        document.getElementById('manufacturer-name').value = this.currentRobotData.manufacturer?.name || '';
        document.getElementById('manufacturer-country').value = this.currentRobotData.manufacturer?.country || '';
        document.getElementById('manufacturer-website').value = this.currentRobotData.manufacturer?.website || '';
        document.getElementById('year-introduced').value = this.currentRobotData.yearIntroduced || '';
        document.getElementById('robot-status').value = this.currentRobotData.status || 'draft';
        
        // Categories
        const categoryTags = document.getElementById('category-tags');
        if (categoryTags) {
            categoryTags.innerHTML = '';
            if (this.currentRobotData.categories && this.currentRobotData.categories.length) {
                this.currentRobotData.categories.forEach(category => {
                    this.addTag(category, categoryTags);
                });
            }
        }
        
        // Details Tab
        document.getElementById('robot-summary').value = this.currentRobotData.summary || '';
        
        if (this.editorInstance) {
            this.editorInstance.setContent(this.currentRobotData.description || '');
        }
        
        // Specs Tab
        if (this.currentRobotData.specifications) {
            const specs = this.currentRobotData.specifications;
            
            // Physical dimensions
            if (specs.physical) {
                document.getElementById('spec-height').value = specs.physical.height?.value || '';
                document.getElementById('spec-height-unit').value = specs.physical.height?.unit || 'm';
                
                document.getElementById('spec-width').value = specs.physical.width?.value || '';
                document.getElementById('spec-width-unit').value = specs.physical.width?.unit || 'm';
                
                document.getElementById('spec-length').value = specs.physical.length?.value || '';
                document.getElementById('spec-length-unit').value = specs.physical.length?.unit || 'm';
                
                document.getElementById('spec-weight').value = specs.physical.weight?.value || '';
                document.getElementById('spec-weight-unit').value = specs.physical.weight?.unit || 'kg';
            }
            
            // Performance
            if (specs.performance) {
                if (specs.performance.battery) {
                    document.getElementById('spec-battery-runtime').value = specs.performance.battery.runtime || '';
                    // Set unit based on value
                    if (specs.performance.battery.runtime > 120) {
                        document.getElementById('spec-battery-runtime-unit').value = 'minutes';
                    } else {
                        document.getElementById('spec-battery-runtime-unit').value = 'hours';
                    }
                }
                
                document.getElementById('spec-speed').value = specs.performance.speed?.value || '';
                document.getElementById('spec-speed-unit').value = specs.performance.speed?.unit || 'm/s';
                
                document.getElementById('spec-dof').value = specs.performance.degreesOfFreedom || '';
                document.getElementById('spec-payload').value = specs.performance.payload?.value || '';
                document.getElementById('spec-payload-unit').value = specs.performance.payload?.unit || 'kg';
            }
            
            // Environmental
            document.getElementById('spec-ip').value = specs.ipRating || '';
            if (specs.performance?.operatingTemperature) {
                document.getElementById('spec-temp-min').value = specs.performance.operatingTemperature.min || '';
                document.getElementById('spec-temp-max').value = specs.performance.operatingTemperature.max || '';
            }
            
            // Sensors & Connectivity
            const sensorTags = document.getElementById('sensor-tags');
            if (sensorTags && specs.sensors) {
                sensorTags.innerHTML = '';
                specs.sensors.forEach(sensor => {
                    this.addTag(sensor.type || sensor, sensorTags);
                });
            }
            
            const connectivityTags = document.getElementById('connectivity-tags');
            if (connectivityTags && specs.connectivity) {
                connectivityTags.innerHTML = '';
                specs.connectivity.forEach(item => {
                    this.addTag(item, connectivityTags);
                });
            }
        }
        
        // Media Tab
        const featuredImage = document.getElementById('featured-image');
        if (featuredImage && this.currentRobotData.media?.featuredImage) {
            featuredImage.src = this.currentRobotData.media.featuredImage.url || 'images/upload-placeholder.jpg';
        }
        
        const gallery = document.getElementById('additional-images-gallery');
        if (gallery && this.currentRobotData.media?.images) {
            gallery.innerHTML = '';
            this.currentRobotData.media.images.forEach(image => {
                const imageItem = document.createElement('div');
                imageItem.className = 'gallery-item';
                imageItem.innerHTML = `
                    <img src="${image.url}" class="gallery-image" alt="${image.alt || ''}">
                    <button class="gallery-remove" title="Remove">×</button>
                `;
                
                // Add remove handler
                const removeBtn = imageItem.querySelector('.gallery-remove');
                removeBtn.addEventListener('click', () => {
                    imageItem.remove();
                });
                
                gallery.appendChild(imageItem);
            });
        }
        
        // Video URL
        if (this.currentRobotData.media?.videos && this.currentRobotData.media.videos.length > 0) {
            document.getElementById('video-url').value = this.currentRobotData.media.videos[0].url || '';
        }
        
        // Applications Tab
        const applicationsContainer = document.getElementById('applications-container');
        if (applicationsContainer && this.currentRobotData.applications) {
            applicationsContainer.innerHTML = '';
            
            this.currentRobotData.applications.forEach(app => {
                this.addApplication(app);
            });
        }
    }
    
    saveRobotData() {
        if (!this.currentRobotId || !this.currentRobotData) {
            console.error('No robot data to save');
            return;
        }
        
        // Create a copy of the current data
        const updatedRobotData = JSON.parse(JSON.stringify(this.currentRobotData));
        
        // Basic Info Tab
        updatedRobotData.name = document.getElementById('robot-name').value;
        updatedRobotData.slug = document.getElementById('robot-slug').value;
        
        // Manufacturer
        if (!updatedRobotData.manufacturer) updatedRobotData.manufacturer = {};
        updatedRobotData.manufacturer.name = document.getElementById('manufacturer-name').value;
        updatedRobotData.manufacturer.country = document.getElementById('manufacturer-country').value;
        updatedRobotData.manufacturer.website = document.getElementById('manufacturer-website').value;
        
        updatedRobotData.yearIntroduced = parseInt(document.getElementById('year-introduced').value) || null;
        updatedRobotData.status = document.getElementById('robot-status').value;
        
        // Categories
        updatedRobotData.categories = [];
        document.querySelectorAll('#category-tags .tag').forEach(tag => {
            const tagText = tag.textContent.trim().replace('×', '').trim();
            if (tagText) updatedRobotData.categories.push(tagText);
        });
        
        // Details Tab
        updatedRobotData.summary = document.getElementById('robot-summary').value;
        updatedRobotData.description = this.editorInstance.getContent();
        
        // Specifications
        if (!updatedRobotData.specifications) updatedRobotData.specifications = {};
        
        // Physical dimensions
        if (!updatedRobotData.specifications.physical) updatedRobotData.specifications.physical = {};
        
        const heightValue = parseFloat(document.getElementById('spec-height').value);
        if (!isNaN(heightValue)) {
            updatedRobotData.specifications.physical.height = {
                value: heightValue,
                unit: document.getElementById('spec-height-unit').value
            };
        }
        
        const widthValue = parseFloat(document.getElementById('spec-width').value);
        if (!isNaN(widthValue)) {
            updatedRobotData.specifications.physical.width = {
                value: widthValue,
                unit: document.getElementById('spec-width-unit').value
            };
        }
        
        const lengthValue = parseFloat(document.getElementById('spec-length').value);
        if (!isNaN(lengthValue)) {
            updatedRobotData.specifications.physical.length = {
                value: lengthValue,
                unit: document.getElementById('spec-length-unit').value
            };
        }
        
        const weightValue = parseFloat(document.getElementById('spec-weight').value);
        if (!isNaN(weightValue)) {
            updatedRobotData.specifications.physical.weight = {
                value: weightValue,
                unit: document.getElementById('spec-weight-unit').value
            };
        }
        
        // Performance
        if (!updatedRobotData.specifications.performance) updatedRobotData.specifications.performance = {};
        
        const batteryRuntime = parseInt(document.getElementById('spec-battery-runtime').value);
        if (!isNaN(batteryRuntime)) {
            if (!updatedRobotData.specifications.performance.battery) {
                updatedRobotData.specifications.performance.battery = {};
            }
            updatedRobotData.specifications.performance.battery.runtime = batteryRuntime;
            updatedRobotData.specifications.performance.battery.unit = document.getElementById('spec-battery-runtime-unit').value;
        }
        
        const speedValue = parseFloat(document.getElementById('spec-speed').value);
        if (!isNaN(speedValue)) {
            updatedRobotData.specifications.performance.speed = {
                value: speedValue,
                unit: document.getElementById('spec-speed-unit').value
            };
        }
        
        const dofValue = parseInt(document.getElementById('spec-dof').value);
        if (!isNaN(dofValue)) {
            updatedRobotData.specifications.performance.degreesOfFreedom = dofValue;
        }
        
        const payloadValue = parseFloat(document.getElementById('spec-payload').value);
        if (!isNaN(payloadValue)) {
            updatedRobotData.specifications.performance.payload = {
                value: payloadValue,
                unit: document.getElementById('spec-payload-unit').value
            };
        }
        
        // Environmental
        updatedRobotData.specifications.ipRating = document.getElementById('spec-ip').value;
        
        const tempMin = parseInt(document.getElementById('spec-temp-min').value);
        const tempMax = parseInt(document.getElementById('spec-temp-max').value);
        if (!isNaN(tempMin) || !isNaN(tempMax)) {
            if (!updatedRobotData.specifications.performance.operatingTemperature) {
                updatedRobotData.specifications.performance.operatingTemperature = {};
            }
            
            if (!isNaN(tempMin)) updatedRobotData.specifications.performance.operatingTemperature.min = tempMin;
            if (!isNaN(tempMax)) updatedRobotData.specifications.performance.operatingTemperature.max = tempMax;
        }
        
        // Sensors
        updatedRobotData.specifications.sensors = [];
        document.querySelectorAll('#sensor-tags .tag').forEach(tag => {
            const tagText = tag.textContent.trim().replace('×', '').trim();
            if (tagText) updatedRobotData.specifications.sensors.push(tagText);
        });
        
        // Connectivity
        updatedRobotData.specifications.connectivity = [];
        document.querySelectorAll('#connectivity-tags .tag').forEach(tag => {
            const tagText = tag.textContent.trim().replace('×', '').trim();
            if (tagText) updatedRobotData.specifications.connectivity.push(tagText);
        });
        
        // Media
        if (!updatedRobotData.media) updatedRobotData.media = {};
        
        // Featured image
        const featuredImage = document.getElementById('featured-image');
        if (featuredImage && featuredImage.src && !featuredImage.src.includes('upload-placeholder.jpg')) {
            updatedRobotData.media.featuredImage = {
                url: featuredImage.src,
                alt: `${updatedRobotData.name} - Featured Image`,
                fileName: featuredImage.dataset.file || null,
                type: featuredImage.dataset.type || null
            };
        }
        
        // Additional images
        updatedRobotData.media.images = [];
        document.querySelectorAll('#additional-images-gallery .gallery-item').forEach(item => {
            const img = item.querySelector('.gallery-image');
            if (img && img.src) {
                updatedRobotData.media.images.push({
                    url: img.src,
                    alt: img.alt || `${updatedRobotData.name} - Image`,
                    fileName: img.dataset.file || null,
                    type: img.dataset.type || null
                });
            }
        });
        
        // Video URL
        const videoUrl = document.getElementById('video-url').value;
        if (videoUrl) {
            updatedRobotData.media.videos = [{
                url: videoUrl,
                type: this.detectVideoType(videoUrl)
            }];
        } else {
            updatedRobotData.media.videos = [];
        }
        
        // Applications
        updatedRobotData.applications = [];
        document.querySelectorAll('#applications-container .application-item').forEach(item => {
            const titleInput = item.querySelector('.application-title-input');
            const descriptionInput = item.querySelector('.application-description');
            const image = item.querySelector('.application-image');
            
            if (titleInput.value || descriptionInput.value) {
                const application = {
                    title: titleInput.value,
                    description: descriptionInput.value
                };
                
                if (image && image.src && !image.src.includes('upload-placeholder.jpg')) {
                    application.image = image.src;
                    application.fileName = image.dataset.file || null;
                    application.type = image.dataset.type || null;
                }
                
                updatedRobotData.applications.push(application);
            }
        });
        
        // Save the updated data using DataManager
        const saved = DataManager.updateRobot(this.currentRobotId, updatedRobotData);
        if (saved) {
            this.currentRobotData = updatedRobotData;
            this.showSaveNotification();
        } else {
            alert('Error saving robot data. Please try again.');
        }
    }
    
    detectVideoType(url) {
        if (url.includes('youtube') || url.includes('youtu.be')) {
            return 'youtube';
        } else if (url.includes('vimeo')) {
            return 'vimeo';
        } else {
            return 'other';
        }
    }
    
    showSaveNotification() {
        const notification = document.getElementById('save-notification');
        if (!notification) return;
        
        // Show notification
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    cancelEditing() {
        // Check if we're on the main dashboard
        if (window.location.pathname.includes('admin-content-editor.html')) {
            window.location.href = 'admin-dashboard.html';
        } else {
            // If we're on the dashboard, just clear the editor container
            const editorContainer = document.querySelector('.robot-editor-container');
            if (editorContainer) {
                editorContainer.innerHTML = '';
            }
        }
    }
    
    // Helper function to generate a URL-friendly slug
    generateSlug(name) {
        return name.toLowerCase()
            .replace(/\s+/g, '-')  // Replace spaces with hyphens
            .replace(/[^\w\-]+/g, '') // Remove non-word characters except hyphens
            .replace(/\-\-+/g, '-')  // Replace multiple hyphens with a single hyphen
            .replace(/^-+/, '')      // Trim hyphens from start
            .replace(/-+$/, '');     // Trim hyphens from end
    }
}

// Initialize the editor when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the editor page
    if (document.querySelector('.robot-editor-container')) {
        new AdminContentEditor();
    }
});
