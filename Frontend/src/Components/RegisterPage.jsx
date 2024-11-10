import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        // Create user with Firebase Authentication and add them to db
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const queryParams = new URLSearchParams(location.search);
        await setDoc(doc(db, 'users', user.uid), {
            userId: user.uid,
            username: username,
            email: email,
            createdAt: new Date(),
            
        });
        

            navigate('/');
          
    } catch (error) {
        setError(error.message);
    }
  };

  return (
    <div className="auth-page">
    <h2>Register</h2>
    <form onSubmit={handleRegister}>
        <div className="form-group">
        <label>Username:</label>
        <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
        />
        </div>
        <div className="form-group">
        <label>Email:</label>
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        </div>
        <div className="form-group">
        <label>Password:</label>
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Register</button>
    </form>
    Already have an account? Login <a href='/login'>here</a>
    </div>
);
};

export default RegisterPage;