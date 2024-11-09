import { React, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '..//AuthContext'

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) return <p>Loading...</p>;
  
  return (
    <div className="landing-page">
      <header>
        <h1>CARS</h1>
      </header>
      <main>
        <div className="auth-buttons">
          <Link to="/login">
            <button className="login-button">Log In</button>
          </Link>
          <Link to="/register">
            <button className="register-button">Register</button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;