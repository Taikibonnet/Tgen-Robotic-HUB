/**
 * GitHub Storage Module for Tgen Robotics Hub
 * This file contains functions for storing and retrieving robot data from GitHub
 */

window.githubStorage = (function() {
    // GitHub repository details
    const OWNER = 'TaikiBonnet';
    const REPO = 'Tgen-Robotic-HUB';
    const DATA_FILE_PATH = 'data/robots.json';
    const IMAGES_PATH = 'images/robots/';
    
    // GitHub API token
    let githubToken = localStorage.getItem('github_token');
    
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
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add auth token if available
            if (githubToken) {
                headers['Authorization'] = `Bearer ${githubToken}`;
            }
            
            // Make the request
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE_PATH}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('GitHub API error:', errorData);
                throw new Error(`Failed to save data file: ${response.status} ${response.statusText}`);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving data file:', error);
            alert(`Error saving to GitHub: ${error.message}. Please try again.`);
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
        
        // Create a new data structure with an empty robots array
        const newData = {
            robots: [], // Force empty array instead of using window.robotsData.robots
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
            // Clean the data URL by removing the data:image\/\\w+;base64, part
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add auth token if available
            if (githubToken) {
                headers['Authorization'] = `Bearer ${githubToken}`;
            }
            
            // Prepare the request
            const requestBody = {
                message: 'Add robot image',
                content: base64Data,
                branch: 'main'
            };
            
            // Check if the file already exists
            try {
                const checkResponse = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${IMAGES_PATH}${fileName}`);
                if (checkResponse.ok) {
                    const fileData = await checkResponse.json();
                    requestBody.sha = fileData.sha;
                }
            } catch (error) {
                // File doesn't exist, no need for SHA
                console.log('Image does not exist yet, will create new');
            }
            
            // Make the request
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${IMAGES_PATH}${fileName}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('GitHub API error:', errorData);
                throw new Error(`Failed to save image: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return `${IMAGES_PATH}${fileName}`;
        } catch (error) {
            console.error('Error saving image:', error);
            alert(`Error saving image to GitHub: ${error.message}. Please try again.`);
            return null;
        }
    }
    
    // Return the public API
    return {
        // Initialize data and sync with GitHub
        init: async function() {
            // Clear any example robots immediately
            if (window.robotsData && Array.isArray(window.robotsData.robots)) {
                window.robotsData.robots = [];
            }
            
            // Update token from localStorage
            githubToken = localStorage.getItem('github_token');
            
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
            
            // Set the data, ensure robots is always an array
            window.robotsData.robots = Array.isArray(data.robots) ? data.robots : [];
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
            
            if (!window.robotsData.clearRobots) {
                window.robotsData.clearRobots = function() {
                    this.robots = [];
                    console.log("Cleared all robots from memory");
                    return true;
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
        
        // Set GitHub token
        setToken: function(token) {
            githubToken = token;
            localStorage.setItem('github_token', token);
            return true;
        },
        
        // Check if we have a token
        hasToken: function() {
            return !!githubToken;
        },
        
        // Add a new robot, save images, and then save data
        addRobotAndSave: async function(robot) {
            // Process images to save them to GitHub if they are data URLs
            if (robot.media) {
                // Process featured image
                if (robot.media.featuredImage && robot.media.featuredImage.startsWith('data:')) {
                    const fileName = `${robot.slug}-featured-${Date.now()}.jpg`;
                    const imageUrl = await saveImage(robot.media.featuredImage, fileName);
                    if (imageUrl) {
                        robot.media.featuredImage = { 
                            url: imageUrl,
                            alt: robot.name
                        };
                    }
                }
                
                // Process gallery images
                if (Array.isArray(robot.media.additionalImages) && robot.media.additionalImages.length > 0) {
                    const savedImages = [];
                    for (let i = 0; i < robot.media.additionalImages.length; i++) {
                        const imageData = robot.media.additionalImages[i];
                        if (imageData && imageData.startsWith('data:')) {
                            const fileName = `${robot.slug}-gallery-${i}-${Date.now()}.jpg`;
                            const imageUrl = await saveImage(imageData, fileName);
                            if (imageUrl) {
                                savedImages.push({
                                    url: imageUrl,
                                    alt: `${robot.name} image ${i + 1}`,
                                    caption: ''
                                });
                            }
                        } else if (typeof imageData === 'object' && imageData.url) {
                            // It's already an image object with a URL
                            savedImages.push(imageData);
                        }
                    }
                    robot.media.images = savedImages;
                    delete robot.media.additionalImages; // Cleanup
                }
                
                // Process videos
                if (Array.isArray(robot.media.videos) && robot.media.videos.length > 0) {
                    // Video uploads are not directly supported in GitHub storage
                    // We keep URL references to external videos like YouTube
                    const savedVideos = [];
                    
                    robot.media.videos.forEach(video => {
                        if (video && typeof video === 'object') {
                            if (video.type === 'url' && video.url) {
                                savedVideos.push({
                                    type: 'url',
                                    url: video.url,
                                    title: video.title || robot.name,
                                    description: video.description || '',
                                    thumbnail: video.thumbnail || ''
                                });
                            }
                        }
                    });
                    
                    robot.media.videos = savedVideos;
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
                if (updatedRobot.media.featuredImage) {
                    if (typeof updatedRobot.media.featuredImage === 'string' && updatedRobot.media.featuredImage.startsWith('data:')) {
                        const fileName = `${updatedRobot.slug}-featured-${Date.now()}.jpg`;
                        const imageUrl = await saveImage(updatedRobot.media.featuredImage, fileName);
                        if (imageUrl) {
                            updatedRobot.media.featuredImage = {
                                url: imageUrl,
                                alt: updatedRobot.name
                            };
                        }
                    }
                }
                
                // Process gallery images
                if (Array.isArray(updatedRobot.media.additionalImages) && updatedRobot.media.additionalImages.length > 0) {
                    const savedImages = [];
                    // Preserve existing images if they exist
                    if (Array.isArray(updatedRobot.media.images)) {
                        savedImages.push(...updatedRobot.media.images);
                    }
                    
                    for (let i = 0; i < updatedRobot.media.additionalImages.length; i++) {
                        const imageData = updatedRobot.media.additionalImages[i];
                        if (imageData && imageData.startsWith('data:')) {
                            const fileName = `${updatedRobot.slug}-gallery-${i}-${Date.now()}.jpg`;
                            const imageUrl = await saveImage(imageData, fileName);
                            if (imageUrl) {
                                savedImages.push({
                                    url: imageUrl,
                                    alt: `${updatedRobot.name} image ${i + 1}`,
                                    caption: ''
                                });
                            }
                        }
                    }
                    updatedRobot.media.images = savedImages;
                    delete updatedRobot.media.additionalImages; // Cleanup
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
            
            // Update timestamps
            updatedRobot.updatedAt = new Date().toISOString();
            
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
    // Clear localStorage to prevent loading old robots
    localStorage.removeItem('tgen_robotics_data');
    // Clear any example robots in memory
    if (window.robotsData) {
        window.robotsData.robots = [];
    }
    window.githubStorage.init();
});
