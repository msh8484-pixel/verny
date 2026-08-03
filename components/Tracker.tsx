"use client";

// 보이지 않는 방문 추적기 — 페이지뷰·스크롤 깊이·스마트스토어 클릭을 수집한다.
// 스크롤은 같은 (세션, 경로)에 여러 번 전송될 수 있고, 대시보드 집계에서 최댓값을 쓴다.
import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";
import { STORE_URL } from "@/data/shop";

export default function Tracker() {
  const pathname = usePathname();
  const maxScroll = useRef(0);
  const prevPath = useRef<string | null>(null);

  const flushScroll = useCallback((path: string, reset: boolean) => {
    const p = maxScroll.current;
    const bucket = p >= 100 ? "100" : p >= 75 ? "75" : p >= 50 ? "50" : p >= 25 ? "25" : null;
    if (bucket) track("scroll", { path, value: bucket });
    if (reset) maxScroll.current = 0;
  }, []);

  // 라우트 전환: 이전 페이지 스크롤 플러시 → 새 페이지뷰
  // prevPath === pathname 가드는 Strict Mode 이중 실행의 중복 pageview 방지.
  useEffect(() => {
    if (prevPath.current === pathname) return;
    if (prevPath.current && !prevPath.current.startsWith("/dash")) flushScroll(prevPath.current, true);
    else maxScroll.current = 0;
    if (!pathname.startsWith("/dash")) {
      const external =
        prevPath.current === null && document.referrer && !document.referrer.includes(window.location.hostname);
      track("pageview", { path: pathname, referrer: external ? document.referrer : undefined });
    }
    prevPath.current = pathname;
  }, [pathname, flushScroll]);

  // 스크롤 최대 도달률 추적 + 탭 이탈 시 플러시
  useEffect(() => {
    function onScroll() {
      if (window.location.pathname.startsWith("/dash")) return;
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / total) * 100));
      if (pct > maxScroll.current) maxScroll.current = pct;
    }
    function onVisibility() {
      if (document.visibilityState === "hidden" && prevPath.current && !prevPath.current.startsWith("/dash"))
        flushScroll(prevPath.current, false);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [flushScroll]);

  // 스마트스토어 링크 클릭 감지 (문서 위임 — 기존 컴포넌트 수정 불필요)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (a && a.href.startsWith(STORE_URL)) track("click", { value: "store" });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
