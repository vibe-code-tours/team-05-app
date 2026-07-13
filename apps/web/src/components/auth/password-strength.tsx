'use client'

import React from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PasswordStrengthProps {
  password: string
  className?: string
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
]

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = React.useMemo(() => {
    const passed = requirements.filter((req) => req.test(password)).length
    if (passed <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' }
    if (passed === 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' }
    if (passed === 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' }
    return { score: 4, label: 'Strong', color: 'bg-green-500' }
  }, [password])

  const metRequirements = React.useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      met: req.test(password),
    }))
  }, [password])

  if (!password) return null

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={cn(
            "text-sm font-semibold",
            strength.score === 1 && "text-red-600",
            strength.score === 2 && "text-orange-600",
            strength.score === 3 && "text-yellow-600",
            strength.score === 4 && "text-green-600"
          )}>
            {strength.label}
          </span>
        </div>
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-2 flex-1 rounded-full transition-all duration-300",
                level <= strength.score ? strength.color : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        {metRequirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center space-x-2 text-sm",
              req.met ? "text-green-600" : "text-gray-500"
            )}
          >
            {req.met ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <X className="w-4 h-4 text-gray-400" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
