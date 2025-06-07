import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Gift, Calendar, Percent, Users, Target } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabaseClient } from '../lib/supabase'

interface Promotion {
  id: string
  name: string
  description: string
  discount_percentage: number
  start_date: string
  end_date: string
  active: boolean
  category: string
  target_days?: number
  created_at: string
}

const promotionCategories = [
  { value: 'reativacao_7_dias', label: 'Reativação 7 dias', icon: Target, color: 'bg-red-100 text-red-800', description: 'Para clientes inativos há 7 dias' },
  { value: 'reativacao_15_dias', label: 'Reativação 15 dias', icon: Target, color: 'bg-orange-100 text-orange-800', description: 'Para clientes inativos há 15 dias' },
  { value: 'reativacao_30_dias', label: 'Reativação 30 dias', icon: Target, color: 'bg-yellow-100 text-yellow-800', description: 'Para clientes inativos há 30 dias' },
  { value: 'promocao_geral', label: 'Promoção Geral', icon: Gift, color: 'bg-blue-100 text-blue-800', description: 'Promoções para todos os clientes' },
  { value: 'combo_especial', label: 'Combo Especial', icon: Gift, color: 'bg-purple-100 text-purple-800', description: 'Combos e ofertas especiais' },
  { value: 'desconto_categoria', label: 'Desconto por Categoria', icon: Percent, color: 'bg-green-100 text-green-800', description: 'Desconto em categorias específicas' },
]

export const Promotions: React.FC = () => {
  const { restaurant } = useOnboarding()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todas')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_percentage: 0,
    start_date: '',
    end_date: '',
    active: true,
    category: 'promocao_geral',
    target_days: undefined as number | undefined,
  })

  useEffect(() => {
    if (restaurant?.id) {
      fetchPromotions()
    } else {
      setLoading(false)
    }
  }, [restaurant])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('promotions')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPromotions(data || [])
    } catch (err: any) {
      console.error('Error fetching promotions:', err)
      setError('Erro ao carregar promoções')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value
    let targetDays: number | undefined = undefined

    // Auto-set target_days based on category
    if (category === 'reativacao_7_dias') targetDays = 7
    else if (category === 'reativacao_15_dias') targetDays = 15
    else if (category === 'reativacao_30_dias') targetDays = 30

    setFormData({
      ...formData,
      category,
      target_days: targetDays,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const promotionData = {
        ...formData,
        restaurant_id: restaurant!.id,
        target_days: formData.target_days || null,
      }

      if (editingPromotion?.id) {
        const { error } = await supabaseClient
          .from('promotions')
          .update(promotionData)
          .eq('id', editingPromotion.id)

        if (error) throw error
      } else {
        const { error } = await supabaseClient
          .from('promotions')
          .insert(promotionData)

        if (error) throw error
      }

      await fetchPromotions()
      closeModal()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar promoção')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      name: promotion.name,
      description: promotion.description,
      discount_percentage: promotion.discount_percentage,
      start_date: new Date(promotion.start_date).toISOString().slice(0, 16),
      end_date: new Date(promotion.end_date).toISOString().slice(0, 16),
      active: promotion.active,
      category: promotion.category,
      target_days: promotion.target_days,
    })
    setShowModal(true)
  }

  const handleDelete = async (promotionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta promoção?')) return

    try {
      const { error } = await supabaseClient
        .from('promotions')
        .delete()
        .eq('id', promotionId)

      if (error) throw error
      await fetchPromotions()
    } catch (err: any) {
      console.error('Error deleting promotion:', err)
      setError('Erro ao excluir promoção')
    }
  }

  const togglePromotionStatus = async (promotionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('promotions')
        .update({ active: !currentStatus })
        .eq('id', promotionId)

      if (error) throw error
      await fetchPromotions()
    } catch (err: any) {
      console.error('Error updating promotion status:', err)
      setError('Erro ao atualizar status da promoção')
    }
  }

  const openAddModal = () => {
    setEditingPromotion(null)
    setFormData({
      name: '',
      description: '',
      discount_percentage: 0,
      start_date: '',
      end_date: '',
      active: true,
      category: 'promocao_geral',
      target_days: undefined,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPromotion(null)
    setError('')
  }

  const isPromotionActive = (promotion: Promotion) => {
    if (!promotion.active) return false
    const now = new Date()
    const startDate = new Date(promotion.start_date)
    const endDate = new Date(promotion.end_date)
    return now >= startDate && now <= endDate
  }

  const getPromotionStatus = (promotion: Promotion) => {
    if (!promotion.active) return 'Inativa'
    const now = new Date()
    const startDate = new Date(promotion.start_date)
    const endDate = new Date(promotion.end_date)
    
    if (now < startDate) return 'Agendada'
    if (now > endDate) return 'Expirada'
    return 'Ativa'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa':
        return 'bg-green-100 text-green-800'
      case 'Agendada':
        return 'bg-blue-100 text-blue-800'
      case 'Expirada':
        return 'bg-gray-100 text-gray-800'
      case 'Inativa':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryInfo = (category: string) => {
    return promotionCategories.find(cat => cat.value === category) || promotionCategories[3]
  }

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase())
    const status = getPromotionStatus(promotion)
    const matchesStatus = statusFilter === 'Todas' || status === statusFilter
    const matchesCategory = categoryFilter === 'Todas' || promotion.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Group promotions by category for agent view
  const groupedPromotions = promotionCategories.map(category => ({
    ...category,
    promotions: filteredPromotions.filter(p => p.category === category.value && isPromotionActive(p))
  })).filter(group => group.promotions.length > 0)

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
          <h1 className="text-3xl font-bold text-gray-900">Promoções</h1>
          <p className="text-gray-600 mt-1">Gerencie as promoções do seu restaurante</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Criar Promoção
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Promoções Ativas por Categoria - Visão do Agente */}
      {groupedPromotions.length > 0 && (
        <Card title="🤖 Promoções Disponíveis para o Agente" subtitle="Ofertas que a IA pode usar para reativar clientes">
          <div className="space-y-6">
            {groupedPromotions.map((group) => {
              const Icon = group.icon
              return (
                <div key={group.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${group.color.replace('text-', 'bg-').replace('-800', '-500')}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.label}</h3>
                      <p className="text-sm text-gray-600">{group.description}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${group.color}`}>
                      {group.promotions.length} ativa(s)
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.promotions.map((promotion) => (
                      <div key={promotion.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{promotion.name}</h4>
                          <span className="text-lg font-bold text-green-600">
                            {promotion.discount_percentage}% OFF
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{promotion.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Válida até: {new Date(promotion.end_date).toLocaleDateString('pt-BR')}</span>
                          {promotion.target_days && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {promotion.target_days} dias
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Filtros */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar promoções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Todas">Todas as Categorias</option>
              {promotionCategories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {['Todas', 'Ativa', 'Agendada', 'Expirada', 'Inativa'].map((status) => (
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

      {/* Lista de Promoções */}
      {filteredPromotions.length > 0 ? (
        <div className="space-y-4">
          {filteredPromotions.map((promotion) => {
            const status = getPromotionStatus(promotion)
            const categoryInfo = getCategoryInfo(promotion.category)
            const CategoryIcon = categoryInfo.icon
            
            return (
              <Card key={promotion.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${categoryInfo.color.replace('text-', 'bg-').replace('-800', '-500')}`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{promotion.name}</h3>
                        <p className="text-sm text-gray-600">{promotion.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                          {promotion.target_days && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {promotion.target_days} dias
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Percent className="w-4 h-4 mr-2" />
                        <span>{promotion.discount_percentage}% de desconto</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Início: {new Date(promotion.start_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Fim: {new Date(promotion.end_date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePromotionStatus(promotion.id, promotion.active)}
                    >
                      {promotion.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <button
                      onClick={() => handleEdit(promotion)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {promotions.length === 0 ? 'Nenhuma promoção criada' : 'Nenhuma promoção encontrada'}
          </h3>
          <p className="text-gray-600 mb-4">
            {promotions.length === 0 
              ? 'Crie promoções para atrair mais clientes e aumentar suas vendas'
              : 'Tente ajustar os filtros de busca'
            }
          </p>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Promoção
          </Button>
        </Card>
      )}

      {/* Modal para Adicionar/Editar Promoção */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPromotion ? 'Editar Promoção' : 'Criar Promoção'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria da Promoção *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  {promotionCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} - {category.description}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getCategoryInfo(formData.category).description}
                </p>
              </div>

              <Input
                label="Nome da promoção *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Pizza em Dobro"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Descreva a promoção..."
                />
              </div>

              <Input
                label="Desconto (%) *"
                name="discount_percentage"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discount_percentage}
                onChange={handleChange}
                placeholder="0"
                required
              />

              {formData.category.startsWith('reativacao_') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Promoção de Reativação</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Esta promoção será oferecida automaticamente pela IA para clientes que não fazem pedidos há {formData.target_days} dias.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Data de início *"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Data de fim *"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Promoção ativa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  loading={saving}
                >
                  {editingPromotion ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}