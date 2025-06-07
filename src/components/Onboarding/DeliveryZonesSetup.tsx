import React, { useState, useEffect } from 'react'
import { MapPin, Plus, Edit, Trash2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Card } from '../UI/Card'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'
import { useOnboarding } from '../../hooks/useOnboarding'
import { supabaseClient } from '../../lib/supabase'

interface DeliveryZone {
  id?: string
  neighborhood: string
  delivery_fee: number
  delivery_time_min: number
  delivery_time_max: number
}

export const DeliveryZonesSetup: React.FC = () => {
  const { restaurant, refetch } = useOnboarding()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<DeliveryZone>({
    neighborhood: '',
    delivery_fee: 0,
    delivery_time_min: 30,
    delivery_time_max: 60,
  })

  useEffect(() => {
    if (restaurant) {
      fetchZones()
    }
  }, [restaurant])

  const fetchZones = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('delivery_zones')
        .select('*')
        .eq('restaurant_id', restaurant?.id)
        .order('neighborhood', { ascending: true })

      if (error) throw error
      setZones(data || [])
    } catch (err: any) {
      console.error('Error fetching delivery zones:', err)
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
    setLoading(true)
    setError('')

    try {
      if (editingZone?.id) {
        // Update existing zone
        const { error } = await supabaseClient
          .from('delivery_zones')
          .update(formData)
          .eq('id', editingZone.id)

        if (error) throw error
      } else {
        // Create new zone
        const { error } = await supabaseClient
          .from('delivery_zones')
          .insert({
            restaurant_id: restaurant?.id,
            ...formData,
          })

        if (error) throw error
      }

      await fetchZones()
      await refetch() // Update onboarding status
      setShowModal(false)
      setEditingZone(null)
      setFormData({
        neighborhood: '',
        delivery_fee: 0,
        delivery_time_min: 30,
        delivery_time_max: 60,
      })
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar zona de entrega')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setFormData(zone)
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
      await refetch() // Update onboarding status
    } catch (err: any) {
      console.error('Error deleting delivery zone:', err)
    }
  }

  const openAddModal = () => {
    setEditingZone(null)
    setFormData({
      neighborhood: '',
      delivery_fee: 0,
      delivery_time_min: 30,
      delivery_time_max: 60,
    })
    setShowModal(true)
  }

  const handleFinish = async () => {
    await refetch() // Make sure onboarding status is updated
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Taxas de Entrega
            </h2>
            <p className="text-gray-600">
              Configure as taxas e tempos de entrega por bairro
            </p>
          </div>

          {/* Add Zone Button */}
          <div className="flex justify-center mb-8">
            <Button onClick={openAddModal} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Zona de Entrega
            </Button>
          </div>

          {/* Zones List */}
          {zones.length > 0 ? (
            <div className="space-y-4 mb-8">
              {zones.map((zone) => (
                <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{zone.neighborhood}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Taxa:</span> R$ {zone.delivery_fee.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Tempo:</span> {zone.delivery_time_min}-{zone.delivery_time_max} min
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-8">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma zona configurada
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione pelo menos uma zona de entrega para continuar
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            {zones.length > 0 && (
              <Button onClick={handleFinish} size="lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Configuração
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Zone Modal */}
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

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={loading}>
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