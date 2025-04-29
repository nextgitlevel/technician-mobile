import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL for the backend
const API_URL = 'http://localhost:5000/api';

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const [assignment, setAssignment] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        router.replace('/');
        return;
      }
      
      // Fetch assignment details
      const assignmentRes = await fetch(`${API_URL}/assignments/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!assignmentRes.ok) {
        throw new Error('Failed to fetch assignment');
      }
      
      const assignmentData = await assignmentRes.json();
      setAssignment(assignmentData);
      
      // Fetch tasks for this assignment
      const tasksRes = await fetch(`${API_URL}/tasks/assignment/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!tasksRes.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const tasksData = await tasksRes.json();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching details:', error);
      Alert.alert('Error', 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete task');
      }
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'Completed' } : task
      ));
      
      // Check if assignment completed
      if (data.assignment_completed) {
        Alert.alert(
          'Assignment Completed',
          'All tasks for this assignment have been completed!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to mark task as complete');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Assignment not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate completion percentage
  const completedCount = tasks.filter(task => task.status === 'Completed').length;
  const totalCount = tasks.length;
  const progressWidth = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Assignment Details</Text>
      </View>
      
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.category}>{assignment.category}</Text>
          <View style={[
            styles.priorityBadge,
            assignment.priority_level === 'L1' && styles.priorityL1,
            assignment.priority_level === 'L2' && styles.priorityL2,
            assignment.priority_level === 'L3' && styles.priorityL3,
            assignment.priority_level === 'L4' && styles.priorityL4
          ]}>
            <Text style={styles.priorityText}>{assignment.priority_level}</Text>
          </View>
        </View>
        <Text style={styles.subcategory}>{assignment.subcategory || 'General'}</Text>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${progressWidth}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {completedCount} of {totalCount} tasks completed
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Tasks</Text>
      
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.taskCard,
            item.status === 'Completed' && styles.completedTask
          ]}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskName}>{item.name}</Text>
              {item.status === 'Completed' && (
                <Text style={styles.completedBadge}>✓ Completed</Text>
              )}
            </View>
            <Text style={styles.taskDescription}>{item.description}</Text>
            
            {item.status !== 'Completed' && (
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={() => {
                  Alert.alert(
                    'Complete Task',
                    'Are you sure this task is completed?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Complete', onPress: () => handleCompleteTask(item.id) }
                    ]
                  );
                }}
              >
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks assigned</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#666'
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16
  },
  backButton: {
    padding: 4
  },
  backButtonText: {
    color: '#3b82f6',
    fontWeight: '500'
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  category: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  subcategory: {
    color: '#666',
    marginBottom: 16
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#e5e7eb'
  },
  priorityL1: {
    backgroundColor: '#fee2e2'
  },
  priorityL2: {
    backgroundColor: '#fef3c7'
  },
  priorityL3: {
    backgroundColor: '#dbeafe'
  },
  priorityL4: {
    backgroundColor: '#d1fae5'
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    color: '#666'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 8
  },
  listContainer: {
    padding: 16,
    paddingTop: 0
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  completedTask: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981'
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500'
  },
  completedBadge: {
    color: '#10b981',
    fontWeight: 'bold'
  },
  taskDescription: {
    color: '#666',
    marginBottom: 16
  },
  completeButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  completeButtonText: {
    color: '#fff',
    fontWeight: '500'
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center'
  },
  emptyText: {
    color: '#999',
    fontSize: 16
  }
});