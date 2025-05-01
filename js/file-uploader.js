// file-uploader.js - Manages file uploads for the robotic hub

// Store for ongoing uploads
const uploadsInProgress = {};

// File uploader object
const FileUploader = {
    // Initialize file upload functionality
    init() {
        // Set up global delegated event listeners
        document.addEventListener('click', (event) => {
            // Check if a media upload button was clicked
            const uploadButton = event.target.closest('.media-upload');
            if (uploadButton) {
                const type = uploadButton.dataset.type || 'image';
                const multiple = uploadButton.dataset.multiple === 'true';
                const targetId = uploadButton.dataset.target;
                
                this.showFileSelector(type, multiple, targetId);
            }
        });
        
        return this;
    },
    
    // Show file selector dialog
    showFileSelector(type = 'image', multiple = false, targetId = null) {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = multiple;
        
        // Set accept attribute based on type
        switch (type) {
            case 'image':
                input.accept = 'image/*';
                break;
            case 'video':
                input.accept = 'video/*';
                break;
            case 'document':
                input.accept = '.pdf,.doc,.docx,.txt';
                break;
            default:
                input.accept = '*/*';
        }
        
        // Set up change event
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            
            if (files.length > 0) {
                this.handleFiles(files, type, targetId);
            }
        });
        
        // Trigger click
        input.click();
    },
    
    // Handle selected files
    handleFiles(files, type, targetId) {
        files.forEach(file => {
            // Generate unique ID for this upload
            const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            // Store upload info
            uploadsInProgress[uploadId] = {
                file,
                type,
                status: 'pending',
                progress: 0
            };
            
            // Show upload in UI if target is specified
            if (targetId) {
                this.showUploadPreview(uploadId, file, targetId);
            }
            
            // Process file
            this.processFile(uploadId, file, type, targetId);
        });
    },
    
    // Show upload preview in target element
    showUploadPreview(uploadId, file, targetId) {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        const previewItem = document.createElement('div');
        previewItem.className = 'upload-preview-item';
        previewItem.dataset.uploadId = uploadId;
        
        // Check file type
        if (file.type.startsWith('image/')) {
            // For images, create thumbnail
            const reader = new FileReader();
            reader.onload = function(e) {
                previewItem.innerHTML = `
                    <div class="upload-thumbnail">
                        <img src="${e.target.result}" alt="${file.name}">
                    </div>
                    <div class="upload-info">
                        <div class="upload-filename">${file.name}</div>
                        <div class="upload-progress-bar">
                            <div class="upload-progress" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="upload-actions">
                        <button class="upload-cancel" data-upload-id="${uploadId}">×</button>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            // For videos, show video icon
            previewItem.innerHTML = `
                <div class="upload-thumbnail video-thumbnail">
                    <i class="fas fa-video"></i>
                </div>
                <div class="upload-info">
                    <div class="upload-filename">${file.name}</div>
                    <div class="upload-progress-bar">
                        <div class="upload-progress" style="width: 0%"></div>
                    </div>
                </div>
                <div class="upload-actions">
                    <button class="upload-cancel" data-upload-id="${uploadId}">×</button>
                </div>
            `;
        } else {
            // For other files, show file icon
            previewItem.innerHTML = `
                <div class="upload-thumbnail file-thumbnail">
                    <i class="fas fa-file"></i>
                </div>
                <div class="upload-info">
                    <div class="upload-filename">${file.name}</div>
                    <div class="upload-progress-bar">
                        <div class="upload-progress" style="width: 0%"></div>
                    </div>
                </div>
                <div class="upload-actions">
                    <button class="upload-cancel" data-upload-id="${uploadId}">×</button>
                </div>
            `;
        }
        
        // Add to target
        targetElement.appendChild(previewItem);
        
        // Set up cancel button
        previewItem.querySelector('.upload-cancel').addEventListener('click', () => {
            this.cancelUpload(uploadId);
            targetElement.removeChild(previewItem);
        });
    },
    
    // Process file (read and store)
    processFile(uploadId, file, type, targetId) {
        const upload = uploadsInProgress[uploadId];
        if (!upload) return;
        
        // Update status
        upload.status = 'processing';
        this.updateUploadProgress(uploadId, 10);
        
        // Read file
        const reader = new FileReader();
        
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const progressPercent = Math.round((e.loaded / e.total) * 90) + 10;
                this.updateUploadProgress(uploadId, progressPercent);
            }
        };
        
        reader.onload = (e) => {
            const base64Data = e.target.result;
            
            // Store in DataManager
            upload.status = 'storing';
            this.updateUploadProgress(uploadId, 95);
            
            const mediaId = DataManager.storeMedia(file.name, file.type, base64Data);
            
            // Update status
            upload.status = 'complete';
            upload.mediaId = mediaId;
            this.updateUploadProgress(uploadId, 100);
            
            // Trigger complete callback
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    // Dispatch custom event
                    const event = new CustomEvent('fileUploaded', {
                        detail: {
                            uploadId,
                            mediaId,
                            file,
                            type,
                            base64Data
                        }
                    });
                    targetElement.dispatchEvent(event);
                }
            }
            
            // Clean up
            setTimeout(() => {
                this.finalizeUpload(uploadId, targetId);
            }, 1000);
        };
        
        reader.onerror = () => {
            upload.status = 'error';
            this.updateUploadProgress(uploadId, 0);
            
            // Show error in UI
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const previewItem = targetElement.querySelector(`.upload-preview-item[data-upload-id="${uploadId}"]`);
                if (previewItem) {
                    previewItem.querySelector('.upload-progress-bar').innerHTML = '<div class="upload-error">Failed to upload</div>';
                }
            }
        };
        
        // Start reading file
        reader.readAsDataURL(file);
    },
    
    // Update upload progress in UI
    updateUploadProgress(uploadId, percent) {
        const upload = uploadsInProgress[uploadId];
        if (!upload) return;
        
        upload.progress = percent;
        
        // Update UI if there's a preview
        const previewItem = document.querySelector(`.upload-preview-item[data-upload-id="${uploadId}"]`);
        if (previewItem) {
            const progressBar = previewItem.querySelector('.upload-progress');
            if (progressBar) {
                progressBar.style.width = `${percent}%`;
            }
        }
    },
    
    // Cancel upload
    cancelUpload(uploadId) {
        delete uploadsInProgress[uploadId];
    },
    
    // Finalize upload (convert preview to final state)
    finalizeUpload(uploadId, targetId) {
        const upload = uploadsInProgress[uploadId];
        if (!upload || upload.status !== 'complete') return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        const previewItem = targetElement.querySelector(`.upload-preview-item[data-upload-id="${uploadId}"]`);
        if (previewItem) {
            // Replace progress bar with success message
            const infoElement = previewItem.querySelector('.upload-info');
            if (infoElement) {
                infoElement.querySelector('.upload-progress-bar').outerHTML = '<div class="upload-success">Completed</div>';
            }
            
            // Store media ID in the element
            previewItem.dataset.mediaId = upload.mediaId;
        }
        
        // Clean up
        delete uploadsInProgress[uploadId];
    },
    
    // Get media ID from an upload
    getMediaId(uploadId) {
        const upload = uploadsInProgress[uploadId];
        return upload?.mediaId || null;
    },
    
    // Get all completed uploads for a target
    getCompletedUploads(targetId) {
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return [];
        
        const completedItems = targetElement.querySelectorAll('.upload-preview-item[data-media-id]');
        return Array.from(completedItems).map(item => ({
            mediaId: item.dataset.mediaId,
            uploadId: item.dataset.uploadId
        }));
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    FileUploader.init();
});

// Expose to global scope
window.FileUploader = FileUploader;
