"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
          <div className="space-y-4">
            <p className="text-lg">
              Welcome, <span className="font-semibold">{session.user?.name}</span>!
            </p>
            <p className="text-gray-600">
              Email: <span className="font-medium">{session.user?.email}</span>
            </p>
            <p className="text-gray-600">
              User Type: <span className="font-medium">{session.user?.userType}</span>
            </p>
            <div className="pt-4">
              <Button onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
