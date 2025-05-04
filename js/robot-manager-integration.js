// robot-manager-integration.js - Integrates all robot management components

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initializeRobotManager();
});

function initializeRobotManager() {
    // Check if required elements exist (to avoid errors on other pages)
    if (!document.getElementById('robot-form')) {
        return;
    }
    
    // Setup modal functionality
    const modal = document.getElementById('robot-modal');
    const addRobotBtn = document.getElementById('add-robot-btn');
    const modalClose = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // Tab functionality
    const tabs = document.querySelectorAll('.modal-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Show modal when "Add New Robot" is clicked
    addRobotBtn.addEventListener('click', function() {
        // Reset the form
        document.getElementById('robot-form').reset();
        document.getElementById('robot-form').removeAttribute('data-robot-id');
        document.getElementById('modal-title').textContent = 'Add New Robot';
        document.getElementById('featured-image-preview').innerHTML = '';
        document.getElementById('additional-images-preview').innerHTML = '';
        
        // Reset file variables
        window.featuredImageFile = null;
        window.additionalImageFiles = [];
        window.videoFiles = [];
        
        // Show first tab
        document.querySelectorAll('.modal-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelector('.modal-tab[data-tab="basic"]').classList.add('active');
        document.getElementById('tab-basic').classList.add('active');
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Hide modal when close button or cancel is clicked
    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeModal();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Allow scrolling again
    }
    
    // Tab switching
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
    
    // Initialize form and storage
    if (typeof window.initRobotStorage === 'function') {
        window.initRobotStorage();
    }
    
    if (typeof window.initializeFormHandlers === 'function') {
        window.initializeFormHandlers();
    }
    
    if (typeof window.initializeMediaUploads === 'function') {
        window.initializeMediaUploads();
    }
    
    if (typeof window.initializeCustomSpecFields === 'function') {
        window.initializeCustomSpecFields();
    }
    
    // Load robots for the table
    if (typeof window.loadRobots === 'function') {
        window.loadRobots();
    }
}
