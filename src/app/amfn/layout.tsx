import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "American Fusion Inc. — Document Portal",
  description: "Secure document portal for American Fusion Inc. deliverables.",
  robots: { index: false, follow: false },
};

export default function AmfnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1729] via-[#1a2744] to-[#0f1729]">
      {children}
    </div>
  );
}
