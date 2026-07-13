'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Check, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ResetPasswordProps {
  onSubmit?: (password: string) => Promise<void>;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export function ResetPassword({ onSubmit, className }: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});

  const getPasswordRequirements = (pwd: string): PasswordRequirement[] => [
    { label: 'At least 8 characters', met: pwd.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(pwd) },
    { label: 'One lowercase letter', met: /[a-z]/.test(pwd) },
    { label: 'One number', met: /[0-9]/.test(pwd) },
  ];

  const requirements = getPasswordRequirements(password);
  const allRequirementsMet = requirements.every((req) => req.met);

  const validateForm = () => {
    const newErrors: { password?: string; confirm?: string } = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!allRequirementsMet) {
      newErrors.password = 'Please meet all password requirements';
    }

    if (!confirmPassword) {
      newErrors.confirm = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(password);
      }
      setIsSuccess(true);
    } catch (err) {
      setErrors({
        password: err instanceof Error ? err.message : 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn('flex min-h-screen items-center justify-center bg-muted/30 px-4', className)}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
            <CardDescription>
              Your password has been reset successfully. You can now login with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="w-full">
              <Button className="w-full">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex min-h-screen items-center justify-center bg-muted/30 px-4', className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {/* Logo */}
          <div className="mx-auto mb-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">Cross</span>
              <span className="text-2xl font-bold text-foreground">Mart</span>
            </Link>
          </div>

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Create a new password for your account. Make sure it&apos;s strong and secure.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(
                    'pr-10',
                    errors.password && 'border-destructive focus-visible:ring-destructive'
                  )}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
                <ul className="space-y-1">
                  {requirements.map((req, index) => (
                    <li
                      key={index}
                      className={cn(
                        'flex items-center gap-2 text-xs',
                        req.met ? 'text-success' : 'text-muted-foreground'
                      )}
                    >
                      <Check
                        className={cn(
                          'h-3 w-3',
                          req.met ? 'text-success' : 'text-muted-foreground/50'
                        )}
                      />
                      {req.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  disabled={isLoading}
                  className={cn(
                    'pr-10',
                    errors.confirm && 'border-destructive focus-visible:ring-destructive'
                  )}
                  aria-invalid={!!errors.confirm}
                  aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirm && (
                <p id="confirm-error" className="text-sm text-destructive">
                  {errors.confirm}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {/* Reset Button */}
            <Button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>

            {/* Back to Login */}
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
