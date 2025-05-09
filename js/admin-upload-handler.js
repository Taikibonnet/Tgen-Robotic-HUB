/**
 * Admin Upload Handler
 * This file manages file uploads and video links for the admin form
 */

window.uploadHandler = (function() {
    // Maximum file size for uploads (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    /**
     * Initialize upload functionality
     */
    function init() {
        console.log('Upload Handler: Initializing');
        setupDragAndDrop();
        setupVideoUrlManager();
    }
    
    /**
     * Set up drag and drop file upload
     */
    function setupDragAndDrop() {
        // Featured image
        setupDropArea('featured-image-upload', 'featured-image-preview', handleFeaturedImageUpload);
        
        // Additional images
        setupDropArea('additional-images-upload', 'additional-images-preview', handleAdditionalImagesUpload);
    }
    
    /**
     * Set up a drop area for file uploads
     */
    function setupDropArea(dropAreaId, previewAreaId, handleCallback) {
        const dropArea = document.getElementById(dropAreaId);
        const previewArea = document.getElementById(previewAreaId);
        
        if (!dropArea || !previewArea) return;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when a file is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        // Remove highlight when a file is dragged out or dropped
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        // Handle dropped files
        dropArea.addEventListener('drop', e => {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleCallback(files);
        });
        
        // Handle click to upload
        dropArea.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            if (dropAreaId === 'additional-images-upload') {
                input.multiple = true;
            }
            
            input.onchange = e => {
                const files = e.target.files;
                handleCallback(files);
            };
            
            input.click();
        });
    }
    
    /**
     * Prevent default behavior for drag and drop events
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    /**
     * Highlight drop area
     */
    function highlight(e) {
        this.classList.add('highlight');
    }
    
    /**
     * Remove highlight from drop area
     */
    function unhighlight(e) {
        this.classList.remove('highlight');
    }
    
    /**
     * Handle featured image upload
     */
    function handleFeaturedImageUpload(files) {
        if (files.length > 0) {
            const file = files[0];
            
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                alert('Image is too large. Maximum file size is 5MB.');
                return;
            }
            
            // Check file type
            if (!file.type.match('image.*')) {
                alert('Only image files are allowed.');
                return;
            }
            
            // Read file
            const reader = new FileReader();
            reader.onload = e => {
                // Set featured image in form data
                window.featuredImageFile = e.target.result;
                
                // Show preview
                const previewArea = document.getElementById('featured-image-preview');
                previewArea.innerHTML = '';
                
                const container = document.createElement('div');
                container.className = 'media-item';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                
                const removeBtn = document.createElement('div');
                removeBtn.className = 'media-remove';
                removeBtn.innerHTML = '×';
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    window.featuredImageFile = null;
                    previewArea.innerHTML = '';
                });
                
                container.appendChild(img);
                container.appendChild(removeBtn);
                previewArea.appendChild(container);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * Handle additional images upload
     */
    function handleAdditionalImagesUpload(files) {
        // Initialize additional images array if not exists
        if (!window.additionalImageFiles) {
            window.additionalImageFiles = [];
        }
        
        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                alert(`Image "${file.name}" is too large. Maximum file size is 5MB.`);
                continue;
            }
            
            // Check file type
            if (!file.type.match('image.*')) {
                alert(`File "${file.name}" is not an image.`);
                continue;
            }
            
            // Read file
            const reader = new FileReader();
            reader.onload = (function(theFile) {
                return function(e) {
                    // Add image to array
                    const imageData = e.target.result;
                    window.additionalImageFiles.push(imageData);
                    
                    // Show preview
                    const previewArea = document.getElementById('additional-images-preview');
                    
                    const container = document.createElement('div');
                    container.className = 'media-item';
                    const imgId = 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
                    container.id = imgId;
                    
                    const img = document.createElement('img');
                    img.src = imageData;
                    
                    const removeBtn = document.createElement('div');
                    removeBtn.className = 'media-remove';
                    removeBtn.innerHTML = '×';
                    removeBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const index = window.additionalImageFiles.indexOf(imageData);
                        if (index !== -1) {
                            window.additionalImageFiles.splice(index, 1);
                        }
                        container.remove();
                    });
                    
                    container.appendChild(img);
                    container.appendChild(removeBtn);
                    previewArea.appendChild(container);
                };
            })(file);
            
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * Set up video URL manager
     */
    function setupVideoUrlManager() {
        // Initialize video URLs array
        if (!window.videoUrls) {
            window.videoUrls = [{ url: '', title: '', description: '' }];
        }
        
        // Add button to add more video URLs
        const addVideoUrlBtn = document.getElementById('add-video-url');
        const videoUrlContainer = document.getElementById('video-url-container');
        
        if (!addVideoUrlBtn || !videoUrlContainer) return;
        
        // Event listener for add button
        addVideoUrlBtn.addEventListener('click', function() {
            const index = window.videoUrls.length;
            window.videoUrls.push({ url: '', title: '', description: '' });
            
            const videoUrlGroup = document.createElement('div');
            videoUrlGroup.className = 'video-url-group';
            videoUrlGroup.dataset.index = index;
            
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
            
            // Add event listeners
            setupVideoUrlGroupEvents(videoUrlGroup, index);
        });
        
        // Set up event listeners for existing video URL groups
        const videoUrlGroups = videoUrlContainer.querySelectorAll('.video-url-group');
        
        videoUrlGroups.forEach((group, index) => {
            setupVideoUrlGroupEvents(group, index);
        });
    }
    
    /**
     * Set up events for a video URL group
     */
    function setupVideoUrlGroupEvents(group, index) {
        const urlInput = group.querySelector('.video-url-input');
        const titleInput = group.querySelector('.video-title-input');
        const descInput = group.querySelector('.video-description-input');
        const removeBtn = group.querySelector('.remove-video-url');
        
        if (urlInput) {
            urlInput.addEventListener('input', function() {
                window.videoUrls[index].url = this.value;
                
                // If URL is a YouTube link, try to get the title automatically
                if (this.value.includes('youtube.com') || this.value.includes('youtu.be')) {
                    // Extract video ID
                    const videoId = extractYouTubeId(this.value);
                    
                    if (videoId && titleInput.value === '') {
                        // You can implement YouTube API integration here to get video details
                        console.log('YouTube video ID:', videoId);
                    }
                }
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
                if (window.videoUrls.length === 1) {
                    // Just clear the fields
                    if (urlInput) urlInput.value = '';
                    if (titleInput) titleInput.value = '';
                    if (descInput) descInput.value = '';
                    window.videoUrls[0] = { url: '', title: '', description: '' };
                } else {
                    // Remove the entry
                    window.videoUrls.splice(index, 1);
                    group.remove();
                    
                    // Update indexes
                    const groups = document.querySelectorAll('.video-url-group');
                    groups.forEach((group, i) => {
                        group.dataset.index = i;
                        setupVideoUrlGroupEvents(group, i);
                    });
                }
            });
        }
    }
    
    /**
     * Extract YouTube video ID from URL
     */
    function extractYouTubeId(url) {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    }
    
    /**
     * Get form data
     */
    function getFormData() {
        return {
            featuredImage: window.featuredImageFile || null,
            additionalImages: window.additionalImageFiles || [],
            videoUrls: window.videoUrls.filter(video => video.url) || []
        };
    }
    
    /**
     * Reset form data
     */
    function resetFormData() {
        window.featuredImageFile = null;
        window.additionalImageFiles = [];
        window.videoUrls = [{ url: '', title: '', description: '' }];
        
        // Clear previews
        const featuredImagePreview = document.getElementById('featured-image-preview');
        const additionalImagesPreview = document.getElementById('additional-images-preview');
        
        if (featuredImagePreview) featuredImagePreview.innerHTML = '';
        if (additionalImagesPreview) additionalImagesPreview.innerHTML = '';
        
        // Reset video URL fields
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
            
            // Set up event listeners
            const group = videoUrlContainer.querySelector('.video-url-group');
            setupVideoUrlGroupEvents(group, 0);
        }
    }
    
    // Add highlight and unhighlight classes to CSS
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .media-upload.highlight {
                border-color: var(--primary);
                background-color: rgba(32, 227, 178, 0.1);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public API
    return {
        init: function() {
            addStyles();
            init();
            
            // Initialize global variables
            window.featuredImageFile = null;
            window.additionalImageFiles = [];
            window.videoUrls = [{ url: '', title: '', description: '' }];
            
            return this;
        },
        getFormData: getFormData,
        resetFormData: resetFormData
    };
})();

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.uploadHandler.init();
});
