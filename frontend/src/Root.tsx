import { ComponentType, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';

import { ApiContextProvider } from '@/context/ApiContext';
import { Providers } from '@/context/Providers';
import { BrowserRouter } from 'react-router-dom';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

function render(App: ComponentType) {
  root.render(
    <StrictMode>
      <ApiContextProvider>
        <RecoilRoot>
          <BrowserRouter>
            <Providers>
              <App />
            </Providers>
          </BrowserRouter>
        </RecoilRoot>
      </ApiContextProvider>
    </StrictMode>,
  );
}

export default render;
