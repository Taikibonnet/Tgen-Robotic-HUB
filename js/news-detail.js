// news-detail.js - Script to handle loading news article content

document.addEventListener('DOMContentLoaded', function() {
    // Get the article ID from the URL
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('id');
    
    if (!articleId) {
        // Handle missing article ID
        showError('Article not found. Please try another article.');
        return;
    }
    
    // Fetch article data
    fetchArticleData(articleId);
});

/**
 * Fetch the article data from the server or local data
 * @param {string} articleId - The ID of the article to fetch
 */
function fetchArticleData(articleId) {
    // In a real application, you would fetch this from a server API
    // For demo purposes, we'll use a simulated fetch with setTimeout
    
    showLoading();
    
    // Simulate network delay
    setTimeout(() => {
        // Check if we have article data in local storage
        const cachedData = localStorage.getItem(`article_${articleId}`);
        
        if (cachedData) {
            // If we have cached data, use it
            renderArticle(JSON.parse(cachedData));
        } else {
            // Otherwise, fetch from "server" (simulated)
            // In a real app, this would be an API call
            fetchFromAPI(articleId);
        }
    }, 1000);
}

/**
 * Simulate fetching from an API
 * @param {string} articleId - The ID of the article to fetch
 */
function fetchFromAPI(articleId) {
    // In a real app, this would be a fetch() call to your API
    
    // For demo, we'll use a mock database of articles
    const articles = {
        '1': {
            id: '1',
            title: 'RIC Technology Unveils Advanced Construction Robotic 3D Printer',
            category: 'Innovation',
            date: 'April 15, 2025',
            author: 'Tech Team',
            image: 'images/news/3d-printer-large.jpg',
            content: `
                <p>RIC Technology, a leader in construction robotics, has unveiled its latest innovation, the RIC-PRIMUS, an advanced construction 3D printer designed to revolutionize building processes across the industry.</p>
                
                <p>The RIC-PRIMUS represents a significant leap forward in construction automation, capable of printing large-scale structures with unprecedented precision and speed. According to the company, the system can reduce construction time by up to 60% while maintaining high structural integrity and design flexibility.</p>
                
                <h2>Technical Specifications</h2>
                
                <p>The RIC-PRIMUS features a modular design with a printing envelope of 12 meters by 12 meters and a height capacity of 9 meters. This makes it suitable for printing single and multi-story structures in one continuous operation. The system utilizes a proprietary concrete mixture that provides optimal flow characteristics during printing while achieving rapid curing and high structural strength.</p>
                
                <p>The printer is equipped with advanced sensor arrays that monitor environmental conditions in real-time, automatically adjusting printing parameters to ensure consistent quality regardless of external factors like temperature and humidity. This adaptive approach enables year-round operation even in challenging weather conditions.</p>
                
                <div class="article-quote">
                    "Construction 3D printing is finally maturing into a reliable, scalable technology," said Dr. Martin Chen, CTO of RIC Technology. "With the RIC-PRIMUS, we've addressed the key challenges that have limited adoption in the past: speed, reliability, and integration with existing construction workflows."
                </div>
                
                <h2>Industry Impact</h2>
                
                <p>The construction industry has been notably slower to adopt automation compared to other sectors, largely due to the complex, varied nature of building projects and the challenges of operating robotics in uncontrolled environments. However, with increasing labor shortages and growing pressure to reduce environmental impact, interest in construction robotics has accelerated significantly.</p>
                
                <p>RIC Technology reports that pilot projects using the RIC-PRIMUS have demonstrated material waste reduction of up to 70% compared to traditional construction methods. This significant improvement in resource efficiency, combined with reduced labor requirements and faster project completion, presents a compelling case for adoption by forward-thinking construction companies.</p>
                
                <h2>Market Outlook</h2>
                
                <p>The global construction 3D printing market is projected to grow from $4.5 billion in 2024 to over $12 billion by 2030, according to industry analysts. RIC Technology is positioning itself at the forefront of this growth with plans to deploy 50 RIC-PRIMUS units worldwide by the end of 2026.</p>
                
                <p>The company is also developing specialized variants of the system for different applications, including disaster relief housing, infrastructure projects, and architectural features. With continued innovation and growing industry acceptance, construction 3D printing is poised to transform how we build our cities and infrastructure in the coming decades.</p>
            `,
            tags: ['3D Printing', 'Construction', 'Automation', 'Innovation', 'Building Technology'],
            relatedArticles: [2, 3, 6]
        },
        '2': {
            id: '2',
            title: 'MIT's "Xstrings" Method Enables Automated Assembly of Cable-Driven Robots',
            category: 'Research',
            date: 'April 12, 2025',
            author: 'Research Team',
            image: 'images/news/mit-research-large.jpg',
            content: `
                <p>Researchers at the Massachusetts Institute of Technology (MIT) have developed a groundbreaking method called "Xstrings" that enables the automated design and assembly of cable-driven robots, opening new possibilities for a variety of applications from artistic sculptures to functional mechanical systems.</p>
                
                <p>The innovative approach allows users to produce cable-driven objects with complex movements automatically, creating robots, kinetic art, and even dynamic fashion designs with unprecedented ease and precision.</p>
                
                <h2>How Xstrings Works</h2>
                
                <p>The Xstrings system uses computational design and specialized fabrication techniques to create objects with embedded cables that can produce complex movements when pulled. The process begins with users specifying desired motions and constraints in software, which then automatically determines the optimal cable routing and attachment points to achieve the specified movements.</p>
                
                <p>Once designed, the system guides the physical assembly process through augmented reality cues that show exactly where to route each cable. This dramatically reduces the complexity typically associated with creating cable-driven mechanisms, which traditionally require significant expertise in mechanical design.</p>
                
                <div class="article-quote">
                    "Cable-driven systems have enormous potential because they're lightweight, efficient, and can create complex movements with relatively simple means," explains Dr. Jess Kim, lead researcher on the project. "But they've been notoriously difficult to design and build. Xstrings makes this accessible to anyone with basic making skills."
                </div>
                
                <h2>Applications and Potential</h2>
                
                <p>The research team has already demonstrated several impressive applications, including reactive architectural elements that respond to environmental conditions, interactive art installations, and prototype prosthetics that mimic natural joint movements with lightweight, energy-efficient designs.</p>
                
                <p>One particularly promising area is soft robotics, where cable-driven systems can create organic-looking movements without the weight and complexity of traditional motors at every joint. This could lead to more natural-looking and energy-efficient robotic assistants, as well as innovative medical devices.</p>
                
                <h2>Future Developments</h2>
                
                <p>The MIT team is now working on extending the system to incorporate sensors and feedback mechanisms, allowing the cable-driven objects to respond to their environment autonomously. They're also exploring ways to combine the cable-driven approach with other actuation methods for hybrid systems with even greater capabilities.</p>
                
                <p>The research represents a significant step toward democratizing complex mechanical design, potentially enabling creators without specialized engineering backgrounds to build sophisticated robotic systems. The team plans to release open-source versions of their design tools later this year to encourage broader experimentation and innovation in this emerging field.</p>
            `,
            tags: ['Research', 'MIT', 'Cable-Driven Robotics', 'Fabrication', 'Design'],
            relatedArticles: [1, 4, 6]
        },
        '3': {
            id: '3',
            title: 'Startups Accelerate Development of Autonomous Mobile Robots for Material Movement',
            category: 'Industry',
            date: 'April 10, 2025',
            author: 'Industry Team',
            image: 'images/news/warehouse-robots-large.jpg',
            content: `
                <p>A new wave of robotics startups and scaleups are rapidly advancing the capabilities of autonomous mobile robots (AMRs) for material movement, challenging established players and bringing more sophisticated automation options to warehouses, factories, and distribution centers worldwide.</p>
                
                <p>These emerging companies are leveraging recent advances in computer vision, artificial intelligence, and navigation technologies to create more versatile, intelligent robots that can seamlessly integrate with existing workflows and physical environments without extensive modifications.</p>
                
                <h2>Enhanced Capabilities</h2>
                
                <p>The latest generation of AMRs features significant improvements over earlier models, with capabilities including true 3D mapping and navigation, predictive movement planning, and more sophisticated interaction with human workers. Most notably, these robots can now recognize and adapt to dynamic environments in real-time, eliminating the need for dedicated lanes or extensive infrastructure changes that characterized earlier automation solutions.</p>
                
                <p>Several startups are focusing on specific challenges that have limited wider adoption, such as handling irregular or delicate items, navigating extremely tight spaces, or operating in environments with limited connectivity. These specialized approaches are opening automation possibilities for industries that previously found robotic solutions impractical or cost-prohibitive.</p>
                
                <div class="article-quote">
                    "What we're seeing is a transition from robots that can follow simple instructions in controlled environments to truly adaptive systems that understand their surroundings and can make complex decisions autonomously," notes Sarah Mendez, robotics analyst at AutomationEdge Research.
                </div>
                
                <h2>Industry Adoption Patterns</h2>
                
                <p>Early adopters of these next-generation AMRs report implementation times of weeks rather than months, with return on investment periods as short as 9-12 months for high-throughput operations. This rapid payback period is driving accelerated adoption, particularly among mid-sized companies that previously considered advanced automation out of reach.</p>
                
                <p>The healthcare sector has emerged as a surprising growth area, with hospitals and medical facilities deploying specialized AMRs for everything from medication delivery to equipment transport and waste management. These implementations are freeing clinical staff from logistical tasks, allowing more time for patient care in environments facing chronic staffing challenges.</p>
                
                <h2>Market Dynamics</h2>
                
                <p>The global market for AMRs is projected to reach $25 billion by 2030, growing at over 20% annually according to recent industry reports. This explosive growth has attracted significant venture capital, with AMR startups raising over $2.8 billion in funding during 2024 alone.</p>
                
                <p>While established industrial automation companies maintain advantages in scale and established customer relationships, the agility and specialized focus of newer entrants are enabling rapid innovation cycles that are reshaping competitive dynamics across the industry. As these technologies mature, expect to see increasing consolidation as larger players acquire innovative startups to enhance their capabilities and defend market share.</p>
            `,
            tags: ['Autonomous Robots', 'Warehousing', 'Logistics', 'Startups', 'Material Handling'],
            relatedArticles: [1, 5, 6]
        }
        // Additional articles would be defined here
    };
    
    // Check if the requested article exists
    if (articles[articleId]) {
        // Cache the article data for future requests
        localStorage.setItem(`article_${articleId}`, JSON.stringify(articles[articleId]));
        
        // Render the article
        renderArticle(articles[articleId]);
    } else {
        // Show error if article doesn't exist
        showError('Article not found. Please try another article.');
    }
}

/**
 * Render the article on the page
 * @param {Object} articleData - The article data to render
 */
function renderArticle(articleData) {
    // Hide loading spinner
    hideLoading();
    
    // Update page title
    document.title = `${articleData.title} - Tgen Robotics Hub`;
    
    // Update article category
    const categoryElement = document.querySelector('.article-category');
    if (categoryElement) categoryElement.textContent = articleData.category;
    
    // Update article title
    const titleElement = document.querySelector('.article-title');
    if (titleElement) titleElement.textContent = articleData.title;
    
    // Update article date
    const dateElement = document.querySelector('.article-date');
    if (dateElement) dateElement.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${articleData.date}`;
    
    // Update article author
    const authorElement = document.querySelector('.article-author');
    if (authorElement) authorElement.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        By ${articleData.author}`;
    
    // Update article image
    const imageElement = document.querySelector('.article-image');
    if (imageElement) {
        imageElement.src = articleData.image;
        imageElement.alt = articleData.title;
    }
    
    // Update article content
    const contentElement = document.querySelector('.article-content');
    if (contentElement) contentElement.innerHTML = articleData.content;
    
    // Update article tags
    const tagsElement = document.querySelector('.article-tags');
    if (tagsElement && articleData.tags) {
        tagsElement.innerHTML = '';
        articleData.tags.forEach(tag => {
            const tagLink = document.createElement('a');
            tagLink.href = `news.html?tag=${encodeURIComponent(tag)}`;
            tagLink.className = 'article-tag';
            tagLink.textContent = `#${tag}`;
            tagsElement.appendChild(tagLink);
        });
    }
    
    // Update related articles (if available)
    if (articleData.relatedArticles && articleData.relatedArticles.length > 0) {
        updateRelatedArticles(articleData.relatedArticles);
    }
}

/**
 * Update related articles section
 * @param {Array} relatedIds - Array of related article IDs
 */
function updateRelatedArticles(relatedIds) {
    // This would typically fetch related articles from an API
    // For demo purposes, we'll use mock data
    
    const relatedArticlesData = [
        {
            id: '1',
            title: 'RIC Technology Unveils Advanced Construction Robotic 3D Printer',
            date: 'April 15, 2025',
            image: 'images/news/3d-printer.jpg'
        },
        {
            id: '2',
            title: 'MIT's "Xstrings" Method Enables Automated Assembly of Cable-Driven Robots',
            date: 'April 12, 2025',
            image: 'images/news/mit-research.jpg'
        },
        {
            id: '3',
            title: 'Startups Accelerate Development of Autonomous Mobile Robots for Material Movement',
            date: 'April 10, 2025',
            image: 'images/news/warehouse-robots.jpg'
        },
        {
            id: '4',
            title: 'Robot See, Robot Do: New AI System Learns After Watching How-to Videos',
            date: 'April 8, 2025',
            image: 'images/news/robot-video-learning.jpg'
        },
        {
            id: '5',
            title: 'Powerful Clinical AI Tool Shows Remarkable Diagnostic Accuracy',
            date: 'April 4, 2025',
            image: 'images/news/medical-ai.jpg'
        },
        {
            id: '6',
            title: 'Next-Generation Humanoid Robots Demonstrate Advanced Dexterity',
            date: 'April 1, 2025',
            image: 'images/news/humanoid-robot.jpg'
        }
    ];
    
    // Filter to get only the related articles
    const relatedArticles = relatedArticlesData.filter(article => relatedIds.includes(parseInt(article.id)));
    
    // Get the container element
    const gridElement = document.querySelector('.article-grid');
    if (!gridElement) return;
    
    // Clear current content
    gridElement.innerHTML = '';
    
    // Add related articles to the grid
    relatedArticles.forEach(article => {
        const articleCard = document.createElement('a');
        articleCard.href = `news-detail.html?id=${article.id}`;
        articleCard.className = 'article-card';
        
        articleCard.innerHTML = `
            <img src="${article.image}" alt="${article.title}" class="card-image">
            <div class="card-content">
                <h3 class="card-title">${article.title}</h3>
                <p class="card-date">${article.date}</p>
            </div>
        `;
        
        gridElement.appendChild(articleCard);
    });
}

/**
 * Show loading spinner
 */
function showLoading() {
    // Create loading element if it doesn't exist
    if (!document.querySelector('.article-loading')) {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'article-loading';
        loadingElement.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        `;
        
        // Insert after the back link
        const backLink = document.querySelector('.back-link');
        if (backLink) {
            backLink.insertAdjacentElement('afterend', loadingElement);
        }
    }
    
    // Hide the article content
    const articleElements = document.querySelectorAll('.article-header, .article-image, .article-content, .article-tags, .share-section, .related-articles');
    articleElements.forEach(el => {
        el.style.display = 'none';
    });
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    // Remove loading element
    const loadingElement = document.querySelector('.article-loading');
    if (loadingElement) {
        loadingElement.remove();
    }
    
    // Show the article content
    const articleElements = document.querySelectorAll('.article-header, .article-image, .article-content, .article-tags, .share-section, .related-articles');
    articleElements.forEach(el => {
        el.style.display = '';
    });
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Hide loading
    hideLoading();
    
    // Create error element if it doesn't exist
    if (!document.querySelector('.article-error')) {
        const errorElement = document.createElement('div');
        errorElement.className = 'article-error message message-error';
        errorElement.textContent = message;
        
        // Insert after the back link
        const backLink = document.querySelector('.back-link');
        if (backLink) {
            backLink.insertAdjacentElement('afterend', errorElement);
        }
    }
    
    // Hide the article content
    const articleElements = document.querySelectorAll('.article-header, .article-image, .article-content, .article-tags, .share-section, .related-articles');
    articleElements.forEach(el => {
        el.style.display = 'none';
    });
}
