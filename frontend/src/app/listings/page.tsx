'use client';

import { Suspense } from 'react';
import ListingsContent from './listings-content';

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ListingsContent />
    </Suspense>
  );
}
