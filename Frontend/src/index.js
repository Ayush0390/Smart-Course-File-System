// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Make sure you are importing App
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme'; // Import our theme

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
    {/* <App /> This is the key! Render the App component */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
