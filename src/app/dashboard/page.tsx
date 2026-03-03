import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CustomerDashboard from "@/components/dashboard/CustomerDashboard";
import FixerDashboard from "@/components/dashboard/FixerDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const userType = session.user.userType;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {userType === "CUSTOMER" ? <CustomerDashboard /> : <FixerDashboard />}
      </div>
    </div>
  );
}
