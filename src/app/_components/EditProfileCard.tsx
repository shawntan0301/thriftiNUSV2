"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Uploader from "./uploader";

type EditProfileCardProps = {
  name: string;
  setName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  image?: string | null;
  setImage: (value: string | null) => void;
  userImage?: string | null;
};

const EditProfileCard: React.FC<EditProfileCardProps> = ({
  name,
  setName,
  bio,
  setBio,
  image,
  setImage,
  userImage,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 mb-4">
        <img
          src={image ?? userImage ?? "/default-profile.jpg"}
          alt="Profile preview"
          className="w-32 h-32 rounded-full object-cover border border-gray-300"
        />
        <div className="flex flex-col gap-2">
          <Uploader onImageUploaded={(url) => setImage(url)} />
          <button
            onClick={() => {
                const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                setImage(fallbackAvatar);
            }}
            className="text-sm text-red-600 hover:underline"
            >
            Remove Photo
            </button>

        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 border border-gray-300 rounded px-3 py-2 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full mt-1 border border-gray-300 rounded px-3 py-2 bg-white"
          rows={4}
        />
      </div>
    </div>
  );
};

export default EditProfileCard;
