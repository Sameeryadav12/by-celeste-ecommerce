import { AppRouter } from './routes/AppRouter'
import { AuthProvider } from './auth/AuthContext'
import { CartProvider } from './features/cart/CartContext'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  )
}
