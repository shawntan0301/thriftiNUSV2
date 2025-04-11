"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditProfileGrid from "../_components/EditProfileGrid";
import { api } from "~/trpc/react";

export default function EditProfilePage() {
  const router = useRouter();
  const { data: user } = api.user.getCurrentUser.useQuery();
  const updateUser = api.user.updateUserProfile.useMutation({
    onSuccess: () => {
        alert("Profile updated successfully!");
        router.push("/my-listings");
        setTimeout(() => {
          window.location.reload();
        }, 150); // auto refresh my-listings
      },
      
    onError: (err) => {
      alert("Error: " + err.message);
    },
  });

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [image, setImage] = useState<string | null | undefined>(user?.image ?? undefined);

  const handleSubmit = () => {
    if (!name) return alert("Name cannot be empty.");
    updateUser.mutate({ name, bio, image });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <EditProfileGrid
        name={name}
        setName={setName}
        bio={bio}
        setBio={setBio}
        image={image ?? null}
        setImage={setImage}
        userImage={user.image}
      />
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
