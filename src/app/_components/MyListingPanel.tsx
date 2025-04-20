"use client";

import { useRouter } from "next/navigation";
import { Pencil, Tag, CheckCircle, Trash2, Undo2 } from "lucide-react";
import { api } from "~/trpc/react";
import type { Status } from "@prisma/client";

type MyListingPanelProps = {
  listingId: string;
  status: Status;
};

const MyListingPanel = ({ listingId, status }: MyListingPanelProps) => {
  const router = useRouter();
  const ctx = api.useContext();

  const deleteListing = api.listings.deleteListing.useMutation({
    onSuccess: () => {
      ctx.listings.getAllListings.invalidate();
      router.push("/"); 
      setTimeout(() => window.location.reload(), 150);
    },
    onError: (error) => {
      alert(error.message);
    },
  });  

  const updateStatus = api.listings.updateStatus.useMutation({
    onSuccess: (data) => {
      alert(`Listing marked as ${data.status.toLowerCase()}!`);
      ctx.listings.getAllListings.invalidate();
      router.push(`/listing/view?id=${listingId}`);
      setTimeout(() => window.location.reload(), 150);
    },
    onError: (error) => {
      alert("Error updating status: " + error.message);
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-sm space-y-4">
      <h3 className="font-semibold text-lg text-gray-800">Your Listing</h3>

      <div className="space-y-3">
        {/* edit button */}
        <button
          onClick={() => router.push(`/sell?id=${listingId}`)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 cursor-pointer"
        >
          <Pencil size={16} />
          Edit Listing
        </button>

        {/* conditionally render based on status */}
        {status === "AVAILABLE" && (
          <button
            onClick={() => updateStatus.mutate({ id: listingId, status: "reserved" })}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 cursor-pointer"
          >
            <Tag size={16} />
            Mark as Reserved
          </button>
        )}

        {status === "RESERVED" && (
          <button
            onClick={() => updateStatus.mutate({ id: listingId, status: "available" })}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-700 cursor-pointer"
          >
            <Undo2 size={16} />
            Mark as Available
          </button>
        )}

        {/* for sold listings, no options to manually change its status should be shown */}

        {/* delete button */}
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
