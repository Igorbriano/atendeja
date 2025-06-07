import React from 'react'
import { useOnboarding } from '../../hooks/useOnboarding'
import { RestaurantSetup } from './RestaurantSetup'
import { ProductsSetup } from './ProductsSetup'
import { DeliveryZonesSetup } from './DeliveryZonesSetup'
import { OnboardingComplete } from './OnboardingComplete'
import { OnboardingProgress } from './OnboardingProgress'

export const OnboardingFlow: React.FC = () => {
  const { getCurrentStep, getStepProgress } = useOnboarding()
  const currentStep = getCurrentStep()

  const renderStep = () => {
    switch (currentStep) {
      case 'restaurant':
        return <RestaurantSetup />
      case 'products':
        return <ProductsSetup />
      case 'delivery-zones':
        return <DeliveryZonesSetup />
      case 'completed':
        return <OnboardingComplete />
      default:
        return <RestaurantSetup />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <OnboardingProgress 
          currentStep={currentStep} 
          progress={getStepProgress()} 
        />
        {renderStep()}
      </div>
    </div>
  )
}