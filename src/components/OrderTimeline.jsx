import React from 'react';

const OrderTimeline = ({ status }) => {
  const steps = ['pending', 'assigned', 'pickedup', 'transit', 'delivered'];
  const currentIndex = steps.indexOf(status);

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {steps.map((step, i) => (
        <div key={step} style={{ textAlign: 'center', flex: 1 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: i <= currentIndex ? '#22C55E' : '#D1D5DB',
              margin: '0 auto',
            }}
          />
          <div style={{ fontSize: 10, marginTop: 4 }}>{step}</div>
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;