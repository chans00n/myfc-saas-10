'use client';

import { useCallback, useEffect } from 'react';
import { Crisp } from 'crisp-sdk-web';

interface CrispUser {
  email?: string;
  name?: string;
  userId?: string;
  [key: string]: any;
}

export const useCrisp = () => {
  // Initialize and hide the chat bubble when the hook is loaded
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      
      // Hide the chat on initial load
      setTimeout(() => {
        window.$crisp = window.$crisp || [];
        window.$crisp.push(["do", "chat:hide"]);
        
        // Add event listener for when chat is closed
        window.$crisp.push(["on", "chat:closed", function() {
          // Hide the chat launcher when chat is closed
          window.$crisp.push(["do", "chat:hide"]);
        }]);

        // Add event listener for when chat is opened
        window.$crisp.push(["on", "chat:opened", function() {
          addCustomCloseButton();
        }]);

      }, 300); // Small delay to ensure Crisp is loaded
    } catch (error) {
      console.error('Error hiding Crisp chat on load:', error);
    }
  }, []);

  // Function to add a custom close button to the Crisp chat
  const addCustomCloseButton = () => {
    try {
      // Wait a bit for the chat interface to fully load
      setTimeout(() => {
        // Check if running in standalone mode (PWA)
        const isStandalone = window.navigator.standalone === true || 
          window.matchMedia('(display-mode: standalone)').matches;
        
        // Only add the button if in PWA mode
        if (!isStandalone) return;
        
        // Remove any existing custom close button first
        const existingButton = document.getElementById('crisp-custom-close-btn');
        if (existingButton) existingButton.remove();
        
        // Create a new button
        const closeButton = document.createElement('button');
        closeButton.id = 'crisp-custom-close-btn';
        closeButton.textContent = 'Close Chat';
        closeButton.style.position = 'absolute';
        closeButton.style.bottom = '10px';
        closeButton.style.left = '50%';
        closeButton.style.transform = 'translateX(-50%)';
        closeButton.style.backgroundColor = '#4f46e5'; // Indigo color matching the theme
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.padding = '8px 16px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.zIndex = '1000000'; // High z-index to ensure it's above other elements
        
        // Add click handler
        closeButton.addEventListener('click', () => {
          Crisp.chat.close();
          Crisp.chat.hide();
        });
        
        // Find the Crisp chat container and append the button
        const crispContainer = document.querySelector('.crisp-client');
        if (crispContainer) {
          crispContainer.appendChild(closeButton);
        }
      }, 500);
    } catch (error) {
      console.error('Error adding custom close button to Crisp chat:', error);
    }
  };

  // Show the Crisp chat widget
  const show = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      
      Crisp.chat.show();
      Crisp.chat.open();
      
      // Add our custom close button when chat is shown
      addCustomCloseButton();
    } catch (error) {
      console.error('Error showing Crisp chat:', error);
    }
  }, []);

  // Hide the Crisp chat widget
  const hide = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      Crisp.chat.hide();
    } catch (error) {
      console.error('Error hiding Crisp chat:', error);
    }
  }, []);

  // Show the help center
  const showHelpCenter = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      Crisp.chat.show();
      Crisp.chat.setHelpdeskView();
      
      // Add our custom close button when help center is shown
      addCustomCloseButton();
    } catch (error) {
      console.error('Error showing Crisp help center:', error);
    }
  }, []);

  // Set user data for Crisp
  const identifyUser = useCallback((userData: CrispUser) => {
    try {
      if (typeof window === 'undefined') return;
      
      if (userData.email) {
        Crisp.user.setEmail(userData.email);
      }
      
      if (userData.name) {
        Crisp.user.setNickname(userData.name);
      }
      
      // Set custom session data
      const sessionData: Record<string, any> = {};
      
      if (userData.userId) {
        sessionData.user_id = userData.userId;
      }
      
      // Add any other custom fields
      Object.keys(userData).forEach(key => {
        if (!['email', 'name', 'userId'].includes(key)) {
          sessionData[key] = userData[key];
        }
      });
      
      if (Object.keys(sessionData).length > 0) {
        Crisp.session.setData(sessionData);
      }
    } catch (error) {
      console.error('Error identifying user in Crisp:', error);
    }
  }, []);

  return {
    show,
    hide,
    showHelpCenter,
    identifyUser
  };
}; 