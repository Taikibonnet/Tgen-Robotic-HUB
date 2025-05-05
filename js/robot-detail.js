/**
 * Robot Detail functionality for Tgen Robotics Hub
 * This script manages the robot detail page and ensures it loads robot data from localStorage
 */

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the storage adapter
    if (window.robotStorage && typeof window.robotStorage.init === 'function') {
        window.robotStorage.init();
    }
    
    // Get robot slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const robotSlug = urlParams.get('slug');
    
    if (!robotSlug) {
        window.location.href = 'encyclopedia.html';
        return;
    }
    
    // Get robot data
    const robot = window.robotsData.getRobotBySlug(robotSlug);
    
    if (!robot) {
        window.location.href = 'encyclopedia.html';
        return;
    }
    
    // Populate robot data
    populateRobotData(robot);
    
    // Set up tabs
    const tabs = document.querySelectorAll('.robot-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
    });
    
    // Favorite button functionality
    const favoriteBtn = document.getElementById('favorite-btn');
    favoriteBtn.addEventListener('click', function() {
        // In a real application, this would send a request to the server
        // For this demo, we'll just toggle the button state
        if (this.classList.contains('favorited')) {
            this.classList.remove('favorited');
            this.innerHTML = '<i class="far fa-heart"></i><span>Add to Favorites</span>';
            
            // Decrement favorite count
            const favoriteCount = document.getElementById('favorite-count');
            favoriteCount.textContent = parseInt(favoriteCount.textContent) - 1;
        } else {
            this.classList.add('favorited');
            this.innerHTML = '<i class="fas fa-heart"></i><span>Favorited</span>';
            
            // Increment favorite count
            const favoriteCount = document.getElementById('favorite-count');
            favoriteCount.textContent = parseInt(favoriteCount.textContent) + 1;
        }
    });
    
    // Share button functionality
    const shareBtn = document.getElementById('share-btn');
    shareBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: robot.name,
                text: robot.summary,
                url: window.location.href
            })
            .catch(error => console.log('Error sharing:', error));
        } else {
            // Fallback for browsers that don't support the Web Share API
            prompt('Copy this URL to share:', window.location.href);
        }
    });
    
    // Review form functionality
    const reviewForm = document.getElementById('review-form');
    const ratingStars = document.querySelectorAll('.rating-star');
    let selectedRating = 0;
    
    // Rating star functionality
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            selectedRating = rating;
            
            // Update stars UI
            ratingStars.forEach((s, index) => {
                const starIcon = s.querySelector('i');
                if (index < rating) {
                    starIcon.className = 'fas fa-star';
                    s.classList.add('active');
                } else {
                    starIcon.className = 'far fa-star';
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Review form submission
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (selectedRating === 0) {
                alert('Please select a rating');
                return;
            }
            
            const reviewTitle = document.getElementById('review-title').value;
            const reviewContent = document.getElementById('review-content').value;
            
            if (!reviewTitle || !reviewContent) {
                alert('Please fill out all fields');
                return;
            }
            
            // In a real application, this would send the review to the server
            // For this demo, we'll just add it to the page
            addReview({
                user: {
                    name: 'You',
                    avatar: 'images/avatars/default.jpg'
                },
                rating: selectedRating,
                title: reviewTitle,
                content: reviewContent,
                date: new Date().toISOString()
            });
            
            // Reset form
            reviewForm.reset();
            selectedRating = 0;
            ratingStars.forEach(s => {
                s.classList.remove('active');
                s.querySelector('i').className = 'far fa-star';
            });
            
            // Show success message
            alert('Review submitted successfully!');
        });
    }
});

/**
 * Populate the robot detail page with robot data
 */
function populateRobotData(robot) {
    // Set page title
    document.title = `${robot.name} - Tgen Robotics Hub`;
    
    // Basic info
    document.getElementById('robot-name').textContent = robot.name;
    document.getElementById('manufacturer-name').textContent = robot.manufacturer.name;
    document.getElementById('manufacturer-website').href = robot.manufacturer.website || '#';
    document.getElementById('robot-summary').textContent = robot.summary;
    document.getElementById('year-introduced').textContent = robot.yearIntroduced || 'N/A';
    document.getElementById('view-count').textContent = robot.stats?.views || 0;
    document.getElementById('favorite-count').textContent = robot.stats?.favorites || 0;
    
    // Featured image
    const featuredImage = document.getElementById('featured-image');
    featuredImage.src = robot.media?.featuredImage?.url || 'images/robot-placeholder.jpg';
    featuredImage.alt = robot.media?.featuredImage?.alt || robot.name;
    
    // Description
    document.getElementById('robot-description').innerHTML = robot.description || '<p>No description available.</p>';
    
    // Specifications
    populateSpecifications(robot);
    
    // Gallery
    populateGallery(robot);
    
    // Applications
    populateApplications(robot);
    
    // Reviews
    populateReviews(robot);
    
    // Related robots
    populateRelatedRobots(robot);
}

/**
 * Populate the specifications tab
 */
function populateSpecifications(robot) {
    const specs = robot.specifications || {};
    
    // Physical specifications
    const physicalSpecs = document.getElementById('physical-specs');
    physicalSpecs.innerHTML = '';
    
    if (specs.physical) {
        // Height
        if (specs.physical.height && specs.physical.height.value) {
            addSpecCard(physicalSpecs, 'Height', specs.physical.height.value, specs.physical.height.unit, 'fas fa-arrows-alt-v');
        }
        
        // Weight
        if (specs.physical.weight && specs.physical.weight.value) {
            addSpecCard(physicalSpecs, 'Weight', specs.physical.weight.value, specs.physical.weight.unit, 'fas fa-weight-hanging');
        }
        
        // Payload
        if (specs.physical.payload && specs.physical.payload.value) {
            addSpecCard(physicalSpecs, 'Payload Capacity', specs.physical.payload.value, specs.physical.payload.unit, 'fas fa-box');
        }
        
        // Max deadlift
        if (specs.physical.maxDeadlift && specs.physical.maxDeadlift.value) {
            addSpecCard(physicalSpecs, 'Maximum Deadlift', specs.physical.maxDeadlift.value, specs.physical.maxDeadlift.unit, 'fas fa-dumbbell');
        }
    }
    
    // If no physical specs, hide the section
    if (physicalSpecs.innerHTML === '') {
        document.querySelector('.spec-section:nth-child(1)').style.display = 'none';
    }
    
    // Performance specifications
    const performanceSpecs = document.getElementById('performance-specs');
    performanceSpecs.innerHTML = '';
    
    if (specs.performance) {
        // Battery runtime
        if (specs.performance.battery && specs.performance.battery.runtime) {
            addSpecCard(performanceSpecs, 'Battery Runtime', specs.performance.battery.runtime, 'minutes', 'fas fa-battery-full');
        }
        
        // Maximum speed
        if (specs.performance.speed && specs.performance.speed.value) {
            addSpecCard(performanceSpecs, 'Maximum Speed', specs.performance.speed.value, specs.performance.speed.unit, 'fas fa-tachometer-alt');
        }
        
        // Degrees of freedom
        if (specs.performance.degreesOfFreedom) {
            addSpecCard(performanceSpecs, 'Degrees of Freedom', specs.performance.degreesOfFreedom, '', 'fas fa-sync');
        }
    }
    
    // If no performance specs, hide the section
    if (performanceSpecs.innerHTML === '') {
        document.querySelector('.spec-section:nth-child(2)').style.display = 'none';
    }
    
    // Hardware specifications
    const hardwareSpecs = document.getElementById('hardware-specs');
    hardwareSpecs.innerHTML = '';
    
    // Sensors
    if (specs.sensors && specs.sensors.length > 0) {
        const sensorTypes = specs.sensors.map(sensor => sensor.type).join(', ');
        addSpecCard(hardwareSpecs, 'Sensors', sensorTypes, '', 'fas fa-eye');
    }
    
    // Connectivity
    if (specs.connectivity && specs.connectivity.length > 0) {
        const connectivityTypes = Array.isArray(specs.connectivity) 
            ? specs.connectivity.join(', ')
            : specs.connectivity;
        addSpecCard(hardwareSpecs, 'Connectivity', connectivityTypes, '', 'fas fa-wifi');
    }
    
    // If no hardware specs, hide the section
    if (hardwareSpecs.innerHTML === '') {
        document.querySelector('.spec-section:nth-child(3)').style.display = 'none';
    }
    
    // Custom specifications
    const customSpecs = document.getElementById('custom-specs');
    customSpecs.innerHTML = '';
    
    if (specs.customFields && specs.customFields.length > 0) {
        specs.customFields.forEach(field => {
            addSpecCard(customSpecs, field.name, field.value, field.unit, 'fas fa-cog');
        });
        
        document.getElementById('custom-specs-section').style.display = 'block';
    } else {
        document.getElementById('custom-specs-section').style.display = 'none';
    }
}

/**
 * Add a specification card to the container
 */
function addSpecCard(container, title, value, unit, iconClass) {
    const card = document.createElement('div');
    card.className = 'spec-card';
    
    card.innerHTML = `
        <div class="spec-title">
            <i class="${iconClass}"></i>
            <span>${title}</span>
        </div>
        <div class="spec-value">${value}</div>
        ${unit ? `<div class="spec-unit">${unit}</div>` : ''}
    `;
    
    container.appendChild(card);
}

/**
 * Populate the gallery tab
 */
function populateGallery(robot) {
    const gallery = document.getElementById('robot-gallery');
    gallery.innerHTML = '';
    
    if (robot.media && robot.media.images && robot.media.images.length > 0) {
        robot.media.images.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            
            galleryItem.innerHTML = `
                <img src="${image.url}" alt="${image.alt || robot.name}" class="gallery-image">
                ${image.caption ? `<div class="gallery-caption">${image.caption}</div>` : ''}
            `;
            
            gallery.appendChild(galleryItem);
        });
    } else {
        gallery.innerHTML = '<p>No additional images available.</p>';
    }
}

/**
 * Populate the applications tab
 */
function populateApplications(robot) {
    const applicationsGrid = document.getElementById('applications-grid');
    applicationsGrid.innerHTML = '';
    
    if (robot.applications && robot.applications.length > 0) {
        robot.applications.forEach(app => {
            const appCard = document.createElement('div');
            appCard.className = 'application-card';
            
            appCard.innerHTML = `
                ${app.image ? `<img src="${app.image}" alt="${app.title}" class="application-image">` : ''}
                <div class="application-content">
                    <h3 class="application-title">${app.title}</h3>
                    <p class="application-description">${app.description}</p>
                </div>
            `;
            
            applicationsGrid.appendChild(appCard);
        });
    } else {
        applicationsGrid.innerHTML = '<p>No applications specified for this robot.</p>';
    }
}

/**
 * Populate the reviews tab
 */
function populateReviews(robot) {
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';
    
    if (robot.reviews && robot.reviews.length > 0) {
        robot.reviews.forEach(review => {
            addReview(review);
        });
    } else {
        reviewList.innerHTML = '<p>No reviews yet. Be the first to review this robot!</p>';
    }
}

/**
 * Add a review to the reviews list
 */
function addReview(review) {
    const reviewList = document.getElementById('review-list');
    
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    // Format date
    const date = new Date(review.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Generate star rating
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= review.rating) {
            starsHTML += '<i class="fas fa-star"></i>';
        } else {
            starsHTML += '<i class="far fa-star"></i>';
        }
    }
    
    reviewCard.innerHTML = `
        <div class="review-header">
            <img src="${review.user.avatar}" alt="${review.user.name}" class="reviewer-avatar">
            <div class="review-info">
                <div class="reviewer-name">${review.user.name}</div>
                <div class="review-date">${formattedDate}</div>
            </div>
        </div>
        <div class="review-rating">
            ${starsHTML}
        </div>
        ${review.title ? `<h4 class="review-title">${review.title}</h4>` : ''}
        <div class="review-content">${review.content}</div>
    `;
    
    reviewList.insertBefore(reviewCard, reviewList.firstChild);
}

/**
 * Populate the related robots section
 */
function populateRelatedRobots(robot) {
    const relatedRobotsGrid = document.getElementById('related-robots-grid');
    relatedRobotsGrid.innerHTML = '';
    
    // Get related robots
    const relatedRobots = window.robotsData.getRelatedRobots ? 
                          window.robotsData.getRelatedRobots(robot.id) : [];
    
    if (relatedRobots && relatedRobots.length > 0) {
        relatedRobots.forEach(relatedRobot => {
            // Create robot card (similar to encyclopedia.html)
            const robotCard = document.createElement('div');
            robotCard.className = 'robot-card';
            robotCard.dataset.slug = relatedRobot.slug;
            
            // Use a placeholder image if no featured image is available
            const imageUrl = relatedRobot.media?.featuredImage?.url || 'images/robot-placeholder.jpg';
            
            robotCard.innerHTML = `
                <img src="${imageUrl}" alt="${relatedRobot.media?.featuredImage?.alt || relatedRobot.name}" class="robot-image">
                <div class="robot-content">
                    <h3 class="robot-title">${relatedRobot.name}</h3>
                    <p class="robot-desc">${relatedRobot.summary}</p>
                    <div class="robot-meta">
                        <span>${relatedRobot.manufacturer.name}</span>
                    </div>
                </div>
            `;
            
            // Add click event to navigate to robot detail page
            robotCard.addEventListener('click', () => {
                window.location.href = `robot-detail.html?slug=${relatedRobot.slug}`;
            });
            
            relatedRobotsGrid.appendChild(robotCard);
        });
    } else {
        // Hide the related robots section if none are available
        document.querySelector('.related-robots-section').style.display = 'none';
    }
}
