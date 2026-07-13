'use client';

import { OtpVerification } from '@/components/auth';

export default function VerifyOtpPage() {
  return (
    <OtpVerification
      phoneNumber="+95 9 ***1234"
      onVerify={async (otp) => {
        // TODO: Implement OTP verification API call
        console.log('Verifying OTP:', otp);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }}
      onResend={async () => {
        // TODO: Implement resend OTP API call
        console.log('Resending OTP');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }}
      onChangePhone={() => {
        // TODO: Navigate to phone number change page
        console.log('Change phone number');
      }}
    />
  );
}
