"use client";

import dynamic from "next/dynamic";

const AppShell = dynamic(
  () => import("@/components/AppShell").then((m) => m.default),
  { ssr: false }
);

export default function Home() {
  return <AppShell />;
}
