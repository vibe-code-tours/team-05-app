'use client';

import { useState, useRef, useEffect, useCallback, type KeyboardEvent, type ClipboardEvent } from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface OtpVerificationProps {
  phoneNumber?: string;
  onVerify?: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onChangePhone?: () => void;
  className?: string;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export function OtpVerification({
  phoneNumber = '+95 9 ***1234',
  onVerify,
  onResend,
  onChangePhone,
  className,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  }, [otp]);

  const handleKeyDown = useCallback((index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty, go to previous and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveInput(index - 1);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveInput(index + 1);
    }
  }, [otp]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Extract only digits from pasted data
    const digits = pastedData.replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (digits.length === 0) return;

    const newOtp = [...otp];
    digits.split('').forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    // Focus next empty input or last input
    const nextEmptyIndex = newOtp.findIndex((val) => val === '');
    const focusIndex = nextEmptyIndex === -1 ? OTP_LENGTH - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
    setActiveInput(focusIndex);
  }, [otp]);

  const handleVerify = useCallback(async () => {
    const otpString = otp.join('');

    if (otpString.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (onVerify) {
        await onVerify(otpString);
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setActiveInput(0);
    } finally {
      setIsLoading(false);
    }
  }, [otp, onVerify]);

  const handleResend = useCallback(async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(RESEND_COOLDOWN);
    setError(null);
    setOtp(new Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    setActiveInput(0);

    try {
      if (onResend) {
        await onResend();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.');
    }
  }, [canResend, onResend]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSuccess) {
    return (
      <div className={cn('flex min-h-screen items-center justify-center bg-muted/30 px-4', className)}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <CardTitle className="text-2xl">Verification Successful</CardTitle>
            <CardDescription>Your phone number has been verified successfully</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button className="w-full">Continue to Login</Button>
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
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
          <CardDescription className="space-y-1">
            <span className="block">We sent a 6-digit code to</span>
            <span className="block font-medium text-foreground">{phoneNumber}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OTP Input Grid */}
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                onFocus={() => setActiveInput(index)}
                className={cn(
                  'h-14 w-12 text-center text-xl font-semibold',
                  'rounded-lg border-2 bg-background transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  activeInput === index && !digit
                    ? 'border-primary'
                    : digit
                      ? 'border-primary bg-primary/5'
                      : 'border-input',
                  error && 'border-destructive'
                )}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          {/* Resend Section */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-medium text-primary hover:underline"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend code in{' '}
                <span className="font-medium text-foreground">{formatCountdown(countdown)}</span>
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isLoading || otp.some((digit) => !digit)}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>

          {/* Change Phone Number */}
          {onChangePhone ? (
            <button
              type="button"
              onClick={onChangePhone}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Change phone number
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Change phone number
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
