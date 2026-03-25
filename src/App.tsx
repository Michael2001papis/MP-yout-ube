import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import { RequireAuth, RequireRole } from './routes/guards'

import HomePage from './pages/HomePage/HomePage'
import WatchPage from './pages/WatchPage/WatchPage'
import AuthPage from './pages/AuthPage/AuthPage'
import UploadPage from './pages/UploadPage/UploadPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import AboutPage from './pages/AboutPage/AboutPage'
import LegalPage from './pages/LegalPage/LegalPage'
import AdminPage from './pages/AdminPage/AdminPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<HomePage />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/upload"
            element={
              <RequireAuth>
                <UploadPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/legal/:docType" element={<LegalPage />} />
          <Route
            path="/admin"
            element={
              <RequireRole allowed={['admin']}>
                <AdminPage />
              </RequireRole>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

