import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { loginUser } from "../../api/auth.api";
import { AuthLayout } from "../../layout/AuthLayout";

interface LoginPageProps {
  onLogin: (
    role: "user" | "admin",
    userId: string,
    isEmailVerified: boolean,
  ) => void;
  onNavigateRegister: () => void;
  onForgotPassword: () => void;
}

export function LoginPage({
  onLogin,
  onNavigateRegister,
  onForgotPassword,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);

      //  REAL backend login
      const res = await loginUser(email, password);

      //  Save JWT
      localStorage.setItem("token", res.token);

      //  Pass role + id + verification status to App.tsx
      onLogin(res.user.role, res.user.id, res.user.isEmailVerified);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue swapping">
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email address"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* ✅ Forgot password link (reduced spacing) */}
        <div className="text-right text-sm -mt-2">
          <button
            type="button"
            onClick={onForgotPassword}
            className="font-medium text-brand-600 hover:text-brand-500"
          >
            Forgot Password
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          Sign in
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-medium text-brand-600 hover:text-brand-500"
          >
            Register now
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
