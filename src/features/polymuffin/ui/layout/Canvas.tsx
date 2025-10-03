"use client";

import React from "react";

import { useViewportScale } from "@/features/polymuffin/hooks/useViewportScale";
import { BASE } from "@/features/polymuffin/constants/layout";

export default function Canvas({ children }: { children: React.ReactNode }) {
  const scale = useViewportScale(BASE.W, BASE.H);

  return (
    <div className="fixed inset-0 bg-[color:var(--bg)] text-[color:var(--fg)] overflow-hidden">
      <div
        className="mx-auto"
        style={{
          width: `${BASE.W * scale}px`,
          height: `${BASE.H * scale}px`,
        }}
      >
        <div
          style={{
            width: `${BASE.W}px`,
            height: `${BASE.H}px`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
