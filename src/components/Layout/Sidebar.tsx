import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Gift,
  MapPin,
  MessageCircle,
  Instagram,
  Settings,
  LogOut,
  Utensils,
  BarChart3,
  HelpCircle,
  Headphones
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    title: 'Produtos',
    icon: Package,
    path: '/products',
  },
  {
    title: 'Promoções',
    icon: Gift,
    path: '/promotions',
  },
  {
    title: 'Pedidos',
    icon: Utensils,
    path: '/orders',
  },
  {
    title: 'Taxas de Entrega',
    icon: MapPin,
    path: '/delivery-rates',
  },
  {
    title: 'WhatsApp',
    icon: MessageCircle,
    path: '/whatsapp',
  },
  {
    title: 'Instagram',
    icon: Instagram,
    path: '/instagram',
  },
  {
    title: 'Marketing',
    icon: BarChart3,
    path: '/marketing',
  },
  {
    title: 'Central de Ajuda',
    icon: HelpCircle,
    path: '/help',
  },
  {
    title: 'Configurações',
    icon: Settings,
    path: '/settings',
  },
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AtendeJá</h1>
            <p className="text-sm text-gray-500">Atendente IA</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 border-r-4 border-primary-600 text-primary-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span className="font-medium">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}