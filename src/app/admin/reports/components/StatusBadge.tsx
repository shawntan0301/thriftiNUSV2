import React from 'react';

interface StatusBadgeProps {
  status?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status = 'CLOSED' }) => {
  const isOpen = status.includes('OPEN');
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium border ${
        isOpen
          ? 'bg-orange-100/30 text-orange-700 border-orange-200'
          : 'bg-blue-100/30 text-blue-700 border-blue-200'
      }`}
    >
      {isOpen ? 'OPEN' : 'CLOSED'}
    </span>
  );
};

export default StatusBadge;
