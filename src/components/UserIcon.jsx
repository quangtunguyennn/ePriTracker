import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, LogIn, UserPlus } from 'lucide-react';
import axios from 'axios';

export default function UserDropdownMenu() {
  const baseURL = 'https://localhost:44338';

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      const token = localStorage.getItem('token');

      // If no token exists, set unauthenticated state
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseURL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserName(response.data.userName);
        setUserEmail(response.data.userEmail);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        // Remove invalid/expired token
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, []);

  // Navigation / Action Handlers
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  const handleRegisterRedirect = () => {
    window.location.href = '/register';
  };

  return (
    <div className="absolute right-0 top-14 w-56 bg-white border border-gray-100 rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden font-lexend z-50">
      
      {/* 1. Loading State */}
      {isLoading ? (
        <div className="px-4 py-3 text-sm text-gray-500 text-center font-medium">
          Loading...
        </div>
      ) : 

      /* 2. Authenticated State (Logged In) */
      isLoggedIn ? (
        <>
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userEmail || ''}
            </p>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 flex flex-col gap-0.5">
            <button 
              type="button"
              className="flex cursor-pointer items-center w-full gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 text-left"
            >
              <User className="w-4 h-4 text-gray-500" />
              Profile
            </button>

            <button 
              type="button"
              className="flex cursor-pointer items-center w-full gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 text-left"
            >
              <Settings className="w-4 h-4 text-gray-500" />
              Settings
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-0.5" />

          {/* Destructive Action (Logout) */}
          <div className="p-1.5">
            <button 
              type="button"
              onClick={handleLogout}
              className="flex cursor-pointer items-center w-full gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200 text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Logout
            </button>
          </div>
        </>
      ) : (

      /* 3. Unauthenticated State (Not Logged In) */
        <div className="p-1.5 flex flex-col gap-0.5">
          <button 
            type="button"
            onClick={handleLoginRedirect}
            className="flex cursor-pointer items-center w-full gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 text-left"
          >
            <LogIn className="w-4 h-4 text-gray-500" />
            Log In
          </button>

          <button 
            type="button"
            onClick={handleRegisterRedirect}
            className="flex cursor-pointer items-center w-full gap-3 px-3 py-2 text-sm font-medium text-indigo-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200 text-left"
          >
            <UserPlus className="w-4 h-4 text-indigo-500" />
            Register
          </button>
        </div>
      )}

    </div>
  );
}