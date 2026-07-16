'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react'
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
  const [focusedField, setFocusedField] = useState<string | null>(null)

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
    const baseClasses = 'pl-12 h-12 rounded-xl border-2 transition-all duration-200'
    const focusClasses = focusedField === field
      ? 'border-blue-500 ring-4 ring-blue-100'
      : hasError
      ? 'border-red-500'
      : 'border-gray-200 hover:border-gray-300'
    return `${baseClasses} ${focusClasses}`
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">CrossMart</h1>
                <p className="text-blue-100 text-sm">Myanmar&apos;s Most Trusted Marketplace</p>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              Start your shopping journey today
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join thousands of buyers and sellers across Myanmar and Thailand.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            {[
              { text: 'Access to 10,000+ products', sub: 'From local and international sellers' },
              { text: 'Free shipping on first order', sub: 'No minimum purchase required' },
              { text: 'Secure payment protection', sub: '100% money-back guarantee' },
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{benefit.text}</p>
                  <p className="text-blue-100 text-sm">{benefit.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/20 grid grid-cols-3 gap-8">
            <div>
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-blue-100 text-sm">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5K+</p>
              <p className="text-blue-100 text-sm">Products</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1K+</p>
              <p className="text-blue-100 text-sm">Sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CrossMart</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                  focusedField === 'fullName' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  className={getInputClasses('fullName', !!errors.fullName)}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                  focusedField === 'email' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className={getInputClasses('email', !!errors.email)}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                  focusedField === 'phone' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="flex">
                  <span className="h-12 px-4 text-gray-500 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl flex items-center font-medium">
                    +95
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9XXXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    className={`h-12 rounded-r-xl border-2 transition-all duration-200 ${
                      focusedField === 'phone'
                        ? 'border-blue-500 ring-4 ring-blue-100'
                        : errors.phone
                        ? 'border-red-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.phone}
                </p>
              )}
              <p className="text-xs text-gray-500">Format: 9XXXXXXXXX (10 digits)</p>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                  focusedField === 'password' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`pl-12 pr-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                    focusedField === 'password'
                      ? 'border-blue-500 ring-4 ring-blue-100'
                      : errors.password
                      ? 'border-red-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.password}
                </p>
              )}
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-semibold ${
                      passwordStrength.level === 'weak' ? 'text-red-500' :
                      passwordStrength.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-500 ease-out ${passwordStrength.width}`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                  focusedField === 'confirmPassword' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  className={`pl-12 pr-12 h-12 rounded-xl border-2 transition-all duration-200 ${
                    focusedField === 'confirmPassword'
                      ? 'border-blue-500 ring-4 ring-blue-100'
                      : errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700 font-medium">I want to</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'CLIENT')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'CLIENT'
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-center">
                    <span className="text-3xl">🛒</span>
                    <p className={`font-semibold mt-3 ${
                      formData.role === 'CLIENT' ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      Shop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Buy products from sellers</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'SELLER')}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'SELLER'
                      ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isLoading}
                >
                  <div className="text-center">
                    <span className="text-3xl">🏪</span>
                    <p className={`font-semibold mt-3 ${
                      formData.role === 'SELLER' ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      Sell
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Start your own store</p>
                  </div>
                </button>
              </div>
              {errors.role && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.role}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                  disabled={isLoading}
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors leading-relaxed">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    target="_blank"
                  >
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            {/* Create Account Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]"
              disabled={isLoading || !formData.agreeToTerms}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="h-5 w-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                Terms
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
