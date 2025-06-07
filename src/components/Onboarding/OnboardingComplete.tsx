import React from 'react'
import { CheckCircle, Rocket, ArrowRight } from 'lucide-react'
import { Card } from '../UI/Card'
import { Button } from '../UI/Button'
import { useNavigate } from 'react-router-dom'

export const OnboardingComplete: React.FC = () => {
  const navigate = useNavigate()

  const handleGoToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Parabéns! Configuração Concluída
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Seu DeliveryFlow AI está pronto para começar a vender! 
            Agora você pode acessar o dashboard e começar a receber pedidos.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-green-900 mb-3">O que você configurou:</h3>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Dados do restaurante</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Cardápio com produtos</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Taxas de entrega por bairro</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3">Próximos passos:</h3>
            <div className="space-y-2 text-sm text-blue-800 text-left">
              <div className="flex items-start">
                <span className="font-medium mr-2">1.</span>
                <span>Configure suas integrações do WhatsApp e Instagram</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">2.</span>
                <span>Teste sua IA fazendo um pedido de exemplo</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">3.</span>
                <span>Divulgue seus novos canais de atendimento</span>
              </div>
            </div>
          </div>

          <Button onClick={handleGoToDashboard} size="lg" className="w-full sm:w-auto">
            <Rocket className="w-5 h-5 mr-2" />
            <span>Ir para o Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  )
}