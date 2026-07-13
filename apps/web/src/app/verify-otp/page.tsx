'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { OtpVerification } from '@/components/auth';
import { useVerifyOtp, useResendOtp } from '@/lib/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  // Get the token from auth store (set during registration)
  const user = useAuthStore((state) => state.user);

  const handleVerify = async (otp: string) => {
    // The token should be stored somewhere during registration
    // For now, we'll use a temporary token approach
    const token = (window as any).__otpToken || '';

    await verifyOtpMutation.mutateAsync({
      code: otp,
      token,
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
