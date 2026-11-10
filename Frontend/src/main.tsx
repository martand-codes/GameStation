import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext'
import { CartProvider } from './Context/CartContext'
import { WishlistProvider } from './Context/WishlistContext'
import { WalletProvider } from './Context/WalletContext'
import { ToastProvider } from './Context/ToastContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <AuthProvider>
              <WalletProvider>
                <App />
              </WalletProvider>
            </AuthProvider>
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
