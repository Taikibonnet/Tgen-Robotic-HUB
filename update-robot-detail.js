/**
 * Updated Robot Detail Integration
 * This file enhances the robot detail page functionality
 */

// Global variable to store the current robot
let currentRobot = null;
let galleryImages = [];
let currentImageIndex = 0;

// Function to initialize the edit functionality
function initializeEditFunctionality() {
    // Check if the edit button exists
    const editBtn = document.getElementById('edit-robot-btn');
    if (!editBtn) return;
    
    // Add event listener to the edit button
    editBtn.addEventListener('click', function() {
        if (!currentRobot) {
            alert('Error: No robot data available.');
            return;
        }
        
        // Redirect to the admin form page with the robot ID
        window.location.href = `admin-form.html?id=${currentRobot.id}`;
    });
    
    // Get the delete button
    const deleteBtn = document.getElementById('delete-robot-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (!currentRobot) {
                alert('Error: No robot data available.');
                return;
            }
            
            if (confirm(`Are you sure you want to delete ${currentRobot.name}? This action cannot be undone.`)) {
                deleteRobot(currentRobot.id);
            }
        });
    }
}

// Function to delete a robot
async function deleteRobot(robotId) {
    // Use GitHub storage to delete the robot
    if (window.githubStorage && typeof window.githubStorage.deleteRobotAndSave === 'function') {
        const success = await window.githubStorage.deleteRobotAndSave(robotId);
        
        if (success) {
            alert('Robot deleted successfully!');
            // Redirect to the encyclopedia page
            window.location.href = 'encyclopedia.html';
        } else {
            alert('Error deleting robot. Please try again.');
        }
    } else if (window.robotStorage && typeof window.robotStorage.deleteRobotAndSave === 'function') {
        // Fall back to robotStorage if githubStorage is not available
        const success = await window.robotStorage.deleteRobotAndSave(robotId);
        
        if (success) {
            alert('Robot deleted successfully!');
            // Redirect to the encyclopedia page
            window.location.href = 'encyclopedia.html';
        } else {
            alert('Error deleting robot. Please try again.');
        }
    } else {
        alert('Error: Storage adapter not available.');
    }
}

// Function to check if the user is an admin
function checkAdminStatus() {
    // Get admin actions container
    const adminActions = document.getElementById('admin-actions');
    if (!adminActions) return;
    
    // Check if user is logged in and is an admin
    const user = window.tgenApp?.getCurrentUser ? window.tgenApp.getCurrentUser() : null;
    const isAdmin = user && user.role === 'admin';
    
    // Show admin controls only to admin users
    adminActions.style.display = isAdmin ? 'block' : 'none';
    
    // Add edit functionality if user is admin
    if (isAdmin) {
        initializeEditFunctionality();
    }
}

// Function to display robot details
function displayRobotDetails() {
    if (!currentRobot) return;
    
    const detailsContainer = document.getElementById('robot-detail-content');
    
    // Clear the container
    detailsContainer.innerHTML = '';
    
    // Create the detail content
    const detailContent = document.createElement('div');
    
    // Header section
    detailContent.innerHTML = `
        <div class="robot-detail-header">
            <h1 class="robot-title">${currentRobot.name}</h1>
            
            <div class="robot-meta">
                <div class="meta-item">
                    <i class="fas fa-industry"></i>
                    <span>${currentRobot.manufacturer?.name || 'Unknown Manufacturer'}</span>
                </div>
                
                ${currentRobot.manufacturer?.country ? `
                    <div class="meta-item">
                        <i class="fas fa-globe"></i>
                        <span>${currentRobot.manufacturer.country}</span>
                    </div>
                ` : ''}
                
                ${currentRobot.yearIntroduced ? `
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Introduced: ${currentRobot.yearIntroduced}</span>
                    </div>
                ` : ''}
            </div>
            
            <p class="robot-summary">${currentRobot.summary}</p>
        </div>
    `;
    
    // Main image
    let mainImageUrl = 'images/robot-placeholder.jpg';
    if (currentRobot.media) {
        if (currentRobot.media.featuredImage) {
            if (typeof currentRobot.media.featuredImage === 'string') {
                mainImageUrl = currentRobot.media.featuredImage;
            } else if (currentRobot.media.featuredImage.url) {
                mainImageUrl = currentRobot.media.featuredImage.url;
            }
        } else if (currentRobot.media.images && currentRobot.media.images.length > 0) {
            if (typeof currentRobot.media.images[0] === 'string') {
                mainImageUrl = currentRobot.media.images[0];
            } else if (currentRobot.media.images[0].url) {
                mainImageUrl = currentRobot.media.images[0].url;
            }
        }
    }
    
    detailContent.innerHTML += `
        <div class="robot-main-image">
            <img src="${mainImageUrl}" alt="${currentRobot.name}" onerror="this.src='images/robot-placeholder.jpg'">
        </div>
    `;
    
    // Content tabs
    detailContent.innerHTML += `
        <div class="content-tabs">
            <div class="content-tab active" data-tab="details">Details</div>
            <div class="content-tab" data-tab="specs">Specifications</div>
            <div class="content-tab" data-tab="media">Media Gallery</div>
        </div>
    `;
    
    // Tab content - Details
    detailContent.innerHTML += `
        <div class="tab-content active" id="tab-details">
            <h2 class="section-title">Description</h2>
            <div class="description">${currentRobot.description || 'No detailed description available.'}</div>
            
            ${currentRobot.manufacturer?.website ? `
                <div class="manufacturer-info">
                    <h2 class="section-title">Manufacturer Information</h2>
                    <p><a href="${currentRobot.manufacturer.website}" target="_blank">${currentRobot.manufacturer.name} Website</a></p>
                </div>
            ` : ''}
        </div>
    `;
    
    // Tab content - Specifications
    let specsContent = `
        <div class="tab-content" id="tab-specs">
            <h2 class="section-title">Technical Specifications</h2>
    `;
    
    // Check if we have specifications
    if (currentRobot.specifications) {
        specsContent += '<div class="specs-grid">';
        
        // Physical specs
        if (currentRobot.specifications.physical) {
            if (currentRobot.specifications.physical.height && currentRobot.specifications.physical.height.value) {
                specsContent += `
                    <div class="spec-item">
                        <div class="spec-label">Height</div>
                        <div class="spec-value">${currentRobot.specifications.physical.height.value} ${currentRobot.specifications.physical.height.unit || ''}</div>
                    </div>
                `;
            }
            
            if (currentRobot.specifications.physical.weight && currentRobot.specifications.physical.weight.value) {
                specsContent += `
                    <div class="spec-item">
                        <div class="spec-label">Weight</div>
                        <div class="spec-value">${currentRobot.specifications.physical.weight.value} ${currentRobot.specifications.physical.weight.unit || ''}</div>
                    </div>
                `;
            }
        }
        
        // Performance specs
        if (currentRobot.specifications.performance) {
            if (currentRobot.specifications.performance.speed && currentRobot.specifications.performance.speed.value) {
                specsContent += `
                    <div class="spec-item">
                        <div class="spec-label">Max Speed</div>
                        <div class="spec-value">${currentRobot.specifications.performance.speed.value} ${currentRobot.specifications.performance.speed.unit || ''}</div>
                    </div>
                `;
            }
            
            if (currentRobot.specifications.performance.batteryRuntime) {
                specsContent += `
                    <div class="spec-item">
                        <div class="spec-label">Battery Runtime</div>
                        <div class="spec-value">${currentRobot.specifications.performance.batteryRuntime} minutes</div>
                    </div>
                `;
            }
        }
        
        specsContent += '</div>';
    } else {
        specsContent += '<p>No detailed specifications available.</p>';
    }
    
    specsContent += '</div>';
    detailContent.innerHTML += specsContent;
    
    // Tab content - Media Gallery
    let mediaContent = `
        <div class="tab-content" id="tab-media">
    `;
    
    // Image gallery
    if (currentRobot.media && currentRobot.media.images && currentRobot.media.images.length > 0) {
        mediaContent += `
            <h2 class="section-title">Image Gallery</h2>
            <div class="gallery" id="image-gallery">
        `;
        
        // Store gallery images for the modal
        galleryImages = [];
        
        currentRobot.media.images.forEach((image, index) => {
            const imageUrl = typeof image === 'string' ? image : image.url;
            const imageAlt = typeof image === 'string' ? currentRobot.name : (image.alt || currentRobot.name);
            const imageCaption = typeof image === 'string' ? '' : (image.caption || '');
            
            if (imageUrl) {
                galleryImages.push({
                    url: imageUrl,
                    alt: imageAlt,
                    caption: imageCaption
                });
                
                mediaContent += `
                    <div class="gallery-item" data-index="${index}">
                        <img src="${imageUrl}" alt="${imageAlt}" onerror="this.src='images/robot-placeholder.jpg'">
                        ${imageCaption ? `<div class="gallery-caption">${imageCaption}</div>` : ''}
                    </div>
                `;
            }
        });
        
        mediaContent += '</div>';
    }
    
    // Videos
    if (currentRobot.media && currentRobot.media.videos && currentRobot.media.videos.length > 0) {
        mediaContent += `
            <h2 class="section-title">Videos</h2>
        `;
        
        currentRobot.media.videos.forEach(video => {
            mediaContent += `<div class="video-section">`;
            
            // Different handling based on video type
            if (video.type === 'youtube' || 
                (video.type === 'url' && video.url && video.url.includes('youtube.com'))) {
                
                const youtubeId = extractYouTubeId(video.url);
                if (youtubeId) {
                    mediaContent += `
                        <div class="video-container">
                            <iframe 
                                src="https://www.youtube.com/embed/${youtubeId}" 
                                title="${video.title || 'YouTube video'}"
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    `;
                }
            } else if (video.type === 'mp4' || video.type === 'file') {
                mediaContent += `
                    <div class="video-container">
                        <video controls>
                            <source src="${video.url}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            } else if (video.type === 'external' || video.type === 'url') {
                mediaContent += `
                    <div class="video-link">
                        <a href="${video.url}" target="_blank" class="btn">
                            <i class="fas fa-external-link-alt"></i> 
                            ${video.title || 'Watch Video'}
                        </a>
                    </div>
                `;
            }
            
            // Video title and description
            if (video.title) {
                mediaContent += `<h3 class="video-title">${video.title}</h3>`;
            }
            
            if (video.description) {
                mediaContent += `<p class="video-description">${video.description}</p>`;
            }
            
            mediaContent += `</div>`;
        });
    }
    
    mediaContent += '</div>';
    detailContent.innerHTML += mediaContent;
    
    // Add the detail content to the container
    detailsContainer.appendChild(detailContent);
    
    // Set up tab switching
    setupTabs();
    
    // Setup gallery click handlers
    setupGalleryClicks();
}

// Function to load robot details
function loadRobotDetails() {
    // Get the robot slug from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const robotSlug = urlParams.get('slug') || urlParams.get('id');
    
    if (!robotSlug) {
        showError('Robot not found');
        return;
    }
    
    // Get the robot from the data
    currentRobot = window.robotsData.getRobotBySlug(robotSlug) || window.robotsData.getRobotById(robotSlug);
    
    if (!currentRobot) {
        showError('Robot not found');
        return;
    }
    
    // Update document title
    document.title = `${currentRobot.name} - Tgen Robotics Hub`;
    
    // Update breadcrumb
    const breadcrumbElem = document.getElementById('robot-name-breadcrumb');
    if (breadcrumbElem) {
        breadcrumbElem.textContent = currentRobot.name;
    }
    
    // Display the robot details
    displayRobotDetails();
    
    // Load related robots
    loadRelatedRobots();
    
    // Update view count
    updateViewCount();
    
    // Check admin status
    checkAdminStatus();
}

// Function to load related robots
function loadRelatedRobots() {
    // Get related robots
    const relatedRobots = window.robotsData.getRelatedRobots(currentRobot.slug || currentRobot.id, 3);
    
    // Get the container
    const relatedRobotsContainer = document.getElementById('related-robots');
    if (!relatedRobotsContainer) return;
    
    // Clear the container
    relatedRobotsContainer.innerHTML = '';
    
    // If no related robots, hide the section
    if (!relatedRobots || relatedRobots.length === 0) {
        const relatedSection = relatedRobotsContainer.closest('.related-robots');
        if (relatedSection) {
            relatedSection.style.display = 'none';
        }
        return;
    }
    
    // Add robots to the grid
    relatedRobots.forEach(robot => {
        const card = document.createElement('div');
        card.className = 'robot-card';
        card.dataset.slug = robot.slug || robot.id;
        
        // Use a placeholder image if no featured image is available
        let imageUrl = 'images/robot-placeholder.jpg';
        if (robot.media) {
            if (robot.media.featuredImage) {
                if (typeof robot.media.featuredImage === 'string') {
                    imageUrl = robot.media.featuredImage;
                } else if (robot.media.featuredImage.url) {
                    imageUrl = robot.media.featuredImage.url;
                }
            } else if (robot.media.images && robot.media.images.length > 0) {
                if (typeof robot.media.images[0] === 'string') {
                    imageUrl = robot.media.images[0];
                } else if (robot.media.images[0].url) {
                    imageUrl = robot.media.images[0].url;
                }
            }
        }
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${robot.name}" class="robot-image" onerror="this.src='images/robot-placeholder.jpg'">
            <div class="robot-content">
                <h3 class="robot-title">${robot.name || 'Unnamed Robot'}</h3>
                <p class="robot-desc">${robot.summary || 'No description available.'}</p>
                <div class="robot-meta">
                    <span>${robot.manufacturer?.name || 'Unknown Manufacturer'}</span>
                </div>
            </div>
        `;
        
        // Add click event
        card.addEventListener('click', () => {
            window.location.href = `robot-detail.html?slug=${robot.slug || robot.id}`;
        });
        
        relatedRobotsContainer.appendChild(card);
    });
    
    // Show the section
    const relatedSection = relatedRobotsContainer.closest('.related-robots');
    if (relatedSection) {
        relatedSection.style.display = 'block';
    }
}

// Extract YouTube video ID from URL
function extractYouTubeId(url) {
    if (!url) return null;
    
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/)|(youtu\.be\/))([^"?&\/\s]{11})/i;
    const match = url.match(regex);
    
    return match ? match[2] : null;
}

// Set up content tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.content-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Get the tab ID
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and tab contents
            document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and its content
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
}

// Setup gallery image clicks
function setupGalleryClicks() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Get the image index
            const index = parseInt(this.getAttribute('data-index'));
            
            // Open the modal with this image
            openGalleryModal(index);
        });
    });
}

// Open gallery modal
function openGalleryModal(index) {
    const modal = document.getElementById('gallery-modal');
    
    if (!modal || !galleryImages || galleryImages.length === 0) return;
    
    // Show the image
    showGalleryImage(index);
    
    // Show the modal
    modal.classList.add('active');
}

// Show gallery image
function showGalleryImage(index) {
    if (!galleryImages || galleryImages.length === 0) return;
    
    // Handle index bounds
    if (index < 0) {
        index = galleryImages.length - 1;
    } else if (index >= galleryImages.length) {
        index = 0;
    }
    
    // Set current index
    currentImageIndex = index;
    
    // Update modal content
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    
    if (modalImage && modalCaption) {
        // Set the image
        modalImage.innerHTML = `<img src="${galleryImages[index].url}" alt="${galleryImages[index].alt || currentRobot.name}" onerror="this.src='images/robot-placeholder.jpg'">`;
        
        // Set the caption
        modalCaption.textContent = galleryImages[index].caption || '';
    }
}

// Update view count
function updateViewCount() {
    if (!currentRobot) return;
    
    // Initialize stats if not exists
    if (!currentRobot.stats) {
        currentRobot.stats = { views: 0, favorites: 0 };
    }
    
    // Increment view count
    currentRobot.stats.views = (currentRobot.stats.views || 0) + 1;
    
    // Save changes
    if (window.githubStorage && typeof window.githubStorage.updateRobotAndSave === 'function') {
        window.githubStorage.updateRobotAndSave(currentRobot.id, currentRobot);
    } else if (window.robotStorage && typeof window.robotStorage.updateRobotAndSave === 'function') {
        window.robotStorage.updateRobotAndSave(currentRobot.id, currentRobot);
    }
}

// Show error message
function showError(message) {
    const detailsContainer = document.getElementById('robot-detail-content');
    
    // Clear the container
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 50px 20px;">
                <div style="font-size: 4rem; color: var(--gray); margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="font-size: 1.8rem; margin-bottom: 10px;">Error</h2>
                <p style="color: var(--gray); max-width: 500px; margin: 0 auto 20px;">${message}</p>
                <a href="encyclopedia.html" class="btn btn-primary">Back to Encyclopedia</a>
            </div>
        `;
    }
    
    // Hide related robots
    const relatedSection = document.querySelector('.related-robots');
    if (relatedSection) {
        relatedSection.style.display = 'none';
    }
    
    // Hide admin actions
    const adminActions = document.getElementById('admin-actions');
    if (adminActions) {
        adminActions.style.display = 'none';
    }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure robotsData exists
    if (!window.robotsData) {
        console.warn('Robot Detail: robotsData not found, initializing empty one');
        window.robotsData = {
            robots: [],
            categories: [],
            lastUpdated: new Date().toISOString(),
            
            getRobotBySlug: function(slug) {
                return this.robots.find(robot => robot.slug === slug);
            },
            
            getRobotById: function(id) {
                const numId = parseInt(id);
                return this.robots.find(robot => 
                    robot.id === numId || robot.id === id || robot.slug === id
                );
            }
        };
    }
    
    // Initialize storage
    if (window.githubStorage && typeof window.githubStorage.init === 'function') {
        window.githubStorage.init().then(() => {
            loadRobotDetails();
        });
    } else if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init().then(() => {
            loadRobotDetails();
        });
    } else {
        console.warn('Robot Detail: No storage adapter found, loading directly');
        loadRobotDetails();
    }
    
    // Setup gallery modal navigation
    setupGalleryModal();
});

// Setup gallery modal
function setupGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    const closeBtn = document.getElementById('modal-close');
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');
    
    if (!modal) return;
    
    // Close modal on close button click
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    }
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Previous image button
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showGalleryImage(currentImageIndex - 1);
        });
    }
    
    // Next image button
    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showGalleryImage(currentImageIndex + 1);
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!modal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            modal.classList.remove('active');
        } else if (e.key === 'ArrowLeft') {
            showGalleryImage(currentImageIndex - 1);
        } else if (e.key === 'ArrowRight') {
            showGalleryImage(currentImageIndex + 1);
        }
    });
}
