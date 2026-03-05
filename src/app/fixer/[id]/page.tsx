import { redirect } from "next/navigation";

interface FixerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function FixerProfilePage({ params }: FixerProfilePageProps) {
  const { id } = await params;
  redirect(`/profile/${id}`);
}
