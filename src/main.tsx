import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import BoxGeometric from './App.tsx'
// import RectangleScene from './teste-corte.tsx'
// import RectangleScene from './teste-aresta.tsx'
// import RectangleScene from './newTest.tsx'
import RectangleScene from './teste.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <BoxGeometric width={2} height={2} depth={2} /> */}
    <RectangleScene />
  </StrictMode>,
)
