import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Clock } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { SubscriptionStatus } from '../components/SubscriptionStatus'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabaseClient } from '../lib/supabase'

interface DashboardData {
  todaySales: number
  todayOrders: number
  averageTicket: number
  averageTime: number
  salesData: Array<{ name: string; vendas: number; pedidos: number }>
  orderStatusData: Array<{ name: string; value: number; color: string }>
  recentOrders: Array<{
    id: string
    customer: string
    items: string
    total: number
    status: string
    time: string
  }>
}

export const Dashboard: React.FC = () => {
  const { restaurant } = useOnboarding()
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todaySales: 0,
    todayOrders: 0,
    averageTicket: 0,
    averageTime: 35,
    salesData: [],
    orderStatusData: [
      { name: 'Concluídos', value: 0, color: '#10B981' },
      { name: 'Pendentes', value: 0, color: '#F59E0B' },
      { name: 'Cancelados', value: 0, color: '#EF4444' },
    ],
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (restaurant?.id) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [restaurant])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch today's orders
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: todayOrders, error: todayError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (todayError) throw todayError

      // Calculate today's metrics
      const todaySales = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
      const todayOrdersCount = todayOrders?.length || 0
      const averageTicket = todayOrdersCount > 0 ? todaySales / todayOrdersCount : 0

      // Fetch last 6 months data for chart
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: allOrders, error: allOrdersError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .gte('created_at', sixMonthsAgo.toISOString())

      if (allOrdersError) throw allOrdersError

      // Group orders by month
      const monthlyData: { [key: string]: { vendas: number; pedidos: number } } = {}
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

      allOrders?.forEach(order => {
        const date = new Date(order.created_at)
        const monthKey = months[date.getMonth()]
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { vendas: 0, pedidos: 0 }
        }
        
        monthlyData[monthKey].vendas += order.total_amount
        monthlyData[monthKey].pedidos += 1
      })

      const salesData = Object.entries(monthlyData).map(([name, data]) => ({
        name,
        ...data
      }))

      // Calculate order status distribution
      const statusCounts = {
        delivered: allOrders?.filter(o => o.status === 'delivered').length || 0,
        pending: allOrders?.filter(o => o.status === 'pending').length || 0,
        cancelled: allOrders?.filter(o => o.status === 'cancelled').length || 0,
      }

      const orderStatusData = [
        { name: 'Concluídos', value: statusCounts.delivered, color: '#10B981' },
        { name: 'Pendentes', value: statusCounts.pending, color: '#F59E0B' },
        { name: 'Cancelados', value: statusCounts.cancelled, color: '#EF4444' },
      ]

      // Get recent orders (last 10)
      const { data: recentOrdersData, error: recentError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentError) throw recentError

      const recentOrders = recentOrdersData?.map(order => ({
        id: order.id,
        customer: order.customer_name,
        items: order.items.map((item: any) => item.name).join(', '),
        total: order.total_amount,
        status: order.status === 'delivered' ? 'Entregue' : 
                order.status === 'preparing' ? 'Preparando' : 
                order.status === 'cancelled' ? 'Cancelado' : 'Pendente',
        time: new Date(order.created_at).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      })) || []

      setDashboardData({
        todaySales,
        todayOrders: todayOrdersCount,
        averageTicket,
        averageTime: 35, // This would need to be calculated based on actual delivery times
        salesData,
        orderStatusData,
        recentOrders
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Últimos 30 dias</option>
            <option>Últimos 7 dias</option>
            <option>Hoje</option>
          </select>
        </div>
      </div>

      {/* Status da Assinatura */}
      <SubscriptionStatus />

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm font-medium">Vendas Hoje</p>
              <p className="text-3xl font-bold">R$ {dashboardData.todaySales.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">vs ontem</span>
              </div>
            </div>
            <DollarSign className="w-12 h-12 text-primary-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Pedidos Hoje</p>
              <p className="text-3xl font-bold">{dashboardData.todayOrders}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">vs ontem</span>
              </div>
            </div>
            <ShoppingCart className="w-12 h-12 text-blue-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-100 text-sm font-medium">Ticket Médio</p>
              <p className="text-3xl font-bold">R$ {dashboardData.averageTicket.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 mr-1" />
                <span className="text-sm">vs ontem</span>
              </div>
            </div>
            <Users className="w-12 h-12 text-secondary-200" />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Tempo Médio</p>
              <p className="text-3xl font-bold">{dashboardData.averageTime}min</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">vs ontem</span>
              </div>
            </div>
            <Clock className="w-12 h-12 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Vendas e Pedidos" subtitle="Últimos 6 meses">
          {dashboardData.salesData.length > 0 ? (
            <ResponsiveContainer width="100%\" height={300}>
              <BarChart data={dashboardData.salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#e63946" />
                <Bar dataKey="pedidos" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum dado de vendas ainda</p>
                <p className="text-sm">Os dados aparecerão quando você receber pedidos</p>
              </div>
            </div>
          )}
        </Card>

        <Card title="Status dos Pedidos" subtitle="Distribuição atual">
          {dashboardData.orderStatusData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%\" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Nenhum pedido ainda</p>
                <p className="text-sm">Os dados aparecerão quando você receber pedidos</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Pedidos Recentes */}
      <Card title="Pedidos Recentes" subtitle="Últimos pedidos do dia">
        {dashboardData.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Pedido</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Items</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Horário</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-700">{order.items}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">R$ {order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Entregue' ? 'bg-primary-100 text-primary-800' :
                        order.status === 'Preparando' ? 'bg-secondary-100 text-secondary-800' :
                        order.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido ainda</h3>
            <p className="text-gray-600">Quando você receber pedidos, eles aparecerão aqui</p>
          </div>
        )}
      </Card>
    </div>
  )
}