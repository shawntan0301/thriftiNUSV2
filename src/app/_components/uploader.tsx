"use client";

import { UploadButton } from "~/utils/uploadthing";
import { useState } from "react";

export default function Uploader({ onImageUploaded }: { onImageUploaded?: (imageUrl: string) => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <main className="flex flex-col items-center justify-between">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          if (res && res[0]) {
           
            const uploadedUrl = (res[0] as any).imageUrl; 
            console.log("File uploaded:", uploadedUrl);
            
            // Store the URL in state
            setImageUrl(uploadedUrl);
            
            // If a callback was provided, call it with the URL
            if (onImageUploaded) {
              onImageUploaded(uploadedUrl);
            }
            
            alert("Upload Completed");
          }
        }}
        onUploadError={(error: Error) => {
          console.error("Upload error:", error);
          alert(`ERROR! ${error.message}`);
        }}
      />
      
      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm">Uploaded image URL: {imageUrl}</p>
        </div>
      )}
    </main>
  );
}
