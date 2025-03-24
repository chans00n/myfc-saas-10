'use client';

import { useEffect } from 'react';
import { Crisp } from 'crisp-sdk-web';

type CrispChatProps = {
  websiteId: string;
  user?: {
    email?: string;
    name?: string;
    userId?: string;
  };
};

export default function CrispChat({ websiteId, user }: CrispChatProps) {
  useEffect(() => {
    if (!websiteId) {
      return;
    }

    // Configure Crisp with Website ID
    try {
      Crisp.configure(websiteId);
      
      // Hide the default chat launcher button
      window.$crisp = window.$crisp || [];
      window.$crisp.push(["do", "chat:hide"]);
      
      // Add custom styles for the custom close button
      const style = document.createElement('style');
      style.textContent = `
        #crisp-custom-close-btn {
          position: absolute !important;
          bottom: 70px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background-color: #4f46e5 !important;
          color: white !important;
          border: none !important;
          border-radius: 5px !important;
          padding: 8px 16px !important;
          font-weight: bold !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
          z-index: 1000000 !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
          cursor: pointer !important;
        }
        
        /* Make sure button is visible in both light and dark mode */
        #crisp-custom-close-btn:hover {
          background-color: #3c36b5 !important;
        }
        
        /* Make space for the button at the bottom of the chat */
        .crisp-client .cc-kv6t .cc-1ms9 {
          padding-bottom: 60px !important;
        }
      `;
      document.head.appendChild(style);
      
      // Set user data if available
      if (user) {
        if (user.email) {
          Crisp.user.setEmail(user.email);
        }
        
        if (user.name) {
          Crisp.user.setNickname(user.name);
        }
        
        if (user.userId) {
          Crisp.session.setData({
            user_id: user.userId
          });
        }
      }
    } catch (error) {
      console.error('Error initializing Crisp:', error);
    }

    // Cleanup when component unmounts
    return () => {};
  }, [websiteId, user]);

  return null;
} 