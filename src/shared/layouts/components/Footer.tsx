import { memo } from 'react';

export const Footer = memo(() => {
  return (
    <footer className="border-t bg-white px-6 py-4">
      <div className="text-center text-sm text-gray-600">© 2024 React 19 Base. All rights reserved.</div>
    </footer>
  );
});

Footer.displayName = 'Footer';
