import React from "react";

type UserProfileCardProps = {
  name: string;
  image?: string | null;
  bio?: string | null;
  // totalListings: number;
};

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  name,
  image,
  bio,
  // totalListings,
}) => {
  return (
    <div className="rounded-lg p-4 shadow-md w-full bg-gray-100">
      <div className="flex items-center gap-4">
        <img
          src={image ?? "/default-profile.jpg"}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-gray-500">{bio ?? "No bio yet"}</p>
          {/* <p className="text-sm text-gray-400 mt-1">
            {totalListings} Listings
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
