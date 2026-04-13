/**
 * main.jsx — Application Entry Point
 * 
 * Initializes the React app and mounts it into the DOM.
 * Uses HashRouter (required for Electron file:// protocol routing).
 * StrictMode is enabled for development-time warnings.
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)