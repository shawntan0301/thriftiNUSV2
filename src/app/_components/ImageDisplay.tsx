// tbc need multiple images to test

type ImageDisplayProps = {
    images: string[];
  };
  
  const ImageDisplay: React.FC<ImageDisplayProps> = ({ images }) => {
    const singleImage = images.length === 1;
  
    return (
      <div className="w-full max-w-6xl flex h-[300px] overflow-hidden">
        {images.map((src, i) => {
          const isFirst = i === 0;
          const isLast = i === images.length - 1;
  
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
              className={`object-cover w-1/${images.length} h-full ${borderRadius}`}
            />
          );
        })}
      </div>
    );
  };
  
  export default ImageDisplay;
  