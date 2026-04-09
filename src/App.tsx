import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/layout/Layout'
import { RequireAuth, RequireRole } from './routes/guards'

import HomePage from './pages/HomePage/HomePage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import AboutPage from './pages/AboutPage/AboutPage'
import AdminEntryPage from './pages/AdminEntryPage/AdminEntryPage'
import LegalPage from './pages/LegalPage/LegalPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'

const WatchPage = lazy(() => import('./pages/WatchPage/WatchPage'))
const AuthPage = lazy(() => import('./pages/AuthPage/AuthPage'))
const UploadPage = lazy(() => import('./pages/UploadPage/UploadPage'))
const AdminPage = lazy(() => import('./pages/AdminPage/AdminPage'))

function RouteFallback() {
  return <div className="py-10 text-center text-sm text-gray-500">Loading...</div>
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
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
              <Route path="/admin-access" element={<AdminEntryPage />} />
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
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}
