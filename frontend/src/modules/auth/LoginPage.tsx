import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { loginUser } from "../../api/auth.api";

interface LoginPageProps {
  onLogin: (role: "user" | "admin", userId: string, isEmailVerified: boolean) => void;
  onNavigateRegister: () => void;
}

export function LoginPage({ onLogin, onNavigateRegister }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsLoading(true);

      // 🔐 REAL backend login
      const res = await loginUser(email, password);

      // 💾 Save JWT
      localStorage.setItem("token", res.token);

      // ✅ Pass role + id + verification status to App.tsx
      onLogin(res.user.role, res.user.id, res.user.isEmailVerified);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-brand-100">
        <div className="text-center">
          <img src="/logo.png" alt="ReWear" className="mx-auto h-16 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue swapping</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
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
      </div>
    </div>
  );
}
