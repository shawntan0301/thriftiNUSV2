import type { Listing, User } from "@prisma/client";

type Props = {
  listing: Listing & { user: User };
};

const formatEnum = (value: string) =>
  value
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");

const getStatusStyle = (status: string) => {
  switch (status) {
    case "RESERVED":
      return "bg-[#F38325] text-white font-medium px-3 py-1 rounded-full text-sm";
    case "SOLD":
      return "bg-[#1F3B76] text-white font-medium px-3 py-1 rounded-full text-sm";
    default:
      return "";
  }
};

const ListingDetails = ({ listing }: Props) => {
  const formattedDate = new Date(listing.createdAt).toLocaleString("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Singapore",
  });

  return (
    <div className="space-y-10">
      {/* Poster and time */}
      <div className="text-gray-600 text-sm">
        Posted by <span className="font-medium text-[#1F3B76]">{listing.user.name}</span> on {formattedDate}
      </div>

      {/* title, price */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-[#1F3B76]">{listing.title}</h1>
        <p className="text-xl text-gray-700">
  S$
  {Number.isInteger(listing.price)
    ? listing.price
    : parseFloat(listing.price.toFixed(2)).toFixed(
        listing.price * 100 % 100 === 0 ? 0 :
        listing.price * 10 % 10 === 0 ? 2 : 2
      )}
</p>



        {listing.status !== "AVAILABLE" && (
          <span className={getStatusStyle(listing.status)}>
            {formatEnum(listing.status)}
          </span>
        )}

        <hr className="mt-4" />
      </div>

      {/* details */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#1F3B76]">Details</h2>
        <div className="space-y-6 text-xl text-gray-900">
          <div>
            <p className="font-medium text-gray-800">Condition</p>
            <p>{formatEnum(listing.condition)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Brand</p>
            <p>{listing.brand ?? "N/A"}</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Category</p>
            <p>{formatEnum(listing.category)}</p>
          </div>
        </div>
        <hr className="mt-4" />
      </div>

      {/* description */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#1F3B76]">Description</h2>
        <p className="text-xl text-gray-900 whitespace-pre-line">
          {listing.description}
        </p>
        <hr className="mt-4" />
      </div>

      {/* deal methods */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#1F3B76]">Deal method</h2>
        <ul className="list-disc ml-5 text-xl text-gray-900 space-y-1">
          {listing.dealMethods.map((dm) => (
            <li key={dm}>{formatEnum(dm)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListingDetails;
