import React from 'react'
import { Navigate } from 'react-router-dom'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const isAdminLoggedIn = localStorage.getItem('admin_session') === 'true'

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login\" replace />
  }

  return <>{children}</>
}