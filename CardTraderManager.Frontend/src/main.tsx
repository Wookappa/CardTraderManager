import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { loadRuntimeConfig } from './config/api.ts'

loadRuntimeConfig().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
