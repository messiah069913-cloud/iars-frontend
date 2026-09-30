// src/app/admin/layout.tsx
// Admin layout — replaces the public nav/footer for all /admin/* routes.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}