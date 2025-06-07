import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Admin credentials check
    const adminEmail = 'admin@deliveryflow.ai'
    const adminPassword = 'DeliveryFlow2024!'

    if (email === adminEmail && password === adminPassword) {
      // Store admin session
      localStorage.setItem('admin_session', 'true')
      navigate('/admin')
    } else {
      setError('Credenciais de administrador inválidas')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white">DeliveryFlow</h1>
              <p className="text-sm text-purple-200">Admin Panel</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Acesso Administrativo
          </h2>
          <p className="text-purple-200">
            Faça login para acessar o painel administrativo
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email do Administrador"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@deliveryflow.ai"
              className="bg-white/10 border-white/30 text-white placeholder-white/60"
              required
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/10 border-white/30 text-white placeholder-white/60"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-white/60 hover:text-white/80"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              size="lg"
              loading={loading}
            >
              Acessar Painel Admin
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-purple-200 text-sm">
              Apenas administradores autorizados podem acessar esta área
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}