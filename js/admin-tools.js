/**
 * Admin Tools for Tgen Robotics Hub
 * This file contains utility functions for admin operations
 */

window.adminTools = (function() {
    /**
     * Initialize admin tools
     */
    function init() {
        console.log('Admin Tools: Initializing');
        
        // Set up event listeners for admin actions
        setupAdminActions();
    }
    
    /**
     * Set up event listeners for admin actions
     */
    function setupAdminActions() {
        // Listen for delete button clicks
        document.addEventListener('click', function(e) {
            if (e.target.id === 'delete-robot-btn' || 
                (e.target.parentElement && e.target.parentElement.id === 'delete-robot-btn')) {
                handleDeleteRobot();
            }
        });
    }
    
    /**
     * Handle delete robot action
     */
    function handleDeleteRobot() {
        const urlParams = new URLSearchParams(window.location.search);
        const robotId = urlParams.get('id') || urlParams.get('slug');
        
        if (!robotId) {
            console.error('No robot ID found in URL');
            alert('Error: Cannot determine which robot to delete.');
            return;
        }
        
        // Get the robot
        const robot = window.robotsData?.getRobotById?.(robotId);
        
        if (!robot) {
            console.error('Robot not found with ID:', robotId);
            alert('Error: Robot not found.');
            return;
        }
        
        // Confirm deletion
        if (confirm(`Are you sure you want to delete ${robot.name}? This action cannot be undone.`)) {
            deleteRobot(robotId);
        }
    }
    
    /**
     * Delete a robot
     */
    async function deleteRobot(robotId) {
        try {
            console.log('Deleting robot with ID:', robotId);
            
            // Use GitHub storage to delete the robot
            if (window.githubStorage && typeof window.githubStorage.deleteRobotAndSave === 'function') {
                const success = await window.githubStorage.deleteRobotAndSave(robotId);
                
                if (success) {
                    alert('Robot deleted successfully!');
                    // Redirect to the encyclopedia page
                    window.location.href = 'encyclopedia.html';
                } else {
                    alert('Error deleting robot. Please check console for details.');
                }
            } else {
                alert('Error: GitHub storage not available. Make sure you have added your GitHub token in localStorage.');
                console.error('GitHub storage not available');
            }
        } catch (error) {
            console.error('Error deleting robot:', error);
            alert(`Error deleting robot: ${error.message}`);
        }
    }
    
    /**
     * Check if GitHub token is set
     */
    function checkGitHubToken() {
        const token = localStorage.getItem('github_token');
        return !!token;
    }
    
    /**
     * Set GitHub token
     */
    function setGitHubToken(token) {
        if (token && token.trim() !== '') {
            localStorage.setItem('github_token', token);
            alert('GitHub token set successfully!');
            return true;
        } else {
            alert('Invalid token');
            return false;
        }
    }
    
    /**
     * Reset GitHub token
     */
    function resetGitHubToken() {
        localStorage.removeItem('github_token');
        alert('GitHub token removed');
    }
    
    /**
     * Clear robots data
     */
    function clearRobotsData() {
        if (window.robotsData && typeof window.robotsData.clearRobots === 'function') {
            window.robotsData.clearRobots();
            
            // Save the empty data to GitHub
            if (window.githubStorage && typeof window.githubStorage.save === 'function') {
                window.githubStorage.save();
                alert('Robots data cleared successfully!');
                return true;
            } else {
                alert('Error: GitHub storage not available. Make sure you have added your GitHub token in localStorage.');
                return false;
            }
        } else {
            alert('Error: Robots data not available');
            return false;
        }
    }
    
    // Public API
    return {
        init: init,
        checkGitHubToken: checkGitHubToken,
        setGitHubToken: setGitHubToken,
        resetGitHubToken: resetGitHubToken,
        clearRobotsData: clearRobotsData,
        deleteRobot: deleteRobot
    };
})();

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminTools.init();
});
