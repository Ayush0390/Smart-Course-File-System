import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Menu, MenuItem, Container, Card, CardContent,
  Typography, FormControl, InputLabel, Select, Button, Box
} from '@mui/material';
import { FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const Dashboard = () => {
  const [pattern, setPattern] = useState('2019');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [department, setDepartment] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [contactAnchorEl, setContactAnchorEl] = useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleContactMenuOpen = (event) => setContactAnchorEl(event.currentTarget);
  const handleContactMenuClose = () => setContactAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    handleClose();
    navigate('/');
  };

  const handleReset = () => {
    setPattern('2019');
    setSubject('');
    setYear('');
    setDepartment('');
    setSyllabusFile(null);
    setMessage('');
  };

  const handleFileChange = (event) => {
    if (event.target.files[0]) {
      setSyllabusFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!syllabusFile || !subject || !year || !department) {
      setMessage('Please fill all fields and upload a syllabus file.');
      return;
    }
    setIsLoading(true);
    setMessage('Processing... This may take a moment.');

    const formData = new FormData();
    formData.append('syllabusFile', syllabusFile);
    formData.append('subject', subject);
    formData.append('year', year);
    formData.append('department', department);

    try {
      const response = await axios.post('/api/syllabus/process-syllabus', formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Generated_CO_PO_Mapping_${subject}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setMessage('CO-PO Mapping sheet generated successfully!');
    } catch (error) {
      const reader = new FileReader();
      let errorMsg = 'An error occurred while processing the file.';
      reader.onload = () => {
        try {
          const parsedError = JSON.parse(reader.result);
          if (parsedError && parsedError.message) {
            errorMsg = parsedError.message;
          }
        } catch (e) {}
        setMessage(errorMsg);
      };
      if (error.response && error.response.data) {
        reader.readAsText(error.response.data);
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pdfPath = "/master-timetable-2024-25-sem2.pdf";

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Smart Course File System
          </Typography>

          {/* Navigation buttons */}
          <Button color="inherit" onClick={handleReset}>Home</Button>
          <Button
            color="inherit"
            onClick={() => navigate("/timetable")}
            startIcon={<CalendarTodayIcon />}
          >
            Master Timetable
          </Button>

          {/* 🆕 Replace old “Personal Timetable” with new “Single Faculty Timetable” */}
          <Button
            color="inherit"
            onClick={() => navigate("/single-faculty-timetable")}
          >
            Single Faculty Timetable
          </Button>

          <Button
            color="inherit"
            href={encodeURI(pdfPath)}
            download="master-timetable-2024-25-sem2.pdf"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>

          <Button color="inherit" onClick={handleContactMenuOpen}>Contacts</Button>

          <Menu
            id="contact-menu"
            anchorEl={contactAnchorEl}
            open={Boolean(contactAnchorEl)}
            onClose={handleContactMenuClose}
          >
            <MenuItem onClick={handleContactMenuClose}>
              <EmailIcon sx={{ mr: 1 }} /> adypsoe@gmail.com
            </MenuItem>
          </Menu>

          {/* Profile Menu */}
          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Dashboard Body */}
      <Box sx={{ backgroundColor: '#f4f6f8', minHeight: 'calc(100vh - 64px)', py: 4 }}>
        <Container maxWidth="md">
          <Card>
            <CardContent sx={{ p: { xs: 2, md: 4 } }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                Upload Syllabus & Generate CO-PO Mapping
              </Typography>

              <Box component="form" noValidate sx={{ mt: 3 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Year</InputLabel>
                  <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                    <MenuItem value="FE">FE</MenuItem>
                    <MenuItem value="SE">SE</MenuItem>
                    <MenuItem value="TE">TE</MenuItem>
                    <MenuItem value="BE">BE</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Department</InputLabel>
                  <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
                    <MenuItem value="Computer">Computer</MenuItem>
                    <MenuItem value="IT">IT</MenuItem>
                    <MenuItem value="ENTC">ENTC</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Pattern</InputLabel>
                  <Select value={pattern} label="Pattern" onChange={(e) => setPattern(e.target.value)}>
                    <MenuItem value="2019">2019</MenuItem>
                    <MenuItem value="2024">2024</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Subject</InputLabel>
                  <Select value={subject} label="Subject" onChange={(e) => setSubject(e.target.value)}>
                    <MenuItem value="DBMS">DBMS</MenuItem>
                    <MenuItem value="Software Engineering">Software Engineering</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    component="label"
                    startIcon={<FaCloudUploadAlt />}
                  >
                    Upload Syllabus
                    <input type="file" hidden onChange={handleFileChange} accept=".pdf" />
                  </Button>
                  {syllabusFile && (
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main' }}>
                      <FaCheckCircle style={{ marginRight: '8px' }} /> {syllabusFile.name}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 'auto' }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Generate Mapping'}
                  </Button>
                </Box>

                {message && (
                  <Typography sx={{ mt: 2, textAlign: 'center' }}>{message}</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
