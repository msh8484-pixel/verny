"use client";

// © 문구를 3초 안에 5번 클릭하면 /dash로 이동. 시각적 힌트 없음.
import { useRef } from "react";
import { useRouter } from "next/navigation";

export default function FooterSecret({ children }: { children: React.ReactNode }) {
  const clicks = useRef<number[]>([]);
  const router = useRouter();

  function onClick() {
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 3000), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      router.push("/dash");
    }
  }

  return (
    <span onClick={onClick} style={{ userSelect: "none" }}>
      {children}
    </span>
  );
}
