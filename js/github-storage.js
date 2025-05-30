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
            console.log('Fetching data file from GitHub');
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE_PATH}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Data file not found. Will create a new one.');
                    return { content: null, sha: null };
                }
                
                const errorData = await response.json();
                console.error('GitHub API error:', errorData);
                throw new Error(`Failed to fetch data file: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            const content = decodeContent(data.content);
            
            try {
                const parsedContent = JSON.parse(content);
                console.log('Data file fetched successfully:', parsedContent);
                return { 
                    content: parsedContent, 
                    sha: data.sha 
                };
            } catch (parseError) {
                console.error('Error parsing JSON from data file:', parseError);
                return { content: null, sha: data.sha };
            }
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
                headers['Authorization'] = `token ${githubToken}`;
            } else {
                console.error('No GitHub token available for saving data');
                alert('GitHub token is required to save changes. Please add a token in the settings.');
                return false;
            }
            
            console.log('Saving data to GitHub');
            
            // Make the request
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_FILE_PATH}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('GitHub API error:', errorData);
                
                // Check for authentication issues
                if (response.status === 401) {
                    alert('GitHub authentication failed. Please check your token.');
                    
                    // Prompt for new token
                    const newToken = prompt('Your GitHub token seems invalid. Please enter a new token:');
                    if (newToken && newToken.trim() !== '') {
                        githubToken = newToken;
                        localStorage.setItem('github_token', newToken);
                        return saveDataFile(data, sha); // Try again with new token
                    }
                }
                
                throw new Error(`Failed to save data file: ${response.status} ${response.statusText}`);
            }
            
            console.log('Data saved successfully to GitHub');
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
            categories: window.robotsData?.categories || ["Quadruped", "Humanoid", "Industrial", "Mobile Robot", "Bipedal"],
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
            let base64Data = imageData;
            
            if (typeof imageData === 'string' && imageData.startsWith('data:')) {
                base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            }
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add auth token if available
            if (githubToken) {
                headers['Authorization'] = `token ${githubToken}`;
            } else {
                console.error('No GitHub token available for saving image');
                alert('GitHub token is required to save images. Please add a token in the settings.');
                return null;
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
            
            console.log('Saving image to GitHub:', fileName);
            
            // Make the request
            const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${IMAGES_PATH}${fileName}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('GitHub API error:', errorData);
                
                // Check for authentication issues
                if (response.status === 401) {
                    alert('GitHub authentication failed. Please check your token.');
                    
                    // Prompt for new token
                    const newToken = prompt('Your GitHub token seems invalid. Please enter a new token:');
                    if (newToken && newToken.trim() !== '') {
                        githubToken = newToken;
                        localStorage.setItem('github_token', newToken);
                        return saveImage(imageData, fileName); // Try again with new token
                    }
                }
                
                throw new Error(`Failed to save image: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Image saved successfully to GitHub:', fileName);
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
            console.log('GitHub Storage: Initializing');
            
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
                console.log('Creating new robotsData object');
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
                    if (!id) return null;
                    
                    const numId = parseInt(id);
                    return this.robots.find(robot => 
                        robot.id === numId || robot.id === id || robot.slug === id
                    );
                };
            }
            
            if (!window.robotsData.getRobotBySlug) {
                window.robotsData.getRobotBySlug = function(slug) {
                    if (!slug) return null;
                    return this.robots.find(robot => robot.slug === slug);
                };
            }
            
            if (!window.robotsData.getRelatedRobots) {
                window.robotsData.getRelatedRobots = function(id, limit = 3) {
                    const robot = this.getRobotById(id);
                    if (!robot) return [];
                    
                    return this.robots
                        .filter(r => r.id !== robot.id && (
                            r.manufacturer?.name === robot.manufacturer?.name ||
                            r.categories?.some(cat => robot.categories?.includes(cat))
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
            console.log('Saving robotsData to GitHub');
            const data = {
                robots: window.robotsData.robots,
                categories: window.robotsData.categories,
                lastUpdated: new Date().toISOString()
            };
            
            const saved = await saveDataFile(data, window.githubStorage.currentSha);
            
            if (saved) {
                // Update the SHA after saving
                console.log('Updating SHA after save');
                const { sha } = await getDataFile();
                window.githubStorage.currentSha = sha;
            }
            
            return saved;
        },
        
        // Set GitHub token
        setToken: function(token) {
            if (token && token.trim() !== '') {
                githubToken = token;
                localStorage.setItem('github_token', token);
                console.log('GitHub token set');
                return true;
            } else {
                console.error('Invalid GitHub token');
                return false;
            }
        },
        
        // Check if we have a token
        hasToken: function() {
            return !!githubToken;
        },
        
        // Add a new robot, save images, and then save data
        addRobotAndSave: async function(robot) {
            console.log('Adding new robot:', robot.name);
            
            // Process images to save them to GitHub if they are data URLs
            if (robot.media) {
                // Process featured image
                if (robot.media.featuredImage && typeof robot.media.featuredImage === 'string' && robot.media.featuredImage.startsWith('data:')) {
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
                        if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
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
                            if ((video.type === 'url' || !video.type) && video.url) {
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
            
            console.log('Processed media for robot:', robot.name);
            
            // Check if robot already exists by ID or slug
            const existingIndex = window.robotsData.robots.findIndex(r => 
                r.id === robot.id || r.slug === robot.slug
            );
            
            if (existingIndex !== -1) {
                // Update existing robot
                console.log('Updating existing robot:', robot.name);
                window.robotsData.robots[existingIndex] = robot;
            } else {
                // Generate a new ID if not provided
                if (!robot.id) {
                    robot.id = Date.now();
                }
                
                // Add the robot
                console.log('Adding new robot to array:', robot.name);
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
            console.log('Saving updated data to GitHub');
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
            
            console.log('Updating robot with ID:', robotId);
            
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
                        if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
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
                
                // Process videos if needed
                if (Array.isArray(updatedRobot.media.videos) && updatedRobot.media.videos.length > 0) {
                    // No special processing needed for videos as they are just URLs
                    updatedRobot.media.videos = updatedRobot.media.videos.map(video => {
                        if (typeof video === 'object' && video.url) {
                            return {
                                type: 'url',
                                url: video.url,
                                title: video.title || updatedRobot.name,
                                description: video.description || ''
                            };
                        }
                        return video;
                    });
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
            
            console.log('Deleting robot with ID:', robotId);
            
            // Remove the robot
            window.robotsData.robots.splice(index, 1);
            
            // Save to GitHub
            return await this.save();
        },
        
        // Clear robots data
        clearRobotsData: async function() {
            console.log('Clearing all robots data');
            
            // Clear robots array
            window.robotsData.robots = [];
            
            // Save to GitHub
            return await this.save();
        }
    };
})();

// Initialize when the script loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('GitHub Storage: Initializing on page load');
    
    // Clear localStorage to prevent loading old robots
    // localStorage.removeItem('tgen_robotics_data');
    
    // Clear any example robots in memory
    if (window.robotsData) {
        window.robotsData.robots = [];
    }
    
    window.githubStorage.init();
});
