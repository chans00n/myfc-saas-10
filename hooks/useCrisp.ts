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
      }, 300); // Small delay to ensure Crisp is loaded
    } catch (error) {
      console.error('Error hiding Crisp chat on load:', error);
    }
  }, []);

  // Show the Crisp chat widget
  const show = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        return;
      }
      
      Crisp.chat.show();
      Crisp.chat.open();
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