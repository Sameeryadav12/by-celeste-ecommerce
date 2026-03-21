import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AccountLayout } from '../pages/AccountLayout'
import { AccountDashboardPage } from '../pages/AccountDashboardPage'
import { AccountOrderDetailPage } from '../pages/AccountOrderDetailPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage'
import { CheckoutCancelPage } from '../pages/CheckoutCancelPage'
import { EventsPage } from '../pages/EventsPage'
import { AdminLayout } from '../pages/admin/AdminLayout'
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage'
import { AdminProductsPage } from '../pages/admin/AdminProductsPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminIngredientsPage } from '../pages/admin/AdminIngredientsPage'
import { AdminEventsPage } from '../pages/admin/AdminEventsPage'
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { ShopPage } from '../pages/ShopPage'
import { SignupPage } from '../pages/SignupPage'
import { WholesalePage } from '../pages/WholesalePage'
import { AboutPage } from '../pages/AboutPage'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { EventDetailPage } from '../pages/EventDetailPage'
import { AdminProtectedRoute } from '../auth/AdminProtectedRoute'
import { NotFoundPage } from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/shop', element: <ShopPage /> },
      { path: '/shop/:slug', element: <ProductDetailPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/checkout/success', element: <CheckoutSuccessPage /> },
      { path: '/checkout/cancel', element: <CheckoutCancelPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/account',
            element: <AccountLayout />,
            children: [
              { index: true, element: <AccountDashboardPage /> },
              { path: 'orders/:orderId', element: <AccountOrderDetailPage /> },
            ],
          },
        ],
      },
      { path: '/wholesale', element: <WholesalePage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:slug', element: <EventDetailPage /> },
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'products', element: <AdminProductsPage /> },
              { path: 'categories', element: <AdminCategoriesPage /> },
              { path: 'ingredients', element: <AdminIngredientsPage /> },
              { path: 'orders', element: <AdminOrdersPage /> },
              { path: 'events', element: <AdminEventsPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

