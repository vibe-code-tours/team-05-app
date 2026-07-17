'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegister } from '@/lib/services/auth.service'

interface RegisterForm {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'CLIENT' | 'SELLER'
  agreeToTerms: boolean
}

interface ValidationErrors {
  fullName?: string
  email?: string
  phone?: string
  password?: string
  confirmPassword?: string
  role?: string
  agreeToTerms?: string
}

type PasswordStrength = {
  level: 'weak' | 'medium' | 'strong'
  color: string
  width: string
  text: string
}

export default function RegisterPage() {
  const router = useRouter()
  const registerMutation = useRegister()
  const isLoading = registerMutation.isPending
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterForm>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CLIENT',
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^9\d{9}$/
    return phoneRegex.test(phone)
  }

  const getPasswordStrength = (password: string): PasswordStrength => {
    let strength = 0

    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++

    if (strength <= 2) {
      return { level: 'weak', color: 'bg-red-500', width: 'w-1/3', text: 'Weak' }
    } else if (strength <= 3) {
      return { level: 'medium', color: 'bg-yellow-500', width: 'w-2/3', text: 'Medium' }
    } else {
      return { level: 'strong', color: 'bg-green-500', width: 'w-full', text: 'Strong' }
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (9XXXXXXXXX)'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (passwordStrength.level === 'weak') {
      newErrors.password = 'Password is too weak. Add uppercase, numbers, or symbols'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await registerMutation.mutateAsync({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
    } catch (error: unknown) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Email or phone already in use'
      setErrors({ email: errorMessage })
    }
  }

  const handleInputChange = (field: keyof RegisterForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const getInputClasses = (field: string, hasError: boolean = false) => {
    const base = 'h-11 rounded-xl border transition-all'
    const focus = 'focus-visible:ring-4 focus-visible:border-rose-500 focus-visible:ring-rose-100'
    const error = hasError ? 'border-red-300' : 'border-gray-200'
    return `${base} ${focus} ${error}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">CrossMart</span>
          </Link>
          <span className="text-sm font-medium text-gray-500">Create Account</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center pt-12 pb-12 px-6">
        <div className="w-full max-w-md">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-gray-500">
              Join CrossMart to buy or sell products
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`pl-10 ${getInputClasses('fullName', !!errors.fullName)}`}
                  disabled={isLoading}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" role="alert" className="text-xs text-red-500">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 ${getInputClasses('email', !!errors.email)}`}
                  disabled={isLoading}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </Label>
              <div className="flex">
                <span className="h-11 px-3 text-sm text-gray-500 bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl flex items-center font-medium">
                  +95
                </span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9XXXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={`rounded-l-none ${getInputClasses('phone', !!errors.phone)}`}
                  disabled={isLoading}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'phone-error' : undefined}
                />
              </div>
              {errors.phone && (
                <p id="phone-error" role="alert" className="text-xs text-red-500">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 ${getInputClasses('password', !!errors.password)}`}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-red-500">
                  {errors.password}
                </p>
              )}
              {/* Password Strength */}
              {formData.password && (
                <div className="pt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 'weak' ? 'text-red-500' :
                      passwordStrength.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} transition-all duration-300 ${passwordStrength.width}`} />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`pl-10 pr-10 ${getInputClasses('confirmPassword', !!errors.confirmPassword)}`}
                  disabled={isLoading}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" role="alert" className="text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'CLIENT')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'CLIENT'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-center">
                    <span className="text-2xl">🛒</span>
                    <p className={`text-sm font-semibold mt-2 ${
                      formData.role === 'CLIENT' ? 'text-rose-600' : 'text-gray-700'
                    }`}>
                      Shop
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Buy products</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'SELLER')}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'SELLER'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-center">
                    <span className="text-2xl">🏪</span>
                    <p className={`text-sm font-semibold mt-2 ${
                      formData.role === 'SELLER' ? 'text-rose-600' : 'text-gray-700'
                    }`}>
                      Sell
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Start your store</p>
                  </div>
                </button>
              </div>
              {errors.role && (
                <p id="role-error" role="alert" className="text-xs text-red-500">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="space-y-1.5">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-rose-600 hover:text-rose-700 font-medium" target="_blank">
                    Terms
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-rose-600 hover:text-rose-700 font-medium" target="_blank">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p id="agreeToTerms-error" role="alert" className="text-xs text-red-500">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-rose-200 active:scale-[0.98]"
              disabled={isLoading || !formData.agreeToTerms}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-rose-600 hover:text-rose-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="hover:text-gray-600 transition-colors">
                Terms
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="hover:text-gray-600 transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
