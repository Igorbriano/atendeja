import React, { useState, useEffect } from 'react'
import { MessageCircle, QrCode, CheckCircle, AlertCircle, Settings, Smartphone, Zap, Users, Bot, Mic, Image, FileText } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Button } from '../components/UI/Button'
import { Input } from '../components/UI/Input'
import { useOnboarding } from '../hooks/useOnboarding'
import { supabaseClient } from '../lib/supabase'

interface WhatsAppConfig {
  isConnected: boolean
  phoneNumber?: string
  instanceName?: string
  apiUrl?: string
  webhookUrl?: string
  lastConnection?: string
}

interface Conversation {
  id: string
  customer_phone: string
  customer_name: string
  customer_message: string
  ai_response: string
  message_type: string
  created_at: string
}

export const WhatsApp: React.FC = () => {
  const { restaurant } = useOnboarding()
  const [config, setConfig] = useState<WhatsAppConfig>({
    isConnected: false
  })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeData, setQRCodeData] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showConversations, setShowConversations] = useState(false)

  const [settingsData, setSettingsData] = useState({
    instanceName: '',
    apiUrl: '',
    webhookUrl: '',
    autoReply: true,
    businessHours: true,
    startTime: '08:00',
    endTime: '22:00',
    groqApiKey: '',
    evolutionApiKey: '',
    openaiApiKey: '',
    googleTtsApiKey: '',
  })

  useEffect(() => {
    checkConnection()
    if (restaurant?.id) {
      fetchConversations()
    }
  }, [restaurant])

  const checkConnection = async () => {
    try {
      setLoading(true)
      // Simular verificação de conexão com Evolution API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Por enquanto, sempre retorna desconectado para mostrar o QR Code
      setConfig({
        isConnected: false,
        phoneNumber: undefined,
        instanceName: undefined,
      })
    } catch (err: any) {
      setError('Erro ao verificar conexão')
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabaseClient
        .from('conversations')
        .select('*')
        .eq('restaurant_id', restaurant!.id)
        .eq('platform', 'whatsapp')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setConversations(data || [])
    } catch (err: any) {
      console.error('Error fetching conversations:', err)
    }
  }

  const generateQRCode = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Simular geração de QR Code
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // QR Code simulado - em produção seria gerado pela Evolution API
      const qrData = `https://wa.me/qr/ABCDEFGHIJKLMNOP`
      setQRCodeData(qrData)
      setShowQRCode(true)
      
      // Simular timeout do QR Code
      setTimeout(() => {
        setShowQRCode(false)
        setQRCodeData('')
      }, 60000) // 1 minuto
      
    } catch (err: any) {
      setError('Erro ao gerar QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setSettingsData({
      ...settingsData,
      [e.target.name]: value,
    })
  }

  const saveSettings = async () => {
    try {
      setLoading(true)
      // Simular salvamento das configurações
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowSettings(false)
    } catch (err: any) {
      setError('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const testAIAgent = async () => {
    try {
      setLoading(true)
      
      // Test AI agent with sample message
      const testMessage = {
        platform: 'whatsapp',
        messageType: 'text',
        content: 'Olá, gostaria de fazer um pedido',
        customerPhone: '+5511999999999',
        customerName: 'Cliente Teste',
        restaurantId: restaurant?.id
      }

      const response = await supabaseClient.functions.invoke('ai-agent', {
        body: testMessage
      })

      if (response.error) throw response.error

      alert('IA testada com sucesso! Resposta: ' + JSON.stringify(response.data, null, 2))
      
    } catch (err: any) {
      setError('Erro ao testar IA: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !showQRCode) {
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
          <h1 className="text-3xl font-bold text-gray-900">Integração WhatsApp</h1>
          <p className="text-gray-600 mt-1">Configure sua IA para atender clientes no WhatsApp</p>
        </div>
        <div className="flex gap-2">
          {config.isConnected && (
            <>
              <Button onClick={() => setShowConversations(true)} variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversas
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </>
          )}
          <Button onClick={testAIAgent} variant="secondary">
            <Bot className="w-4 h-4 mr-2" />
            Testar IA
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Status da Conexão */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              config.isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <MessageCircle className={`w-6 h-6 ${
                config.isConnected ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Status da Conexão
              </h3>
              <div className="flex items-center space-x-2">
                {config.isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">Conectado</span>
                    {config.phoneNumber && (
                      <span className="text-gray-500">• {config.phoneNumber}</span>
                    )}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">Desconectado</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {!config.isConnected && (
            <Button onClick={generateQRCode} loading={loading}>
              <QrCode className="w-4 h-4 mr-2" />
              Conectar WhatsApp
            </Button>
          )}
        </div>
      </Card>

      {/* Capacidades da IA */}
      <Card title="🤖 Capacidades da IA de Atendimento" subtitle="Sua IA está preparada para atender com inteligência">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-blue-900">Mensagens de Texto</h3>
            </div>
            <p className="text-sm text-blue-700">
              Entende e responde mensagens de texto com inteligência, oferecendo produtos e fechando vendas.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-purple-900">Áudios</h3>
            </div>
            <p className="text-sm text-purple-700">
              Converte áudios em texto usando Whisper API e pode responder com áudios gerados por IA.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-green-900">Imagens</h3>
            </div>
            <p className="text-sm text-green-700">
              Recebe imagens dos clientes e responde adequadamente, podendo enviar imagens dos produtos.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-yellow-900">Vendas Inteligentes</h3>
            </div>
            <p className="text-sm text-yellow-700">
              Age como vendedora experiente, sugerindo upsells, combos e aplicando promoções automaticamente.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-red-900">Coleta de Dados</h3>
            </div>
            <p className="text-sm text-red-700">
              Coleta nome, telefone, endereço completo e confirma todos os detalhes antes de finalizar.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-indigo-900">Impressão Automática</h3>
            </div>
            <p className="text-sm text-indigo-700">
              Envia pedidos confirmados diretamente para a impressora da cozinha automaticamente.
            </p>
          </div>
        </div>
      </Card>

      {/* QR Code para Conexão */}
      {showQRCode && (
        <Card title="Conectar WhatsApp Web" subtitle="Escaneie o QR Code com seu WhatsApp">
          <div className="text-center space-y-6">
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 inline-block">
              {/* QR Code simulado */}
              <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">QR Code será exibido aqui</p>
                  <p className="text-xs text-gray-400 mt-2">Válido por 60 segundos</p>
                </div>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">Como conectar:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-gray-700">Abra o WhatsApp no seu celular</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-gray-700">Toque em "Mais opções" (⋮) e depois em "Dispositivos conectados"</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-gray-700">Toque em "Conectar um dispositivo" e escaneie este QR Code</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Importante:</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Após conectar, a IA assumirá o atendimento automaticamente. Mantenha seu celular conectado à internet.
              </p>
            </div>

            <Button variant="outline" onClick={() => setShowQRCode(false)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Funcionalidades da IA */}
      <Card title="Tecnologias Integradas" subtitle="Plataforma completa de IA para atendimento">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Groq AI</h3>
            <p className="text-sm text-gray-600">IA ultra-rápida para conversas naturais e vendas inteligentes</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Evolution API</h3>
            <p className="text-sm text-gray-600">Integração completa com WhatsApp para envio de mídia</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Whisper + TTS</h3>
            <p className="text-sm text-gray-600">Converte áudio em texto e gera respostas em voz</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Impressão</h3>
            <p className="text-sm text-gray-600">Pedidos enviados automaticamente para a cozinha</p>
          </div>
        </div>
      </Card>

      {/* Estatísticas (quando conectado) */}
      {config.isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card title="Mensagens Hoje" className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">127</div>
            <p className="text-sm text-gray-600">+23% vs ontem</p>
          </Card>

          <Card title="Pedidos via WhatsApp" className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">34</div>
            <p className="text-sm text-gray-600">+15% vs ontem</p>
          </Card>

          <Card title="Taxa de Conversão" className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">26.8%</div>
            <p className="text-sm text-gray-600">+5.2% vs ontem</p>
          </Card>

          <Card title="Tempo Médio" className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">2.3min</div>
            <p className="text-sm text-gray-600">Por conversa</p>
          </Card>
        </div>
      )}

      {/* Modal de Conversas */}
      {showConversations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Conversas Recentes</h2>
              <button
                onClick={() => setShowConversations(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {conversations.map((conv) => (
                <div key={conv.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{conv.customer_name}</span>
                      <span className="text-sm text-gray-500">{conv.customer_phone}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        conv.message_type === 'text' ? 'bg-blue-100 text-blue-800' :
                        conv.message_type === 'audio' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {conv.message_type === 'text' ? 'Texto' : 
                         conv.message_type === 'audio' ? 'Áudio' : 'Imagem'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(conv.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">Cliente:</p>
                      <p className="text-gray-900">{conv.customer_message}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-600 mb-1">IA:</p>
                      <p className="text-gray-900">{conv.ai_response}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma conversa ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configurações da IA</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">APIs e Integrações</h3>
                <div className="space-y-4">
                  <Input
                    label="Groq API Key"
                    name="groqApiKey"
                    type="password"
                    value={settingsData.groqApiKey}
                    onChange={handleSettingsChange}
                    placeholder="gsk_..."
                  />

                  <Input
                    label="Evolution API Key"
                    name="evolutionApiKey"
                    type="password"
                    value={settingsData.evolutionApiKey}
                    onChange={handleSettingsChange}
                    placeholder="Sua chave da Evolution API"
                  />

                  <Input
                    label="OpenAI API Key (Whisper)"
                    name="openaiApiKey"
                    type="password"
                    value={settingsData.openaiApiKey}
                    onChange={handleSettingsChange}
                    placeholder="sk-..."
                  />

                  <Input
                    label="Google TTS API Key"
                    name="googleTtsApiKey"
                    type="password"
                    value={settingsData.googleTtsApiKey}
                    onChange={handleSettingsChange}
                    placeholder="Sua chave do Google TTS"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Comportamento da IA</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoReply"
                      name="autoReply"
                      checked={settingsData.autoReply}
                      onChange={handleSettingsChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="autoReply" className="ml-2 text-sm text-gray-700">
                      Resposta automática ativada
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="businessHours"
                      name="businessHours"
                      checked={settingsData.businessHours}
                      onChange={handleSettingsChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="businessHours" className="ml-2 text-sm text-gray-700">
                      Respeitar horário de funcionamento
                    </label>
                  </div>

                  {settingsData.businessHours && (
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Horário de Início"
                        name="startTime"
                        type="time"
                        value={settingsData.startTime}
                        onChange={handleSettingsChange}
                      />

                      <Input
                        label="Horário de Fim"
                        name="endTime"
                        type="time"
                        value={settingsData.endTime}
                        onChange={handleSettingsChange}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSettings(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveSettings} loading={loading}>
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}