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
    api.post<{ user: User; requiresVerification: boolean }>("/auth/register", data),

  login: (data: LoginInput) =>
    api.post<AuthResponse>("/auth/login", data),

  verifyOtp: (data: VerifyOtpInput) =>
    api.post<AuthResponse>("/auth/verify-otp", data),

  resendOtp: (email: string) =>
    api.post<{ message: string }>("/auth/resend-otp", { email }),
};

// React Query hooks
export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      // Store the token for OTP verification
      if (response.data.requiresVerification) {
        useAuthStore.setState({ user: response.data.user });
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
      router.push("/");
    },
  });
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
      router.push("/");
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: authApi.resendOtp,
  });
}
