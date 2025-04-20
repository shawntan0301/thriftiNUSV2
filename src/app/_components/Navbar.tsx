"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  useClerk,
} from "@clerk/nextjs";
import Image from "next/image";
import { api } from "~/trpc/react";

const Navbar = () => {
  const { signOut } = useClerk();
  const { data: user } = api.user.getCurrentUser.useQuery();

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
                    height={24}
                    width={160}
                  />
                </Link>
              </div>

              <div className="ml-auto flex items-center space-x-4 text-base">

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

                <SignedIn>
                {user && (
                  <>
                    {/* conversation button */}
                    <Link
                      href="/conversation/view"
                      className="p-2 rounded-full hover:bg-gray-100 transition"
                      title="Messages"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="w-8 h-8 text-gray-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 9.75h.008m3.867 0h.008m3.867 0h.008M21 12c0 4.418-4.03 8-9 8a9.76 9.76 0 01-3.6-.675L3 21l1.675-4.6A7.94 7.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>



                    </Link>

                    {/* log out button */}
                    <button
                      onClick={() => signOut()}
                      className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
                      title="Log out"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-7 h-7 text-gray-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-7.5A2.25 2.25 0 003.75 5.25v13.5A2.25 2.25 0 006 21h7.5a2.25 2.25 0 002.25-2.25V15m3-3H9m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    </button>

                    {/* profile info */}
                    <Link
                      href={`/my-listings/view?id=${user.id}`}
                      className="flex items-center gap-2"
                    >
                      <img
                        src={user.image ?? "/default-profile.jpg"}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                      />
                      <span className="text-lg font-medium text-gray-800">
                        Hello, <span className="text-secondaryAccent font-semibold">{user.name}</span>
                      </span>
                    </Link>

                    {/* sell */}
                    <div className="ml-2 flow-root">
                    <Link
                      href="/sell"
                      className={buttonVariants({
                        variant: "secondary",
                        className: "text-base px-4 py-2", // <– manually increase
                      })}
                    >

                        Sell
                      </Link>
                    </div>
                  </>
                )}
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
