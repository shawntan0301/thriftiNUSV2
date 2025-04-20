"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import MaxWidthWrapper from "./_components/MaxWidthWrapper";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Intro from "./_components/IntroPage";
import ListingGrid from "./_components/ListingGrid";
import SearchAndFilters from "./_components/SearchAndFilters";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { data: currentUser } = api.user.getCurrentUser.useQuery();
  const { data: allListings, isLoading } = api.listings.getAllListings.useQuery();
  const [listings, setListings] = useState<any[] | null>(null);

  const listingsToShow = listings ?? allListings;

  return (
    <div>
      <MaxWidthWrapper>
        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Intro />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <SearchAndFilters onUpdateResults={setListings} />
          </motion.div>

          <AnimatePresence>
            {isLoading ? (
              <motion.p
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                Loading listings...
              </motion.p>
            ) : listingsToShow && listingsToShow.length > 0 ? (
              <motion.div
                key="listings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ListingGrid listings={listingsToShow} />
              </motion.div>
            ) : (
              <motion.p
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-600 text-center"
              >
                No results found.
              </motion.p>
            )}
          </AnimatePresence>
        </SignedIn>

        <SignedOut>
          {/* Hero Section */}
          <section className="h-screen w-full bg-[url('/assets/bg-thrift.jpg')] bg-cover bg-center text-white flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
              className="text-center px-4 max-w-2xl"
            >
              {/* ThriftiNUS Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5 }}
                className="text-center font-[Inter] leading-tight tracking-tight text-white"
              >
                <div className="text-7xl sm:text-8xl font-black">
                  <span
                    style={{
                      color: "#243F73",
                      textShadow: "0px 2px 8px rgba(255,255,255,0.9)",
                    }}
                  >
                    Thrifti
                  </span>
                  <span
                    style={{
                      color: "#E18132",
                      textShadow: "0px 2px 8px rgba(255,255,255,0.9)",
                    }}
                  >
                    NUS
                  </span>
                </div>
              </motion.h1>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="mt-3 text-4xl sm:text-5xl font-bold text-white drop-shadow-none"
              >
                Trade Smarter, Live Greener
              </motion.div>

              <p className="mt-4 text-lg sm:text-xl text-gray-200">
                Join a vibrant campus community committed to reducing waste through conscious buying and selling.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignInButton mode="modal">
                  <button className="bg-white text-black font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>

                <a
                  href="#about-section"
                  className="bg-transparent border border-white text-white font-medium px-6 py-3 rounded-full hover:bg-white hover:text-black transition"
                >
                  About Us
                </a>
              </div>
            </motion.div>
          </section>

          {/* About Us Section */}
          <section
            id="about-section"
            className="bg-[#FFF9F1] text-gray-800 py-20 px-6 sm:px-12"
          >
            {/* What is ThriftiNUS */}
            <div className="mb-16">
              <div className="bg-white rounded-xl shadow-md p-10 max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-orange-500">
                  What is{" "}
                  <span className="text-[#243F73]">Thrifti</span>
                  <span className="text-[#E18132]">NUS</span>
                  ?
                </h2>
                <p className="text-lg leading-relaxed text-gray-800">
                  ThriftiNUS is a community-first marketplace exclusively for NUS students to buy and sell second-hand items. From textbooks to tech, fashion to furniture — we make it easy to give your pre-loved items a second life while supporting sustainability on campus.
                </p>
              </div>
            </div>

            {/* Our Mission Section */}
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-white rounded-xl shadow-lg p-8 mt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-3xl font-bold text-orange-500">
                      Our Mission
                    </h2>
                  </div>
                  <p className="text-lg leading-relaxed mb-4 text-gray-800">
                    ThriftiNUS is an NUS-powered marketplace for buying and selling second-hand items — all in the spirit of sustainability and affordability.
                  </p>
                  <p className="text-lg leading-relaxed text-gray-800">
                    By connecting NUS students directly, we promote conscious consumption and reduce waste while saving money and giving items a second life.
                  </p>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden shadow-md">
                <img
                  src="/assets/about-preview.png"
                  alt="Students sharing pre-loved items"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </section>

          {/* CTA Join Section */}
          <section className="py-20 px-6 sm:px-12 bg-[#FFF9F1]">
            <div className="max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-xl">
              <div
                className="relative bg-cover bg-center text-white text-center px-6 py-20 sm:px-12"
                style={{ backgroundImage: "url('/assets/cta-bg.jpg')" }} // replace with your actual path
              >
                <div className="absolute inset-0 bg-orange-300 opacity-50"></div>

                <div className="relative z-10 flex flex-col items-center justify-center">
                <h2 className="text-4xl sm:text-5xl font-extrabold mb-4">
                  Join the <span style={{ color: "#243F73" }}>Thrifti</span>
                  <span className="text-yellow-300">NUS</span> Community
                </h2>

                  <p className="text-lg sm:text-xl mb-8 max-w-2xl">
                    Discover great campus deals and give pre-loved items a new life — all
                    while saving money and promoting sustainability.
                  </p>
                  <SignInButton mode="modal">
                    <button className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-full shadow hover:bg-gray-100 transition cursor-pointer text-lg">
                      Sign In
                    </button>
                  </SignInButton>
                </div>
              </div>
            </div>
          </section>



        </SignedOut>
      </MaxWidthWrapper>
    </div>
  );
}
