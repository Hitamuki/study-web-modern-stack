import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloProvider } from './app/providers/ApolloProvider';
import { MemosPage } from './pages/Memos';

// Basic global resets
const globalStyle = document.createElement('style');
globalStyle.innerHTML = `
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  * {
    box-sizing: border-box;
  }
`;
document.head.appendChild(globalStyle);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider>
      <MemosPage />
    </ApolloProvider>
  </React.StrictMode>
);
