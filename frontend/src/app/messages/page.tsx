'use client';

import { Suspense } from 'react';
import MessagesContent from './messages-content';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
