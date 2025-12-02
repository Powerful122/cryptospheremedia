import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App.jsx'; // This imports the main component you wrote
import './index.css';         // We will create this simple file next

// The code below finds the <div id="root"> element in index.html 
// and renders the entire App component inside it.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
