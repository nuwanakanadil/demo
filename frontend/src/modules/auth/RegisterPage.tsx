import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { registerUser } from "../../api/auth.api";
import { CheckCircle } from "lucide-react";
import { AuthLayout } from "../../layout/AuthLayout";

interface RegisterPageProps {
  onRegister: (role: "user" | "admin", userId: string) => void; // (kept, but not used anymore)
  onNavigateLogin: () => void;
}

export function RegisterPage({ onNavigateLogin }: RegisterPageProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);

      await registerUser(name, email, password);

      // ✅ registration done — now require email verification
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="Verify your email to activate your account"
      >
        <div className="text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-100/90">
            <CheckCircle className="h-9 w-9 text-brand-600" />
          </div>

          <div>
            <p className="text-sm text-gray-600">
              We sent a verification link to <span className="font-semibold">{email}</span>.
              <br />
              Please verify your email before logging in.
            </p>
          </div>

          <Button className="w-full" size="lg" onClick={onNavigateLogin}>
            Go to Login
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              setError(null);
            }}
          >
            Use a different email
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Create your profile and start swapping in minutes">
      <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input type="email" label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Register
          </Button>

          <div className="relative pt-1">
            <div className="h-px bg-neutral-200" />
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="font-semibold text-brand-700 hover:text-brand-600"
            >
              Sign in
            </button>
          </div>
      </form>
    </AuthLayout>
  );
}
