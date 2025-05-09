# Tgen Robotics Hub

A comprehensive web-based encyclopedia for robotics, where users can browse, search, and learn about various robots from around the world. The application includes an admin interface for adding, editing, and managing robot entries.

## Features

- **Robot Encyclopedia:** Browse through a catalog of robots with search and filter capabilities
- **Detailed Robot Pages:** View comprehensive information about each robot including technical specifications, media galleries, and videos
- **Admin Interface:** Add, edit, and delete robot entries through a user-friendly form
- **GitHub Integration:** All content is stored in the GitHub repository, making it easy to manage and deploy
- **Media Management:** Upload images and add video URLs to showcase robots
- **Category System:** Organize robots by categories for better navigation
- **Responsive Design:** Works on desktop, tablet, and mobile devices

## How It Works

The Tgen Robotics Hub uses GitHub as its backend to store all robot data in JSON format. Here's how the system works:

1. **Data Storage**: All robot data is stored in `data/robots.json` in the GitHub repository
2. **Media Files**: Images are stored in `images/robots/` directory in the repository
3. **GitHub API**: The system uses GitHub API to read and write data and files
4. **Web Interface**: The entire application runs in the browser with no server-side code needed

## Adding Robots

To add a new robot to the encyclopedia:

1. **Navigate to the Admin Form**: Go to the `admin-form.html` page
2. **Fill in Basic Information**: Enter the robot's name, manufacturer details, summary, and description
3. **Add Specifications**: Provide technical specifications like dimensions, weight, and performance metrics
4. **Upload Media**: Add a featured image, gallery images, and video URLs
5. **Save**: Click the "Save Robot" button to add the robot to the encyclopedia

## Uploading Media

The system supports two ways to add media:

1. **Image Uploads**: 
   - You can upload images directly from your computer by clicking on the upload area or dragging and dropping files.
   - Supported formats: JPG, PNG, GIF
   - Maximum file size: 5MB per image

2. **Video URLs**:
   - Add videos by entering their URLs (YouTube, Vimeo, etc.)
   - You can add multiple videos with titles and descriptions
   - Videos will be embedded in the robot detail page

## Editing and Deleting Robots

To edit or delete a robot:

1. **From Encyclopedia**: Click on the edit button on any robot card (admin only)
2. **From Detail Page**: Use the edit/delete buttons on the robot detail page (admin only)
3. **Edit Form**: Make your changes and save
4. **Delete Confirmation**: Confirm deletion when prompted

## Technical Implementation

The Tgen Robotics Hub is built using:

- **HTML/CSS/JavaScript**: Frontend implementation
- **GitHub API**: Backend data storage
- **Font Awesome**: Icons
- **CSS Grid/Flexbox**: Responsive layout

The application is structured into several modules:

- **GitHub Storage Module**: Handles reading and writing to GitHub (`github-storage.js`)
- **Admin Form**: Manages robot data entry (`improved-admin-form.js`)
- **Media Upload Handler**: Manages file uploads (`admin-upload-handler.js`)
- **Encyclopedia**: Displays robot cards and search functionality (`encyclopedia.js`)
- **Robot Detail**: Shows detailed information about a robot (`update-robot-detail.js`)

## Folder Structure

```
Tgen-Robotic-HUB/
├── css/
│   └── main.css
├── data/
│   └── robots.json
├── images/
│   ├── logo.svg
│   ├── robot-placeholder.jpg
│   └── robots/
│       └── [robot images]
├── js/
│   ├── admin-upload-handler.js
│   ├── data.js
│   ├── encyclopedia.js
│   ├── github-storage.js
│   └── main.js
├── admin-form.html
├── encyclopedia.html
├── improved-admin-form.js
├── index.html
├── robot-detail.html
└── update-robot-detail.js
```

## Getting Started

1. Clone the repository
2. Open `index.html` in your web browser
3. Navigate to the Encyclopedia to view robots
4. Go to the Admin Form to add new robots

## GitHub Token

To enable write operations (adding/editing robots), you need to:

1. Generate a GitHub personal access token with repo scope
2. Store it in your browser's local storage with the key `github_token`

This can be done by adding the token through the browser console:
```javascript
localStorage.setItem('github_token', 'your-github-token');
```

## Credits

This project was created by Taikibonnet. Feel free to contribute to this project by submitting pull requests or opening issues.