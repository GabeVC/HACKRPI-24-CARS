// src/Components/AuthModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Welcome!</h2>
        <p>Please log in or register to add a review.</p>
        <div className="auth-buttons">
          <button 
            className="login-button" 
            onClick={() => {
              onClose();
              navigate('/login');
            }}
          >
            Log In
          </button>
          <button 
            className="register-button" 
            onClick={() => {
              onClose();
              navigate('/register');
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
