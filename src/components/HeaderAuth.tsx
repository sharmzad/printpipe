"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function useSignedIn() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => setSignedIn(document.cookie.split("; ").includes("pp_in=1")), []);
  return signedIn;
}

export default function HeaderAuth() {
  const signedIn = useSignedIn();
  if (signedIn) return <Link href="/dashboard" className="btn-ink">Dashboard</Link>;
  return (
    <>
      <Link href="/login" className="px-2 py-1 hover:text-accent">Log in</Link>
      <Link href="/signup" className="btn-primary">Sign up free</Link>
    </>
  );
}
