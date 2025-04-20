import React from 'react';

interface TypeTagProps {
  label: string;
}

const TypeTag: React.FC<TypeTagProps> = ({ label = 'Unknown' }) => {
  return (
    <span
      className="inline-flex items-center rounded-full border border-border bg-white text-sm px-3 py-0.5 text-muted-foreground"
    >
      {label
        .split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ')}
    </span>
  );
};

export default TypeTag;
