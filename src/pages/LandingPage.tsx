import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Headphones, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  X, 
  Star,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Phone,
  Instagram,
  Printer,
  BarChart3,
  Gift,
  Timer,
  Crown,
  Infinity,
  Bot,
  Mic,
  Image as ImageIcon,
  MessageCircle
} from 'lucide-react'

const testimonials = [
  {
    name: "Carlos Silva",
    business: "Pizzaria do Carlos",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150",
    text: "Nunca mais perdi pedido no WhatsApp. O AtendeJá responde na hora e ainda sugere bebidas. Minhas vendas aumentaram 40%!",
    rating: 5
  },
  {
    name: "Maria Santos",
    business: "Lanchonete da Maria",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    text: "Economizei R$1.200/mês com atendente e ainda vendo mais. O AtendeJá trabalha 24h sem reclamar!",
    rating: 5
  },
  {
    name: "João Oliveira",
    business: "Burger House",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    text: "Agora durmo em paz sabendo que meus clientes estão sendo atendidos. O AtendeJá é melhor que qualquer funcionário!",
    rating: 5
  }
]

const features = [
  {
    icon: Bot,
    title: "IA Treinada para Vender",
    description: "Responde clientes, sugere combos e fecha vendas automaticamente"
  },
  {
    icon: Phone,
    title: "WhatsApp + Instagram",
    description: "Integração completa com as principais plataformas de atendimento"
  },
  {
    icon: Printer,
    title: "Impressão Automática",
    description: "Pedidos impressos direto na cozinha, sem erro humano"
  },
  {
    icon: BarChart3,
    title: "Painel Completo",
    description: "Controle total de pedidos, produtos e relatórios em tempo real"
  },
  {
    icon: Star,
    title: "Avaliações Automáticas",
    description: "Coleta feedback dos clientes e reativa os insatisfeitos"
  },
  {
    icon: TrendingUp,
    title: "Suporte Incluso",
    description: "Atualizações constantes e suporte técnico especializado"
  }
]

// Animação de conversa real
const conversationSteps = [
  {
    type: 'customer',
    message: 'Oi! Vocês estão abertos?',
    delay: 1000
  },
  {
    type: 'ai',
    message: 'Olá! 😊 Sim, estamos abertos até 23h! Temos uma promoção especial hoje: Pizza Grande + Refrigerante por apenas R$ 35! Gostaria de conhecer nosso cardápio?',
    delay: 2000
  },
  {
    type: 'customer',
    message: 'Que legal! Quero uma pizza margherita',
    delay: 1500
  },
  {
    type: 'ai',
    message: 'Ótima escolha! 🍕 Pizza Margherita por R$ 28. Que tal aproveitar nossa promoção e adicionar um refrigerante por apenas R$ 7 a mais? Fica R$ 35 no total!',
    delay: 2500
  },
  {
    type: 'customer',
    message: 'Fechado! Pode ser coca-cola',
    delay: 1000
  },
  {
    type: 'ai',
    message: 'Perfeito! 🥤 Pizza Margherita + Coca-Cola = R$ 35. Preciso do seu nome e endereço para entrega. Qual seu nome?',
    delay: 2000
  },
  {
    type: 'customer',
    message: 'João Silva, Rua das Flores 123',
    delay: 1500
  },
  {
    type: 'ai',
    message: '✅ Pedido confirmado!\n\nJoão Silva\n🍕 Pizza Margherita + Coca-Cola\n💰 Total: R$ 35 + R$ 5 entrega = R$ 40\n📍 Rua das Flores 123\n⏰ Entrega em 30-45min\n\nPedido enviado para a cozinha! 👨‍🍳',
    delay: 3000
  }
]

const plans = [
  {
    id: 'essencial',
    name: 'Essencial',
    price: 197,
    color: 'from-gray-600 to-gray-700',
    icon: CheckCircle,
    popular: false,
    features: [
      'Atendimento ativo via WhatsApp (Evolution API)',
      'Identificação de texto, áudio e imagem recebidos',
      'Impressão automática de pedidos (ESC/POS)',
      'Acesso ao painel de gestão (produtos, pedidos, promoções)',
      'Suporte básico via e-mail'
    ],
    limitations: [
      'Sem limites de mensagens ou atendimentos',
      'Funcionalidades básicas de IA'
    ],
    hotmartUrl: 'https://pay.hotmart.com/essencial-plan'
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: 497,
    color: 'from-primary-600 to-primary-700',
    icon: Crown,
    popular: true,
    features: [
      'Até 400 atendimentos com IA/mês',
      'Até 300 mensagens via WhatsApp/mês',
      'Até 50 imagens no cardápio digital',
      'IA com resposta ativa em texto, áudio e imagem',
      'Impressão automática de pedidos',
      'Avaliação pós-venda + reativação automática de clientes inativos',
      'Dashboard com métricas de venda, pedidos, clientes e conversão',
      'Suporte prioritário via WhatsApp e e-mail'
    ],
    limitations: [
      'Limites mensais de uso',
      'Sem Instagram Direct Messages'
    ],
    hotmartUrl: 'https://pay.hotmart.com/profissional-plan'
  },
  {
    id: 'ilimitado',
    name: 'Ilimitado',
    price: 997,
    color: 'from-secondary-500 to-secondary-600',
    icon: Infinity,
    popular: false,
    features: [
      'Atendimentos com IA ilimitados',
      'Mensagens via WhatsApp ilimitadas',
      'Imagens ilimitadas no cardápio digital',
      'Atendimento completo ao Instagram Direct Messages',
      'IA com compreensão e resposta multimodal (texto, imagem, áudio)',
      'Atendimento 24h com IA humanizada',
      'Automação de promoções, avaliações, funis e reativação de clientes',
      'Suporte dedicado via WhatsApp da equipe',
      'Acesso prioritário a novos recursos e integrações futuras'
    ],
    limitations: [],
    hotmartUrl: 'https://pay.hotmart.com/ilimitado-plan'
  }
]

export const LandingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [conversationMessages, setConversationMessages] = useState<any[]>([])
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (!isAnimating) return

    const timer = setTimeout(() => {
      if (currentStep < conversationSteps.length) {
        setConversationMessages(prev => [...prev, conversationSteps[currentStep]])
        setCurrentStep(prev => prev + 1)
      } else {
        // Reset animation after completion
        setTimeout(() => {
          setCurrentStep(0)
          setConversationMessages([])
        }, 3000)
      }
    }, conversationSteps[currentStep]?.delay || 1000)

    return () => clearTimeout(timer)
  }, [currentStep, isAnimating])

  const handlePlanClick = (plan: any) => {
    window.open(plan.hotmartUrl, '_blank')
  }

  const handleFreeTrialClick = () => {
    window.open('https://pay.hotmart.com/free-trial', '_blank')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AtendeJá</h1>
                <p className="text-xs text-gray-500">Atendente IA</p>
              </div>
            </div>
            <Link 
              to="/login"
              className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Seu delivery está{' '}
                  <span className="text-primary-600">perdendo vendas</span>{' '}
                  todos os dias.
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
                  O único atendente que nunca atrasa, nunca falta e ainda{' '}
                  <span className="font-bold text-primary-600">vende enquanto você dorme</span>.
                </p>
                <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4">
                  <p className="text-secondary-800 font-medium text-center">
                    "O único atendente que nunca atrasa, nunca falta e ainda vende enquanto você dorme."
                  </p>
                </div>
              </div>
              
              {/* Oferta Especial de Teste */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Gift className="w-8 h-8" />
                  <span className="text-2xl font-bold">TESTE GRÁTIS</span>
                </div>
                <p className="text-lg mb-4">
                  <span className="font-bold">7 DIAS GRÁTIS</span> - Veja sua IA vendendo antes de pagar!
                </p>
                <div className="flex items-center space-x-2 text-sm">
                  <Timer className="w-4 h-4" />
                  <span>Sem cartão de crédito • Sem compromisso • Acesso completo</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* CTA Principal - Teste Grátis */}
                <button
                  onClick={handleFreeTrialClick}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl text-xl font-bold hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 shadow-xl flex items-center justify-center space-x-2"
                >
                  <Gift className="w-6 h-6" />
                  <span>Começar Teste Grátis de 7 Dias</span>
                </button>
                
                <p className="text-sm text-gray-600 text-center sm:text-left">
                  ✅ Sem taxa de setup • ✅ Cancele quando quiser • ✅ Suporte incluso
                </p>
              </div>
            </div>

            {/* Animação de Conversa Real */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border-b border-gray-200 pb-4">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">IA AtendeJá</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                        <p className="text-sm text-primary-600">Online agora</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 h-96 overflow-y-auto">
                    {conversationMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.type === 'customer' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.type === 'customer'
                              ? 'bg-gray-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                    
                    {currentStep < conversationSteps.length && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg px-4 py-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <CheckCircle className="w-4 h-4 text-primary-500" />
                      <span>Conversa real entre cliente e IA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicadores de Capacidades */}
              <div className="absolute -right-4 top-1/4 space-y-2">
                <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium">Texto</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium">Áudio</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium">Imagem</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planos Comerciais */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Escolha o Plano Ideal para seu Restaurante
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Todos os planos incluem IA treinada para vendas, integração WhatsApp e suporte técnico
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:scale-105 ${
                    plan.popular ? 'border-primary-500 ring-4 ring-primary-100' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                        MAIS POPULAR
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                        <span className="text-gray-600">/mês</span>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <CheckCircle className="w-5 h-5 text-primary-500 mr-2" />
                        Incluído:
                      </h4>
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}

                      {plan.limitations.length > 0 && (
                        <>
                          <h4 className="font-semibold text-gray-900 flex items-center mt-6">
                            <X className="w-5 h-5 text-red-500 mr-2" />
                            Limitações:
                          </h4>
                          {plan.limitations.map((limitation, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600">{limitation}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePlanClick(plan)}
                      className={`w-full bg-gradient-to-r ${plan.color} text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                    >
                      Escolher {plan.name}
                    </button>

                    {plan.popular && (
                      <p className="text-center text-sm text-gray-600 mt-3">
                        ⭐ Recomendado para a maioria dos restaurantes
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h3 className="font-bold text-primary-900 mb-2">🎯 Não sabe qual escolher?</h3>
              <p className="text-primary-700 mb-4">
                Comece com o <strong>Teste Grátis de 7 dias</strong> e experimente todas as funcionalidades!
              </p>
              <button
                onClick={handleFreeTrialClick}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Começar Teste Grátis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Capacidades da IA */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              IA Completa para Atendimento
            </h2>
            <p className="text-xl text-gray-600">
              Sua IA entende e responde em múltiplos formatos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Mensagens de Texto</h3>
              <p className="text-gray-700">
                Entende e responde mensagens de texto com inteligência natural, 
                oferecendo produtos e fechando vendas automaticamente.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Áudios</h3>
              <p className="text-gray-700">
                Converte áudios dos clientes em texto usando Whisper AI e 
                pode responder com áudios gerados por inteligência artificial.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Imagens</h3>
              <p className="text-gray-700">
                Recebe e processa imagens dos clientes, respondendo adequadamente 
                e enviando fotos dos produtos quando necessário.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Vendas Inteligentes</h3>
              <p className="text-gray-700">
                Age como vendedora experiente, sugerindo upsells, combos e 
                aplicando promoções automaticamente para maximizar vendas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Coleta Completa</h3>
              <p className="text-gray-700">
                Coleta nome, telefone, endereço completo e confirma todos os 
                detalhes antes de finalizar o pedido.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impressão Automática</h3>
              <p className="text-gray-700">
                Envia pedidos confirmados diretamente para a impressora da 
                cozinha, eliminando erros humanos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como o AtendeJá Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em 4 passos simples, sua IA está vendendo 24h por dia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: MessageCircle,
                title: "IA Responde Cliente",
                description: "Cliente manda mensagem no WhatsApp, IA responde na hora com cardápio e promoções"
              },
              {
                step: "2",
                icon: TrendingUp,
                title: "Sugere Upsells",
                description: "IA oferece combos, bebidas e sobremesas para aumentar o ticket médio"
              },
              {
                step: "3",
                icon: Printer,
                title: "Imprime Pedido",
                description: "Pedido confirmado é enviado direto para impressora da cozinha"
              },
              {
                step: "4",
                icon: Star,
                title: "Coleta Avaliação",
                description: "Após entrega, IA pede avaliação e reativa clientes insatisfeitos"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova Social */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 500 restaurantes já automatizaram suas vendas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.business}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-secondary-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Comece Hoje Mesmo
              </h2>
              <p className="text-xl text-gray-300">
                Teste grátis por 7 dias e veja sua IA vendendo mais que qualquer funcionário
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-8 h-8" />
                  <span className="text-2xl font-bold">TESTE GRÁTIS POR 7 DIAS</span>
                </div>
                
                <div className="space-y-4">
                  <p className="text-2xl font-bold">
                    Veja funcionando antes de pagar qualquer coisa
                  </p>
                  <p className="text-lg">
                    Depois: A partir de R$197/mês • Cancele quando quiser
                  </p>
                </div>

                <button
                  onClick={handleFreeTrialClick}
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl flex items-center justify-center space-x-2 mx-auto"
                >
                  <Timer className="w-6 h-6" />
                  <span>Começar Teste Grátis Agora</span>
                </button>

                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Setup em 24h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Suporte incluso</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Sem compromisso</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 text-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Clock className="w-6 h-6" />
                <span className="font-bold text-lg">OFERTA LIMITADA</span>
              </div>
              <p className="font-medium">
                Apenas os primeiros 100 restaurantes terão acesso ao teste grátis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AtendeJá</h3>
                  <p className="text-sm text-gray-400">Atendente IA</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                O único atendente que nunca atrasa, nunca falta e ainda vende enquanto você dorme.
              </p>
              <p className="text-sm text-secondary-400 font-medium">
                "O único atendente que nunca atrasa, nunca falta e ainda vende enquanto você dorme."
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <div className="space-y-2 text-gray-400">
                <p>WhatsApp: (11) 99999-9999</p>
                <p>Email: suporte@atendeja.com</p>
                <p>Horário: 24h por dia</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <div className="space-y-2 text-gray-400">
                <p>Termos de Uso</p>
                <p>Política de Privacidade</p>
                <p>CNPJ: 00.000.000/0001-00</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AtendeJá. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}