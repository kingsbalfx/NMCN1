import React from 'react';

export default function Watermark() {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        fontSize: '120px',
        fontWeight: '700',
        color: 'rgba(0, 102, 255, 0.05)',
        whiteSpace: 'nowrap',
        transform: 'rotate(-20deg)',
        letterSpacing: '8px',
        textAlign: 'center',
      }}>
        kingsbalfx&healthcare
        <br />
        digital bridge
      </div>
    </div>
  );
}
