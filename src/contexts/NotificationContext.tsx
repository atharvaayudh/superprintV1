import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';
export type SoundType = 'ding' | 'notification' | 'clap' | 'error' | 'none';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  sound?: SoundType;
  duration?: number;
  timestamp: string;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  broadcastNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const playSound = (soundType: SoundType) => {
  if (soundType === 'none') return;
  
  // Create audio context for sound generation
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.8) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  switch (soundType) {
    case 'ding':
      playTone(800, 0.4, 'sine', 0.9);
      setTimeout(() => playTone(1000, 0.3, 'sine', 0.8), 200);
      break;
    case 'notification':
      playTone(600, 0.2, 'sine', 0.8);
      setTimeout(() => playTone(800, 0.2, 'sine', 0.8), 200);
      setTimeout(() => playTone(1000, 0.2, 'sine', 0.8), 400);
      break;
    case 'clap':
      // Simulate clap with multiple quick tones
      for (let i = 0; i < 8; i++) {
        setTimeout(() => playTone(200 + Math.random() * 800, 0.1, 'square', 0.9), i * 80);
      }
      break;
    case 'error':
      playTone(300, 0.5, 'square', 0.9);
      setTimeout(() => playTone(250, 0.4, 'square', 0.8), 300);
      setTimeout(() => playTone(200, 0.3, 'square', 0.7), 600);
      break;
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to real-time notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'notification' }, (payload) => {
        const notification = payload.payload as Notification;
        setNotifications(prev => [...prev, notification]);
        
        // Play sound if specified
        if (notification.sound) {
          playSound(notification.sound);
        }
        
        // Auto-remove after duration
        const duration = notification.duration || 6000;
        setTimeout(() => {
          removeNotification(notification.id);
        }, duration);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    const newNotification = { ...notification, id, timestamp };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Play sound if specified
    if (notification.sound) {
      playSound(notification.sound);
    }
    
    // Auto-remove after duration
    const duration = notification.duration || 6000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const broadcastNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    const fullNotification = { ...notification, id, timestamp };
    
    // Add notification locally first (for the person updating)
    setNotifications(prev => [...prev, fullNotification]);
    
    // Play sound locally
    if (notification.sound) {
      playSound(notification.sound);
    }
    
    // Auto-remove locally
    const duration = notification.duration || 6000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
    
    // Broadcast to all other connected clients
    await supabase
      .channel('notifications')
      .send({
        type: 'broadcast',
        event: 'notification',
        payload: fullNotification
      });
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification, 
      broadcastNotification 
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-7 w-7 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-7 w-7 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-7 w-7 text-yellow-600" />;
      default:
        return <Info className="h-7 w-7 text-blue-600" />;
    }
  };

  const getBackgroundColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-300 shadow-green-200';
      case 'error':
        return 'bg-red-50 border-red-300 shadow-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300 shadow-yellow-200';
      default:
        return 'bg-blue-50 border-blue-300 shadow-blue-200';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 space-y-4 max-w-md w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`w-full ${getBackgroundColor(notification.type)} border-2 rounded-2xl shadow-2xl p-6 transform transition-all duration-700 ease-out animate-slideInFadeIn`}
          style={{
            animation: 'slideInFadeIn 0.7s ease-out forwards, slideOutFadeOut 0.7s ease-in 5.3s forwards'
          }}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="ml-4 w-0 flex-1">
              <p className="text-lg font-bold text-gray-900">
                {notification.title}
              </p>
              <p className="mt-2 text-base text-gray-700">
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => removeNotification(notification.id)}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 rounded-full hover:bg-white/50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideInFadeIn {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes slideOutFadeOut {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.8);
          }
        }
        .animate-slideInFadeIn {
          animation: slideInFadeIn 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
};