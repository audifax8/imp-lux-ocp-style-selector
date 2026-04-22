import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { injectSkinStyles } from '@/style-selector/bootstrap/skin-loader';
import { activeBrand } from '@/white-label/detect';

import { DataProvider } from '@/style-selector/context/data';
import StyleSelector from '@/style-selector/bootstrap';

injectSkinStyles(activeBrand);

export function mount(container: HTMLElement): void {
  createRoot(container).render(
    <StrictMode>
      <DataProvider>
        <StyleSelector />  
      </DataProvider>
    </StrictMode>
  );
};
