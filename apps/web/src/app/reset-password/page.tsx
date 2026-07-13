'use client';

import { ResetPassword } from '@/components/auth';

export default function ResetPasswordPage() {
  return (
    <ResetPassword
      onSubmit={async (password: string) => {
        // TODO: Implement reset password API call
        console.log('Resetting password for:', password.length, 'chars');
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }}
    />
  );
}
