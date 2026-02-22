import { type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MeaningAudit } from './pages/modules/MeaningAudit';
import { PeakExperience } from './pages/modules/PeakExperience';
import { DomainExploration } from './pages/modules/DomainExploration';
import { ContributionCalibration } from './pages/modules/ContributionCalibration';
import { ExperimentDesign } from './pages/modules/ExperimentDesign';
import { Laddering } from './pages/modules/Laddering';
import { MTPDrafting } from './pages/modules/MTPDrafting';

// Protected Route Wrapper
const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-textSecondary">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="audit" element={<MeaningAudit />} />
            <Route path="peak" element={<RequireAuth><PeakExperience /></RequireAuth>} />
            <Route path="explore" element={<RequireAuth><DomainExploration /></RequireAuth>} />
            <Route path="contribution" element={<RequireAuth><ContributionCalibration /></RequireAuth>} />
            <Route path="experiment" element={<RequireAuth><ExperimentDesign /></RequireAuth>} />
            <Route path="laddering" element={<RequireAuth><Laddering /></RequireAuth>} />
            <Route path="mtp" element={<RequireAuth><MTPDrafting /></RequireAuth>} />
            <Route path="dashboard" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
