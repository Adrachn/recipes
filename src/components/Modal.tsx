"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const overlay = useRef<HTMLDivElement>(null);

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlay.current) {
        onDismiss();
      }
    },
    [onDismiss, overlay]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={overlay}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClick}
    >
      <div className="relative">{children}</div>
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-white text-4xl leading-none"
      >
        &times;
      </button>
    </div>
  );
}
