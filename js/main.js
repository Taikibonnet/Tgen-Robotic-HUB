// main.js - Common functionality for Tgen Robotics Hub

// DOM Elements
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const navLinks = document.querySelector('.nav-links');
const authButtons = document.querySelector('.auth-buttons');
const aiButton = document.getElementById('ai-button');

// Initialize the site
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    setupMenuToggle();
    setupActiveNavLink();
    setupAIAssistant();
    
    // Check if user is logged in
    checkUserStatus();
});

// Mobile menu toggle
function setupMenuToggle() {
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            authButtons.classList.toggle('mobile-active');
        });
    }
}

// Set active nav link based on current page
function setupActiveNavLink() {
    // Get the current page path
    const currentPath = window.location.pathname;
    
    // Find the matching nav link and add the active class
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPath = link.getAttribute('href');
        
        if (currentPath.endsWith(linkPath) || 
            (currentPath.endsWith('/') && linkPath === 'index.html') ||
            (currentPath.includes(linkPath) && linkPath !== 'index.html')) {
            link.classList.add('active');
        }
    });
}

// AI Assistant functionality
function setupAIAssistant() {
    if (aiButton) {
        aiButton.addEventListener('click', openAIAssistant);
    }
}

// Open AI Assistant
function openAIAssistant() {
    // Simple placeholder implementation
    showMessage("AI Assistant feature coming soon!", "info");
}

// Check user login status
function checkUserStatus() {
    // Check for user data in localStorage
    const userData = localStorage.getItem('tgenUser');
    
    if (userData) {
        const user = JSON.parse(userData);
        updateUserUI(user);
    }
}

// Update UI based on user login status
function updateUserUI(user) {
    const authButtonsContainer = document.querySelector('.auth-buttons');
    
    if (!authButtonsContainer) return;
    
    // Replace login/signup buttons with user info
    authButtonsContainer.innerHTML = `
        <div class="user-dropdown">
            <div class="user-info">
                <span>${user.firstName}</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="dropdown-menu">
                <a href="profile.html">Profile</a>
                ${user.role === 'admin' ? '<a href="admin-dashboard.html">Admin Dashboard</a>' : ''}
                <a href="#" id="logout-btn">Logout</a>
            </div>
        </div>
    `;
    
    // Add click handler for dropdown toggle
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.dropdown-menu').classList.toggle('active');
        });
    }
    
    // Add click handler for logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        const dropdown = document.querySelector('.dropdown-menu');
        if (dropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
        }
    });
}

// Logout function
function logout() {
    // Remove user data from localStorage
    localStorage.removeItem('tgenUser');
    
    // Reload the page
    window.location.reload();
}

// Login function (called from login page)
function login(email, password) {
    // In a real application, this would make an API call
    // For demo purposes, we'll use the sample user data
    
    // Find user with matching credentials
    const user = window.robotsData.users.find(u => 
        u.email === email && u.password === password
    );
    
    if (user) {
        // Store user data in localStorage (excluding password)
        const userData = { ...user };
        delete userData.password;
        
        localStorage.setItem('tgenUser', JSON.stringify(userData));
        
        return { success: true, user: userData };
    }
    
    return { success: false, message: "Invalid email or password" };
}

// Register function (called from signup page)
function register(userData) {
    // In a real application, this would make an API call
    // For demo purposes, we'll simulate user registration
    
    // Check if email already exists
    const emailExists = window.robotsData.users.some(u => u.email === userData.email);
    
    if (emailExists) {
        return { success: false, message: "Email already in use" };
    }
    
    // Create new user
    const newUser = {
        id: window.robotsData.users.length + 1,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        profileImage: 'images/avatars/default.jpg',
        preferences: {
            theme: 'dark',
            favoriteCategories: []
        },
        activity: {
            favoriteRobots: [],
            recentlyViewed: []
        }
    };
    
    // Add to users array
    window.robotsData.users.push(newUser);
    
    // Store user data in localStorage (excluding password)
    const userDataToStore = { ...newUser };
    delete userDataToStore.password;
    
    localStorage.setItem('tgenUser', JSON.stringify(userDataToStore));
    
    return { success: true, user: userDataToStore };
}

// Get current user
function getCurrentUser() {
    const userData = localStorage.getItem('tgenUser');
    
    if (userData) {
        return JSON.parse(userData);
    }
    
    return null;
}

// Add to user's recently viewed robots
function addToRecentlyViewed(robotId) {
    const user = getCurrentUser();
    
    if (!user) return;
    
    // Get numeric robot ID
    robotId = parseInt(robotId);
    
    // Create new recently viewed entry
    const newEntry = {
        robotId,
        timestamp: new Date().toISOString()
    };
    
    // If user doesn't have activity or recentlyViewed, initialize them
    if (!user.activity) user.activity = {};
    if (!user.activity.recentlyViewed) user.activity.recentlyViewed = [];
    
    // Remove if already exists
    user.activity.recentlyViewed = user.activity.recentlyViewed.filter(
        item => item.robotId !== robotId
    );
    
    // Add to beginning of array
    user.activity.recentlyViewed.unshift(newEntry);
    
    // Keep only the 10 most recent
    if (user.activity.recentlyViewed.length > 10) {
        user.activity.recentlyViewed = user.activity.recentlyViewed.slice(0, 10);
    }
    
    // Update localStorage
    localStorage.setItem('tgenUser', JSON.stringify(user));
}

// Toggle robot favorite status
function toggleFavorite(robotId) {
    const user = getCurrentUser();
    
    if (!user) return { success: false, message: "You must be logged in to favorite robots" };
    
    // Get numeric robot ID
    robotId = parseInt(robotId);
    
    // If user doesn't have activity or favoriteRobots, initialize them
    if (!user.activity) user.activity = {};
    if (!user.activity.favoriteRobots) user.activity.favoriteRobots = [];
    
    // Check if robot is already in favorites
    const index = user.activity.favoriteRobots.indexOf(robotId);
    
    if (index === -1) {
        // Add to favorites
        user.activity.favoriteRobots.push(robotId);
        
        // Update localStorage
        localStorage.setItem('tgenUser', JSON.stringify(user));
        
        return { success: true, added: true };
    } else {
        // Remove from favorites
        user.activity.favoriteRobots.splice(index, 1);
        
        // Update localStorage
        localStorage.setItem('tgenUser', JSON.stringify(user));
        
        return { success: true, added: false };
    }
}

// Check if a robot is in user's favorites
function isRobotFavorited(robotId) {
    const user = getCurrentUser();
    
    if (!user || !user.activity || !user.activity.favoriteRobots) {
        return false;
    }
    
    // Get numeric robot ID
    robotId = parseInt(robotId);
    
    return user.activity.favoriteRobots.includes(robotId);
}

// Show a temporary message
function showMessage(message, type = 'info', duration = 3000) {
    // Check if a message is already showing
    const existingMessage = document.querySelector('.message-popup');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message-popup message-${type} fade-in`;
    messageElement.textContent = message;
    
    // Add to body
    document.body.appendChild(messageElement);
    
    // Position in top-right corner
    messageElement.style.position = 'fixed';
    messageElement.style.top = '100px';
    messageElement.style.right = '20px';
    messageElement.style.padding = '15px 25px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.zIndex = '2000';
    messageElement.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    
    // Set background color based on type
    if (type === 'success') {
        messageElement.style.backgroundColor = 'rgba(32, 227, 178, 0.9)';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = 'rgba(255, 107, 107, 0.9)';
    } else {
        messageElement.style.backgroundColor = 'rgba(42, 157, 255, 0.9)';
    }
    
    // Remove after duration
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s ease-in-out';
        
        // Remove from DOM after fade out
        setTimeout(() => {
            messageElement.remove();
        }, 500);
    }, duration);
}

// Parse URL parameters
function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    
    if (!queryString) return params;
    
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
    }
    
    return params;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Make global functions available
window.tgenApp = {
    login,
    register,
    logout,
    getCurrentUser,
    addToRecentlyViewed,
    toggleFavorite,
    isRobotFavorited,
    showMessage,
    getUrlParams,
    formatDate
};
