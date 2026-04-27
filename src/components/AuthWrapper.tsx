'use client';

import { useEffect, useState } from 'react';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  // Authentication check disabled as per user request
  return <>{children}</>;
}
