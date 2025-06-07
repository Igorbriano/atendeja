import React from 'react'
import { AlertTriangle, CreditCard, Clock } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { Card } from './UI/Card'
import { Button } from './UI/Button'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { subscription, loading, isSubscriptionActive, isSubscriptionOverdue, getSubscriptionStatusText } = useSubscription()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // No subscription found
  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assinatura Necessária</h2>
            <p className="text-gray-600 mb-6">
              Para acessar o DeliveryFlow AI, você precisa de uma assinatura ativa.
            </p>
            <Button 
              onClick={() => window.open('https://pay.hotmart.com/your-product-link', '_blank')}
              className="w-full"
            >
              Assinar Agora - R$ 497/mês
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Subscription is overdue
  if (isSubscriptionOverdue()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pagamento em Atraso</h2>
            <p className="text-gray-600 mb-4">
              Sua assinatura está com pagamento em atraso. Para continuar usando o DeliveryFlow AI, 
              regularize sua situação.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Status:</strong> {getSubscriptionStatusText()}
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Plano:</strong> {subscription.plan_name}
              </p>
            </div>
            <Button 
              onClick={() => window.open('https://pay.hotmart.com/your-product-link', '_blank')}
              className="w-full"
            >
              Regularizar Pagamento
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Subscription is cancelled or refunded
  if (subscription.status === 'cancelled' || subscription.status === 'refunded') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="p-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Assinatura Cancelada</h2>
            <p className="text-gray-600 mb-4">
              Sua assinatura foi cancelada. Para continuar usando o DeliveryFlow AI, 
              você precisa assinar novamente.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>Status:</strong> {getSubscriptionStatusText()}
              </p>
              <p className="text-sm text-red-800">
                <strong>Data de cancelamento:</strong> {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('pt-BR') : 'N/A'}
              </p>
            </div>
            <Button 
              onClick={() => window.open('https://pay.hotmart.com/your-product-link', '_blank')}
              className="w-full"
            >
              Assinar Novamente
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Subscription is active - show the app
  if (isSubscriptionActive()) {
    return <>{children}</>
  }

  // Fallback for unknown status
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="p-8">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Status Desconhecido</h2>
          <p className="text-gray-600 mb-6">
            Não foi possível verificar o status da sua assinatura. Entre em contato com o suporte.
          </p>
          <Button variant="outline" className="w-full">
            Contatar Suporte
          </Button>
        </div>
      </Card>
    </div>
  )
}