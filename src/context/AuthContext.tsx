import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut 
} from "firebase/auth";
import { auth } from "../firebase/firebaseConfig"; 

// Define AuthUser type
interface AuthUser {
  uid: string;
  email: string | null;
  role: "admin" | "ambassador" | "superadmin";
}

// Define AuthContext type
interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provide context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }
  
      setIsLoading(true);
  
      try {

        await user.getIdToken(true);
        const idTokenResult = await user.getIdTokenResult(true);
  
        console.log("Custom Claims:", idTokenResult.claims);
  
        let userRole: "admin" | "ambassador" | "superadmin" = "ambassador"; // Default role
        if (idTokenResult.claims.superadmin) {
          userRole = "superadmin";
        } else if (idTokenResult.claims.role) {
          userRole = idTokenResult.claims.role as "admin" | "ambassador";
        }

        // Set current user state
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          role: userRole,
        };
  
        setCurrentUser(authUser);
        console.log("Auth User Set:", authUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
