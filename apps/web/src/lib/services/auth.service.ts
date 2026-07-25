import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

// Types

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface SupabaseAuthInput {
  accessToken: string;
}

export interface RegisterResponse {
  user: User;
  requiresVerification: boolean;
  otpToken?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface VerifyOtpInput {
  code: string;
  token: string;
}

// API calls
export const authApi = {
  register: (data: RegisterInput) =>
    api.post<RegisterResponse>("/auth/register", data),

  login: (data: LoginInput) =>
    api.post<AuthResponse>("/auth/login", data),

  verifyOtp: (data: VerifyOtpInput) =>
    api.post<AuthResponse>("/auth/verify-otp", data),

  resendOtp: (email: string) =>
    api.post<{ message: string; otpToken?: string }>("/auth/resend-otp", { email }),

  supabaseAuth: (data: SupabaseAuthInput) =>
    api.post<AuthResponse>("/auth/supabase", data),
};

// React Query hooks
export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      // Store the OTP token for verification
      if (response.data.requiresVerification && response.data.otpToken) {
        useAuthStore.setState({
          user: response.data.user,
          otpToken: response.data.otpToken,
        });
      }
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      useAuthStore.getState().login(user, accessToken);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      // Redirect based on role
      router.push(getPostLoginPath(user.role));
    },
  });
}

/** Map user role to post-login redirect path. */
function getPostLoginPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "SELLER":
      return "/seller";
    default:
      return "/";
  }
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      useAuthStore.getState().login(user, accessToken);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push(getPostLoginPath(user.role));
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: (response) => {
      // Store the new OTP token if provided
      if (response.data?.otpToken) {
        useAuthStore.setState({ otpToken: response.data.otpToken });
      }
    },
  });
}

export function useSupabaseAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.supabaseAuth,
    onSuccess: (response) => {
      const { user, accessToken } = response.data;
      useAuthStore.getState().login(user, accessToken);
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.push(getPostLoginPath(user.role));
    },
  });
}
