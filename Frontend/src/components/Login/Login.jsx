import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, TextField, Button, Box, Card } from '@mui/material';
import axios from 'axios';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password || (!isLoginMode && !name)) {
      setError('Please fill all required fields.');
      return;
    }

    setError('');
    setSuccess('');

    const endpoint = isLoginMode ? '/api/users/login' : '/api/users/register';
    const payload = isLoginMode ? { email, password } : { name, email, password };

    try {
      const response = await axios.post(endpoint, payload);

      if (isLoginMode) {
        const { token, user } = response.data;
        localStorage.setItem('auth-token', token);
        localStorage.setItem('user-role', user.role);

        // ✅ Redirect based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setSuccess(response.data.message || 'User registered successfully');
        setIsLoginMode(true);
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setSuccess('');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(/images/login-bg-left.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: '480px',
          p: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 2, color: 'black' }}>
          {isLoginMode ? 'Welcome Back!' : 'Create an Account'}
        </Typography>

        {success && (
          <Typography color="primary.light" sx={{ mb: 2 }}>
            {success}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {!isLoginMode && (
            <TextField
              fullWidth
              margin="normal"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <Typography color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
            {isLoginMode ? 'Login' : 'Register'}
          </Button>

          <Button fullWidth onClick={toggleMode} sx={{ mt: 1 }}>
            {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;
