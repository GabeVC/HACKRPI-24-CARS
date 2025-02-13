import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { AuthProvider } from './AuthContext';
import HomePage from './components/HomePage';
import UserProfile from './components/UserProfile';



const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the authenticated user
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App"  >
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage/>}/> 
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<UserProfile/>} />
        </Routes>
      </AuthProvider>
    </div>
  );
};

export default App;