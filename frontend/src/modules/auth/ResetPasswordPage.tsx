import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { AuthLayout } from "../..//layout/AuthLayout";
import { resetPassword } from "../../api/auth.api";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPassword(token, newPassword, confirmPassword);
      setSuccess(res?.message || "Password reset successful. You can log in now.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Reset failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Enter a new password for your account"
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

        <div className="space-y-4">
          <Input
            id="newPassword"
            type="password"
            label="New password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={!!success}
          />

          <Input
            id="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={!!success}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={!!success}>
          Reset Password
        </Button>

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium text-brand-600 hover:text-brand-500"
          >
            Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}