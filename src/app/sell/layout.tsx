"use client";  // Must be a client component because we use Suspense

import { Suspense } from "react";

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}
