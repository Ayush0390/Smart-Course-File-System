import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Timetable from './components/Timetable/Timetable';
import AdminDashboard from './components/Admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* ---------- Public Routes ---------- */}
          <Route path="/" element={<Login />} />

          {/* ---------- Protected Routes ---------- */}
          {/* Faculty Dashboard */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={Dashboard} requiredRole="user" />}
          />

          {/* Admin Dashboard */}
          <Route
            path="/admin"
            element={<ProtectedRoute element={AdminDashboard} requiredRole="admin" />}
          />

          {/* Timetable Viewer */}
          <Route
            path="/timetable"
            element={<ProtectedRoute element={Timetable} requiredRole="user" />}
          />

          

        </Routes>
      </Router>
    </div>
  );
}

export default App;
