/* main.css - Core styles for Tgen Robotics Hub website */

:root {
    --primary: #20e3b2;
    --secondary: #0cebeb;
    --dark: #121212;
    --light: #f8f9fa;
    --accent: #ff6b6b;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: #121212;
    color: var(--light);
    line-height: 1.6;
    overflow-x: hidden;
}

a {
    color: var(--primary);
    text-decoration: none;
    transition: all 0.3s ease;
}

a:hover {
    color: var(--secondary);
}

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header Styles */
header {
    background-color: rgba(18, 18, 18, 0.95);
    padding: 15px 0;
    position: fixed;
    width: 100%;
    top: 0;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    height: 60px;
}

.nav-links {
    display: flex;
    gap: 30px;
}

.nav-links a {
    color: var(--light);
    font-weight: 500;
    position: relative;
}

.nav-links a::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -5px;
    left: 0;
    background: linear-gradient(90deg, var(--secondary), var(--primary));
    transition: width 0.3s ease;
}

.nav-links a:hover::after, .nav-links a.active::after {
    width: 100%;
}

.nav-links a.active {
    color: var(--primary);
}

.auth-buttons {
    display: flex;
    gap: 15px;
}

.btn {
    padding: 10px 20px;
    border-radius: 50px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-block;
}

.btn-outline {
    border: 2px solid var(--primary);
    background: transparent;
    color: var(--primary);
}

.btn-outline:hover {
    background: var(--primary);
    color: var(--dark);
}

.btn-primary {
    background: linear-gradient(90deg, var(--secondary), var(--primary));
    color: var(--dark);
    border: none;
}

.btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(32, 227, 178, 0.3);
}

/* Main Content Area */
.main-content {
    padding: 100px 0 60px;
    min-height: calc(100vh - 300px);
}

.section-title {
    font-size: 2.5rem;
    margin-bottom: 60px;
    text-align: center;
    position: relative;
    padding-bottom: 20px;
}

.section-title::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 3px;
    background: linear-gradient(90deg, var(--secondary), var(--primary));
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
}

/* AI Assistant */
.ai-assistant {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 1000;
}

.ai-button {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--secondary), var(--primary));
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 5px 20px rgba(32, 227, 178, 0.4);
    transition: all 0.3s ease;
}

.ai-button:hover {
    transform: scale(1.1);
}

.ai-icon {
    font-size: 1.5rem;
    color: var(--dark);
}

/* Footer */
footer {
    background-color: rgba(10, 10, 10, 0.95);
    padding: 60px 0 20px;
}

.footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    margin-bottom: 40px;
}

.footer-section h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
    color: var(--primary);
}

.footer-links {
    list-style: none;
}

.footer-links li {
    margin-bottom: 10px;
}

.footer-links a {
    color: var(--light);
    opacity: 0.7;
    transition: all 0.3s ease;
}

.footer-links a:hover {
    opacity: 1;
    color: var(--primary);
}

.copyright {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.9rem;
    color: var(--light);
    opacity: 0.6;
}

/* Loader */
.loader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.loader {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(32, 227, 178, 0.2);
    border-radius: 50%;
    border-top-color: var(--primary);
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Messages */
.message {
    padding: 15px 20px;
    border-radius: 10px;
    margin-bottom: 20px;
}

.message-success {
    background-color: rgba(32, 227, 178, 0.2);
    color: var(--primary);
}

.message-error {
    background-color: rgba(255, 107, 107, 0.2);
    color: var(--accent);
}

.message-info {
    background-color: rgba(42, 157, 255, 0.2);
    color: #2a9dff;
}

/* No Results */
.no-results {
    text-align: center;
    padding: 50px 0;
    width: 100%;
}

.no-results h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: var(--primary);
}

.no-results p {
    color: var(--gray);
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.fade-in {
    animation: fadeIn 0.5s ease-in-out;
}

/* Responsive */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    .mobile-menu-button {
        display: block;
        background: none;
        border: none;
        color: var(--light);
        font-size: 1.5rem;
        cursor: pointer;
    }
    
    .nav-links.mobile-active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 80px;
        left: 0;
        width: 100%;
        background-color: rgba(18, 18, 18, 0.95);
        padding: 20px;
        z-index: 1000;
    }
    
    .auth-buttons {
        display: none;
    }
    
    .auth-buttons.mobile-active {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
    }
    
    .section-title {
        font-size: 2rem;
    }
}

@media (max-width: 576px) {
    .ai-button {
        width: 50px;
        height: 50px;
    }
    
    .ai-icon {
        font-size: 1.2rem;
    }
    
    .footer-grid {
        grid-template-columns: 1fr;
    }
}

/* Mobile Menu Button */
.mobile-menu-button {
    display: none;
}

@media (max-width: 768px) {
    .mobile-menu-button {
        display: block;
    }
}
