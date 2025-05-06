import { useEffect } from 'react';
import AppNavigation from './navigation';

export default function LoginRedirect() {
  // Redirect to main login page using our centralized navigation module
  useEffect(() => {
    AppNavigation.goToLogin();
  }, []);
  
  // Return null since this is just a redirect component
  return null;
}