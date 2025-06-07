import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './components/AuthProvider'
import { NotificationProvider } from './components/NotificationProvider'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { SubscriptionGuard } from './components/SubscriptionGuard'
import { OnboardingGuard } from './components/OnboardingGuard'
import { DashboardLayout } from './components/Layout/DashboardLayout'
import { LandingPage } from './pages/LandingPage'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { AdminLogin } from './pages/AdminLogin'
import { AdminDashboard } from './pages/AdminDashboard'
import { Dashboard } from './pages/Dashboard'
import { Products } from './pages/Products'
import { Promotions } from './pages/Promotions'
import { Orders } from './pages/Orders'
import { DeliveryRates } from './pages/DeliveryRates'
import { WhatsApp } from './pages/WhatsApp'
import { Marketing } from './pages/Marketing'
import { HelpCenter } from './pages/HelpCenter'
import { Settings } from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <Products />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/promotions" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <Promotions />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <Orders />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/delivery-rates" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <DeliveryRates />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/whatsapp" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <WhatsApp />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/instagram" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Integração Instagram</h2>
                        <p className="text-gray-600">Página em desenvolvimento</p>
                      </div>
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/marketing" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <Marketing />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/help" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <HelpCenter />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SubscriptionGuard>
                  <OnboardingGuard>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </OnboardingGuard>
                </SubscriptionGuard>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App