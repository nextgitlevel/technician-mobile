import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from './config/environment';

// API URL for the backend comes from environment configuration
const API_URL = ENV.API_URL;

export default function QueueScreen() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = JSON.parse(await AsyncStorage.getItem('user'));
      
      if (!token || !user) {
        router.replace('/');
        return;
      }
      
      const response = await fetch(`${API_URL}/assignments?team_id=${user.team_id}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      
      // Sort by status and priority
      const sortedAssignments = data.sort((a, b) => {
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
      // If no assignments found, show empty state instead of error
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
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
      
      {currentAssignment && (
        <TouchableOpacity 
          style={styles.currentBanner}
          onPress={() => router.push(`/assignment/${currentAssignment.id}`)}
        >
          <Text style={styles.currentBannerText}>
            Continue: {currentAssignment.category} ({currentAssignment.subcategory})
          </Text>
          <Text style={styles.currentBannerSubtext}>Tap to continue →</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={assignments.filter(a => a.status !== 'Completed')}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.card,
              item.status === 'In Progress' && styles.activeCard
            ]}
            onPress={() => router.push(`/assignment/${item.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.category}</Text>
              <View style={[
                styles.priorityBadge,
                item.priority_level === 'L1' && styles.priorityL1,
                item.priority_level === 'L2' && styles.priorityL2,
                item.priority_level === 'L3' && styles.priorityL3,
                item.priority_level === 'L4' && styles.priorityL4
              ]}>
                <Text style={styles.priorityText}>{item.priority_level}</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>{item.subcategory || 'General'}</Text>
            <Text style={styles.statusText}>
              {item.status === 'In Progress' ? '🔄 In Progress' : '⏱️ Queued'}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No assignments in queue</Text>
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
    marginTop: 12,
    color: '#666'
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  logoutButton: {
    padding: 8
  },
  logoutText: {
    color: '#3b82f6'
  },
  currentBanner: {
    backgroundColor: '#3b82f6',
    padding: 12,
    margin: 16,
    borderRadius: 8
  },
  currentBannerText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  currentBannerSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4
  },
  listContainer: {
    padding: 16,
    paddingTop: 0
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  cardSubtitle: {
    color: '#666',
    marginBottom: 8
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  statusText: {
    fontSize: 12,
    color: '#666'
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