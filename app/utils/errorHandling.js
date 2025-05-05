import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config/environment';

/**
 * Error types for consistent error handling
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTHENTICATION_ERROR',
  SERVER: 'SERVER_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  OFFLINE: 'OFFLINE_ERROR',
};

/**
 * Determine the error type based on the error
 * @param {Error} error - The error object
 * @returns {string} Error type from ErrorTypes
 */
export const getErrorType = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;
  
  if (!navigator.onLine || error.message?.includes('network') || error.message?.includes('Network')) {
    return ErrorTypes.NETWORK;
  }
  
  if (error.response) {
    const status = error.response.status;
    
    if (status === 401 || status === 403) {
      return ErrorTypes.AUTH;
    }
    
    if (status >= 400 && status < 500) {
      return ErrorTypes.VALIDATION;
    }
    
    if (status >= 500) {
      return ErrorTypes.SERVER;
    }
  }
  
  if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
    return ErrorTypes.TIMEOUT;
  }
  
  return ErrorTypes.UNKNOWN;
};

/**
 * Get user-friendly error message
 * @param {string} errorType - Type of error from ErrorTypes
 * @param {Error} error - Optional error object for additional details
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (errorType, error = null) => {
  switch (errorType) {
    case ErrorTypes.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorTypes.AUTH:
      return 'Your session has expired. Please sign in again.';
    case ErrorTypes.SERVER:
      return 'Something went wrong on our end. Please try again later.';
    case ErrorTypes.VALIDATION:
      // Try to extract specific validation error if available
      if (error?.response?.data?.message) {
        return error.response.data.message;
      }
      return 'Please check your information and try again.';
    case ErrorTypes.TIMEOUT:
      return 'The request timed out. Please try again.';
    case ErrorTypes.OFFLINE:
      return 'You\'re offline. Some features may be limited.';
    case ErrorTypes.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Log error to console (and potentially to monitoring service)
 * @param {Error} error - Error object
 * @param {string} context - Where the error occurred
 */
export const logError = (error, context = 'app') => {
  if (ENV.enableDebugMode) {
    console.error(`[${context}]`, error);
  }
  
  // TODO: Add integration with crash reporting service
};

/**
 * Handle API errors appropriately
 * @param {Error} error - Error object
 * @param {string} context - Where the error occurred
 * @param {boolean} showAlert - Whether to show an alert
 */
export const handleApiError = async (error, context = 'api', showAlert = true) => {
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(errorType, error);
  
  logError(error, context);
  
  // Handle authentication errors by redirecting to login
  if (errorType === ErrorTypes.AUTH) {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      router.replace('/');
    } catch (storageError) {
      logError(storageError, 'auth-logout');
    }
    return;
  }
  
  // Show alert if needed
  if (showAlert) {
    Alert.alert('Error', errorMessage);
  }
  
  return { type: errorType, message: errorMessage };
};

export default {
  ErrorTypes,
  getErrorType,
  getErrorMessage,
  logError,
  handleApiError
};