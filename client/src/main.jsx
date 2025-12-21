import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Global error logging for development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
    console.error('Error stack:', event.error.stack);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
