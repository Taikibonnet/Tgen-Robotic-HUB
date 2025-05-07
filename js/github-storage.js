/**
 * GitHub Storage Module for Tgen Robotics Hub
 * This file contains functions for storing and retrieving robot data from GitHub
 */

window.githubStorage = (function() {
    // GitHub repository details
    const OWNER = 'TaikiBonnet';
    const REPO = 'Tgen-Robotic-HUB';
    const DATA_FILE_PATH = 'data/robots.json';
    
    // Helper function to encode content for GitHub API
    function encodeContent(content) {
        return btoa(unescape(encodeURIComponent(content)));
    }
    
    // Helper function to decode content from GitHub API
    function decodeContent(content) {
        return decodeURIComponent(escape(atob(content)));
    }
    
    /**
     * Get the current data file from GitHub
     */
    async function getDataFile() {
        try {
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE_PATH}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Data file not found. Will create a new one.');
                    return { content: null, sha: null };
                }
                throw new Error('Failed to fetch data file');
            }
            
            const data = await response.json();
            const content = decodeContent(data.content);
            return { 
                content: JSON.parse(content), 
                sha: data.sha 
            };
        } catch (error) {
            console.error('Error getting data file:', error);
            return { content: null, sha: null };
        }
    }
    
    /**
     * Save data to GitHub
     */
    async function saveDataFile(data, sha = null) {
        try {
            // Convert data to string
            const content = JSON.stringify(data, null, 2);
            
            // Prepare the request
            const requestBody = {
                message: 'Update robots data',
                content: encodeContent(content),
                branch: 'main'
            };
            
            // If we have a SHA, it means we're updating an existing file
            if (sha) {
                requestBody.sha = sha;
            }
            
            // Make the request
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE_PATH}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (localStorage.getItem('github_token') || '')
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save data file');
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data file:', error);
            return false;
        }
    }
    
    /**
     * Initialize data:
     * 1. Try to load from GitHub
     * 2. If not available, use default data from window.robotsData
     * 3. Return the data
     */
    async function initializeData() {
        const { content, sha } = await getDataFile();
        
        if (content) {
            console.log('Data loaded from GitHub');
            return { data: content, sha };
        }
        
        console.log('Creating new data structure');
        
        // Create a new data structure
        const newData = {
            robots: window.robotsData && Array.isArray(window.robotsData.robots) 
                ? window.robotsData.robots 
                : [],
            categories: window.robotsData?.categories || [],
            lastUpdated: new Date().toISOString()
        };
        
        // Save the new data to GitHub
        const saved = await saveDataFile(newData);
        
        if (saved) {
            console.log('New data saved to GitHub');
            // Reload to get the SHA
            return await getDataFile();
        }
        
        return { data: newData, sha: null };
    }
    
    /**
     * Save an image to GitHub and return the URL
     */
    async function saveImage(imageData, fileName) {
        try {
            // Clean the data URL by removing the data:image/xxx;base64, part
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            
            // Prepare the request
            const requestBody = {
                message: 'Add robot image',
                content: base64Data,
                branch: 'main'
            };
            
            // Check if the file already exists
            try {
                const checkResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/images/robots/${fileName}`);
                if (checkResponse.ok) {
                    const fileData = await checkResponse.json();
                    requestBody.sha = fileData.sha;
                }
            } catch (error) {
                // File doesn't exist, no need for SHA
            }
            
            // Make the request
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/images/robots/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + (localStorage.getItem('github_token') || '')
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error('Failed to save image');
            }
            
            const data = await response.json();
            return `images/robots/${fileName}`;
        } catch (error) {
            console.error('Error saving image:', error);
            return null;
        }
    }
    
    // Return the public API
    return {
        // Initialize data and sync with GitHub
        init: async function() {
            // Initialize data
            const { data, sha } = await initializeData();
            
            // Update window.robotsData
            if (!window.robotsData) {
                window.robotsData = {
                    robots: [],
                    categories: [],
                    lastUpdated: new Date().toISOString()
                };
            }
            
            // Set the data
            window.robotsData.robots = data.robots || [];
            window.robotsData.categories = data.categories || [];
            window.robotsData.lastUpdated = data.lastUpdated || new Date().toISOString();
            
            // Store the SHA for future updates
            window.githubStorage.currentSha = sha;
            
            // Add helper methods to window.robotsData if they don't exist
            if (!window.robotsData.getRobotById) {
                window.robotsData.getRobotById = function(id) {
                    const numId = parseInt(id);
                    return this.robots.find(robot => 
                        robot.id === numId || robot.id === id || robot.slug === id
                    );
                };
            }
            
            if (!window.robotsData.getRobotBySlug) {
                window.robotsData.getRobotBySlug = function(slug) {
                    return this.robots.find(robot => robot.slug === slug);
                };
            }
            
            if (!window.robotsData.getRelatedRobots) {
                window.robotsData.getRelatedRobots = function(id, limit = 3) {
                    const robot = this.getRobotById(id);
                    if (!robot) return [];
                    
                    return this.robots
                        .filter(r => r.id !== id && (
                            r.manufacturer?.name === robot.manufacturer?.name ||
                            r.applications?.some(app => robot.applications?.includes(app))
                        ))
                        .sort(() => Math.random() - 0.5)
                        .slice(0, limit);
                };
            }
            
            console.log(`Initialized robotsData with ${window.robotsData.robots.length} robots`);
            
            return window.robotsData;
        },
        
        // Save the current state of window.robotsData to GitHub
        save: async function() {
            const data = {
                robots: window.robotsData.robots,
                categories: window.robotsData.categories,
                lastUpdated: new Date().toISOString()
            };
            
            const saved = await saveDataFile(data, window.githubStorage.currentSha);
            
            if (saved) {
                // Update the SHA after saving
                const { sha } = await getDataFile();
                window.githubStorage.currentSha = sha;
            }
            
            return saved;
        },
        
        // Add a new robot, save images, and then save data
        addRobotAndSave: async function(robot) {
            // Process images to save them to GitHub if they are data URLs
            if (robot.media) {
                // Process featured image
                if (robot.media.featuredImage && robot.media.featuredImage.url && robot.media.featuredImage.url.startsWith('data:')) {
                    const fileName = `${robot.slug}-featured-${Date.now()}.jpg`;
                    const imageUrl = await saveImage(robot.media.featuredImage.url, fileName);
                    if (imageUrl) {
                        robot.media.featuredImage.url = imageUrl;
                    }
                }
                
                // Process gallery images
                if (robot.media.images && robot.media.images.length > 0) {
                    for (let i = 0; i < robot.media.images.length; i++) {
                        if (robot.media.images[i].url && robot.media.images[i].url.startsWith('data:')) {
                            const fileName = `${robot.slug}-gallery-${i}-${Date.now()}.jpg`;
                            const imageUrl = await saveImage(robot.media.images[i].url, fileName);
                            if (imageUrl) {
                                robot.media.images[i].url = imageUrl;
                            }
                        }
                    }
                }
            }
            
            // Check if robot already exists by ID or slug
            const existingIndex = window.robotsData.robots.findIndex(r => 
                r.id === robot.id || r.slug === robot.slug
            );
            
            if (existingIndex !== -1) {
                // Update existing robot
                window.robotsData.robots[existingIndex] = robot;
            } else {
                // Generate a new ID if not provided
                if (!robot.id) {
                    robot.id = Date.now();
                }
                
                // Add the robot
                window.robotsData.robots.push(robot);
            }
            
            // Add categories if not already present
            if (robot.categories) {
                robot.categories.forEach(category => {
                    if (!window.robotsData.categories.includes(category)) {
                        window.robotsData.categories.push(category);
                    }
                });
            }
            
            // Save to GitHub
            return await this.save();
        },
        
        // Update an existing robot and save
        updateRobotAndSave: async function(robotId, updatedData) {
            // First find the robot
            const index = window.robotsData.robots.findIndex(r => 
                r.id === parseInt(robotId) || r.id === robotId || r.slug === robotId
            );
            
            if (index === -1) {
                console.error('Robot not found with ID:', robotId);
                return false;
            }
            
            // Make a copy of the existing robot
            const robot = { ...window.robotsData.robots[index] };
            
            // Merge with updated data
            const updatedRobot = { ...robot, ...updatedData };
            
            // Process images if needed
            if (updatedRobot.media) {
                // Process featured image
                if (updatedRobot.media.featuredImage && updatedRobot.media.featuredImage.url && updatedRobot.media.featuredImage.url.startsWith('data:')) {
                    const fileName = `${updatedRobot.slug}-featured-${Date.now()}.jpg`;
                    const imageUrl = await saveImage(updatedRobot.media.featuredImage.url, fileName);
                    if (imageUrl) {
                        updatedRobot.media.featuredImage.url = imageUrl;
                    }
                }
                
                // Process gallery images
                if (updatedRobot.media.images && updatedRobot.media.images.length > 0) {
                    for (let i = 0; i < updatedRobot.media.images.length; i++) {
                        if (updatedRobot.media.images[i].url && updatedRobot.media.images[i].url.startsWith('data:')) {
                            const fileName = `${updatedRobot.slug}-gallery-${i}-${Date.now()}.jpg`;
                            const imageUrl = await saveImage(updatedRobot.media.images[i].url, fileName);
                            if (imageUrl) {
                                updatedRobot.media.images[i].url = imageUrl;
                            }
                        }
                    }
                }
            }
            
            // Update the robot in the array
            window.robotsData.robots[index] = updatedRobot;
            
            // Add categories if not already present
            if (updatedRobot.categories) {
                updatedRobot.categories.forEach(category => {
                    if (!window.robotsData.categories.includes(category)) {
                        window.robotsData.categories.push(category);
                    }
                });
            }
            
            // Save to GitHub
            return await this.save();
        },
        
        // Delete a robot and save
        deleteRobotAndSave: async function(robotId) {
            // Find the robot
            const index = window.robotsData.robots.findIndex(r => 
                r.id === parseInt(robotId) || r.id === robotId || r.slug === robotId
            );
            
            if (index === -1) {
                console.error('Robot not found with ID:', robotId);
                return false;
            }
            
            // Remove the robot
            window.robotsData.robots.splice(index, 1);
            
            // Save to GitHub
            return await this.save();
        }
    };
})();

// Initialize when the script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('GitHub Storage: Initializing');
    window.githubStorage.init();
});
