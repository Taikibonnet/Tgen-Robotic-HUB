/**
 * Authentication module for Tgen Robotic HUB
 * Handles user registration, login, and session management
 */

// User model structure
class User {
    constructor(fullName, email, password, interests = []) {
        this.id = this.generateUserId();
        this.fullName = fullName;
        this.email = email;
        this.password = this.hashPassword(password); // In a real app, this would be properly hashed
        this.interests = interests;
        this.created = new Date().toISOString();
        this.lastLogin = null;
        this.profilePicture = null;
        this.bio = '';
        this.role = 'user'; // Default role (user, editor, admin)
        this.verified = false;
    }

    // Simple ID generator - in a real app, you'd use a proper UUID generator
    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    // Simulate password hashing - in a real app, use a proper hashing library
    hashPassword(password) {
        // This is NOT secure, just for demo purposes
        // In a real application, use bcrypt or a similar library
        return btoa(password + 'salt_value');
    }

    // Public profile data (remove sensitive info)
    getPublicProfile() {
        const { password, ...publicData } = this;
        return publicData;
    }
}

// Authentication service
class AuthService {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
    }

    // Load users from localStorage
    loadUsers() {
        const usersJson = localStorage.getItem('tgen_users');
        return usersJson ? JSON.parse(usersJson) : [];
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('tgen_users', JSON.stringify(this.users));
    }

    // Load current user from sessionStorage
    loadCurrentUser() {
        const userJson = sessionStorage.getItem('tgen_current_user');
        return userJson ? JSON.parse(userJson) : null;
    }

    // Save current user to sessionStorage
    saveCurrentUser(user) {
        if (user) {
            sessionStorage.setItem('tgen_current_user', JSON.stringify(user));
        } else {
            sessionStorage.removeItem('tgen_current_user');
        }
    }

    // Register a new user
    register(fullName, email, password, interests = []) {
        // Check if email already exists
        if (this.getUserByEmail(email)) {
            throw new Error('Email already registered');
        }

        // Create new user
        const newUser = new User(fullName, email, password, interests);
        this.users.push(newUser);
        this.saveUsers();

        return newUser.getPublicProfile();
    }

    // Log in a user
    login(email, password, rememberMe = false) {
        const user = this.getUserByEmail(email);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Check password (this would be a secure comparison in a real app)
        const hashedPassword = new User('', '', password).hashPassword(password);
        
        if (user.password !== hashedPassword) {
            throw new Error('Invalid password');
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        // Set current user
        this.currentUser = user;
        this.saveCurrentUser(user.getPublicProfile());

        // If remember me is checked, store in localStorage
        if (rememberMe) {
            localStorage.setItem('tgen_remember_user', email);
        }

        return user.getPublicProfile();
    }

    // Log out the current user
    logout() {
        this.currentUser = null;
        this.saveCurrentUser(null);
        localStorage.removeItem('tgen_remember_user');
    }

    // Get a user by email
    getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    // Get a user by ID
    getUserById(id) {
        return this.users.find(user => user.id === id);
    }

    // Check if a user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Update user profile
    updateProfile(userData) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        const user = this.getUserById(this.currentUser.id);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Update allowed fields
        const allowedFields = ['fullName', 'bio', 'interests', 'profilePicture'];
        
        allowedFields.forEach(field => {
            if (userData[field] !== undefined) {
                user[field] = userData[field];
            }
        });

        this.saveUsers();
        this.currentUser = user;
        this.saveCurrentUser(user.getPublicProfile());

        return user.getPublicProfile();
    }

    // Change password
    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('No user logged in');
        }

        const user = this.getUserById(this.currentUser.id);
        
        if (!user) {
            throw new Error('User not found');
        }

        // Verify old password
        const hashedOldPassword = new User('', '', oldPassword).hashPassword(oldPassword);
        
        if (user.password !== hashedOldPassword) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        user.password = new User('', '', newPassword).hashPassword(newPassword);
        this.saveUsers();

        return true;
    }

    // Request password reset (in a real app, this would send an email)
    requestPasswordReset(email) {
        const user = this.getUserByEmail(email);
        
        if (!user) {
            // For security reasons, don't reveal if the email exists or not
            return true;
        }

        // In a real app, generate a reset token and send an email
        // For demo purposes, we'll just log it
        console.log(`Password reset requested for ${email}`);
        
        return true;
    }

    // Check for remembered user
    checkRememberedUser() {
        const rememberedEmail = localStorage.getItem('tgen_remember_user');
        
        if (rememberedEmail) {
            const user = this.getUserByEmail(rememberedEmail);
            
            if (user) {
                // Auto login (in a real app, you'd use a secure token instead)
                this.currentUser = user;
                this.saveCurrentUser(user.getPublicProfile());
                return user.getPublicProfile();
            }
        }
        
        return null;
    }
}

// Password validation utility
class PasswordValidator {
    // Check password strength (returns 0-5)
    static checkStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        if (password.match(/[a-z]/)) strength += 1;
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^A-Za-z0-9]/)) strength += 1;
        
        return strength;
    }

    // Get text description of password strength
    static getStrengthText(strength) {
        const descriptions = [
            'Very Weak',
            'Weak',
            'Medium',
            'Strong',
            'Very Strong',
            'Excellent'
        ];
        
        return descriptions[strength] || descriptions[0];
    }

    // Check if password meets minimum requirements
    static meetsRequirements(password) {
        // Require at least 3 out of 5 strength points
        return this.checkStrength(password) >= 3;
    }
}

// Initialize auth service
const authService = new AuthService();

// Check for remembered user on page load
document.addEventListener('DOMContentLoaded', function() {
    const rememberedUser = authService.checkRememberedUser();
    
    if (rememberedUser) {
        // User is auto-logged in
        console.log(`Welcome back, ${rememberedUser.fullName}`);
        
        // Update UI to reflect logged-in state
        updateAuthUI(true);
    } else {
        // No remembered user
        updateAuthUI(false);
    }
});

// Update UI based on authentication state
function updateAuthUI(isLoggedIn) {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (!authButtons) return;
    
    if (isLoggedIn) {
        // User is logged in - update UI
        const user = authService.currentUser;
        
        // Replace login/signup buttons with user menu
        authButtons.innerHTML = `
            <div class="user-menu">
                <div class="user-avatar">
                    <img src="${user.profilePicture || 'images/default-avatar.png'}" alt="${user.fullName}">
                </div>
                <div class="user-dropdown">
                    <ul>
                        <li><a href="profile.html">My Profile</a></li>
                        <li><a href="dashboard.html">Dashboard</a></li>
                        <li><a href="#" id="logoutButton">Log Out</a></li>
                    </ul>
                </div>
            </div>
        `;
        
        // Add logout handler
        document.getElementById('logoutButton').addEventListener('click', function(e) {
            e.preventDefault();
            authService.logout();
            window.location.href = 'index.html';
        });
    } else {
        // User is not logged in - ensure default buttons
        authButtons.innerHTML = `
            <a href="login.html" class="btn btn-outline">Log In</a>
            <a href="signup.html" class="btn btn-primary">Sign Up</a>
        `;
    }
}

// Form handling for signup page
if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');
    
    // Password strength meter
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const strength = PasswordValidator.checkStrength(password);
        const strengthDescription = PasswordValidator.getStrengthText(strength);
        
        // Update strength meter
        passwordStrength.className = 'strength-meter';
        
        if (strength > 0) {
            if (strength <= 2) passwordStrength.classList.add('weak');
            else if (strength <= 3) passwordStrength.classList.add('medium');
            else if (strength <= 4) passwordStrength.classList.add('strong');
            else passwordStrength.classList.add('very-strong');
            
            strengthText.textContent = strengthDescription;
        } else {
            strengthText.textContent = '';
        }
    });
    
    // Form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Get form values
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Get selected interests
            const interestsSelect = document.getElementById('interests');
            const selectedInterests = Array.from(interestsSelect.selectedOptions).map(option => option.value);
            
            // Validate password match
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }
            
            // Validate password strength
            if (!PasswordValidator.meetsRequirements(password)) {
                throw new Error('Password does not meet security requirements');
            }
            
            // Terms agreement
            const termsAgreement = document.getElementById('termsAgreement');
            if (!termsAgreement.checked) {
                throw new Error('You must agree to the terms to continue');
            }
            
            // Register user
            const newUser = authService.register(fullName, email, password, selectedInterests);
            
            // Auto login
            authService.login(email, password);
            
            // Show success message
            alert('Account created successfully! Welcome to TGen Robotic HUB!');
            
            // Redirect to dashboard
            window.location.href = 'index.html';
            
        } catch (error) {
            // Show error message
            alert(`Registration failed: ${error.message}`);
        }
    });
}

// Form handling for login page
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Get form values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            // Login user
            authService.login(email, password, rememberMe);
            
            // Show success message
            alert('Login successful! Welcome back to TGen Robotic HUB!');
            
            // Redirect to dashboard
            window.location.href = 'index.html';
            
        } catch (error) {
            // Show error message
            alert(`Login failed: ${error.message}`);
        }
    });
}

// Form handling for password reset page
if (document.getElementById('resetPasswordForm')) {
    const resetForm = document.getElementById('resetPasswordForm');
    
    resetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Get email
            const email = document.getElementById('email').value;
            
            // Request password reset
            authService.requestPasswordReset(email);
            
            // Show success message (always show success for security reasons)
            alert('If an account with this email exists, password reset instructions have been sent. Please check your inbox.');
            
            // Redirect to login
            window.location.href = 'login.html';
            
        } catch (error) {
            // Show generic error message for security
            alert('Unable to process your request. Please try again later.');
        }
    });
}

// Profile page functions
if (document.getElementById('profileForm')) {
    const profileForm = document.getElementById('profileForm');
    const currentUser = authService.currentUser;
    
    // Populate form with current user data
    if (currentUser) {
        document.getElementById('fullName').value = currentUser.fullName || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('bio').value = currentUser.bio || '';
        
        // Set selected interests
        if (currentUser.interests && Array.isArray(currentUser.interests)) {
            const interestsSelect = document.getElementById('interests');
            
            for (let option of interestsSelect.options) {
                if (currentUser.interests.includes(option.value)) {
                    option.selected = true;
                }
            }
        }
        
        // Show profile picture if available
        const profilePicture = document.getElementById('profilePicture');
        if (profilePicture && currentUser.profilePicture) {
            document.getElementById('currentProfilePicture').src = currentUser.profilePicture;
        }
    }
    
    // Form submission
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Get form values
            const fullName = document.getElementById('fullName').value;
            const bio = document.getElementById('bio').value;
            
            // Get selected interests
            const interestsSelect = document.getElementById('interests');
            const selectedInterests = Array.from(interestsSelect.selectedOptions).map(option => option.value);
            
            // Get profile picture
            const profilePicture = document.getElementById('profilePicture');
            let pictureUrl = currentUser.profilePicture || null;
            
            if (profilePicture.files && profilePicture.files[0]) {
                // In a real app, you would upload this to a server
                // For demo purposes, we'll use a FileReader to get a data URL
                const reader = new FileReader();
                
                reader.onloadend = function() {
                    pictureUrl = reader.result;
                    
                    // Update profile
                    const updatedUser = authService.updateProfile({
                        fullName,
                        bio,
                        interests: selectedInterests,
                        profilePicture: pictureUrl
                    });
                    
                    // Show success message
                    alert('Profile updated successfully!');
                    
                    // Refresh page
                    window.location.reload();
                };
                
                reader.readAsDataURL(profilePicture.files[0]);
            } else {
                // Update profile without changing picture
                const updatedUser = authService.updateProfile({
                    fullName,
                    bio,
                    interests: selectedInterests,
                    profilePicture: pictureUrl
                });
                
                // Show success message
                alert('Profile updated successfully!');
                
                // Refresh page
                window.location.reload();
            }
            
        } catch (error) {
            // Show error message
            alert(`Profile update failed: ${error.message}`);
        }
    });
}

// Change password form
if (document.getElementById('changePasswordForm')) {
    const passwordForm = document.getElementById('changePasswordForm');
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        try {
            // Get form values
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate password match
            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match');
            }
            
            // Validate password strength
            if (!PasswordValidator.meetsRequirements(newPassword)) {
                throw new Error('New password does not meet security requirements');
            }
            
            // Change password
            authService.changePassword(currentPassword, newPassword);
            
            // Show success message
            alert('Password changed successfully!');
            
            // Clear form
            passwordForm.reset();
            
        } catch (error) {
            // Show error message
            alert(`Password change failed: ${error.message}`);
        }
    });
}

// Add more handlers for other auth-related forms as needed

// Export auth service for use in other modules
window.authService = authService;
