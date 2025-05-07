// main.js - Common functionality for Tgen Robotics Hub

// Initialize the site
document.addEventListener('DOMContentLoaded', () => {
    console.log('Main.js: Initializing site functionality');
    
    // Set up event listeners
    setupMenuToggle();
    setupActiveNavLink();
    setupAIAssistant();
    
    // Check if user is logged in and update UI accordingly
    checkUserStatus();
    
    // Add event listener for auth state changes
    window.addEventListener('authStateChanged', updateUIOnAuthChange);
});

/**
 * Custom event listener for auth state changes from other scripts
 */
function updateUIOnAuthChange(event) {
    console.log('Main.js: Auth state changed event received');
    const user = event.detail;
    updateUserUI(user);
}

// Mobile menu toggle
function setupMenuToggle() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling
            navLinks.classList.toggle('mobile-active');
            authButtons.classList.toggle('mobile-active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu-button') && 
            !e.target.closest('.nav-links.mobile-active') && 
            !e.target.closest('.auth-buttons.mobile-active')) {
            
            if (navLinks && navLinks.classList.contains('mobile-active')) {
                navLinks.classList.remove('mobile-active');
            }
            
            if (authButtons && authButtons.classList.contains('mobile-active')) {
                authButtons.classList.remove('mobile-active');
            }
        }
    });
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
    const aiButton = document.getElementById('ai-button');
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
    console.log('Main.js: Checking user login status');
    
    // Try to get user from tgenApp if available
    if (window.tgenApp && typeof window.tgenApp.getCurrentUser === 'function') {
        const user = window.tgenApp.getCurrentUser();
        if (user) {
            console.log('Main.js: User found via tgenApp:', user.firstName, '(Role:', user.role + ')');
            updateUserUI(user);
            return;
        }
    }
    
    // Otherwise, try to get directly from localStorage
    try {
        const userData = localStorage.getItem('tgen_current_user');
        
        if (userData) {
            const user = JSON.parse(userData);
            console.log('Main.js: User found via localStorage:', user.firstName, '(Role:', user.role + ')');
            updateUserUI(user);
        } else {
            console.log('Main.js: No user found in localStorage');
        }
    } catch (e) {
        console.error('Main.js: Error checking user status:', e);
    }
}

// Update UI based on user login status
function updateUserUI(user) {
    console.log('Main.js: Updating UI for user');
    const authButtonsContainer = document.querySelector('.auth-buttons');
    
    if (!authButtonsContainer) {
        console.log('Main.js: Auth buttons container not found');
        return;
    }
    
    if (user) {
        console.log('Main.js: Updating UI for logged in user');
        
        // Replace login/signup buttons with user info
        authButtonsContainer.innerHTML = `
            <div class="user-dropdown">
                <div class="user-info">
                    <span>${user.firstName}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="dropdown-menu">
                    <a href="profile.html"><i class="fas fa-user"></i> My Profile</a>
                    ${user.role === 'admin' ? '<a href="admin-dashboard.html"><i class="fas fa-tachometer-alt"></i> Admin Dashboard</a>' : ''}
                    <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;
        
        // Add click handler for dropdown toggle
        const userInfo = document.querySelector('.user-info');
        const dropdownMenu = document.querySelector('.dropdown-menu');
        
        if (userInfo && dropdownMenu) {
            userInfo.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('active');
                const icon = userInfo.querySelector('i');
                if (icon) {
                    icon.style.transform = dropdownMenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                }
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
            const userInfoIcon = document.querySelector('.user-info i');
            if (dropdown && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
                if (userInfoIcon) {
                    userInfoIcon.style.transform = 'rotate(0)';
                }
            }
        });
        
        // Show/hide admin elements based on user role
        const adminElements = document.querySelectorAll('.admin-only');
        console.log('Main.js: Found', adminElements.length, 'admin-only elements');
        adminElements.forEach(el => {
            el.style.display = user.role === 'admin' ? 'block' : 'none';
        });
        
        // Show admin controls if user is admin
        const adminControls = document.getElementById('admin-controls');
        if (adminControls) {
            console.log('Main.js: Setting admin-controls display to', user.role === 'admin' ? 'block' : 'none');
            adminControls.style.display = user.role === 'admin' ? 'block' : 'none';
        }
    } else {
        console.log('Main.js: Updating UI for non-logged in user');
        
        // Show login/signup buttons
        authButtonsContainer.innerHTML = `
            <a href="login.html" class="btn btn-outline">Log In</a>
            <a href="signup.html" class="btn btn-primary">Sign Up</a>
        `;
        
        // Hide admin elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Hide admin controls
        const adminControls = document.getElementById('admin-controls');
        if (adminControls) {
            adminControls.style.display = 'none';
        }
    }
}

// Logout function
function logout() {
    console.log('Main.js: Logging out user');
    
    // Clear user data from localStorage
    localStorage.removeItem('tgen_current_user');
    
    // If tgenApp logout exists, use it as well
    if (window.tgenApp && typeof window.tgenApp.logout === 'function') {
        window.tgenApp.logout();
    } else {
        // Reload the page
        window.location.reload();
    }
}

// Login function (called from login page)
function login(email, password) {
    // If tgenApp login exists, use it
    if (window.tgenApp && typeof window.tgenApp.login === 'function') {
        return window.tgenApp.login(email, password);
    }
    
    // Otherwise, implement a simple login
    console.log('Main.js: Logging in user', email);
    
    // Check credentials
    if (email === 'admin@example.com' && password === 'password') {
        const userData = {
            id: 1,
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
        };
        
        // Store in localStorage
        localStorage.setItem('tgen_current_user', JSON.stringify(userData));
        
        // Update UI
        updateUserUI(userData);
        
        // Dispatch event for auth state change
        dispatchAuthEvent(userData);
        
        return { success: true, userData };
    } else if (email === 'user@example.com' && password === 'password') {
        const userData = {
            id: 2,
            email: 'user@example.com',
            firstName: 'Regular',
            lastName: 'User',
            role: 'user'
        };
        
        // Store in localStorage
        localStorage.setItem('tgen_current_user', JSON.stringify(userData));
        
        // Update UI
        updateUserUI(userData);
        
        // Dispatch event for auth state change
        dispatchAuthEvent(userData);
        
        return { success: true, userData };
    }
    
    return { success: false, message: 'Invalid email or password' };
}

// Get current user
function getCurrentUser() {
    // If tgenApp getCurrentUser exists, use it
    if (window.tgenApp && typeof window.tgenApp.getCurrentUser === 'function') {
        return window.tgenApp.getCurrentUser();
    }
    
    // Otherwise, get directly from localStorage
    try {
        const userData = localStorage.getItem('tgen_current_user');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error('Main.js: Error getting current user:', e);
        return null;
    }
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Dispatch auth state change event
function dispatchAuthEvent(user) {
    const event = new CustomEvent('authStateChanged', { detail: user });
    window.dispatchEvent(event);
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
window.tgenApp = window.tgenApp || {};
window.tgenApp.login = login;
window.tgenApp.logout = logout;
window.tgenApp.getCurrentUser = getCurrentUser;
window.tgenApp.isAdmin = isAdmin;
window.tgenApp.showMessage = showMessage;
window.tgenApp.getUrlParams = getUrlParams;
window.tgenApp.formatDate = formatDate;
