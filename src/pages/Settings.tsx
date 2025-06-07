import React, { useState } from 'react'
import { Save, MapPin, MessageCircle, Instagram, ExternalLink } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    restaurantName: 'Meu Restaurante',
    phone: '(11) 99999-9999',
    email: 'contato@restaurante.com',
    address: 'Rua das Flores, 123 - Centro',
    googleMapsUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    whatsappToken: '',
    evolutionApiUrl: '',
    metaBusinessToken: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Aqui você implementaria a lógica para salvar as configurações
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simula API call
      console.log('Settings saved:', formData)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-1">Gerencie as configurações do seu restaurante</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card title="Informações Básicas" subtitle="Dados principais do seu restaurante">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Restaurante"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                required
              />
              <Input
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Endereço"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
        </Card>

        {/* Redes Sociais */}
        <Card title="Redes Sociais" subtitle="Links para suas redes sociais">
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Google Meu Negócio"
                name="googleMapsUrl"
                value={formData.googleMapsUrl}
                onChange={handleChange}
                placeholder="https://goo.gl/maps/..."
              />
              <MapPin className="absolute right-3 top-9 text-gray-400 w-5 h-5" />
            </div>
            <div className="relative">
              <Input
                label="Instagram"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/seurestaurante"
              />
              <Instagram className="absolute right-3 top-9 text-gray-400 w-5 h-5" />
            </div>
            <div className="relative">
              <Input
                label="Facebook"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                placeholder="https://facebook.com/seurestaurante"
              />
              <ExternalLink className="absolute right-3 top-9 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Integração WhatsApp */}
        <Card title="Integração WhatsApp" subtitle="Configure a Evolution API para WhatsApp">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-900">Como configurar:</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    1. Configure sua instância da Evolution API<br />
                    2. Cole a URL da API e o token de acesso<br />
                    3. Teste a conexão
                  </p>
                </div>
              </div>
            </div>
            <Input
              label="URL da Evolution API"
              name="evolutionApiUrl"
              value={formData.evolutionApiUrl}
              onChange={handleChange}
              placeholder="https://api.evolution.com"
            />
            <Input
              label="Token de Acesso"
              name="whatsappToken"
              type="password"
              value={formData.whatsappToken}
              onChange={handleChange}
              placeholder="Seu token da Evolution API"
            />
            <Button variant="outline" type="button">
              Testar Conexão
            </Button>
          </div>
        </Card>

        {/* Integração Instagram */}
        <Card title="Integração Instagram" subtitle="Configure o Meta Business para Instagram">
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start">
                <Instagram className="w-5 h-5 text-purple-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-purple-900">Como configurar:</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    1. Crie um app no Meta for Developers<br />
                    2. Configure o Instagram Basic Display API<br />
                    3. Cole o token de acesso
                  </p>
                </div>
              </div>
            </div>
            <Input
              label="Token do Meta Business"
              name="metaBusinessToken"
              type="password"
              value={formData.metaBusinessToken}
              onChange={handleChange}
              placeholder="Seu token do Meta Business"
            />
            <Button variant="outline" type="button">
              Autorizar Instagram
            </Button>
          </div>
        </Card>

        {/* Taxas de Entrega */}
        <Card title="Taxas de Entrega" subtitle="Configure as taxas por bairro">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-900">Configuração de Taxas:</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Acesse a seção "Taxas de Entrega" no menu lateral para configurar as taxas por bairro
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" type="button">
              Configurar Taxas de Entrega
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={loading} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}