
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { applyColors } from './theme/colors'
import PerformanceMonitor from './services/PerformanceMonitor'
import EventLogger from './services/EventLogger'

applyColors()

// Initialize performance monitoring
PerformanceMonitor.getInstance()
EventLogger.getInstance()

createRoot(document.getElementById("root")!).render(<App />);
