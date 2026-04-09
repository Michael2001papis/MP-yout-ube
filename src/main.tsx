/*
 * © 2026 Michael Papismedov – MP
 * All rights reserved.
 *
 * This code is proprietary and protected.
 * Unauthorized use, distribution, or modification is strictly prohibited.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import './style.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

