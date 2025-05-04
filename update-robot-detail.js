/**
 * Robot Detail Page Updater
 * 
 * This script should be run on the robot-detail.html page
 * It will add the videos tab and include the necessary JavaScript files
 * 
 * HOW TO USE:
 * 1. Add this script to your repository
 * 2. Open your browser console on the robot-detail.html page
 * 3. Run this code (copy and paste it in the console):
 *    fetch('update-robot-detail.js')
 *      .then(response => response.text())
 *      .then(script => eval(script))
 *      .catch(error => console.error('Error loading updater:', error));
 */

(function() {
    // Add CSS for videos tab
    const addVideoCSS = function() {
        const style = document.createElement('style');
        style.textContent = `
            /* Video Tab Styles */
            .robot-videos {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: 30px;
            }
            
            .video-item {
                background-color: rgba(18, 18, 18, 0.5);
                border-radius: 10px;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .video-item:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
            }
            
            .video-player {
                width: 100%;
                border-radius: 10px 10px 0 0;
            }
            
            .video-player iframe {
                width: 100%;
                height: 225px;
                border: none;
            }
            
            .video-player video {
                width: 100%;
                height: 225px;
                border-radius: 10px 10px 0 0;
                background-color: #000;
                object-fit: contain;
            }
            
            .video-content {
                padding: 15px;
            }
            
            .video-title {
                font-size: 1.2rem;
                margin-bottom: 10px;
                color: var(--light);
            }
            
            .video-description {
                font-size: 0.9rem;
                color: var(--gray);
                line-height: 1.5;
            }
            
            .empty-videos-message {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: var(--gray);
                font-style: italic;
            }
            
            @media (max-width: 992px) {
                .robot-videos {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('✅ Video CSS styles added');
    };

    // Add videos tab in navigation
    const addVideosTab = function() {
        const robotTabs = document.querySelector('.robot-tabs');
        const existingTab = document.querySelector('.robot-tab[data-tab="videos"]');
        
        if (robotTabs && !existingTab) {
            // Find the gallery tab
            const galleryTab = document.querySelector('.robot-tab[data-tab="gallery"]');
            
            if (galleryTab) {
                // Create videos tab and insert after gallery tab
                const videosTab = document.createElement('div');
                videosTab.className = 'robot-tab';
                videosTab.setAttribute('data-tab', 'videos');
                videosTab.textContent = 'Videos';
                
                // Insert after gallery tab
                galleryTab.after(videosTab);
                console.log('✅ Videos tab added to navigation');
            } else {
                console.error('❌ Gallery tab not found');
            }
        } else {
            console.log('Videos tab already exists or robot tabs not found');
        }
    };

    // Add videos tab content
    const addVideosTabContent = function() {
        const tabContents = document.querySelector('.tab-content[id="tab-gallery"]');
        const existingContent = document.querySelector('.tab-content[id="tab-videos"]');
        
        if (tabContents && !existingContent) {
            // Create videos tab content and insert after gallery tab
            const videosContent = document.createElement('div');
            videosContent.className = 'tab-content';
            videosContent.id = 'tab-videos';
            videosContent.innerHTML = `
                <h2 class="section-title">Robot Videos</h2>
                <div class="robot-videos" id="robot-videos">
                    <p class="empty-videos-message" style="display: none;">No videos available for this robot.</p>
                </div>
            `;
            
            // Insert after gallery tab
            tabContents.after(videosContent);
            console.log('✅ Videos tab content added');
        } else {
            console.log('Videos tab content already exists or tab contents not found');
        }
    };

    // Add script tags for our new JavaScript files
    const addScriptTags = function() {
        // Add video-handler.js
        const videoHandlerScript = document.createElement('script');
        videoHandlerScript.src = 'js/video-handler.js';
        document.body.appendChild(videoHandlerScript);
        console.log('✅ video-handler.js script tag added');
        
        // Add robot-detail-integration.js
        const integrationScript = document.createElement('script');
        integrationScript.src = 'js/robot-detail-integration.js';
        document.body.appendChild(integrationScript);
        console.log('✅ robot-detail-integration.js script tag added');
    };

    // Run all update functions
    addVideoCSS();
    addVideosTab();
    addVideosTabContent();
    addScriptTags();
    
    // Add click event listener for the videos tab
    const videosTab = document.querySelector('.robot-tab[data-tab="videos"]');
    if (videosTab) {
        videosTab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.robot-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById('tab-' + tabId).classList.add('active');
        });
        console.log('✅ Click event listener added to videos tab');
    }
    
    console.log('✅ Robot detail page updated successfully! Refresh the page to see the changes.');
})();
