// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { auth } from "../lib/firebaseconfig";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthContextType {
  user: User | null;
  userName: string | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user data from MongoDB
        try {
          const response = await fetch(`${API_URL}/api/users/${currentUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            setUserName(data.user.name);
          } else if (response.status === 404) {
            // User exists in Firebase but not in MongoDB (old user)
            // Extract name from email or set default
            const emailName = currentUser.email?.split('@')[0] || 'User';
            const defaultName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
            setUserName(defaultName);
            
            // Try to create user in MongoDB with default name
            try {
              await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: currentUser.uid,
                  name: defaultName,
                  email: currentUser.email
                }),
              });
            } catch (e) {
              console.error('Failed to create MongoDB user:', e);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback: use email as name
          const emailName = currentUser.email?.split('@')[0] || 'User';
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
      } else {
        setUserName(null);
      }
      
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user in MongoDB
      try {
        await fetch(`${API_URL}/api/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: userCredential.user.uid,
            name,
            email
          }),
        });
        setUserName(name);
      } catch (dbError) {
        console.error('Error storing user in MongoDB:', dbError);
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login in MongoDB
      try {
        const response = await fetch(`${API_URL}/api/users/${userCredential.user.uid}`);
        if (response.ok) {
          const data = await response.json();
          setUserName(data.user.name);
          
          // Update last login
          await fetch(`${API_URL}/api/users/${userCredential.user.uid}/login`, {
            method: 'PATCH',
          });
        }
      } catch (dbError) {
        console.error('Error updating user login:', dbError);
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ user, userName, loading, signUp, signIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
