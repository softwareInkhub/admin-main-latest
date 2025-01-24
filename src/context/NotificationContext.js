'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';

const NotificationContext = createContext({});

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Listen to notifications for admin only
  useEffect(() => {
    if (!user?.uid || !isAdmin) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Query notifications for pending influencers
    const q = query(
      collection(db, 'notifications'),
      where('type', '==', 'PENDING_INFLUENCER'),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    }, (error) => {
      console.error("Notification error:", error);
      toast.error("Failed to load notifications");
    });

    return () => unsubscribe();
  }, [user?.uid, isAdmin]);

  // Mark notification as read and delete it
  const markAsRead = async (notificationId) => {
    try {
      // Delete the notification instead of marking it as read
      await deleteDoc(doc(db, 'notifications', notificationId));
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error removing notification:", error);
      toast.error("Failed to update notification");
    }
  };

  // Clear all notifications
  const markAllAsRead = async () => {
    try {
      const promises = notifications.map(n => 
        deleteDoc(doc(db, 'notifications', n.id))
      );
      
      await Promise.all(promises);
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      isAdmin
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Helper function to create a notification
export const createNotification = async (influencerData) => {
  try {
    const notificationRef = collection(db, 'notifications');
    await addDoc(notificationRef, {
      type: 'PENDING_INFLUENCER',
      title: 'New Pending Influencer',
      message: `${influencerData.name} is waiting for approval`,
      createdAt: new Date(),
      read: false,
      influencerId: influencerData.id,
      influencerName: influencerData.name
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}; 