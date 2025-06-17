import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyColors } from './theme/colors'

applyColors()

createRoot(document.getElementById("root")!).render(<App />);
