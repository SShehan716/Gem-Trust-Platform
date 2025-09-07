/**
 * Authentication Context for Gem Trust Platform
 * 
 * This context provides authentication state management
 * and methods for user authentication operations.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Auth } from 'aws-amplify';
import { cognitoConfig } from './cognito-config';

// Configure Amplify
Auth.configure({
  Auth: {
    region: cognitoConfig.region,
    userPoolId: cognitoConfig.userPoolId,
    userPoolWebClientId: cognitoConfig.userPoolWebClientId,
    mandatorySignIn: true,
    authenticationFlowType: 'USER_SRP_AUTH'
  }
});

// User object structure
const defaultUser = {
  id: null,
  email: null,
  name: null,
  phoneNumber: null,
  nicNumber: null,
  role: null,
  isAuthenticated: false,
  isLoading: true
};

// Create Auth Context
const AuthContext = createContext({
  user: defaultUser,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  confirmSignUp: async () => {},
  resendConfirmationCode: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
  isLoading: true,
  error: null
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    checkAuthState();
  }, []);

  // Check current authentication state
  const checkAuthState = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const currentUser = await Auth.currentAuthenticatedUser();
      const userAttributes = await Auth.userAttributes(currentUser);
      
      // Extract user attributes
      const userData = {
        id: currentUser.username,
        email: userAttributes.find(attr => attr.Name === 'email')?.Value || '',
        name: userAttributes.find(attr => attr.Name === 'name')?.Value || '',
        phoneNumber: userAttributes.find(attr => attr.Name === 'phone_number')?.Value || '',
        nicNumber: userAttributes.find(attr => attr.Name === 'custom:nic_number')?.Value || '',
        role: userAttributes.find(attr => attr.Name === 'custom:role')?.Value || '',
        isAuthenticated: true,
        isLoading: false
      };
      
      setUser(userData);
    } catch (error) {
      console.log('User not authenticated:', error);
      setUser({ ...defaultUser, isLoading: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const user = await Auth.signIn(email, password);
      
      if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
        throw new Error('Password change required. Please contact support.');
      }
      
      await checkAuthState();
      return { success: true, user };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthState]);

  // Sign up function
  const signUp = useCallback(async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { email, password, name, phoneNumber, nicNumber, role } = userData;
      
      const result = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name,
          phone_number: phoneNumber,
          'custom:nic_number': nicNumber,
          'custom:role': role
        }
      });
      
      return { success: true, result };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Confirm sign up function
  const confirmSignUp = useCallback(async (email, code) => {
    try {
      setError(null);
      setIsLoading(true);
      
      await Auth.confirmSignUp(email, code);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resend confirmation code
  const resendConfirmationCode = useCallback(async (email) => {
    try {
      setError(null);
      await Auth.resendSignUp(email);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null);
      await Auth.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email, code, newPassword) => {
    try {
      setError(null);
      await Auth.forgotPasswordSubmit(email, code, newPassword);
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setError(null);
      await Auth.signOut();
      setUser({ ...defaultUser, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (attributes) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const currentUser = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(currentUser, attributes);
      
      await checkAuthState();
      return { success: true };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthState]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    resetPassword,
    updateUserProfile,
    clearError,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error) => {
  if (error.code) {
    switch (error.code) {
      case 'UserNotFoundException':
        return 'User not found. Please check your email address.';
      case 'NotAuthorizedException':
        return 'Incorrect password. Please try again.';
      case 'UserNotConfirmedException':
        return 'Please confirm your email address before signing in.';
      case 'UsernameExistsException':
        return 'An account with this email already exists.';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements.';
      case 'InvalidParameterException':
        return 'Invalid input. Please check your information.';
      case 'CodeMismatchException':
        return 'Invalid verification code. Please try again.';
      case 'ExpiredCodeException':
        return 'Verification code has expired. Please request a new one.';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
  return error.message || 'An unexpected error occurred.';
};

export default AuthContext;
