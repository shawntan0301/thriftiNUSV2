"use client";

import { useRouter } from "next/navigation";
import { Pencil, Tag, CheckCircle, Trash2 } from "lucide-react";
import { api } from "~/trpc/react";

const MyListingPanel = ({ listingId }: { listingId: string }) => {
  const router = useRouter();
  const ctx = api.useContext();

  const deleteListing = api.listings.deleteListing.useMutation({
    onSuccess: () => {
      ctx.listings.getAllListings.invalidate();
      router.push("/my-listings");
      setTimeout(() => {
        window.location.reload();
      }, 150); // auto refresh 
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-sm space-y-4">
      <h3 className="font-semibold text-lg text-gray-800">Your Listing</h3>

      <div className="space-y-3">
        <button
          onClick={() => router.push(`/sell?id=${listingId}`)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-900"
        >
          <Pencil size={16} />
          Edit Listing
        </button>

        <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-900">
          <Tag size={16} />
          Mark as Reserved
        </button>

        <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-900">
          <CheckCircle size={16} />
          Mark as Sold
        </button>

        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this listing?")) {
              deleteListing.mutate(listingId);
            }
          }}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 cursor-pointer"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

export default MyListingPanel;
