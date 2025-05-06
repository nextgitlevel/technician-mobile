import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AssignmentQueueScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  
  const fetchAssignments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      
      if (!token || !user) {
        // Not logged in, redirect to login
        navigation.replace('Login');
        return;
      }
      
      const response = await axios.get(`${API_URL}/assignments?team_id=${user.team_id}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Sort by status and priority
      const sortedAssignments = response.data.sort((a, b) => {
        // First by status - In Progress comes first
        if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
        if (a.status !== 'In Progress' && b.status === 'In Progress') return 1;
        
        // Then by priority level
        const priorityOrder = { 'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4 };
        return priorityOrder[a.priority_level] - priorityOrder[b.priority_level];
      });
      
      setAssignments(sortedAssignments);
      
      // Find current in-progress assignment
      const inProgress = sortedAssignments.find(a => a.status === 'In Progress');
      setCurrentAssignment(inProgress);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to load your task queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchAssignments();
    
    // Refresh every minute
    const interval = setInterval(fetchAssignments, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };
  
  const handleStartAssignment = async (assignment) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Update assignment status to In Progress
      await axios.patch(
        `${API_URL}/assignments/${assignment.id}/start`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      // Refresh the queue
      fetchAssignments();
      
      // Navigate to assignment detail
      navigation.navigate('AssignmentDetail', { assignmentId: assignment.id });
    } catch (error) {
      console.error('Error starting assignment:', error);
      Alert.alert('Error', 'Failed to start assignment');
    }
  };
  
  const renderAssignmentItem = ({ item }) => {
    // Determine if this is the current assignment
    const isCurrentAssignment = item.status === 'In Progress';
    
    return (
      <TouchableOpacity
        style={[
          styles.assignmentCard,
          isCurrentAssignment && styles.currentAssignmentCard
        ]}
        onPress={() => {
          if (isCurrentAssignment) {
            navigation.navigate('AssignmentDetail', { assignmentId: item.id });
          } else {
            Alert.alert(
              'Start Assignment',
              `Are you ready to begin work on this ${item.category} assignment?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Start', onPress: () => handleStartAssignment(item) }
              ]
            );
          }
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.assignmentCategory}>{item.category}</Text>
          <View style={[
            styles.priorityBadge,
            item.priority_level === 'L1' && styles.priorityL1,
            item.priority_level === 'L2' && styles.priorityL2,
            item.priority_level === 'L3' && styles.priorityL3,
            item.priority_level === 'L4' && styles.priorityL4,
          ]}>
            <Text style={styles.priorityText}>{item.priority_level}</Text>
          </View>
        </View>
        
        <Text style={styles.assignmentSubcategory}>{item.subcategory || 'General'}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.assignmentStatus}>
            {isCurrentAssignment ? '🔄 In Progress' : '⏱️ Queued'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading your queue...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assignment Queue</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {currentAssignment ? (
        <TouchableOpacity 
          style={styles.currentAssignmentBanner}
          onPress={() => navigation.navigate('AssignmentDetail', { assignmentId: currentAssignment.id })}
        >
          <Text style={styles.currentAssignmentText}>
            Continue Current Assignment: {currentAssignment.category}
          </Text>
          <Text style={styles.continueText}>Tap to continue →</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.noCurrentText}>No assignment in progress</Text>
      )}
      
      <FlatList
        data={assignments.filter(a => a.status !== 'Completed')}
        renderItem={renderAssignmentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No pending assignments</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#3b82f6',
  },
  currentAssignmentBanner: {
    backgroundColor: '#3b82f6',
    padding: 12,
    margin: 10,
    borderRadius: 8,
  },
  currentAssignmentText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  continueText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
    marginTop: 4,
  },
  noCurrentText: {
    textAlign: 'center',
    color: '#666',
    padding: 15,
  },
  listContainer: {
    padding: 10,
  },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentAssignmentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentCategory: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignmentSubcategory: {
    color: '#666',
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  priorityL1: {
    backgroundColor: '#fee2e2',
  },
  priorityL2: {
    backgroundColor: '#fef3c7',
  },
  priorityL3: {
    backgroundColor: '#dbeafe',
  },
  priorityL4: {
    backgroundColor: '#d1fae5',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  assignmentStatus: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});

export default AssignmentQueueScreen;