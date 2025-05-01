// file-upload-handler.js - Utilities for handling file uploads in the admin dashboard

const FileUploadHandler = {
    // Store for uploaded files
    files: {
        featuredImage: null,
        additionalImages: [],
        videos: [],
        applicationImages: {}
    },
    
    // Clear the file storage
    clearAll() {
        this.files = {
            featuredImage: null,
            additionalImages: [],
            videos: [],
            applicationImages: {}
        };
    },
    
    // Initialize file upload components
    initializeUploadAreas() {
        // Find all upload areas with the data-upload-type attribute
        const uploadAreas = document.querySelectorAll('[data-upload-type]');
        
        uploadAreas.forEach(area => {
            const uploadType = area.dataset.uploadType;
            const previewContainer = document.querySelector(`[data-preview-for="${uploadType}"]`);
            
            if (!previewContainer) {
                console.error(`No preview container found for upload type: ${uploadType}`);
                return;
            }
            
            // Add click handler to upload area
            area.addEventListener('click', () => {
                this.handleFileUpload(uploadType, previewContainer);
            });
            
            // Add drag and drop functionality
            this.setupDragAndDrop(area, previewContainer, uploadType);
        });
    },
    
    // Set up drag and drop for upload areas
    setupDragAndDrop(dropArea, previewContainer, uploadType) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('highlight');
            });
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('highlight');
            });
        });
        
        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            // Handle the dropped files
            if (files.length > 0) {
                // Use the same handler as for click uploads
                this.processFiles(files, uploadType, previewContainer);
            }
        });
    },
    
    // Handle file upload via file input
    handleFileUpload(uploadType, previewContainer) {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        
        // Determine file type restrictions
        if (uploadType === 'videos') {
            input.accept = 'video/*';
        } else {
            input.accept = 'image/*';
        }
        
        // Allow multiple files for additional images
        if (uploadType === 'additionalImages') {
            input.multiple = true;
        }
        
        // Handle file selection
        input.addEventListener('change', () => {
            if (input.files && input.files.length > 0) {
                this.processFiles(input.files, uploadType, previewContainer);
            }
        });
        
        // Trigger file dialog
        input.click();
    },
    
    // Process selected files
    processFiles(files, uploadType, previewContainer) {
        // Different handling based on upload type
        if (uploadType === 'featuredImage') {
            // Only one featured image allowed
            this.processFile(files[0], uploadType, previewContainer);
        } else if (uploadType === 'additionalImages') {
            // Multiple additional images allowed
            Array.from(files).forEach(file => {
                this.processFile(file, uploadType, previewContainer);
            });
        } else if (uploadType === 'videos') {
            // Process videos
            Array.from(files).forEach(file => {
                if (file.type.startsWith('video/')) {
                    this.processFile(file, uploadType, previewContainer);
                } else {
                    this.showError('Please select a video file.');
                }
            });
        } else if (uploadType.startsWith('application-')) {
            // Extract application index from upload type
            const appIndex = uploadType.split('-')[1];
            this.processFile(files[0], uploadType, previewContainer, appIndex);
        }
    },
    
    // Process a single file
    processFile(file, uploadType, previewContainer, appIndex = null) {
        // Check file size
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            this.showError('File is too large. Maximum size is 50MB.');
            return;
        }
        
        // Read file as Data URL
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            };
            
            // Store file data based on type
            if (uploadType === 'featuredImage') {
                this.files.featuredImage = fileData;
                this.renderFeaturedImagePreview(previewContainer);
            } else if (uploadType === 'additionalImages') {
                this.files.additionalImages.push(fileData);
                this.renderAdditionalImagesPreview(previewContainer);
            } else if (uploadType === 'videos') {
                this.files.videos.push(fileData);
                this.renderVideosPreview(previewContainer);
            } else if (uploadType.startsWith('application-')) {
                this.files.applicationImages[appIndex] = fileData;
                this.renderApplicationImagePreview(previewContainer, appIndex);
            }
        };
        
        reader.onerror = () => {
            this.showError('Error reading file.');
        };
        
        reader.readAsDataURL(file);
    },
    
    // Render featured image preview
    renderFeaturedImagePreview(container) {
        if (!this.files.featuredImage) {
            container.innerHTML = '';
            return;
        }
        
        container.innerHTML = `
            <div class="media-item">
                <img src="${this.files.featuredImage.data}" alt="${this.files.featuredImage.name}">
                <div class="media-remove" data-type="featured">&times;</div>
            </div>
        `;
        
        // Add click handler to remove button
        container.querySelector('.media-remove').addEventListener('click', () => {
            this.files.featuredImage = null;
            container.innerHTML = '';
        });
    },
    
    // Render additional images preview
    renderAdditionalImagesPreview(container) {
        container.innerHTML = '';
        
        this.files.additionalImages.forEach((image, index) => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.index = index;
            
            mediaItem.innerHTML = `
                <img src="${image.data}" alt="${image.name}">
                <div class="media-remove" data-type="additional" data-index="${index}">&times;</div>
            `;
            
            container.appendChild(mediaItem);
            
            // Add click handler to remove button
            mediaItem.querySelector('.media-remove').addEventListener('click', () => {
                this.files.additionalImages.splice(index, 1);
                this.renderAdditionalImagesPreview(container);
            });
        });
    },
    
    // Render videos preview
    renderVideosPreview(container) {
        container.innerHTML = '';
        
        this.files.videos.forEach((video, index) => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.index = index;
            
            mediaItem.innerHTML = `
                <img src="images/video-placeholder.jpg" alt="${video.name}">
                <div class="media-remove" data-type="video" data-index="${index}">&times;</div>
                <div class="media-label">${video.name}</div>
            `;
            
            // Style the label
            const label = mediaItem.querySelector('.media-label');
            label.style.position = 'absolute';
            label.style.bottom = '0';
            label.style.left = '0';
            label.style.right = '0';
            label.style.background = 'rgba(0,0,0,0.7)';
            label.style.color = 'white';
            label.style.padding = '5px';
            label.style.fontSize = '10px';
            label.style.whiteSpace = 'nowrap';
            label.style.overflow = 'hidden';
            label.style.textOverflow = 'ellipsis';
            
            container.appendChild(mediaItem);
            
            // Add click handler to remove button
            mediaItem.querySelector('.media-remove').addEventListener('click', () => {
                this.files.videos.splice(index, 1);
                this.renderVideosPreview(container);
            });
        });
    },
    
    // Render application image preview
    renderApplicationImagePreview(container, appIndex) {
        if (!this.files.applicationImages[appIndex]) {
            container.innerHTML = '';
            return;
        }
        
        const image = this.files.applicationImages[appIndex];
        
        container.innerHTML = `
            <div class="media-item">
                <img src="${image.data}" alt="${image.name}">
                <div class="media-remove" data-type="application" data-index="${appIndex}">&times;</div>
            </div>
        `;
        
        // Add click handler to remove button
        container.querySelector('.media-remove').addEventListener('click', () => {
            delete this.files.applicationImages[appIndex];
            container.innerHTML = '';
        });
    },
    
    // Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'upload-error';
        errorDiv.textContent = message;
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.padding = '15px 20px';
        errorDiv.style.backgroundColor = 'rgba(255, 107, 107, 0.95)';
        errorDiv.style.color = 'white';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '2000';
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 3000);
    },
    
    // Get all uploaded files and store in DataManager
    saveFilesToDataManager() {
        const mediaIds = {
            featuredImage: null,
            additionalImages: [],
            videos: [],
            applicationImages: {}
        };
        
        // Process featured image
        if (this.files.featuredImage) {
            mediaIds.featuredImage = DataManager.storeMedia(
                this.files.featuredImage.name,
                this.files.featuredImage.type,
                this.files.featuredImage.data
            );
        }
        
        // Process additional images
        this.files.additionalImages.forEach(image => {
            const mediaId = DataManager.storeMedia(
                image.name,
                image.type,
                image.data
            );
            mediaIds.additionalImages.push(mediaId);
        });
        
        // Process videos
        this.files.videos.forEach(video => {
            const mediaId = DataManager.storeMedia(
                video.name,
                video.type,
                video.data
            );
            mediaIds.videos.push(mediaId);
        });
        
        // Process application images
        for (const [index, image] of Object.entries(this.files.applicationImages)) {
            const mediaId = DataManager.storeMedia(
                image.name,
                image.type,
                image.data
            );
            mediaIds.applicationImages[index] = mediaId;
        }
        
        return mediaIds;
    }
};

// Add CSS for file upload areas
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        /* File Upload Area Styles */
        [data-upload-type] {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        [data-upload-type]:hover, [data-upload-type].highlight {
            border-color: var(--primary);
            background-color: rgba(32, 227, 178, 0.05);
        }
        
        .media-item {
            position: relative;
            border-radius: 5px;
            overflow: hidden;
            height: 100px;
        }
        
        .media-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .media-remove {
            position: absolute;
            top: 5px;
            right: 5px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.8rem;
            z-index: 10;
        }
    `;
    document.head.appendChild(style);
});
