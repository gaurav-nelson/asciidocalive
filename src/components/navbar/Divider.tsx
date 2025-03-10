import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
}

const Divider: React.FC<DividerProps> = ({ orientation = 'vertical' }) => {
  if (orientation === 'vertical') {
    return (
      <>
        <div className="hidden md:block h-6 w-px bg-slate-600"></div>
        <div className="block md:hidden h-px w-full bg-slate-600 my-2"></div>
      </>
    );
  }

  return <div className="h-px w-full bg-slate-600 my-2"></div>;
};

export default Divider;
