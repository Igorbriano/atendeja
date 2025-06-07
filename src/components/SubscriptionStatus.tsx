import React from 'react'
import { CreditCard, Calendar, DollarSign, Zap, MessageCircle, Image, BarChart3 } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { Card } from './UI/Card'

export const SubscriptionStatus: React.FC = () => {
  const { 
    subscription, 
    usage,
    loading, 
    getSubscriptionStatusColor, 
    getSubscriptionStatusText,
    getPlanDisplayName,
    getUsagePercentage
  } = useSubscription()

  if (loading || !subscription) {
    return null
  }

  const isUnlimited = subscription.plan_type === 'ilimitado'

  return (
    <div className="space-y-6">
      {/* Status Principal */}
      <Card title="Status da Assinatura" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor()}`}>
                {getSubscriptionStatusText()}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Plano</p>
              <p className="font-medium text-gray-900">{getPlanDisplayName()}</p>
              <p className="text-sm text-gray-500">
                {subscription.currency} {subscription.amount.toFixed(2)}/mês
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Início</p>
              <p className="font-medium text-gray-900">
                {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Uso Mensal */}
      <Card title="Uso Mensal" subtitle={`Período: ${usage?.current_month || 'N/A'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* IA Interactions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-900">Atendimentos IA</span>
              </div>
              {isUnlimited ? (
                <span className="text-sm font-medium text-primary-600">Ilimitado</span>
              ) : (
                <span className="text-sm text-gray-600">
                  {usage?.ai_interactions_used || 0} / {subscription.monthly_ai_limit}
                </span>
              )}
            </div>
            {!isUnlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(getUsagePercentage('ai'), 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">Mensagens</span>
              </div>
              {isUnlimited ? (
                <span className="text-sm font-medium text-primary-600">Ilimitado</span>
              ) : (
                <span className="text-sm text-gray-600">
                  {usage?.messages_sent || 0} / {subscription.monthly_messages_limit}
                </span>
              )}
            </div>
            {!isUnlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(getUsagePercentage('messages'), 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-primary-500" />
                <span className="font-medium text-gray-900">Imagens</span>
              </div>
              {isUnlimited ? (
                <span className="text-sm font-medium text-primary-600">Ilimitado</span>
              ) : (
                <span className="text-sm text-gray-600">
                  {usage?.images_uploaded || 0} / {subscription.monthly_images_limit}
                </span>
              )}
            </div>
            {!isUnlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(getUsagePercentage('images'), 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Limite */}
        {!isUnlimited && (
          <div className="mt-6 space-y-2">
            {getUsagePercentage('ai') > 80 && (
              <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-2 rounded-lg text-sm">
                ⚠️ Você está próximo do limite de atendimentos IA ({Math.round(getUsagePercentage('ai'))}% usado)
              </div>
            )}
            {getUsagePercentage('messages') > 80 && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm">
                ⚠️ Você está próximo do limite de mensagens ({Math.round(getUsagePercentage('messages'))}% usado)
              </div>
            )}
            {getUsagePercentage('images') > 80 && (
              <div className="bg-primary-50 border border-primary-200 text-primary-800 px-4 py-2 rounded-lg text-sm">
                ⚠️ Você está próximo do limite de imagens ({Math.round(getUsagePercentage('images'))}% usado)
              </div>
            )}
          </div>
        )}

        {/* Upgrade CTA */}
        {subscription.plan_type !== 'ilimitado' && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-purple-900">Precisa de mais?</h4>
                <p className="text-sm text-purple-700">
                  Faça upgrade para o Plano Ilimitado e tenha acesso sem limites!
                </p>
              </div>
              <button 
                onClick={() => window.open('https://pay.hotmart.com/ilimitado-plan', '_blank')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Fazer Upgrade
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}