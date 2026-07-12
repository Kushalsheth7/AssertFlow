import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signUpUser } from '../store/dataStore';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    const cleanEmail = email.trim();
    console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);

    try {
      if (isLogin) {
        await loginUser(cleanEmail, password);
      } else {
        await signUpUser(cleanEmail, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Auth Error:', err);
      let errMsg = 'Authentication failed';
      if (err.message && err.message !== '{}') {
        errMsg = err.message;
      } else if (err.error_description) {
        errMsg = err.error_description;
      } else if (typeof err === 'string' && err !== '{}') {
        errMsg = err;
      }
      setError(errMsg);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isLogin ? 'Login to AssetFlow' : 'Sign up for AssetFlow'}</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleAuth} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: 'absolute', right: '10px', top: '32px', 
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' 
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" className="primary-btn">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="toggle-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" className="link-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
