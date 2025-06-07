import React, { useState, useEffect } from 'react'
import { Search, Eye, CheckCircle, Clock, AlertCircle, ShoppingCart } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabaseClient } from '../lib/supabase'

interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total_amount: number
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled'
  created_at: string
}

const statusConfig = {
  'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
  'preparing': { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Preparando' },
  'delivered': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Entregue' },
  'cancelled': { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Cancelado' },
}

export const Orders: React.FC = () => {
  const { restaurant } = useOnboarding()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (restaurant?.id) {
      fetchOrders()
    } else {
      setLoading(false)
    }
  }, [restaurant])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      const { error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      await fetchOrders()
    } catch (err: any) {
      console.error('Error updating order status:', err)
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'Todos' || statusConfig[order.status].label === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os pedidos do seu restaurante</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente ou número do pedido..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['Todos', 'Pendente', 'Preparando', 'Entregue', 'Cancelado'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Lista de Pedidos */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status]
            const StatusIcon = statusInfo.icon

            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(order.created_at)}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-sm text-gray-600">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{order.customer_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">R$ {order.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} item(s)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalhes
                    </Button>
                    
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        loading={updating === order.id}
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                      >
                        Aceitar
                      </Button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        loading={updating === order.id}
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                      >
                        Finalizar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {orders.length === 0 ? 'Nenhum pedido ainda' : 'Nenhum pedido encontrado'}
          </h3>
          <p className="text-gray-600">
            {orders.length === 0 
              ? 'Quando você receber pedidos, eles aparecerão aqui'
              : 'Tente ajustar os filtros de busca'
            }
          </p>
        </Card>
      )}

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pedido #{selectedOrder.id.slice(0, 8)}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Fechar</span>
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Informações do Cliente</h3>
                  <p className="text-gray-700">{selectedOrder.customer_name}</p>
                  <p className="text-gray-600">{selectedOrder.customer_phone}</p>
                  <p className="text-gray-600 mt-2">{selectedOrder.customer_address}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status do Pedido</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].label}
                  </span>
                  <p className="text-gray-600 mt-2">
                    Pedido feito em: {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-lg font-bold text-gray-900">Total</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {selectedOrder.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Fechar
                </Button>
                {selectedOrder.status === 'pending' && (
                  <Button onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'preparing')
                    setSelectedOrder(null)
                  }}>
                    Aceitar Pedido
                  </Button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <Button onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'delivered')
                    setSelectedOrder(null)
                  }}>
                    Marcar como Entregue
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}