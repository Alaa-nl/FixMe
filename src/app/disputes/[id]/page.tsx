import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DisputeDetail from "@/components/dispute/DisputeDetail";

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const { id } = await params;
  const isAdmin = session.user.userType === "ADMIN";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DisputeDetail disputeId={id} isAdmin={isAdmin} />
    </div>
  );
}
