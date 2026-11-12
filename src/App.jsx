import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequestProvider, useRequests } from './context/RequestContext';
import { Navbar } from './components/common/Navbar';
import { DemoBanner } from './components/common/DemoBanner';
import { Footer } from './components/common/Footer';
import { Toast } from './components/common/Toast';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BeneficiaryDashboard } from './pages/BeneficiaryDashboard';
import { SubmitAidRequestPage } from './pages/SubmitAidRequestPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { RequestDetailsPage } from './pages/RequestDetailsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { TransparencyDashboard } from './pages/TransparencyDashboard';
import { CataloguePage } from './pages/CataloguePage';

const AppContent = () => {
  const { toast, dismissToast } = useRequests();
  const { role } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      {/* Top Persona Switcher Bar */}
      <DemoBanner />

      {/* Primary Sticky Header */}
      <Navbar />

      {/* Main Routed Content */}
      <div className="flex-1">
        <Routes>
          {/* Main Home Route: dynamically displays only what persona is selected; otherwise displays public landing */}
          <Route
            path="/"
            element={
              role === 'beneficiary' ? (
                <BeneficiaryDashboard />
              ) : role === 'donor' ? (
                <DonorDashboard />
              ) : role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <LandingPage />
              )
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Beneficiary Routes - Protected */}
          <Route
            path="/beneficiary"
            element={
              <ProtectedRoute allowedRoles={['beneficiary', 'admin']}>
                <BeneficiaryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiary/new-request"
            element={
              <ProtectedRoute allowedRoles={['beneficiary', 'admin']}>
                <SubmitAidRequestPage />
              </ProtectedRoute>
            }
          />

          {/* Donor Routes - Hidden from Beneficiary */}
          <Route
            path="/donor"
            element={
              role === 'beneficiary' ? (
                <Navigate to="/beneficiary" replace />
              ) : (
                <DonorDashboard />
              )
            }
          />
          <Route path="/donor/requests/:id" element={<RequestDetailsPage />} />
          <Route path="/requests/:id" element={<RequestDetailsPage />} />
          <Route path="/beneficiary/requests/:id" element={<RequestDetailsPage />} />

          {/* Admin Route - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Transparency Public Ledger */}
          <Route path="/transparency" element={<TransparencyDashboard />} />

          {/* Verified Supplies Catalogue */}
          <Route path="/catalogue" element={<CataloguePage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Reusable Toast Notification */}
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RequestProvider>
          <AppContent />
        </RequestProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export { App };

