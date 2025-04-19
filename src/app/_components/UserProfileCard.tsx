"use client";

import React, { useRef, useState, useEffect } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type UserProfileCardProps = {
  userId: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  totalListings?: number;
  averageRating?: number;
  totalReviews?: number;
  joinedAt: Date;
  isOwnProfile?: boolean;
};

const getTimeSinceJoined = (joinedDate: Date): string => {
  const now = new Date();
  const diff = now.getTime() - joinedDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  return `${years}y ${remainingDays}d`;
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  userId,
  name,
  image,
  bio,
  totalListings = 0,
  averageRating = 5.0,
  totalReviews = 0,
  joinedAt,
  isOwnProfile = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useSearchParams();

  const profileId = userId || params.get("id") || "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle report user action
  const handleReportUser = () => {
    if (!profileId) {
      alert("Unable to report: User ID not found");
      return;
    }

    if (window.confirm("Are you sure you want to report this user?")) {
      router.push(`/create-profile-report?userId=${profileId}`);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="rounded-xl p-4 shadow-md w-full bg-gray-100 flex items-center justify-between">
      {/* Profile Info */}
      <div className="flex items-center gap-4">
        <img
          src={image ?? "/default-profile.jpg"}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />

        <div>
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-sm text-gray-500">{totalListings} Listings</p>
          <p className="text-sm text-gray-500">{bio ?? "No bio yet"}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 text-center">
        <div>
          <p className="font-medium text-lg">
            {averageRating.toFixed(1)}{" "}
            <Star size={18} className="inline-block text-blue-900 fill-blue-900" />
          </p>
          <p className="text-sm text-gray-500">{totalReviews} Reviews</p>
        </div>
        <div>
          <p className="font-medium text-lg">{getTimeSinceJoined(joinedAt)}</p>
          <p className="text-sm text-gray-500">Joined</p>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`${isOwnProfile
            ? "rounded-full px-4 py-2 text-sm bg-blue-900 text-white hover:bg-blue-800"
            : "rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200"
            }`}
          aria-label="Profile options"
        >
          {isOwnProfile ? "Profile" : <span className="text-lg">⋮</span>}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
            {isOwnProfile ? (
              <div className="py-1">
                <Link href="/edit-profile" onClick={() => setDropdownOpen(false)}>
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    Edit Profile
                  </div>
                </Link>
              </div>
            ) : (
              <div className="py-1">
                <div
                  className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                  onClick={handleReportUser}
                >
                  Report Profile
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileCard;
