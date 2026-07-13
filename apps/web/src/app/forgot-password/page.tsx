'use client';

import { ForgotPassword } from '@/components/auth';

export default function ForgotPasswordPage() {
  return (
    <ForgotPassword
      onSubmit={async (email) => {
        // TODO: Implement forgot password API call
        console.log('Sending reset link to:', email);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }}
    />
  );
}
