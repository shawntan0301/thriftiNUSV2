"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import EditProfileGrid from "../_components/EditProfileGrid";
import { X } from "lucide-react";

type Props = {
  onClose: () => void;
};

export default function EditProfilePopup({ onClose }: Props) {
  const { data: user } = api.user.getCurrentUser.useQuery();
  const updateUser = api.user.updateUserProfile.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    },
    onError: (err) => setError(err.message),
  });

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState<string | null | undefined>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setBio(user.bio ?? "");
      setImage(user.image ?? null);
    }
  }, [user]);

  const handleSubmit = () => {
    if (!name) {
      setError("Name cannot be empty.");
      return;
    }
    setError("");
    updateUser.mutate({ name, bio, image });
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/10 flex items-center justify-center">
      <div className="relative bg-white w-full max-w-xl mx-auto rounded-lg shadow-lg p-6">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-green-500">Your profile was updated!</h2>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-4 text-center">Edit Your Profile</h2>

            <EditProfileGrid
              name={name}
              setName={setName}
              bio={bio}
              setBio={setBio}
              image={image}
              setImage={setImage}
              userImage={user.image}
            />

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white font-semibold px-4 py-2 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
