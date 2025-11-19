import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
} from '@mui/material';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth-token');

  // ✅ Fetch users wrapped in useCallback (fixes dependency warning)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch Users Error:', err);
      alert('Failed to fetch users.');
    }
    setLoading(false);
  }, [token]);

  // ✅ Fetch users once component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error('Delete User Error:', err);
      alert('Failed to delete user.');
    }
  };

  const handleAddUser = async () => {
    const { name, email, password, role } = newUser;

    if (!name || !email || !password) {
      alert('Name, email, and password are required.');
      return;
    }

    try {
      await axios.post(
        '/api/users/admin/add-user',
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User added successfully.');
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      console.error('Add User Error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error adding user.');
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>

      {/* ✅ Add User Form */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6">Add New User</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            label="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <TextField
            select
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            sx={{ width: 150 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleAddUser}>
            Add User
          </Button>
        </Box>
      </Card>

      {/* ✅ User List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Registered Users
          </Typography>
          {users.length === 0 ? (
            <Typography>No users found.</Typography>
          ) : (
            users.map((user) => (
              <Box
                key={user._id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  p: 1,
                  borderBottom: '1px solid #ccc',
                }}
              >
                <Typography>
                  {user.name ? `${user.name} — ` : ''}
                  {user.email}
                </Typography>
                <Typography
                  sx={{ color: user.role === 'admin' ? 'red' : 'black' }}
                >
                  {user.role.toUpperCase()}
                </Typography>
                {user.role !== 'admin' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboard;
