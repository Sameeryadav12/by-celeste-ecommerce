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
import { AdminProductNewPage } from '../pages/admin/AdminProductNewPage'
import { AdminProductEditPage } from '../pages/admin/AdminProductEditPage'
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage'
import { AdminIngredientsPage } from '../pages/admin/AdminIngredientsPage'
import { AdminEventsPage } from '../pages/admin/AdminEventsPage'
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage'
import { AdminOrderDetailPage } from '../pages/admin/AdminOrderDetailPage'
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage'
import { AdminWholesalePage } from '../pages/admin/AdminWholesalePage'
import { AdminWholesaleDetailPage } from '../pages/admin/AdminWholesaleDetailPage'
import { AdminTestimonialsPage } from '../pages/admin/AdminTestimonialsPage'
import { AdminMarketingPage } from '../pages/admin/AdminMarketingPage'
import { AdminThemePage } from '../pages/admin/AdminThemePage'
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { ShopPage } from '../pages/ShopPage'
import { SignupPage } from '../pages/SignupPage'
import { WholesaleApplyPage } from '../pages/WholesalePage'
import { AboutPage } from '../pages/AboutPage'
import { TestimonialsPage } from '../pages/TestimonialsPage'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { EventDetailPage } from '../pages/EventDetailPage'
import { AdminProtectedRoute } from '../auth/AdminProtectedRoute'
import { NotFoundPage } from '../pages/NotFoundPage'
import { WholesaleProtectedRoute } from '../auth/WholesaleProtectedRoute'
import { WholesaleLayout } from '../pages/wholesale/WholesaleLayout'
import { WholesaleDashboardPage } from '../pages/wholesale/WholesaleDashboardPage'
import { WholesaleShopPage } from '../pages/wholesale/WholesaleShopPage'
import { WholesaleOrdersPage } from '../pages/wholesale/WholesaleOrdersPage'
import { WholesaleAccountPage } from '../pages/wholesale/WholesaleAccountPage'
import { WholesaleOrderDetailPage } from '../pages/wholesale/WholesaleOrderDetailPage'
import { WholesaleBulkOrdersPage } from '../pages/wholesale/WholesaleBulkOrdersPage'
import { WholesaleSupportPage } from '../pages/wholesale/WholesaleSupportPage'

const router = createBrowserRouter([
  /* ─── Public storefront (MainLayout) ─── */
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
      { path: '/testimonials', element: <TestimonialsPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/wholesale/apply', element: <WholesaleApplyPage /> },
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
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:slug', element: <EventDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  /* ─── Wholesale portal (own layout, separate from storefront/admin) ─── */
  {
    element: <WholesaleProtectedRoute />,
    children: [
      {
        path: '/wholesale',
        element: <WholesaleLayout />,
        children: [
          { index: true, element: <WholesaleDashboardPage /> },
          { path: 'shop', element: <WholesaleShopPage /> },
          { path: 'orders', element: <WholesaleOrdersPage /> },
          { path: 'orders/:id', element: <WholesaleOrderDetailPage /> },
          { path: 'account', element: <WholesaleAccountPage /> },
          { path: 'bulk-orders', element: <WholesaleBulkOrdersPage /> },
          { path: 'support', element: <WholesaleSupportPage /> },
        ],
      },
    ],
  },

  /* ─── Admin portal (own layout, separate from storefront) ─── */
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'products/new', element: <AdminProductNewPage /> },
          { path: 'products/:id/edit', element: <AdminProductEditPage /> },
          { path: 'categories', element: <AdminCategoriesPage /> },
          { path: 'ingredients', element: <AdminIngredientsPage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'orders/:id', element: <AdminOrderDetailPage /> },
          { path: 'customers', element: <AdminCustomersPage /> },
          { path: 'wholesale', element: <AdminWholesalePage /> },
          { path: 'wholesale/:id', element: <AdminWholesaleDetailPage /> },
          { path: 'testimonials', element: <AdminTestimonialsPage /> },
          { path: 'events', element: <AdminEventsPage /> },
          { path: 'marketing', element: <AdminMarketingPage /> },
          { path: 'theme', element: <AdminThemePage /> },
          { path: 'settings', element: <AdminSettingsPage /> },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
