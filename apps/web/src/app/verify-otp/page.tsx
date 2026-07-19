'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { OtpVerification } from '@/components/auth';
import { useVerifyOtp, useResendOtp } from '@/lib/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();
  const otpToken = useAuthStore((state) => state.otpToken);

  const handleVerify = async (otp: string) => {
    if (!otpToken) {
      throw new Error('OTP token not found. Please register again.');
    }

    await verifyOtpMutation.mutateAsync({
      code: otp,
      token: otpToken,
    });
  };

  const handleResend = async () => {
    await resendOtpMutation.mutateAsync(email);
  };

  return (
    <OtpVerification
      phoneNumber={email || '+95 9 ***1234'}
      onVerify={handleVerify}
      onResend={handleResend}
      onChangePhone={() => {
        router.push('/register');
      }}
    />
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
