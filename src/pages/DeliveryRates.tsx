import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabaseClient } from '../lib/supabase'

interface DeliveryZone {
  id: string
  neighborhood: string
  delivery_fee: number
  delivery_time_min: number
  delivery_time_max: number
  active: boolean
}

export const DeliveryRates: React.FC = () => {
  const { restaurant } = useOnboarding()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    neighborhood: '',
    delivery_fee: 0,
    delivery_time_min: 30,
    delivery_time_max: 60,
    active: true,
  })

  useEffect(() => {
    if (restaurant?.id) {
      fetchZones()
    } else {
      setLoading(false)
    }
  }, [restaurant])

  const fetchZones = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from('delivery_zones')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .order('neighborhood', { ascending: true })

      if (error) throw error
      setZones(data || [])
    } catch (err: any) {
      console.error('Error fetching delivery zones:', err)
      setError('Erro ao carregar zonas de entrega')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const zoneData = {
        ...formData,
        restaurant_id: restaurant!.id,
      }

      if (editingZone?.id) {
        const { error } = await supabaseClient
          .from('delivery_zones')
          .update(zoneData)
          .eq('id', editingZone.id)

        if (error) throw error
      } else {
        const { error } = await supabaseClient
          .from('delivery_zones')
          .insert(zoneData)

        if (error) throw error
      }

      await fetchZones()
      closeModal()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar zona de entrega')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setFormData({
      neighborhood: zone.neighborhood,
      delivery_fee: zone.delivery_fee,
      delivery_time_min: zone.delivery_time_min,
      delivery_time_max: zone.delivery_time_max,
      active: zone.active,
    })
    setShowModal(true)
  }

  const handleDelete = async (zoneId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta zona de entrega?')) return

    try {
      const { error } = await supabaseClient
        .from('delivery_zones')
        .delete()
        .eq('id', zoneId)

      if (error) throw error
      await fetchZones()
    } catch (err: any) {
      console.error('Error deleting delivery zone:', err)
      setError('Erro ao excluir zona de entrega')
    }
  }

  const toggleZoneStatus = async (zoneId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseClient
        .from('delivery_zones')
        .update({ active: !currentStatus })
        .eq('id', zoneId)

      if (error) throw error
      await fetchZones()
    } catch (err: any) {
      console.error('Error updating zone status:', err)
      setError('Erro ao atualizar status da zona')
    }
  }

  const openAddModal = () => {
    setEditingZone(null)
    setFormData({
      neighborhood: '',
      delivery_fee: 0,
      delivery_time_min: 30,
      delivery_time_max: 60,
      active: true,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingZone(null)
    setError('')
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Taxas de Entrega</h1>
          <p className="text-gray-600 mt-1">Configure as taxas e tempos de entrega por bairro</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Zona
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Lista de Zonas */}
      {zones.length > 0 ? (
        <div className="space-y-4">
          {zones.map((zone) => (
            <Card key={zone.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{zone.neighborhood}</h3>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        zone.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {zone.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Taxa:</span> R$ {zone.delivery_fee.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Tempo:</span> {zone.delivery_time_min}-{zone.delivery_time_max} min
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleZoneStatus(zone.id, zone.active)}
                  >
                    {zone.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <button
                    onClick={() => handleEdit(zone)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(zone.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma zona configurada</h3>
          <p className="text-gray-600 mb-4">
            Configure as zonas de entrega para definir taxas e tempos por bairro
          </p>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Zona de Entrega
          </Button>
        </Card>
      )}

      {/* Modal para Adicionar/Editar Zona */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingZone ? 'Editar Zona' : 'Adicionar Zona de Entrega'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="Bairro *"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                placeholder="Ex: Centro, Vila Madalena"
                required
              />

              <Input
                label="Taxa de Entrega (R$) *"
                name="delivery_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.delivery_fee}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tempo Mín. (min) *"
                  name="delivery_time_min"
                  type="number"
                  min="1"
                  value={formData.delivery_time_min}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Tempo Máx. (min) *"
                  name="delivery_time_max"
                  type="number"
                  min="1"
                  value={formData.delivery_time_max}
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
                  Zona ativa
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
                <Button type="submit" loading={saving}>
                  {editingZone ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}