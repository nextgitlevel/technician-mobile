import { useEffect } from 'react';
import { router } from 'expo-router';

export default function LoginRedirect() {
  // Redirect to main login page
  useEffect(() => {
    router.replace('/');
  }, []);
  
  // Return null since this is just a redirect component
  return null;
}