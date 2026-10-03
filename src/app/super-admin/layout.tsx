"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getUser } from "@/lib/admin-auth";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      router.replace("/admin/login");
      return;
    }

    if (user.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
  }, [router]);

  return <>{children}</>;
}