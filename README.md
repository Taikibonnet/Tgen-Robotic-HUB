# Tgen Robotic HUB

A comprehensive online encyclopedia for robotics enthusiasts, researchers, and professionals. This platform provides detailed information about various robots, their specifications, applications, and media content.

## Website Structure

The platform consists of several key components:

- **Encyclopedia**: Browse robots with filtering and search capabilities
- **Robot Details**: In-depth information about each robot with media galleries
- **User Authentication**: Secure login system with admin controls
- **Responsive Design**: Mobile-friendly interface for all device types

## Recent Updates

### Media Display Enhancement (May 7, 2025)

We've addressed issues with image and video display for non-admin users by:

1. **Creating a dedicated robots directory** in the images folder to store robot images consistently
2. **Implementing a robust media handler** that properly resolves image and video paths for both admin and non-admin users
3. **Adding fallback placeholder images** to ensure robots without images still display properly
4. **Fixing video path handling** for embedded videos and external video links

### Image Path Resolution

The updated system now handles various image path formats:

- Absolute URLs (starting with `http://` or `https://`)
- Relative paths within the robots folder (`images/robots/image.jpg`)
- Partial paths that are automatically corrected (`image.jpg` → `images/robots/image.jpg`)

### Error Handling

We've added robust error handling to catch and resolve:

- Missing images (automatically replaced with placeholder)
- Incorrect image paths (automatically corrected to the robots folder)
- Invalid video URLs (providing links instead of embeds for unsupported formats)

## Technical Details

### File Structure

- **images/robots/** - Central storage location for all robot images
- **robot-media-handler.js** - Core functionality for handling media across the application
- **js/media-display.js** - Handles media display on detail pages with galleries and videos
- **js/encyclopedia.js** - Manages the encyclopedia page and robot card generation
- **js/data.js** - Contains sample robot data for demonstration

### Key Functions

The `robotMedia` object provides several important functions:

- `getImageUrl(robot)` - Retrieves the appropriate image URL for a robot
- `handleImageError(img)` - Handles image loading errors and uses fallbacks
- `getVideoUrl(robot)` - Creates properly formatted video URLs for embedding
- `fixImagePath(path)` - Corrects image paths to ensure compatibility
- `renderGallery(robot, container)` - Renders a complete media gallery

## Usage for Developers

When adding new robots to the system:

1. Always upload images to the `images/robots/` directory
2. Use the `robotMedia` helper functions to handle image and video URLs
3. For videos, YouTube links are automatically converted to embed formats
4. Ensure robots have fallback images in case the main image fails to load

## Next Steps

Future enhancements may include:

- Improved image lazy-loading for better performance
- Support for additional video providers beyond YouTube
- Enhanced gallery view with better lightbox functionality
- User image uploads with automatic optimization

## Contact

For any questions or issues related to the Tgen Robotic HUB, please reach out to our development team at contact@tgenrobotics.com.
