"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import NavItems from "./NavItems";
import { buttonVariants } from "./ui/button";
import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";

const Navbar = () => {
  const { user } = useUser();

  return (
    <div className="sticky inset-x-0 top-0 z-50 h-16 bg-white">
      <header className="relative bg-white">
        <MaxWidthWrapper>
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              {/* logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  <Image
                    src="/ThriftiNUS.svg"
                    alt="ThriftiNUS"
                    height={12}
                    width={80}
                  />
                </Link>
              </div>

              <div className="z-50 hidden lg:ml-8 lg:block lg:self-stretch">
                <NavItems />
              </div>

              <div className="ml-auto flex items-center space-x-4">
                {/* if signed out */}
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      className={buttonVariants({
                        variant: "ghost",
                      })}
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>

                {/* if signed in */}
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                  <span>
                    Hello,{" "}
                    <span className="text-secondaryAccent font-semibold">
                      {user?.firstName ?? "User"}
                    </span>
                  </span>
                  <div className="ml-4 flow-root lg:ml-6">
                    <Link
                      href="/sell"
                      className={buttonVariants({
                        variant: "secondary",
                      })}
                    >
                      Sell
                    </Link>
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default Navbar;
