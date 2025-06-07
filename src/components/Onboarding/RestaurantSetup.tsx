import React, { useState } from 'react'
import { Store, ArrowRight, ExternalLink } from 'lucide-react'
import { Card } from '../UI/Card'
import { Button } from '../UI/Button'
import { Input } from '../UI/Input'
import { useOnboarding } from '../../hooks/useOnboarding'

export const RestaurantSetup: React.FC = () => {
  const { createRestaurant, restaurant, updateRestaurant } = useOnboarding()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: restaurant?.name || '',
    phone: restaurant?.phone || '',
    email: restaurant?.email || '',
    address: restaurant?.address || '',
    city: restaurant?.city || '',
    state: restaurant?.state || '',
    zip_code: restaurant?.zip_code || '',
    description: restaurant?.description || '',
    external_menu_url: restaurant?.external_menu_url || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (restaurant) {
        await updateRestaurant(formData)
      } else {
        await createRestaurant(formData)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar dados do restaurante')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dados do seu Restaurante
          </h2>
          <p className="text-gray-600">
            Vamos começar com as informações básicas do seu negócio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Nome do Restaurante *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Pizzaria do João"
                required
              />
            </div>

            <Input
              label="Telefone *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              required
            />

            <Input
              label="Email *"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contato@restaurante.com"
              required
            />

            <div className="md:col-span-2">
              <Input
                label="Endereço *"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Rua das Flores, 123"
                required
              />
            </div>

            <Input
              label="Cidade *"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="São Paulo"
              required
            />

            <Input
              label="Estado *"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="SP"
              required
            />

            <Input
              label="CEP *"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="01234-567"
              required
            />

            <div className="md:col-span-2">
              <div className="relative">
                <Input
                  label="Link do Cardápio Digital (opcional)"
                  name="external_menu_url"
                  type="url"
                  value={formData.external_menu_url}
                  onChange={handleChange}
                  placeholder="https://seurestaurante.com/cardapio"
                  helperText="Se você já tem um cardápio online, cole o link aqui"
                />
                <ExternalLink className="absolute right-3 top-9 text-gray-400 w-5 h-5" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Conte um pouco sobre seu restaurante..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="flex items-center space-x-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}