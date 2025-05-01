import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const AssignmentDetailScreen = ({ navigation, route }) => {
  const { assignmentId } = route.params;
  
  const [assignment, setAssignment] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAssignmentDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Fetch assignment details
      const assignmentRes = await axios.get(`${API_URL}/assignments/${assignmentId}`, {
        headers: { 'x-auth-token': token }
      });
      
      setAssignment(assignmentRes.data);
      
      // Fetch tasks for this assignment
      const tasksRes = await axios.get(`${API_URL}/tasks/assignment/${assignmentId}`, {
        headers: { 'x-auth-token': token }
      });
      
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      Alert.alert('Error', 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);
  
  const completeTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Mark task as complete
      const response = await axios.patch(
        `${API_URL}/tasks/${taskId}/complete`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      if (response.data.success) {
        // Update local state
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: 'Completed' } : task
        ));
        
        // Check if assignment completed
        if (response.data.assignment_completed) {
          Alert.alert(
            'Assignment Completed',
            'All tasks for this assignment have been completed!',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to mark task as complete');
    }
  };
  
  const renderTaskItem = ({ item }) => {
    const isCompleted = item.status === 'Completed';
    
    return (
      <View style={[styles.taskCard, isCompleted && styles.completedTask]}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskName}>{item.name}</Text>
          {isCompleted && <Text style={styles.completedBadge}>✓ Completed</Text>}
        </View>
        
        {item.description && <Text style={styles.taskDescription}>{item.description}</Text>}
        
        {item.photo_url && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: item.photo_url }} style={styles.taskPhoto} />
          </View>
        )}
        
        {!isCompleted && (
          <View style={styles.taskActions}>
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => {
                Alert.alert(
                  'Complete Task',
                  'Are you sure this task is completed?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Complete', onPress: () => completeTask(item.id) }
                  ]
                );
              }}
            >
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading assignment details...</Text>
      </View>
    );
  }
  
  if (!assignment) {
    return (
      <View style={styles.centered}>
        <Text>Assignment not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.assignmentInfo}>
        <View style={styles.assignmentHeader}>
          <Text style={styles.assignmentCategory}>{assignment.category}</Text>
          <View style={[
            styles.priorityBadge,
            assignment.priority_level === 'L1' && styles.priorityL1,
            assignment.priority_level === 'L2' && styles.priorityL2,
            assignment.priority_level === 'L3' && styles.priorityL3,
            assignment.priority_level === 'L4' && styles.priorityL4,
          ]}>
            <Text style={styles.priorityText}>{assignment.priority_level}</Text>
          </View>
        </View>
        
        <Text style={styles.assignmentSubcategory}>{assignment.subcategory || 'General'}</Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.progressText}>
          {tasks.filter(t => t.status === 'Completed').length} of {tasks.length} tasks completed
        </Text>
      </View>
      
      <Text style={styles.tasksTitle}>Tasks</Text>
      
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks assigned</Text>
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
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  assignmentInfo: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentCategory: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  assignmentSubcategory: {
    color: '#666',
    marginBottom: 15,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    color: '#666',
    fontSize: 12,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 10,
  },
  listContainer: {
    padding: 10,
    paddingTop: 0,
  },
  taskCard: {
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
  completedTask: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
  },
  completedBadge: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#666',
    marginBottom: 15,
  },
  photoContainer: {
    marginBottom: 15,
  },
  taskPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  completeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '500',
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

export default AssignmentDetailScreen;