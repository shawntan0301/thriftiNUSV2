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
      router.push("/");
      setTimeout(() => {
        window.location.reload();
      }, 150); // auto refresh 
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const markReserved = api.listings.updateStatus.useMutation({
    onSuccess: () => {
      alert("Listing marked as reserved!");
      ctx.listings.getAllListings.invalidate();
      router.push(`/listing/view?id=${listingId}`)
      setTimeout(() => window.location.reload(), 150);
    },
    onError: (error) => {
      alert("Error marking as reserved: " + error.message);
    },
  });



  const markSold = api.listings.updateStatus.useMutation({
    onSuccess: () => {
      alert("Listing marked as sold!");
      ctx.listings.getAllListings.invalidate();
      router.push(`/listing/view?id=${listingId}`)
      setTimeout(() => window.location.reload(), 150);
    },
    onError: (error) => {
      alert("Error marking as sold: " + error.message);
    },
  });


  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-sm space-y-4">
      <h3 className="font-semibold text-lg text-gray-800">Your Listing</h3>

      <div className="space-y-3">
        <button
          onClick={() => router.push(`/sell?id=${listingId}`)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 cursor-pointer"
        >
          <Pencil size={16} />
          Edit Listing
        </button>

        <button 
        onClick={() =>
          markReserved.mutate({ id: listingId, status: "reserved" })
          }
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 cursor-pointer">
          <Tag size={16} />
          Mark as Reserved
        </button>

        <button 
        onClick={() =>
          markSold.mutate({ id: listingId, status: "sold" })
          }
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 cursor-pointer">
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
