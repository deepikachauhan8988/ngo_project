// AuthContext.js for your ngoproject
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
 
const AuthContext = createContext(null);
 
export const useAuth = () => useContext(AuthContext);
 
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access: null,
    refresh: null,
    role: null,
    unique_id: null,
    allocated_district: null,
  });
 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
 
  // Function to check if the current access token is valid
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
   
    try {
      // Parse JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
     
      // Check if token is expired (with 5 minute buffer)
      return payload.exp > currentTime + 300;
    } catch (error) {
      console.error("Error validating token:", error);
      return false;
    }
  }, []);
 
  // Computed property for authentication status
  const isUserAuthenticated = !!auth.access && isTokenValid(auth.access);
 
  // LOGIN
  const login = useCallback((data) => {
    console.log("Login function called with data:", data); // Debug log
   
    // This logic correctly handles the login API response you provided:
    // { "access": "...", "refresh": "...", "unique_id": "...", "role": "...", "allocated_district": "..." }
    const authData = {
      access: data.access || data.token || data.accessToken,
      refresh: data.refresh || data.refreshToken,
      role: data.role || data.userRole,
      unique_id: data.unique_id || data.user_id || data.id || data.userId || data.pk,
      allocated_district: data.allocated_district || null,
    };
   
    console.log("Processed auth data:", authData); // Debug log
   
    setAuth(authData);
    setIsAuthenticated(true);
   
    // Store in localStorage for persistence
    localStorage.setItem('auth', JSON.stringify(authData));
  }, []);
 
  // LOGOUT
  const logout = useCallback(() => {
    setAuth({
      access: null,
      refresh: null,
      role: null,
      unique_id: null,
      allocated_district: null,
    });
    setIsAuthenticated(false);
   
    // Clear localStorage
    localStorage.removeItem('auth');
  }, []);
 
  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
         
          // Check if the stored token is still valid
          if (isTokenValid(parsedAuth.access)) {
            setAuth(parsedAuth);
            setIsAuthenticated(true);
          } else if (parsedAuth.refresh) {
            // If access token is expired but refresh token exists, try to refresh
            try {
              const newAccess = await refreshAccessToken(parsedAuth.refresh);
              if (newAccess) {
                setAuth(prev => ({ ...prev, access: newAccess }));
                setIsAuthenticated(true);
              } else {
                // If refresh fails, clear auth
                localStorage.removeItem('auth');
              }
            } catch (error) {
              console.error("Error refreshing token on init:", error);
              localStorage.removeItem('auth');
            }
          } else {
            // No valid tokens, clear localStorage
            localStorage.removeItem('auth');
          }
        } catch (error) {
          console.error("Error parsing stored auth data:", error);
          localStorage.removeItem('auth');
        }
      }
     
      // Set loading to false after initialization
      setIsLoading(false);
    };
   
    initAuth();
  }, [isTokenValid]);
 
  // REFRESH ACCESS TOKEN
  const refreshAccessToken = useCallback(async (refreshToken = null) => {
    try {
      const tokenToUse = refreshToken || auth.refresh;
     
      if (!tokenToUse) {
        console.log("No refresh token available");
        logout();
        return null;
      }
 
      // Updated to your ngoproject's API endpoint
      const response = await fetch(
        "https://mahadevaaya.com/ngoproject/ngoproject_backend/api/refresh-token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: tokenToUse }),
        }
      );
 
      const data = await response.json();
 
      if (response.ok && data.access) {
        const updatedAuth = {
          ...auth,
          access: data.access,
        };
       
        setAuth(updatedAuth);
        localStorage.setItem('auth', JSON.stringify(updatedAuth));
       
        return data.access;
      } else {
        console.log("Token refresh failed:", data);
        logout();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return null;
    }
  }, [auth, logout]);
 
  // Function to check authentication status (for use in components)
  const checkAuthentication = useCallback(async () => {
    if (!auth.access) return false;
   
    if (isTokenValid(auth.access)) {
      return true;
    } else {
      // Token is expired, try to refresh
      const newToken = await refreshAccessToken();
      return !!newToken;
    }
  }, [auth.access, isTokenValid, refreshAccessToken]);
 
  // Auto-refresh token before it expires
  useEffect(() => {
    if (!auth.access) return;
   
    try {
      // Parse JWT to get expiration time
      const payload = JSON.parse(atob(auth.access.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
     
      // Set a timer to refresh the token 5 minutes before it expires
      if (timeUntilExpiration > 0) {
        const refreshTimer = setTimeout(() => {
          refreshAccessToken();
        }, timeUntilExpiration - 5 * 60 * 1000); // 5 minutes before expiration
       
        return () => clearTimeout(refreshTimer);
      } else {
        // Token is already expired, refresh now
        refreshAccessToken();
      }
    } catch (error) {
      console.error("Error setting up token refresh:", error);
    }
  }, [auth.access, refreshAccessToken]);
 
  return (
    <AuthContext.Provider
      value={{
        auth,
        isAuthenticated: isUserAuthenticated,
        isLoading,
        login,
        logout,
        refreshAccessToken,
        checkAuthentication, // Expose the check function
        // Expose auth properties directly for convenience
        token: auth.access,
        refreshToken: auth.refresh,
        role: auth.role,
        unique_id: auth.unique_id,
        allocated_district: auth.allocated_district,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};