import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './components/Landing';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import { useLaundryStore } from './store';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD'>('LANDING');
  const currentUser = useLaundryStore(state => state.currentUser);
  const syncState = useLaundryStore(state => state.syncState);
  
  // Real-time synchronization
  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [syncState]);

  // Navigate to Dashboard automatically if user is logged in
  useEffect(() => {
    if (currentUser) {
      setCurrentView('DASHBOARD');
    }
  }, [currentUser]);

  return (
    <Layout 
      onNavigate={setCurrentView} 
      currentView={currentView}
    >
      {currentView === 'LANDING' ? (
        <Landing onStart={() => setCurrentView('DASHBOARD')} />
      ) : !currentUser ? (
        <Login />
      ) : currentUser.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <StudentDashboard />
      )}
    </Layout>
  );
};

export default App;
