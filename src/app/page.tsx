"use client";

import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import { Button } from "./_components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Intro from "./_components/IntroPage";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      {/* <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <SignedIn>
          <button onClick={() => router.push("/my-listings")}>Check My Listings!</button>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </main> */}
      <MaxWidthWrapper>
        <SignedIn>
          <Intro />
          <button onClick={() => router.push("/my-listings")}>
            Check My Listings!
          </button>
        </SignedIn>
        <SignedOut>
          <Intro />
        </SignedOut>
      </MaxWidthWrapper>
    </div>
  );
}
