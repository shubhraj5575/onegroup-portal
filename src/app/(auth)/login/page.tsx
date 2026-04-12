"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Phone,
  Shield,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  UserPlus,
  CheckCircle2,
  Loader2,
  Mail,
  User,
  Lock,
} from "lucide-react";

type Step = "phone" | "otp" | "register";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<Step>("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCode, setRegCode] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login, verifyOtp, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(
        user.role === "ADMIN" || user.role === "SUPER_ADMIN"
          ? "/admin/dashboard"
          : "/dashboard"
      );
    }
  }, [user, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone);
      setStep("otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      await verifyOtp(phone, otpString);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: regPhone,
          name: regName,
          email: regEmail,
          adminCode: regCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(data.message);
      setTimeout(() => {
        setStep("phone");
        setPhone(regPhone);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                ONE Group
              </h1>
              <p className="text-[11px] text-white/40 tracking-widest uppercase">
                Real Estate
              </p>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Your Property,
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                One Portal Away
              </span>
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Track payments, monitor construction progress, manage documents —
              everything about your property in one place.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: "💰", label: "Payment Tracking" },
                { icon: "🏗️", label: "Construction Updates" },
                { icon: "📄", label: "Document Vault" },
                { icon: "🎯", label: "Referral Rewards" },
              ].map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                >
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-sm text-white/70">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/20 text-sm">
            &copy; {new Date().getFullYear()} ONE Group. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ONE Group</h1>
              <p className="text-[11px] text-gray-400 tracking-widest uppercase">
                Customer Portal
              </p>
            </div>
          </div>

          {/* Phone Step */}
          {step === "phone" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Welcome back
                </h2>
                <p className="text-gray-500 mt-2">
                  Enter your registered phone number to continue
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-3 border-r bg-gray-50 rounded-l-lg text-sm text-gray-500 font-medium">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      maxLength={10}
                      autoFocus
                      className="pl-24 h-12 text-lg tracking-wider"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800"
                  disabled={loading || phone.length !== 10}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Get OTP
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gray-50 px-4 text-gray-400 uppercase tracking-wider">
                    Admin Access
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep("register");
                  setError("");
                }}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border-2 border-dashed border-gray-200 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-white transition-all"
              >
                <Shield className="h-4 w-4" />
                Register as Admin
              </button>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 -ml-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h2 className="text-2xl font-bold text-gray-900">
                  Verify OTP
                </h2>
                <p className="text-gray-500 mt-2">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-gray-700">
                    +91 {phone}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-13 h-14 rounded-xl border-2 border-gray-200 text-center text-2xl font-bold text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all bg-white"
                    />
                  ))}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gray-900 hover:bg-gray-800"
                  disabled={loading || otp.join("").length !== 6}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Verify & Login
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-300 bg-gray-100 inline-block px-3 py-1.5 rounded-full">
                    Dev OTP:{" "}
                    <span className="font-mono font-bold text-gray-500">
                      123456
                    </span>
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Register Admin Step */}
          {step === "register" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <button
                  onClick={() => {
                    setStep("phone");
                    setError("");
                    setSuccess("");
                  }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 -ml-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Admin Registration
                    </h2>
                  </div>
                </div>
                <p className="text-gray-500 mt-1">
                  Register a new admin account with your organization code
                </p>
              </div>

              {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 font-medium">
                    {success}
                  </p>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Your full name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="tel"
                      placeholder="9876543210"
                      value={regPhone}
                      onChange={(e) =>
                        setRegPhone(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Email{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="admin@onegroup.in"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Admin Registration Code
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Enter organization code"
                      value={regCode}
                      onChange={(e) => setRegCode(e.target.value)}
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Dev code:{" "}
                    <span className="font-mono font-bold">ONEGROUP2025</span>
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-indigo-600 hover:bg-indigo-700"
                  disabled={
                    loading ||
                    !regName ||
                    regPhone.length !== 10 ||
                    !regCode
                  }
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Admin Account
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
