/**
 * Authentication functionality for Tgen Robotics Hub
 * This script provides simple user authentication functionality
 */

// Initialize auth when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

// Object to store app state and methods
window.tgenApp = window.tgenApp || {};

/**
 * Initialize authentication
 */
function initAuth() {
    // Check if user is logged in
    const user = getLoggedInUser();
    
    // Update UI based on auth state
    updateAuthUI(user);
    
    // Setup login form
    setupLoginForm();
    
    // Setup signup form
    setupSignupForm();
    
    // Setup logout functionality
    setupLogout();
}

/**
 * Get the currently logged in user
 */
function getLoggedInUser() {
    try {
        const userJson = localStorage.getItem('tgen_current_user');
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        console.error('Error retrieving user:', e);
        return null;
    }
}

/**
 * Set current user in localStorage
 */
function setCurrentUser(user) {
    try {
        if (user) {
            localStorage.setItem('tgen_current_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('tgen_current_user');
        }
        return true;
    } catch (e) {
        console.error('Error setting user:', e);
        return false;
    }
}

/**
 * Update UI based on authentication state
 */
function updateAuthUI(user) {
    // If user is logged in
    if (user) {
        // Hide login/signup buttons, show user info
        const authButtonsContainer = document.querySelector('.auth-buttons');
        if (authButtonsContainer) {
            // Replace login/signup buttons with user dropdown
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
            
            // Add event listeners for dropdown and logout
            const userInfo = document.querySelector('.user-info');
            const dropdownMenu = document.querySelector('.dropdown-menu');
            const logoutBtn = document.getElementById('logout-btn');
            
            if (userInfo && dropdownMenu) {
                // Toggle dropdown on click
                userInfo.addEventListener('click', function(e) {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('active');
                    const icon = userInfo.querySelector('i');
                    if (icon) {
                        icon.style.transform = dropdownMenu.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                    }
                });
                
                // Hide dropdown when clicking elsewhere
                document.addEventListener('click', function() {
                    dropdownMenu.classList.remove('active');
                    const icon = userInfo.querySelector('i');
                    if (icon) {
                        icon.style.transform = 'rotate(0)';
                    }
                });
            }
            
            if (logoutBtn) {
                // Logout handler
                logoutBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        }
        
        // Show/hide admin sections based on user role
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = user.role === 'admin' ? 'block' : 'none';
        });
        
        // Show admin actions
        const adminActions = document.querySelectorAll('.admin-actions');
        adminActions.forEach(el => {
            el.style.display = user.role === 'admin' ? 'flex' : 'none';
        });
        
        // Show admin controls
        const adminControls = document.getElementById('admin-controls');
        if (adminControls) {
            adminControls.style.display = user.role === 'admin' ? 'block' : 'none';
        }
    } else {
        // Show login/signup buttons if user is not logged in
        const authButtonsContainer = document.querySelector('.auth-buttons');
        if (authButtonsContainer) {
            authButtonsContainer.innerHTML = `
                <a href="login.html" class="btn btn-outline">Log In</a>
                <a href="signup.html" class="btn btn-primary">Sign Up</a>
            `;
        }
        
        // Hide admin sections
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Hide admin actions
        const adminActions = document.querySelectorAll('.admin-actions');
        adminActions.forEach(el => {
            el.style.display = 'none';
        });
        
        // Hide admin controls
        const adminControls = document.getElementById('admin-controls');
        if (adminControls) {
            adminControls.style.display = 'none';
        }
    }
}

/**
 * Setup login form
 */
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Simple login validation (in a real app, this would validate against a server)
        login(email, password);
    });
}

/**
 * Login a user
 */
function login(email, password) {
    // In a real app, this would validate credentials against a server
    // For demo purposes, we'll use a simple validation
    
    // Check for admin account
    if (email === 'tgen.robotics@gmail.com' && password === 'Admin123!') {
        const user = {
            id: 1,
            email: 'tgen.robotics@gmail.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
        };
        
        setCurrentUser(user);
        
        // Redirect after successful login
        window.location.href = 'admin-dashboard.html';
        return true;
    }
    
    // Check for regular users - accept any email with valid password format
    if (email.includes('@') && password.length >= 6) {
        // Extract first part of email for first name
        const firstName = email.split('@')[0].split('.')[0];
        const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        
        const user = {
            id: Math.floor(Math.random() * 10000) + 2,
            email: email,
            firstName: capitalizedFirstName,
            lastName: 'User',
            role: 'user'
        };
        
        setCurrentUser(user);
        
        // Redirect after successful login
        window.location.href = 'encyclopedia.html';
        return true;
    }
    
    // If we get here, login failed
    alert('Invalid email or password.');
    return false;
}

/**
 * Setup signup form
 */
function setupSignupForm() {
    const signupForm = document.getElementById('signup-form');
    
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('signup-first-name').value;
        const lastName = document.getElementById('signup-last-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        // Simple signup (in a real app, this would register with a server)
        signup(firstName, lastName, email, password);
    });
}

/**
 * Register a new user
 */
function signup(firstName, lastName, email, password) {
    // In a real app, this would register the user with a server
    // For demo purposes, we'll simulate a successful registration
    
    const user = {
        id: Math.floor(Math.random() * 10000) + 3, // Random ID (3+)
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: 'user' // New users are always regular users
    };
    
    setCurrentUser(user);
    
    // Redirect after successful signup
    window.location.href = 'encyclopedia.html';
    return true;
}

/**
 * Logout the current user
 */
function logout() {
    setCurrentUser(null);
    window.location.href = 'index.html';
}

/**
 * Setup logout functionality
 */
function setupLogout() {
    const logoutLinks = document.querySelectorAll('.logout-link');
    
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

// Add methods to the global app object for external access
window.tgenApp.getCurrentUser = getLoggedInUser;
window.tgenApp.login = login;
window.tgenApp.logout = logout;
window.tgenApp.signup = signup;
window.tgenApp.isAdmin = function() {
    const user = getLoggedInUser();
    return user && user.role === 'admin';
};
