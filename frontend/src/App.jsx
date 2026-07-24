import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AthleteProfile from './pages/AthleteProfile'
import UploadVideo from './pages/UploadVideo'
import PredictionHistory from './pages/PredictionHistory'
import AboutProject from './pages/AboutProject'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<AboutProject />} />
      <Route path="/contact" element={<Contact />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <AthleteProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/upload"
        element={
          <ProtectedRoute>
            <UploadVideo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/predictions"
        element={
          <ProtectedRoute>
            <PredictionHistory />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
