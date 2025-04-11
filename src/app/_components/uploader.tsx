"use client";

import { UploadButton } from "~/utils/uploadthing";
import { useState } from "react";

export default function Uploader({ onImageUploaded }: { onImageUploaded?: (imageUrl: string) => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <main className="flex flex-col items-center justify-between">
      <UploadButton
        endpoint="imageUploader"


        // added a visible button
        appearance={{
          button: "px-4 py-2 bg-gray-400 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition",
          container: "", // removes extra spacing
        }}
        content={{
          button: "Upload a photo",
        }}

        
        onClientUploadComplete={(res) => {
          if (res && res[0]) {
           
            const uploadedUrl = (res[0] as any).url;
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
          { /*<p className="text-sm">Uploaded image URL: {imageUrl}</p>    commented to remove the ugly url first (show preview instead) */}
        </div>
      )}
    </main>
  );
}
