// JavaScript code to fix image and video display in the encyclopedia section

document.addEventListener('DOMContentLoaded', function() {
  // Function to process robot article data and update the display
  function processRobotArticle(articleData) {
    // 1. Handle main image
    if (articleData.mainImage) {
      const mainImageContainer = document.querySelector('.main-image-placeholder');
      if (mainImageContainer) {
        mainImageContainer.innerHTML = '';
        const mainImg = document.createElement('img');
        mainImg.src = articleData.mainImage;
        mainImg.alt = articleData.title || 'Robot image';
        mainImg.className = 'main-robot-image';
        mainImageContainer.appendChild(mainImg);
      }
    }
    
    // 2. Handle gallery images
    if (articleData.galleryImages && Array.isArray(articleData.galleryImages) && articleData.galleryImages.length > 0) {
      const galleryContainer = document.querySelector('.gallery-container');
      if (galleryContainer) {
        galleryContainer.innerHTML = '';
        
        articleData.galleryImages.forEach(imageUrl => {
          const galleryItem = document.createElement('div');
          galleryItem.className = 'gallery-item';
          
          const img = document.createElement('img');
          img.src = imageUrl;
          img.alt = 'Gallery image';
          img.className = 'gallery-image';
          
          // Add click event for lightbox if needed
          img.addEventListener('click', function() {
            openLightbox(imageUrl);
          });
          
          galleryItem.appendChild(img);
          galleryContainer.appendChild(galleryItem);
        });
      }
    }
    
    // 3. Handle videos
    if (articleData.videos && Array.isArray(articleData.videos) && articleData.videos.length > 0) {
      const videoContainer = document.querySelector('.video-container');
      if (videoContainer) {
        videoContainer.innerHTML = '';
        
        articleData.videos.forEach(videoData => {
          const videoWrapper = document.createElement('div');
          videoWrapper.className = 'video-wrapper';
          
          // Check if it's a YouTube link
          if (videoData.type === 'youtube' && videoData.url) {
            // Extract YouTube video ID from URL
            const videoId = extractYoutubeId(videoData.url);
            if (videoId) {
              const iframe = document.createElement('iframe');
              iframe.width = '100%';
              iframe.height = '315';
              iframe.src = `https://www.youtube.com/embed/${videoId}`;
              iframe.frameBorder = '0';
              iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
              iframe.allowFullscreen = true;
              
              videoWrapper.appendChild(iframe);
            }
          } 
          // Check if it's an MP4 file
          else if (videoData.type === 'mp4' && videoData.url) {
            const videoPlayer = document.createElement('video');
            videoPlayer.controls = true;
            videoPlayer.width = '100%';
            videoPlayer.className = 'video-player';
            
            const source = document.createElement('source');
            source.src = videoData.url;
            source.type = 'video/mp4';
            
            videoPlayer.appendChild(source);
            videoWrapper.appendChild(videoPlayer);
          }
          // Handle other external video links
          else if (videoData.type === 'external' && videoData.url) {
            // Try to determine if it's a known video platform
            if (videoData.url.includes('vimeo.com')) {
              // Handle Vimeo videos
              const vimeoId = extractVimeoId(videoData.url);
              if (vimeoId) {
                const iframe = document.createElement('iframe');
                iframe.width = '100%';
                iframe.height = '315';
                iframe.src = `https://player.vimeo.com/video/${vimeoId}`;
                iframe.frameBorder = '0';
                iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                iframe.allowFullscreen = true;
                
                videoWrapper.appendChild(iframe);
              }
            } else {
              // For unknown external video services, create a link
              const linkElement = document.createElement('a');
              linkElement.href = videoData.url;
              linkElement.target = '_blank';
              linkElement.textContent = videoData.title || 'Watch external video';
              linkElement.className = 'external-video-link';
              
              videoWrapper.appendChild(linkElement);
            }
          }
          
          videoContainer.appendChild(videoWrapper);
        });
      }
    }
  }
  
  // Helper function to extract YouTube video ID from URL
  function extractYoutubeId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
  
  // Helper function to extract Vimeo video ID from URL
  function extractVimeoId(url) {
    const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|)(\d+)(?:$|\/|\?))/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }
  
  // Function to create a simple lightbox for gallery images
  function openLightbox(imageUrl) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.onclick = function() {
      document.body.removeChild(lightbox);
    };
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'lightbox-image';
    
    lightbox.appendChild(img);
    document.body.appendChild(lightbox);
  }
  
  // Get the robot ID from the URL (if applicable)
  const urlParams = new URLSearchParams(window.location.search);
  const robotId = urlParams.get('id');
  
  if (robotId) {
    // This function should be replaced with your actual data fetching logic
    // For example, you might fetch this from a JSON file or an API
    fetchRobotArticleData(robotId);
  }
  
  // Function to fetch robot article data
  function fetchRobotArticleData(id) {
    // Example if you store data in localStorage after editing in admin section
    const storedData = localStorage.getItem(`robot_${id}`);
    if (storedData) {
      try {
        const articleData = JSON.parse(storedData);
        processRobotArticle(articleData);
      } catch (e) {
        console.error('Error parsing robot article data:', e);
      }
    }
    
    // Alternative approach: fetch from a JSON file
    // fetch('data/robots.json')
    //   .then(response => response.json())
    //   .then(data => {
    //     const robotData = data.find(robot => robot.id == id);
    //     if (robotData) {
    //       processRobotArticle(robotData);
    //     }
    //   })
    //   .catch(error => console.error('Error fetching robot data:', error));
  }
});
