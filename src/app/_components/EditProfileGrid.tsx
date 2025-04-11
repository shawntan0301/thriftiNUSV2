import React from "react";
import EditProfileCard from "./EditProfileCard";

interface EditProfileGridProps {
  name: string;
  setName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  image?: string | null; // allow null
  setImage: (value: string | null) => void; // allow setting null
  userImage?: string | null;
}

const EditProfileGrid: React.FC<EditProfileGridProps> = ({
  name,
  setName,
  bio,
  setBio,
  image,
  setImage,
  userImage,
}) => {
  return (
    <div className="bg-gray-100 px-6 py-8 rounded shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Edit Profile</h2>
      <EditProfileCard
        name={name}
        setName={setName}
        bio={bio}
        setBio={setBio}
        image={image}
        setImage={setImage}
        userImage={userImage}
      />
    </div>
  );
};

export default EditProfileGrid;
