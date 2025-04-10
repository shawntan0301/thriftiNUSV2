"use client";

import React from "react";
import { MoreVertical, Star } from "lucide-react";

type UserProfileCardProps = {
  name: string;
  image?: string | null;
  bio?: string | null;
  totalListings?: number;
  averageRating?: number;
  totalReviews?: number;
  joinedAt: Date;
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
  name,
  image,
  bio,
  totalListings = 0,
  averageRating = 5.0,
  totalReviews = 0,
  joinedAt,
}) => {
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
          <p className="text-sm text-gray-500">{bio}</p>
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

      {/* 3-dot menu */}
      <button className="rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200">
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
};

export default UserProfileCard;
