import React from 'react'
import { CheckCircle, Circle, Store, Package, MapPin } from 'lucide-react'

interface OnboardingProgressProps {
  currentStep: string
  progress: number
}

const steps = [
  {
    id: 'restaurant',
    title: 'Dados do Restaurante',
    icon: Store,
    description: 'Informações básicas do seu negócio'
  },
  {
    id: 'products',
    title: 'Cardápio',
    icon: Package,
    description: 'Adicione seus produtos e preços'
  },
  {
    id: 'delivery-zones',
    title: 'Taxas de Entrega',
    icon: MapPin,
    description: 'Configure as taxas por bairro'
  }
]

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  progress 
}) => {
  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configure seu DeliveryFlow AI
        </h1>
        <p className="text-gray-600">
          Vamos configurar sua conta em 3 passos simples
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id)
          const Icon = step.icon
          
          return (
            <div
              key={step.id}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : status === 'current'
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-20'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status === 'completed'
                    ? 'bg-green-500'
                    : status === 'current'
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    status === 'completed'
                      ? 'text-green-700'
                      : status === 'current'
                      ? 'text-blue-700'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                </div>
              </div>
              <p className={`text-sm ${
                status === 'completed'
                  ? 'text-green-600'
                  : status === 'current'
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {step.description}
              </p>
              
              {/* Step number */}
              <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                status === 'completed'
                  ? 'bg-green-500 text-white'
                  : status === 'current'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}