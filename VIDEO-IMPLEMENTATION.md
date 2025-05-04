# Video Functionality Implementation Guide

This guide explains how to implement the video functionality in your Robotics HUB website. The implementation includes:

1. Adding videos to robots in the admin interface
2. Displaying videos on the robot detail page

## Files Added

The following files have been added to implement video functionality:

- `robot-form-handler.js` - Handles video uploads and URL inputs in the admin interface
- `robot-storage-adapter.js` - Stores robot data including videos
- `robot-manager-integration.js` - Integrates functionality in the admin page
- `js/video-handler.js` - Functions for displaying videos on the robot detail page
- `js/robot-detail-integration.js` - Integrates video display into the robot detail page
- `update-robot-detail.js` - Helper script to add video tab to the robot detail page

## Implementation in Robot Detail Page

There are two ways to implement the video tab in the robot detail page:

### Method 1: Browser Console (Easiest)

1. Open your robot detail page in a web browser
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Run the following code:

```javascript
fetch('update-robot-detail.js')
  .then(response => response.text())
  .then(script => eval(script))
  .catch(error => console.error('Error loading updater:', error));
```

4. Refresh the page and the video tab should appear

### Method 2: Manual Implementation

1. Add the video tab to the robot-detail.html file in the tabs section:

```html
<div class="robot-tabs">
    <div class="robot-tab active" data-tab="description">Description</div>
    <div class="robot-tab" data-tab="specifications">Specifications</div>
    <div class="robot-tab" data-tab="gallery">Gallery</div>
    <div class="robot-tab" data-tab="videos">Videos</div> <!-- Add this line -->
    <div class="robot-tab" data-tab="applications">Applications</div>
    <div class="robot-tab" data-tab="reviews">Reviews</div>
</div>
```

2. Add the video tab content section:

```html
<!-- Videos Tab -->
<div class="tab-content" id="tab-videos">
    <h2 class="section-title">Robot Videos</h2>
    <div class="robot-videos" id="robot-videos">
        <!-- Videos will be populated by JavaScript -->
        <p class="empty-videos-message" style="display: none;">No videos available for this robot.</p>
    </div>
</div>
```

3. Add the video CSS styles to the `<style>` section:

```css
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
```

4. Include the JavaScript files before the closing `</body>` tag:

```html
<!-- Add these script imports right before the closing </body> tag -->
<script src="js/video-handler.js"></script>
<script src="js/robot-detail-integration.js"></script>
```

5. Add a call to `populateVideos(robot)` in your existing `populateRobotData` function:

```javascript
function populateRobotData(robot) {
    // Basic info
    document.getElementById('robot-name').textContent = robot.name;
    // ... (existing code)
    
    // Add this line at the end of the function
    populateVideos(robot);
}
```

## Adding Videos in the Admin Interface

The admin interface already has the necessary code to add videos to robots. You can:

1. Upload video files directly
2. Add video URLs from YouTube, Vimeo, or other platforms

When adding video URLs, you can also add a title and description for each video.

## Testing

To test the functionality:

1. Open the admin page and add a new robot or edit an existing one
2. Go to the Media tab and add videos (either upload files or add URLs)
3. Save the robot
4. View the robot detail page and see the videos tab

## Troubleshooting

If you encounter issues:

- Check the browser console for JavaScript errors
- Make sure all script files are properly included
- Verify that robot data is being loaded correctly
- Ensure the CSS styles are applied properly

For any questions or assistance, please contact support.
