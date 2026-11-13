import React from 'react';
import CyberSkeleton from '../Common/CyberSkeleton';

export default function GovernanceSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <CyberSkeleton role="OWNER" layout="dashboard" cardsCount={4} />
    </div>
  );
}

