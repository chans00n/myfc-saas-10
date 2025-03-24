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