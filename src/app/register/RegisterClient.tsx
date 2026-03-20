"use client";

import { useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wrench, Hammer } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

type UserType = "CUSTOMER" | "FIXER";

interface RegisterClientProps {
  content: Record<string, string>;
}

export default function RegisterClient({ content }: RegisterClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [userType, setUserType] = useState<UserType>("CUSTOMER");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Fetch available OAuth providers
  useEffect(() => {
    getProviders().then((p) => setProviders(p));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = content["register_error_name"];
    }

    if (!formData.email.trim()) {
      newErrors.email = content["register_error_email_required"];
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = content["register_error_email_invalid"];
    }

    if (!formData.password) {
      newErrors.password = content["register_error_password_required"];
    } else if (formData.password.length < 8) {
      newErrors.password = content["register_error_password_short"];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || content["register_error_failed"] });
        setLoading(false);
        return;
      }

      // Auto-login after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: content["register_error_login_after"] });
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrors({ general: content["register_error_generic"] });
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google") => {
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (err) {
      setErrors({
        general: content["register_error_google"],
      });
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo variant="stacked" size="4xl" priority />
          </Link>
          <h2 className="mt-6 text-2xl font-semibold text-gray-800">{content["register_title"]}</h2>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={content["register_name_label"]}
            name="name"
            type="text"
            placeholder={content["register_name_placeholder"]}
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input
            label={content["register_email_label"]}
            name="email"
            type="email"
            placeholder={content["register_email_placeholder"]}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {content["register_password_label"]}
            </label>
            <PasswordInput
              id="password"
              name="password"
              placeholder={content["register_password_placeholder"]}
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* User Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {content["register_type_label"]}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("CUSTOMER")}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  userType === "CUSTOMER"
                    ? "border-primary bg-orange-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-50 flex items-center justify-center">
                  <Wrench className={`w-5 h-5 ${userType === "CUSTOMER" ? "text-primary" : "text-gray-400"}`} />
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {content["register_type_customer"]}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUserType("FIXER")}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  userType === "FIXER"
                    ? "border-primary bg-orange-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-50 flex items-center justify-center">
                  <Hammer className={`w-5 h-5 ${userType === "FIXER" ? "text-primary" : "text-gray-400"}`} />
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {content["register_type_fixer"]}
                </div>
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {content["register_submit"]}
          </Button>
        </form>

        {/* OAuth Buttons */}
        {providers && Object.values(providers).some((p: any) => p.id !== "credentials") && (
          <>
            {/* Divider only shown if OAuth providers exist */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-gray-500">{content["register_divider"]}</span>
              </div>
            </div>

            <div className="space-y-3">
              {providers?.google && (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => handleOAuthSignIn("google")}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {content["register_google"]}
                </Button>
              )}
            </div>
          </>
        )}

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {content["register_login_prompt"]}{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {content["register_login_link"]}
          </Link>
        </p>
      </div>
    </div>
  );
}
