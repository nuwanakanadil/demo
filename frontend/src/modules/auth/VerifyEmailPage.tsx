import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { Button } from "../../components/ui/Button";

export function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  // ✅ Prevent double request in React StrictMode (dev)
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Verification token missing.");
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        const msg = res.data?.message || "Email verified successfully.";

        setMessage(msg);
        setStatus("success"); // ✅ treat both "verified" and "already verified" as success
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.response?.data?.message || "Verification failed.");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-brand-100 text-center space-y-4">
        <img src="/logo.png" alt="ReWear" className="mx-auto h-14 w-auto" />

        <h2 className="text-2xl font-bold text-gray-900">Email Verification</h2>

        {status === "loading" && <p className="text-gray-600">Verifying your email…</p>}
        {status === "success" && <p className="text-green-700">{message}</p>}
        {status === "error" && <p className="text-red-600">{message}</p>}

        <Button className="w-full" onClick={() => (window.location.href = "/")}>
          Go to Login
        </Button>
      </div>
    </div>
  );
}
