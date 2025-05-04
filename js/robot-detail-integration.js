/**
 * Robot Detail Integration
 * This file integrates the video functionality into the robot detail page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get any existing populateRobotData function
    const originalPopulateRobotData = window.populateRobotData;
    
    // Override the populateRobotData function to add video functionality
    window.populateRobotData = function(robot) {
        // Call the original function if it exists
        if (typeof originalPopulateRobotData === 'function') {
            originalPopulateRobotData(robot);
        } else {
            // Basic implementation if original function doesn't exist
            populateBasicRobotData(robot);
        }
        
        // Call our video population function
        if (typeof populateVideos === 'function') {
            populateVideos(robot);
        } else {
            console.error('Video handler not loaded. Make sure video-handler.js is included.');
        }
    };
    
    /**
     * Basic implementation of robot data population
     * Only used if the original function doesn't exist
     */
    function populateBasicRobotData(robot) {
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
    }
});
