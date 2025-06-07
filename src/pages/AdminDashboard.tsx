import React, { useState, useEffect } from 'react'
import { Users, DollarSign, TrendingUp, AlertTriangle, Search, Filter, Eye, Ban, CheckCircle } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { supabaseClient } from '../lib/supabase'

interface Subscriber {
  id: string
  email: string
  name: string
  restaurant_name: string
  phone: string
  subscription_status: string
  subscription_amount: number
  subscription_start: string
  last_login: string
  is_blocked: boolean
}

export const AdminDashboard: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null)

  // Mock data for demonstration
  const mockSubscribers: Subscriber[] = [
    {
      id: '1',
      email: 'joao@pizzaria.com',
      name: 'João Silva',
      restaurant_name: 'Pizzaria do João',
      phone: '(11) 99999-9999',
      subscription_status: 'active',
      subscription_amount: 497.00,
      subscription_start: '2024-01-15',
      last_login: '2024-01-20T10:30:00Z',
      is_blocked: false
    },
    {
      id: '2',
      email: 'maria@lanchonete.com',
      name: 'Maria Santos',
      restaurant_name: 'Lanchonete da Maria',
      phone: '(11) 88888-8888',
      subscription_status: 'overdue',
      subscription_amount: 497.00,
      subscription_start: '2024-01-10',
      last_login: '2024-01-18T15:45:00Z',
      is_blocked: false
    },
    {
      id: '3',
      email: 'pedro@sushi.com',
      name: 'Pedro Costa',
      restaurant_name: 'Sushi Express',
      phone: '(11) 77777-7777',
      subscription_status: 'cancelled',
      subscription_amount: 497.00,
      subscription_start: '2024-01-05',
      last_login: '2024-01-16T09:20:00Z',
      is_blocked: true
    }
  ]

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      setLoading(true)
      // In a real implementation, you would fetch from Supabase
      // For now, using mock data
      setTimeout(() => {
        setSubscribers(mockSubscribers)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      setLoading(false)
    }
  }

  const toggleBlockUser = async (userId: string, currentStatus: boolean) => {
    try {
      // In a real implementation, you would update the user status in Supabase
      setSubscribers(prev => 
        prev.map(sub => 
          sub.id === userId 
            ? { ...sub, is_blocked: !currentStatus }
            : sub
        )
      )
    } catch (error) {
      console.error('Error toggling user block status:', error)
    }
  }

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || subscriber.subscription_status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'overdue':
        return 'Em Atraso'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconhecido'
    }
  }

  const totalRevenue = subscribers
    .filter(sub => sub.subscription_status === 'active')
    .reduce((sum, sub) => sum + sub.subscription_amount, 0)

  const activeSubscribers = subscribers.filter(sub => sub.subscription_status === 'active').length
  const overdueSubscribers = subscribers.filter(sub => sub.subscription_status === 'overdue').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-1">Gerencie assinantes e monitore o sistema</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              localStorage.removeItem('admin_session')
              window.location.href = '/admin/login'
            }}
          >
            Sair
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Receita Mensal</p>
                <p className="text-3xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Assinantes Ativos</p>
                <p className="text-3xl font-bold">{activeSubscribers}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Em Atraso</p>
                <p className="text-3xl font-bold">{overdueSubscribers}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Assinantes</p>
                <p className="text-3xl font-bold">{subscribers.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou restaurante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativo</option>
                <option value="overdue">Em Atraso</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Lista de Assinantes */}
        <Card title="Assinantes" subtitle={`${filteredSubscribers.length} assinantes encontrados`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Restaurante</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Valor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Último Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{subscriber.name}</p>
                        <p className="text-sm text-gray-600">{subscriber.email}</p>
                        <p className="text-sm text-gray-600">{subscriber.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{subscriber.restaurant_name}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriber.subscription_status)}`}>
                          {getStatusText(subscriber.subscription_status)}
                        </span>
                        {subscriber.is_blocked && (
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      R$ {subscriber.subscription_amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(subscriber.last_login).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedSubscriber(subscriber)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleBlockUser(subscriber.id, subscriber.is_blocked)}
                          className={`p-2 rounded-lg transition-colors ${
                            subscriber.is_blocked
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={subscriber.is_blocked ? 'Desbloquear usuário' : 'Bloquear usuário'}
                        >
                          {subscriber.is_blocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal de Detalhes */}
        {selectedSubscriber && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Detalhes do Assinante</h2>
                <button
                  onClick={() => setSelectedSubscriber(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Informações Pessoais</h3>
                    <p className="text-gray-700"><strong>Nome:</strong> {selectedSubscriber.name}</p>
                    <p className="text-gray-700"><strong>Email:</strong> {selectedSubscriber.email}</p>
                    <p className="text-gray-700"><strong>Telefone:</strong> {selectedSubscriber.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Restaurante</h3>
                    <p className="text-gray-700"><strong>Nome:</strong> {selectedSubscriber.restaurant_name}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Assinatura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSubscriber.subscription_status)}`}>
                        {getStatusText(selectedSubscriber.subscription_status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Valor Mensal</p>
                      <p className="font-medium text-gray-900">R$ {selectedSubscriber.subscription_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Data de Início</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedSubscriber.subscription_start).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setSelectedSubscriber(null)}>
                    Fechar
                  </Button>
                  <Button
                    variant={selectedSubscriber.is_blocked ? "secondary" : "danger"}
                    onClick={() => {
                      toggleBlockUser(selectedSubscriber.id, selectedSubscriber.is_blocked)
                      setSelectedSubscriber(null)
                    }}
                  >
                    {selectedSubscriber.is_blocked ? 'Desbloquear' : 'Bloquear'} Usuário
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}