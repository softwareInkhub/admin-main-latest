'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Set auth token in cookie
          const token = await firebaseUser.getIdToken();
          Cookies.set('authToken', token, { secure: true });

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userDoc.data()
            });
          } else {
            console.error('No user document found');
            await firebaseSignOut(auth);
            setUser(null);
            Cookies.remove('authToken');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          Cookies.remove('authToken');
        }
      } else {
        setUser(null);
        Cookies.remove('authToken');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set('authToken', token, { secure: true });
      
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      Cookies.remove('authToken');
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      Cookies.remove('authToken');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Register new user
  const register = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      Cookies.set('authToken', token, { secure: true });
      
      // Create user profile in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        createdAt: new Date(),
        status: 'active'
      });

      return userCredential;
    } catch (error) {
      console.error('Registration error:', error);
      Cookies.remove('authToken');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
