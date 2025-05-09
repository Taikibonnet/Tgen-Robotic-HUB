/**
 * Token Manager for Tgen Robotics Hub
 * This file contains utility functions for managing GitHub tokens
 */

window.tokenManager = (function() {
    
    /**
     * Initialize token manager and show prompt if no token is set
     */
    function init() {
        // Check if token exists in localStorage
        const token = localStorage.getItem('github_token');
        
        // Show token UI in the header
        addTokenUIToHeader();
        
        // If no token, show prompt after a delay
        if (!token) {
            setTimeout(function() {
                promptForToken();
            }, 1000);
        }
    }

    /**
     * Add token management UI to the header
     */
    function addTokenUIToHeader() {
        const authButtons = document.querySelector('.auth-buttons');
        
        if (authButtons) {
            // Create token button
            const tokenButton = document.createElement('button');
            tokenButton.className = 'btn btn-outline';
            tokenButton.innerHTML = '<i class="fas fa-key"></i> GitHub Token';
            tokenButton.style.marginRight = '10px';
            tokenButton.addEventListener('click', function() {
                showTokenModal();
            });
            
            // Insert before other auth buttons
            authButtons.insertBefore(tokenButton, authButtons.firstChild);
        }
    }

    /**
     * Show token management modal
     */
    function showTokenModal() {
        // Create modal container
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';
        
        // Check current token status
        const token = localStorage.getItem('github_token');
        const hasToken = !!token;
        
        // Create modal content
        const content = document.createElement('div');
        content.style.backgroundColor = '#1a1a1a';
        content.style.borderRadius = '10px';
        content.style.padding = '30px';
        content.style.maxWidth = '500px';
        content.style.width = '90%';
        
        content.innerHTML = `
            <h2 style="margin-top: 0; margin-bottom: 20px;">GitHub Token Manager</h2>
            <p style="margin-bottom: 20px;">
                A GitHub personal access token is required to add, edit, or delete robots.
                <br>
                ${hasToken ? 'Your token is currently set.' : 'No token is currently set.'}
            </p>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px;">GitHub Personal Access Token:</label>
                <input type="text" id="github-token-input" placeholder="Enter your GitHub token" 
                       value="${hasToken ? '****************************************' : ''}" 
                       style="width: 100%; padding: 10px; border-radius: 5px; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white;">
                <small style="display: block; margin-top: 5px; color: #adb5bd;">
                    Need a token? <a href="https://github.com/settings/tokens" target="_blank" style="color: #20e3b2;">
                        Create one on GitHub
                    </a> with 'repo' scope.
                </small>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
                <button id="modal-cancel" style="padding: 10px 20px; border-radius: 5px; background: transparent; border: 1px solid #adb5bd; color: #adb5bd; cursor: pointer;">
                    Cancel
                </button>
                
                <div>
                    ${hasToken ? 
                        `<button id="modal-clear" style="padding: 10px 20px; border-radius: 5px; background: rgba(255, 107, 107, 0.2); border: none; color: #ff6b6b; cursor: pointer; margin-right: 10px;">
                            Clear Token
                        </button>` : ''
                    }
                    <button id="modal-save" style="padding: 10px 20px; border-radius: 5px; background: linear-gradient(90deg, #0cebeb, #20e3b2); border: none; color: black; cursor: pointer;">
                        Save Token
                    </button>
                </div>
            </div>
        `;
        
        // Add modal to document
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Add event listeners
        const cancelButton = document.getElementById('modal-cancel');
        const saveButton = document.getElementById('modal-save');
        const clearButton = document.getElementById('modal-clear');
        const tokenInput = document.getElementById('github-token-input');
        
        // If token is set, select all on focus
        if (hasToken) {
            tokenInput.addEventListener('focus', function() {
                this.value = '';
                this.placeholder = 'Enter your GitHub token';
            });
        }
        
        // Cancel button closes modal
        cancelButton.addEventListener('click', function() {
            document.body.removeChild(modal);
        });
        
        // Save button saves token
        saveButton.addEventListener('click', function() {
            const newToken = tokenInput.value.trim();
            
            if (newToken) {
                setToken(newToken);
                alert('GitHub token saved successfully!');
                document.body.removeChild(modal);
            } else {
                alert('Please enter a valid GitHub token');
            }
        });
        
        // Clear button removes token
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                if (confirm('Are you sure you want to remove your GitHub token? You will not be able to add, edit, or delete robots.')) {
                    clearToken();
                    alert('GitHub token removed.');
                    document.body.removeChild(modal);
                }
            });
        }
    }

    /**
     * Set GitHub token
     */
    function setToken(token) {
        localStorage.setItem('github_token', token);
        
        // Update token in storage module if available
        if (window.githubStorage && typeof window.githubStorage.setToken === 'function') {
            window.githubStorage.setToken(token);
        }
        
        return true;
    }
    
    /**
     * Clear GitHub token
     */
    function clearToken() {
        localStorage.removeItem('github_token');
        
        return true;
    }
    
    /**
     * Check if GitHub token is set
     */
    function hasToken() {
        return !!localStorage.getItem('github_token');
    }
    
    /**
     * Get GitHub token
     */
    function getToken() {
        return localStorage.getItem('github_token');
    }
    
    /**
     * Prompt user to enter GitHub token
     */
    function promptForToken() {
        if (!hasToken()) {
            if (confirm('GitHub token is required to add, edit, or delete robots. Would you like to set it now?')) {
                showTokenModal();
            }
        }
    }
    
    // Return public API
    return {
        init: init,
        showTokenModal: showTokenModal,
        setToken: setToken,
        clearToken: clearToken,
        hasToken: hasToken,
        getToken: getToken,
        promptForToken: promptForToken
    };
})();

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.tokenManager.init();
});