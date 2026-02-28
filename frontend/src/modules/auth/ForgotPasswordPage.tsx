import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../../layout/AuthLayout";
import { forgotPassword } from "../../api/auth.api";

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setIsLoading(true);
      await forgotPassword(email);
      setSuccess("If this email exists, a reset link has been sent.");
      setEmail("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive a reset link"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <Input
          id="email"
          type="email"
          label="Email address"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={!!success}
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!!success}>
          Send Reset Link
        </Button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={onBackToLogin}
            className="font-medium text-brand-600 hover:text-brand-500"
          >
            Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}