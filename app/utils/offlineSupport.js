import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetInfo } from '@react-native-community/netinfo';

// Cache keys
const ASSIGNMENT_CACHE_KEY = 'offline_assignments';
const TASKS_CACHE_KEY = 'offline_tasks';
const PENDING_ACTIONS_KEY = 'offline_pending_actions';

/**
 * Saves data to offline cache
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const saveToCache = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`Data saved to cache: ${key}`);
    return true;
  } catch (error) {
    console.error('Error saving to cache:', error);
    return false;
  }
};

/**
 * Retrieves data from offline cache
 * @param {string} key - Storage key
 * @returns {any} Cached data or null
 */
export const getFromCache = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
};

/**
 * Check if the device is online
 * @returns {Promise<boolean>} True if online
 */
export const isOnline = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    console.error('Error checking connectivity:', error);
    return false;
  }
};

/**
 * Add pending action to be performed when back online
 * @param {string} action - Action type
 * @param {object} payload - Action data
 */
export const addPendingAction = async (action, payload) => {
  try {
    const pendingActions = await getFromCache(PENDING_ACTIONS_KEY) || [];
    pendingActions.push({
      id: Date.now().toString(),
      action,
      payload,
      timestamp: new Date().toISOString()
    });
    await saveToCache(PENDING_ACTIONS_KEY, pendingActions);
    console.log('Pending action added for offline sync');
  } catch (error) {
    console.error('Error adding pending action:', error);
  }
};

/**
 * Process all pending actions when back online
 * @param {function} processAction - Function to process a single action
 */
export const processPendingActions = async (processAction) => {
  try {
    const online = await isOnline();
    if (!online) {
      console.log('Cannot process pending actions: device is offline');
      return;
    }

    const pendingActions = await getFromCache(PENDING_ACTIONS_KEY) || [];
    console.log(`Processing ${pendingActions.length} pending actions`);
    
    const results = [];
    const remainingActions = [];

    for (const action of pendingActions) {
      try {
        const result = await processAction(action);
        results.push({ action, result, success: true });
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        results.push({ action, error: error.message, success: false });
        remainingActions.push(action);
      }
    }

    // Save remaining actions that failed
    await saveToCache(PENDING_ACTIONS_KEY, remainingActions);
    
    return results;
  } catch (error) {
    console.error('Error processing pending actions:', error);
    return [];
  }
};

/**
 * Cache assignments data for offline use
 * @param {Array} assignments - Assignment data
 */
export const cacheAssignments = async (assignments) => {
  return saveToCache(ASSIGNMENT_CACHE_KEY, assignments);
};

/**
 * Get cached assignments
 * @returns {Array} Cached assignments
 */
export const getCachedAssignments = async () => {
  return getFromCache(ASSIGNMENT_CACHE_KEY);
};

/**
 * Cache tasks for a specific assignment
 * @param {string} assignmentId - Assignment ID
 * @param {Array} tasks - Task data
 */
export const cacheTasks = async (assignmentId, tasks) => {
  const cachedTasks = await getFromCache(TASKS_CACHE_KEY) || {};
  cachedTasks[assignmentId] = tasks;
  return saveToCache(TASKS_CACHE_KEY, cachedTasks);
};

/**
 * Get cached tasks for an assignment
 * @param {string} assignmentId - Assignment ID
 * @returns {Array} Cached tasks
 */
export const getCachedTasks = async (assignmentId) => {
  const cachedTasks = await getFromCache(TASKS_CACHE_KEY) || {};
  return cachedTasks[assignmentId] || [];
};

export default {
  saveToCache,
  getFromCache,
  isOnline,
  addPendingAction,
  processPendingActions,
  cacheAssignments,
  getCachedAssignments,
  cacheTasks,
  getCachedTasks
};