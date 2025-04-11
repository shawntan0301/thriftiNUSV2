import React from "react";

type ReviewCardProps = {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  author: {
    id: string;
    name: string;
  };
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  author,
  content,
  rating,
  createdAt,
}) => {
  return (
    <div className="w-full max-w-[280px]">
      <div className="text-sm text-gray-800 space-y-1">
        <div className="flex items-center gap-1 text-gray-700 text-sm">
          <span className="font-semibold underline">{author.name}</span>
          <span className="text-gray-400">|</span>
          <span>{formatDate(createdAt)}</span>
          <span className="text-gray-400">|</span>
          <span className="font-semibold">
            {rating.toFixed(1)} <span className="text-blue-900 font-bold">★</span>
          </span>
        </div>
        <p className="text-gray-900 text-sm whitespace-pre-line mt-1">{content}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
