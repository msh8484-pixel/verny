import type { ReactNode } from "react";
import SideNav from "./SideNav";
import SiteFooter from "./SiteFooter";

export default function Shell({ children, inner = false }: { children: ReactNode; inner?: boolean }) {
  return (
    <div className="shell">
      <SideNav />
      <main className={"shell-main" + (inner ? " shell-inner" : "")}>
        {children}
        <SiteFooter />
      </main>
    </div>
  );
}
