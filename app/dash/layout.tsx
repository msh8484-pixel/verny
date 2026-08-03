import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VERNY INSIGHT",
  robots: { index: false, follow: false },
};

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return children;
}
