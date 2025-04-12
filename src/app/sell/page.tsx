"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Category, Condition, DealMethod } from "@prisma/client";
import Uploader from "../_components/uploader";
import CategorySelector from "../_components/CategorySelector";
import ConditionSelector from "../_components/ConditionSelector";
import DealMethodSelector from "../_components/DealMethodSelector";
import ItemDetailsForm from "../_components/ItemDetailsForm";
import PriceInput from "../_components/PriceInput";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [condition, setCondition] = useState<Condition | null>(null);
  const [dealMethods, setDealMethods] = useState<DealMethod[]>([]);

  const createListing = api.listings.createListing.useMutation({
    onSuccess: () => {
      alert("Listing created successfully!");
      router.push("/my-listings");
    },
    onError: (err) => {
      alert("Error: " + err.message);
    },
  });

  const handleSubmit = () => {
    // for debugging 
    console.log({
      title,
      description,
      price,
      imageUrls,
      category,
      condition,
      dealMethods,
    });

    if (!title || !description || !price || imageUrls.length === 0 || !category || !condition || dealMethods.length === 0) {
      alert("Please fill in all required fields.");
      return;
    }

    createListing.mutate({
      title,
      description,
      price,
      imageUrls,  // Changed from imageUrl to imageUrls
      brand,
      category,
      condition,
      dealMethods,
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Uploader onImageUploaded={(urls) => setImageUrls(urls)} />
      <CategorySelector value={category} onChange={setCategory} />
      <ConditionSelector value={condition} onChange={setCondition} />
      <ItemDetailsForm
        title={title}
        brand={brand}
        description={description}
        onTitleChange={setTitle}
        onBrandChange={setBrand}
        onDescriptionChange={setDescription}
      />
      <PriceInput value={price} onChange={setPrice} />
      <DealMethodSelector
        value={null}
        onChange={(method) => {
          setDealMethods((prev) =>
            prev.includes(method)
              ? prev.filter((m) => m !== method)
              : [...prev, method]
          );
        }}
      />
      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600"
      >
        List now
      </button>
    </div>
  );
}