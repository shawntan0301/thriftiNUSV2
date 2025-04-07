"use client";

import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import { buttonVariants, Button } from "./_components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const Intro = () => {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-primaryAccent sm:text-6xl">
        Your marketplace for high-quality{" "}
        <span className="text-secondaryAccent">thrifts.</span>
      </h1>
      <p className="text-muted-foreground mt-6 max-w-prose text-lg">
        Welcome to ThriftiNUS. The best marketplace for NUS students!
      </p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <Link href="/products" className={buttonVariants()}>
          Browse Trending
        </Link>
        <Button variant="ghost">Our quality promise &rarr;</Button>
      </div>
    </div>
  );
};

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

          <SignInButton />
        </SignedOut>
      </MaxWidthWrapper>
    </div>
  );
}
