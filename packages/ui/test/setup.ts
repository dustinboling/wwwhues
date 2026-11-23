import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  document.head.querySelectorAll('link[data-hues-prefetch]').forEach((link) => link.remove());
});
