import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/toast/ToastContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { AppLayout } from "./layout/AppLayout";
import { BackgroundFX } from "./components/BackgroundFX";

import { Landing } from "./pages/Landing";
import { About } from "./pages/About";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { VerifyEmail } from "./pages/auth/VerifyEmail";
import { Unauthorized } from "./pages/Unauthorized";
import { NotFound } from "./pages/NotFound";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { RoleHome } from "./pages/RoleHome";
import { AthleteManagement } from "./pages/AthleteManagement";
import { UserManagement } from "./pages/admin/UserManagement";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <BackgroundFX variant="ambient" />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Authenticated (any role) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />

                {/* Admin only */}
                <Route element={<RoleRoute allow={["admin"]} />}>
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/analysis" element={<Dashboard />} />
                </Route>

                {/* Coach (+ admin) */}
                <Route element={<RoleRoute allow={["coach", "admin"]} />}>
                  <Route
                    path="/coach"
                    element={
                      <RoleHome
                        title="Team overview"
                        description="Manage your athletes, review team analytics, and compare performance."
                        analysisPath="/coach/analysis"
                        secondaryAction={{
                          label: "Athlete Management",
                          description: "Add, edit, and track the athletes on your roster.",
                          path: "/coach/athletes",
                        }}
                      />
                    }
                  />
                  <Route path="/coach/analysis" element={<Dashboard />} />
                  <Route
                    path="/coach/athletes"
                    element={
                      <AthleteManagement
                        title="Athlete Management"
                        description="Add, edit, and search the athletes on your roster."
                      />
                    }
                  />
                </Route>

                {/* Athlete (+ admin) */}
                <Route element={<RoleRoute allow={["athlete", "admin"]} />}>
                  <Route
                    path="/athlete"
                    element={
                      <RoleHome
                        title="Welcome back"
                        description="Upload your movement videos and track your injury risk history over time."
                        analysisPath="/athlete/analysis"
                      />
                    }
                  />
                  <Route path="/athlete/analysis" element={<Dashboard />} />
                </Route>

                {/* Physiotherapist (+ admin) */}
                <Route element={<RoleRoute allow={["physiotherapist", "admin"]} />}>
                  <Route
                    path="/physio"
                    element={
                      <RoleHome
                        title="Assigned athletes"
                        description="Review injury history, monitor rehabilitation progress, and add recovery notes."
                        analysisPath="/physio/analysis"
                        secondaryAction={{
                          label: "Athlete Management",
                          description: "Track recovery status, treatment plans, and rehab notes.",
                          path: "/physio/athletes",
                        }}
                      />
                    }
                  />
                  <Route path="/physio/analysis" element={<Dashboard />} />
                  <Route
                    path="/physio/athletes"
                    element={
                      <AthleteManagement
                        title="Athlete Management"
                        description="Track recovery status, treatment plans, and rehab notes for your athletes."
                      />
                    }
                  />
                </Route>
              </Route>
            </Route>

            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
