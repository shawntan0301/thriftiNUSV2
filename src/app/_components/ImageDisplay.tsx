type ImageDisplayProps = {
  images: string[];
};

const ImageDisplay: React.FC<ImageDisplayProps> = ({ images }) => {
  const singleImage = images.length === 1;

  return (
    <div className="w-full max-w-6xl flex overflow-x-auto h-[300px] snap-x snap-mandatory">
      {images.map((src, i) => {
        const isFirst = i === 0;
        const isLast = i === images.length - 1;
  
        // Determine border radius for a single image or the first and last images
        const borderRadius = singleImage
          ? "rounded-xl"
          : isFirst
          ? "rounded-l-xl"
          : isLast
          ? "rounded-r-xl"
          : "";
  
        return (
          <img
            key={i}
            src={src}
            alt={`Listing image ${i + 1}`}
            className={`object-cover h-full flex-shrink-0 snap-start ${borderRadius}`}
            // Optionally, set a fixed width, adjust as needed
            style={{ width: "33.33%" }}
          />
        );
      })}
    </div>
  );
};

export default ImageDisplay;

  