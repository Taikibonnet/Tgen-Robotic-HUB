/**
 * Profile page functionality for TGen Robotic HUB
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check for authentication
    if (!authService.isLoggedIn()) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }

    // Get current user
    const currentUser = authService.currentUser;

    // Populate profile overview
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileJoined = document.getElementById('profileJoined');
    const profileBio = document.getElementById('profileBio');
    const profileInterests = document.getElementById('profileInterests');
    const profileOverviewAvatar = document.getElementById('profileOverviewAvatar');

    if (profileName) profileName.textContent = currentUser.fullName || 'No Name Set';
    if (profileEmail) profileEmail.textContent = currentUser.email || '';
    
    // Format date
    if (profileJoined && currentUser.created) {
        const created = new Date(currentUser.created);
        profileJoined.textContent = `Member since ${created.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
    
    if (profileBio) profileBio.textContent = currentUser.bio || 'No bio yet.';
    
    // Populate interests
    if (profileInterests && currentUser.interests && currentUser.interests.length > 0) {
        profileInterests.innerHTML = '';
        
        // Map of interest values to display names
        const interestLabels = {
            'industrial': 'Industrial Robotics',
            'medical': 'Medical Robotics',
            'ai': 'AI & Machine Learning',
            'programming': 'Robotics Programming',
            'hardware': 'Hardware & Electronics',
            'drones': 'Drones & UAVs',
            'education': 'Educational Robotics',
            'research': 'Research & Development'
        };
        
        currentUser.interests.forEach(interest => {
            const badge = document.createElement('div');
            badge.className = 'interest-badge';
            badge.innerHTML = `
                <i class="fas fa-tag"></i>
                ${interestLabels[interest] || interest}
            `;
            profileInterests.appendChild(badge);
        });
    }
    
    // Set profile picture
    if (profileOverviewAvatar) {
        if (currentUser.profilePicture) {
            profileOverviewAvatar.innerHTML = `<img src="${currentUser.profilePicture}" alt="Profile Picture">`;
        } else {
            profileOverviewAvatar.innerHTML = `<i class="fas fa-user"></i>`;
        }
    }

    // Tab switching
    const tabs = document.querySelectorAll('.profile-tab');
    const contents = document.querySelectorAll('.profile-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to selected tab and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Mobile navigation
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    mobileMenuButton.addEventListener('click', function() {
        navLinks.classList.toggle('mobile-active');
        authButtons.classList.toggle('mobile-active');
    });

    // Update auth UI
    updateAuthUI(true);

    // Profile form
    const profileForm = document.getElementById('profileForm');
    
    if (profileForm) {
        // Populate form with current user data
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
        
        // Preview profile picture
        const currentPicture = document.getElementById('currentProfilePicture');
        if (currentPicture && currentUser.profilePicture) {
            currentPicture.src = currentUser.profilePicture;
        }
        
        // Handle file input change for image preview
        const profilePicture = document.getElementById('profilePicture');
        if (profilePicture) {
            profilePicture.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById('currentProfilePicture').src = e.target.result;
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
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
    const changePasswordForm = document.getElementById('changePasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('strengthText');

    if (changePasswordForm) {
        // Password toggle visibility
        const toggleCurrentPassword = document.getElementById('toggleCurrentPassword');
        const toggleNewPassword = document.getElementById('toggleNewPassword');
        const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        const currentPassword = document.getElementById('currentPassword');
        const confirmPassword = document.getElementById('confirmPassword');

        toggleCurrentPassword.addEventListener('click', function() {
            const type = currentPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            currentPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        toggleNewPassword.addEventListener('click', function() {
            const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            newPasswordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        // Password strength meter
        newPasswordInput.addEventListener('input', function() {
            const password = newPasswordInput.value;
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
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            try {
                // Reset error messages
                document.querySelectorAll('.error-message').forEach(el => {
                    el.classList.remove('show-error');
                });
                
                // Get form values
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = newPasswordInput.value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                
                // Validate password match
                if (newPassword !== confirmPassword) {
                    document.getElementById('confirmPasswordError').classList.add('show-error');
                    throw new Error('Passwords do not match');
                }
                
                // Validate password strength
                if (!PasswordValidator.meetsRequirements(newPassword)) {
                    document.getElementById('newPasswordError').classList.add('show-error');
                    throw new Error('Password does not meet security requirements');
                }
                
                // Change password
                authService.changePassword(currentPassword, newPassword);
                
                // Show success message
                alert('Password changed successfully!');
                
                // Clear form
                changePasswordForm.reset();
                
            } catch (error) {
                if (error.message.includes('Current password is incorrect')) {
                    document.getElementById('currentPasswordError').classList.add('show-error');
                }
                
                // Show error message
                alert(`Password change failed: ${error.message}`);
            }
        });
    }
});
