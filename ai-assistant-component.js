// AIAssistant.js - React component for the robotics encyclopedia AI guide

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AIAssistant = ({ currentRobot, currentPage }) => {
  // State variables
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Initialize the assistant with a session
  useEffect(() => {
    // Generate a session ID or retrieve from localStorage if exists
    const existingSessionId = localStorage.getItem('aiAssistantSessionId');
    if (existingSessionId) {
      setSessionId(existingSessionId);
      
      // Load previous messages if any
      const savedMessages = localStorage.getItem('aiAssistantMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('aiAssistantSessionId', newSessionId);
      
      // Add initial welcome message
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your robotics guide. How can I help you explore the world of robots today?',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aiAssistantMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Context awareness - send information about current page/robot to assistant
  useEffect(() => {
    if (currentRobot && sessionId) {
      // Only send context update if the chat has been opened at least once
      if (messages.length > 1) {
        updateAssistantContext();
      }
    }
  }, [currentRobot, currentPage]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const updateAssistantContext = async () => {
    try {
      await axios.post('/api/ai-assistant/context', {
        sessionId,
        context: {
          currentRobot,
          currentPage
        }
      });
    } catch (error) {
      console.error('Failed to update assistant context:', error);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Send message to backend AI service
      const response = await axios.post('/api/ai-assistant/message', {
        sessionId,
        message: inputMessage,
        context: {
          currentRobot,
          currentPage
        }
      });
      
      // Add AI response to chat
      const assistantMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again later.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const clearConversation = () => {
    // Keep only the initial welcome message
    const welcomeMessage = messages[0];
    setMessages([welcomeMessage]);
  };
  
  return (
    <>
      {/* Floating button */}
      <motion.div 
        className="ai-assistant-button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <div className="ai-icon">🤖</div>
      </motion.div>
      
      {/* Chat modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="ai-assistant-modal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="ai-assistant-header">
              <h3>AI Robotics Guide</h3>
              <div className="ai-assistant-controls">
                <button 
                  className="clear-button" 
                  onClick={clearConversation}
                  title="Clear conversation"
                >
                  🗑️
                </button>
                <button 
                  className="close-button" 
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="ai-assistant-messages">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.role === 'assistant' ? 'assistant' : 'user'} ${msg.isError ? 'error' : ''}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="assistant-avatar">🤖</div>
                  )}
                  <div className="message-content">
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="user-avatar">👤</div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="message assistant typing">
                  <div className="assistant-avatar">🤖</div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <form className="ai-assistant-input" onSubmit={handleSubmit}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me about robots..."
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={isTyping || !inputMessage.trim()}
              >
                Send
              </button>
            </form>
            
            <div className="ai-assistant-footer">
              <p>Ask about robots, technologies, or navigate the encyclopedia</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;

// CSS for the AI Assistant component (to be included in your CSS/SCSS files)

/*
.ai-assistant-styles {
  --primary: #20e3b2;
  --secondary: #0cebeb;
  --dark: #121212;
  --light: #f8f9fa;
  --gray: #adb5bd;
  --assistant-bg: rgba(26, 26, 26, 0.95);
  --user-message-bg: rgba(32, 227, 178, 0.15);
  --assistant-message-bg: rgba(255, 255, 255, 0.1);
  --error-bg: rgba(255, 107, 107, 0.15);
}

// Floating button
.ai-assistant-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
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
  z-index: 1000;
}

.ai-icon {
  font-size: 1.5rem;
  color: var(--dark);
}

// Chat modal
.ai-assistant-modal {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 350px;
  height: 500px;
  background: var(--assistant-bg);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-assistant-header h3 {
  color: var(--primary);
  font-size: 1.1rem;
  margin: 0;
}

.ai-assistant-controls {
  display: flex;
  gap: 10px;
}

.ai-assistant-controls button {
  background: transparent;
  border: none;
  color: var(--gray);
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.ai-assistant-controls button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--light);
}

.ai-assistant-messages {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  display: flex;
  align-items: flex-start;
  max-width: 85%;
}

.message.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.message-content {
  padding: 12px 15px;
  border-radius: 15px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.assistant .message-content {
  background: var(--assistant-message-bg);
  color: var(--light);
  border-radius: 15px 15px 15px 0;
}

.user .message-content {
  background: var(--user-message-bg);
  color: var(--light);
  border-radius: 15px 15px 0 15px;
}

.message.error .message-content {
  background: var(--error-bg);
  color: #ff6b6b;
}

.assistant-avatar, .user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  font-size: 1.2rem;
}

.assistant-avatar {
  background: linear-gradient(135deg, var(--secondary), var(--primary));
  color: var(--dark);
}

.user-avatar {
  background: rgba(255, 255, 255, 0.1);
  color: var(--light);
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 15px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  display: inline-block;
  animation: typing 1.5s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

.ai-assistant-input {
  display: flex;
  padding: 10px 15px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.ai-assistant-input input {
  flex: 1;
  padding: 12px 15px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: var(--light);
  font-size: 0.95rem;
}

.ai-assistant-input input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.ai-assistant-input input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(32, 227, 178, 0.2);
}

.ai-assistant-input button {
  margin-left: 10px;
  padding: 10px 20px;
  border-radius: 20px;
  background: linear-gradient(90deg, var(--secondary), var(--primary));
  color: var(--dark);
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-assistant-input button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.ai-assistant-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.ai-assistant-footer {
  padding: 10px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--gray);
}

@media (max-width: 576px) {
  .ai-assistant-modal {
    width: calc(100% - 30px);
    bottom: 15px;
    right: 15px;
    height: 450px;
  }
}
*/
