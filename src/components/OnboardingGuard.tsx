import React from 'react'
import { useOnboarding } from '../hooks/useOnboarding'
import { OnboardingFlow } from './Onboarding/OnboardingFlow'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { onboardingStatus, loading } = useOnboarding()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // If onboarding is not completed, show onboarding flow
  if (!onboardingStatus?.onboarding_completed) {
    return <OnboardingFlow />
  }

  // If onboarding is completed, show the main app
  return <>{children}</>
}