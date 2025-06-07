import React, { useState } from 'react'
import { Search, Book, Video, ExternalLink, ChevronRight, ChevronDown, MessageCircle, Settings, Package, Gift, MapPin, BarChart3, Smartphone, QrCode, CreditCard, Users, Zap, FileText, Download, Play } from 'lucide-react'
import { Card } from '../components/UI/Card'
import { Input } from '../components/UI/Input'

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'Básico' | 'Intermediário' | 'Avançado'
  duration: string
  steps: Array<{
    title: string
    description: string
    image?: string
    tips?: string[]
    links?: Array<{ text: string; url: string }>
  }>
}

const tutorials: Tutorial[] = [
  {
    id: 'onboarding',
    title: 'Primeiros Passos - Configuração Inicial',
    description: 'Configure sua conta e restaurante em 5 minutos',
    category: 'Configuração',
    difficulty: 'Básico',
    duration: '5 min',
    steps: [
      {
        title: 'Criar Conta e Fazer Login',
        description: 'Acesse deliveryflow.ai e crie sua conta com email e senha',
        tips: [
          'Use um email que você acessa frequentemente',
          'Escolha uma senha forte com pelo menos 8 caracteres',
          'Confirme seu email clicando no link enviado'
        ]
      },
      {
        title: 'Configurar Dados do Restaurante',
        description: 'Preencha as informações básicas do seu negócio',
        tips: [
          'Nome completo do restaurante',
          'Telefone principal para contato',
          'Endereço completo com CEP',
          'Descrição atrativa do seu negócio'
        ]
      },
      {
        title: 'Adicionar Produtos ao Cardápio',
        description: 'Monte seu cardápio digital com produtos e preços',
        tips: [
          'Adicione pelo menos 5 produtos para começar',
          'Use fotos atrativas dos pratos',
          'Descrições claras e apetitosas',
          'Preços sempre atualizados'
        ]
      },
      {
        title: 'Configurar Taxas de Entrega',
        description: 'Defina taxas e tempos por bairro',
        tips: [
          'Liste todos os bairros que você atende',
          'Defina taxas justas e competitivas',
          'Tempos realistas de entrega',
          'Mantenha sempre atualizado'
        ]
      }
    ]
  },
  {
    id: 'whatsapp-setup',
    title: 'Conectar WhatsApp Business',
    description: 'Integre sua IA com WhatsApp em 3 passos',
    category: 'Integração',
    difficulty: 'Básico',
    duration: '10 min',
    steps: [
      {
        title: 'Acessar Aba WhatsApp',
        description: 'No painel, clique em "WhatsApp" no menu lateral',
        tips: [
          'Certifique-se de ter completado o onboarding',
          'Tenha seu celular com WhatsApp em mãos'
        ]
      },
      {
        title: 'Gerar QR Code',
        description: 'Clique em "Conectar WhatsApp" para gerar o QR Code',
        tips: [
          'O QR Code expira em 60 segundos',
          'Mantenha a página aberta durante o processo'
        ]
      },
      {
        title: 'Escanear com WhatsApp',
        description: 'Use seu WhatsApp para escanear o código',
        tips: [
          'Abra WhatsApp > Menu (⋮) > Dispositivos conectados',
          'Toque em "Conectar um dispositivo"',
          'Escaneie o QR Code da tela',
          'Mantenha o celular conectado à internet'
        ]
      },
      {
        title: 'Testar Conexão',
        description: 'Envie uma mensagem teste para verificar se funciona',
        tips: [
          'Use outro número para testar',
          'Envie "Olá" para seu WhatsApp Business',
          'A IA deve responder automaticamente'
        ]
      }
    ]
  },
  {
    id: 'ai-training',
    title: 'Treinar sua IA Vendedora',
    description: 'Configure sua IA para vender mais e melhor',
    category: 'IA e Automação',
    difficulty: 'Intermediário',
    duration: '15 min',
    steps: [
      {
        title: 'Configurar Promoções',
        description: 'Crie ofertas que a IA pode usar para converter clientes',
        tips: [
          'Promoções de reativação para clientes inativos',
          'Combos e upsells automáticos',
          'Descontos por categoria',
          'Ofertas especiais por horário'
        ]
      },
      {
        title: 'Testar Conversas',
        description: 'Simule conversas para treinar a IA',
        tips: [
          'Use diferentes tipos de pedidos',
          'Teste objeções comuns',
          'Verifique se coleta dados corretamente',
          'Confirme se calcula entregas'
        ]
      },
      {
        title: 'Ajustar Respostas',
        description: 'Refine o comportamento da IA baseado nos testes',
        tips: [
          'IA deve ser amigável mas focada em vendas',
          'Sempre sugerir bebidas e sobremesas',
          'Confirmar endereço e dados do cliente',
          'Calcular taxa de entrega automaticamente'
        ]
      }
    ]
  },
  {
    id: 'marketing-pixels',
    title: 'Configurar Pixels de Marketing',
    description: 'Rastreie suas vendas no Facebook, Google e TikTok',
    category: 'Marketing',
    difficulty: 'Avançado',
    duration: '20 min',
    steps: [
      {
        title: 'Acessar Facebook Business Manager',
        description: 'Configure seu pixel do Facebook para rastrear vendas',
        tips: [
          'Acesse business.facebook.com',
          'Vá em Gerenciador de Eventos > Fontes de Dados',
          'Copie o ID do seu pixel',
          'Cole na aba Marketing do DeliveryFlow'
        ],
        links: [
          { text: 'Facebook Business Manager', url: 'https://business.facebook.com' },
          { text: 'Guia Oficial do Pixel', url: 'https://developers.facebook.com/docs/facebook-pixel' }
        ]
      },
      {
        title: 'Configurar Google Analytics 4',
        description: 'Rastreie conversões no Google Analytics',
        tips: [
          'Acesse analytics.google.com',
          'Vá em Administrador > Informações da propriedade',
          'Copie o ID de acompanhamento (G-XXXXXXXXXX)',
          'Cole na aba Marketing do DeliveryFlow'
        ],
        links: [
          { text: 'Google Analytics', url: 'https://analytics.google.com' },
          { text: 'Configurar GA4', url: 'https://support.google.com/analytics/answer/9304153' }
        ]
      },
      {
        title: 'Testar Conversões',
        description: 'Faça um pedido teste para verificar se está rastreando',
        tips: [
          'Use o botão "Testar Pixel" na aba Marketing',
          'Verifique se aparece no Facebook Events Manager',
          'Confirme no Google Analytics em tempo real',
          'Monitore a aba "Conversões Recentes"'
        ]
      }
    ]
  },
  {
    id: 'order-management',
    title: 'Gerenciar Pedidos e Impressão',
    description: 'Organize pedidos e configure impressão automática',
    category: 'Operação',
    difficulty: 'Básico',
    duration: '8 min',
    steps: [
      {
        title: 'Acompanhar Pedidos em Tempo Real',
        description: 'Use a aba Pedidos para gerenciar todos os pedidos',
        tips: [
          'Pedidos aparecem automaticamente quando confirmados',
          'Use filtros para organizar por status',
          'Clique em "Ver Detalhes" para informações completas'
        ]
      },
      {
        title: 'Atualizar Status dos Pedidos',
        description: 'Mude o status conforme o pedido avança',
        tips: [
          'Pendente → Preparando → Entregue',
          'Status "Entregue" dispara pixels de conversão',
          'Cliente recebe notificação automática'
        ]
      },
      {
        title: 'Configurar Impressora (Opcional)',
        description: 'Configure impressão automática na cozinha',
        tips: [
          'Use impressora térmica ESC/POS',
          'Configure via Evolution API',
          'Teste com pedido exemplo',
          'Ajuste layout do cupom'
        ]
      }
    ]
  },
  {
    id: 'promotions-setup',
    title: 'Criar Promoções Inteligentes',
    description: 'Configure ofertas que a IA usa para reativar clientes',
    category: 'Vendas',
    difficulty: 'Intermediário',
    duration: '12 min',
    steps: [
      {
        title: 'Promoções de Reativação',
        description: 'Crie ofertas para clientes que não pedem há dias',
        tips: [
          'Reativação 7 dias: 15% de desconto',
          'Reativação 15 dias: 20% de desconto',
          'Reativação 30 dias: 25% de desconto',
          'IA oferece automaticamente'
        ]
      },
      {
        title: 'Promoções Gerais',
        description: 'Ofertas para todos os clientes',
        tips: [
          'Combos especiais',
          'Desconto por categoria',
          'Promoções por horário',
          'Ofertas de fim de semana'
        ]
      },
      {
        title: 'Monitorar Performance',
        description: 'Acompanhe quais promoções convertem mais',
        tips: [
          'Use o dashboard para ver métricas',
          'Ajuste descontos baseado em resultados',
          'Teste diferentes ofertas',
          'Mantenha promoções atualizadas'
        ]
      }
    ]
  }
]

const quickLinks = [
  {
    title: 'Evolution API - Documentação',
    description: 'Documentação oficial da Evolution API para WhatsApp',
    url: 'https://doc.evolution-api.com',
    icon: MessageCircle
  },
  {
    title: 'Groq AI - Console',
    description: 'Console da Groq para gerenciar sua API de IA',
    url: 'https://console.groq.com',
    icon: Zap
  },
  {
    title: 'Facebook Business Manager',
    description: 'Gerencie seus pixels e campanhas do Facebook',
    url: 'https://business.facebook.com',
    icon: BarChart3
  },
  {
    title: 'Google Analytics',
    description: 'Acompanhe suas métricas no Google Analytics',
    url: 'https://analytics.google.com',
    icon: BarChart3
  },
  {
    title: 'Hotmart - Área do Produtor',
    description: 'Gerencie sua conta e vendas na Hotmart',
    url: 'https://app.hotmart.com',
    icon: CreditCard
  },
  {
    title: 'Suporte WhatsApp',
    description: 'Entre em contato direto com nossa equipe',
    url: 'https://wa.me/5511999999999',
    icon: Users
  }
]

const categories = [
  { id: 'all', name: 'Todos', icon: Book },
  { id: 'Configuração', name: 'Configuração', icon: Settings },
  { id: 'Integração', name: 'Integração', icon: Smartphone },
  { id: 'IA e Automação', name: 'IA e Automação', icon: Zap },
  { id: 'Marketing', name: 'Marketing', icon: BarChart3 },
  { id: 'Operação', name: 'Operação', icon: Package },
  { id: 'Vendas', name: 'Vendas', icon: Gift }
]

export const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Básico':
        return 'bg-green-100 text-green-800'
      case 'Intermediário':
        return 'bg-yellow-100 text-yellow-800'
      case 'Avançado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (selectedTutorial) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedTutorial(null)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Voltar para Central de Ajuda
            </button>
          </div>
        </div>

        <Card>
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedTutorial.difficulty)}`}>
                  {selectedTutorial.difficulty}
                </span>
                <span className="text-sm text-gray-600">⏱️ {selectedTutorial.duration}</span>
                <span className="text-sm text-gray-600">📂 {selectedTutorial.category}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedTutorial.title}</h1>
              <p className="text-lg text-gray-600">{selectedTutorial.description}</p>
            </div>

            <div className="space-y-6">
              {selectedTutorial.steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    {expandedStep === index ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedStep === index && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      {step.image && (
                        <div className="mb-4">
                          <img
                            src={step.image}
                            alt={step.title}
                            className="w-full max-w-2xl rounded-lg border border-gray-200"
                          />
                        </div>
                      )}

                      {step.tips && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">💡 Dicas importantes:</h4>
                          <ul className="space-y-2">
                            {step.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start space-x-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span className="text-gray-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.links && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">🔗 Links úteis:</h4>
                          <div className="space-y-2">
                            {step.links.map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700"
                              >
                                <ExternalLink className="w-4 h-4" />
                                <span>{link.text}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Central de Ajuda</h1>
          <p className="text-gray-600 mt-1">Tutoriais completos para dominar o DeliveryFlow AI</p>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar tutoriais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
          />
        </div>
      </Card>

      {/* Categorias */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          )
        })}
      </div>

      {/* Tutoriais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTutorials.map((tutorial) => (
          <Card key={tutorial.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <div onClick={() => setSelectedTutorial(tutorial)} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                  {tutorial.difficulty}
                </span>
                <span className="text-sm text-gray-500">⏱️ {tutorial.duration}</span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{tutorial.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {tutorial.category}
                </span>
                <span className="text-green-600 font-medium text-sm">
                  {tutorial.steps.length} passos →
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Links Rápidos */}
      <Card title="🔗 Links Úteis" subtitle="Acesso rápido a ferramentas importantes">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{link.title}</h4>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            )
          })}
        </div>
      </Card>

      {/* Suporte Direto */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-900 mb-2">Precisa de Ajuda Personalizada?</h3>
          <p className="text-green-700 mb-4">
            Nossa equipe está pronta para ajudar você a configurar e otimizar seu DeliveryFlow AI
          </p>
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Falar com Suporte</span>
          </a>
        </div>
      </Card>
    </div>
  )
}