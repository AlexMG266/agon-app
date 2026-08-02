import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// limpieza de componentes tras cada test
afterEach(() => {
  cleanup();
});
