import React from 'react';

const OrderBadge = ({ status }) => {
  let color;
  switch (status) {
    case 'pending':
      color = '#FACC15'; // yellow
      break;
    case 'assigned':
      color = '#3B82F6'; // blue
      break;
    case 'pickedup':
      color = '#F97316'; // orange
      break;
    case 'transit':
      color = '#8B5CF6'; // purple
      break;
    case 'delivered':
      color = '#22C55E'; // green
      break;
    case 'cancelled':
      color = '#EF4444'; // red
      break;
    default:
      color = '#9CA3AF'; // gray
  }

  return (
    <span
      style={{
        padding: '4px 8px',
        borderRadius: 6,
        background: `${color}33`, // light bg
        color,
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      {status.toUpperCase()}
    </span>
  );
};

export default OrderBadge;