"use client";

import { UploadButton } from "~/utils/uploadthing";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Uploader({
  initialImageUrls = [],
  onImageUploaded
}: {
  initialImageUrls?: string[];
  onImageUploaded?: (imageUrls: string[]) => void
}) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);

  useEffect(() => {
    setImageUrls(initialImageUrls);
  }, [initialImageUrls]);

  return (
    <main className="flex flex-col items-center justify-between">
      <UploadButton
        endpoint="imageUploader"
        appearance={{
          button: "px-4 py-2 bg-gray-400 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition",
          container: "", // removes extra spacing
        }}
        content={{
          button: imageUrls.length > 0 ? "Upload more photos" : "Upload photos",
        }}

        onClientUploadComplete={(res) => {
          if (res && res.length > 0) {
            // Extract all URLs from the response
            const newUrls = res.map((file) => (file as any).url);
            console.log("Files uploaded:", newUrls);

            // Update state with all URLs
            const updatedUrls = [...imageUrls, ...newUrls];
            setImageUrls(updatedUrls);

            // If a callback was provided, call it with all URLs
            if (onImageUploaded) {
              onImageUploaded(updatedUrls);
            }

            alert("Upload Completed");
          }
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          alert(`ERROR! ${error.message}`);
        }}
      />

      {imageUrls.length > 0 && (
        <div className="mt-4 w-full">
          <p className="text-sm font-medium mb-2">Uploaded Images ({imageUrls.length})</p>
          <div className="flex flex-wrap gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative w-24 h-24">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  onClick={() => {
                    const newUrls = imageUrls.filter((_, i) => i !== index);
                    setImageUrls(newUrls);
                    if (onImageUploaded) onImageUploaded(newUrls);
                  }}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
