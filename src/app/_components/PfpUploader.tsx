"use client";

import { UploadButton } from "~/utils/uploadthing";
import { useState } from "react";
import Image from "next/image";

export default function PfpUploader({
    initialImageUrl,
    onImageUploaded
}: {
    initialImageUrl?: string | null;
    onImageUploaded?: (imageUrl: string | null) => void;
}) {
    const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);

    return (
        <div className="flex flex-col items-center">
            {/* Upload Button */}
            <UploadButton
                endpoint="profilePicUploader"
                appearance={{
                    button: "px-4 py-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition",
                    container: "",
                }}
                content={{
                    button: imageUrl ? "Change profile picture" : "Upload profile picture",
                }}
                onClientUploadComplete={(res) => {
                    if (res && res.length > 0) {
                        // Get the URL from the first (and only) file
                        const newUrl = res[0].url || (res[0] as any).imageUrl;

                        // Update state with the new URL (replace the old one)
                        setImageUrl(newUrl);

                        // If a callback was provided, call it with the new URL
                        if (onImageUploaded) {
                            onImageUploaded(newUrl);
                        }
                    }
                }}
                onUploadError={(error: Error) => {
                    console.error("Upload error:", error);
                    alert(`Error uploading profile picture: ${error.message}`);
                }}
            />
        </div>
    );
}
