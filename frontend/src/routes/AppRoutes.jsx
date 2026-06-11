import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { adminRouteRedirects, routes, userRouteRedirects } from "../config/routes";
import { Loader } from "../shared/components/Loader";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { UserLayout } from "../shared/layout/UserLayout";
import { AdminLayout } from "../admin/layout/AdminLayout";

const HomePage = lazy(() => import("../user/pages/HomePage").then((module) => ({ default: module.HomePage })));
const AboutPage = lazy(() =>
  import("../user/pages/AboutPage").then((module) => ({ default: module.AboutPage }))
);
const ContactPage = lazy(() =>
  import("../user/pages/ContactPage").then((module) => ({ default: module.ContactPage }))
);
const ProductsPage = lazy(() =>
  import("../user/pages/ProductsPage").then((module) => ({ default: module.ProductsPage }))
);
const ProductDetailsPage = lazy(() =>
  import("../user/pages/ProductDetailsPage").then((module) => ({ default: module.ProductDetailsPage }))
);
const CartPage = lazy(() => import("../user/pages/CartPage").then((module) => ({ default: module.CartPage })));
const FavoritesPage = lazy(() =>
  import("../user/pages/FavoritesPage").then((module) => ({ default: module.FavoritesPage }))
);
const OrdersPage = lazy(() =>
  import("../user/pages/OrdersPage").then((module) => ({ default: module.OrdersPage }))
);
const UserOrderTrackingPage = lazy(() =>
  import("../user/pages/OrderTrackingPage").then((module) => ({ default: module.OrderTrackingPage }))
);
const ReturnsPage = lazy(() =>
  import("../user/pages/ReturnsPage").then((module) => ({ default: module.ReturnsPage }))
);
const ProfilePage = lazy(() =>
  import("../user/pages/ProfilePage").then((module) => ({ default: module.ProfilePage }))
);

const AdminDashboardPage = lazy(() =>
  import("../admin/pages/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage }))
);
const ProductListPage = lazy(() =>
  import("../admin/pages/products/ProductListPage").then((module) => ({ default: module.ProductListPage }))
);
const ProductFormPage = lazy(() =>
  import("../admin/pages/products/ProductFormPage").then((module) => ({ default: module.ProductFormPage }))
);
const AdminProductDetailsPage = lazy(() =>
  import("../admin/pages/products/ProductDetailsPage").then((module) => ({ default: module.ProductDetailsPage }))
);
const CategoriesPage = lazy(() =>
  import("../admin/pages/products/CategoriesPage").then((module) => ({ default: module.CategoriesPage }))
);
const FeaturedProductsPage = lazy(() =>
  import("../admin/pages/products/FeaturedProductsPage").then((module) => ({ default: module.FeaturedProductsPage }))
);
const BulkUploadPage = lazy(() =>
  import("../admin/pages/products/BulkUploadPage").then((module) => ({ default: module.BulkUploadPage }))
);
const UserListPage = lazy(() =>
  import("../admin/pages/users/UserListPage").then((module) => ({ default: module.UserListPage }))
);
const UserDetailsPage = lazy(() =>
  import("../admin/pages/users/UserDetailsPage").then((module) => ({ default: module.UserDetailsPage }))
);
const AllOrdersPage = lazy(() =>
  import("../admin/pages/orders/AllOrdersPage").then((module) => ({ default: module.AllOrdersPage }))
);
const PendingOrdersPage = lazy(() =>
  import("../admin/pages/orders/PendingOrdersPage").then((module) => ({ default: module.PendingOrdersPage }))
);
const OrderTrackingPage = lazy(() =>
  import("../admin/pages/orders/OrderTrackingPage").then((module) => ({ default: module.OrderTrackingPage }))
);
const ReturnRequestsPage = lazy(() =>
  import("../admin/pages/refunds/ReturnRequestsPage").then((module) => ({ default: module.ReturnRequestsPage }))
);
const RefundStatusPage = lazy(() =>
  import("../admin/pages/refunds/RefundStatusPage").then((module) => ({ default: module.RefundStatusPage }))
);
const HomeContentPage = lazy(() =>
  import("../admin/pages/content/HomeContentPage").then((module) => ({ default: module.HomeContentPage }))
);
const AboutContentPage = lazy(() =>
  import("../admin/pages/content/AboutContentPage").then((module) => ({ default: module.AboutContentPage }))
);
const ContactContentPage = lazy(() =>
  import("../admin/pages/content/ContactContentPage").then((module) => ({ default: module.ContactContentPage }))
);
const BannerManagementPage = lazy(() =>
  import("../admin/pages/content/BannerManagementPage").then((module) => ({ default: module.BannerManagementPage }))
);
const BlogManagementPage = lazy(() =>
  import("../admin/pages/content/BlogManagementPage").then((module) => ({ default: module.BlogManagementPage }))
);
const AnalyticsOverviewPage = lazy(() =>
  import("../admin/pages/analytics/AnalyticsOverviewPage").then((module) => ({ default: module.AnalyticsOverviewPage }))
);
const FinanceReportsPage = lazy(() =>
  import("../admin/pages/analytics/FinanceReportsPage").then((module) => ({ default: module.FinanceReportsPage }))
);
const SettingsPage = lazy(() =>
  import("../admin/pages/settings/SettingsPage").then((module) => ({ default: module.SettingsPage }))
);

function RouteLoader() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Loader label="Loading BR Jewellers..." />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        {userRouteRedirects.map((entry) => (
          <Route key={entry.from} path={entry.from} element={<Navigate to={entry.to} replace />} />
        ))}

        <Route path="/" element={<UserLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:productId" element={<ProductDetailsPage />} />
          <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
            <Route path="cart" element={<CartPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route key="orders-list" path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId/tracking" element={<UserOrderTrackingPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to={routes.appHome} replace />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />

            {adminRouteRedirects.map((entry) => (
              <Route key={entry.from} path={entry.from} element={<Navigate to={entry.to} replace />} />
            ))}

            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="products/list" element={<ProductListPage />} />
            <Route path="products/create" element={<ProductFormPage />} />
            <Route path="products/:productId/edit" element={<ProductFormPage />} />
            <Route path="products/:productId" element={<AdminProductDetailsPage />} />
            <Route path="products/categories" element={<CategoriesPage />} />
            <Route path="products/featured" element={<FeaturedProductsPage />} />
            <Route path="products/bulk-upload" element={<BulkUploadPage />} />
            <Route path="users/list" element={<UserListPage />} />
            <Route path="users/details/:userId" element={<UserDetailsPage />} />
            <Route path="orders/all" element={<AllOrdersPage />} />
            <Route path="orders/pending" element={<PendingOrdersPage />} />
            <Route path="orders/tracking" element={<OrderTrackingPage />} />
            <Route path="refunds/requests" element={<ReturnRequestsPage />} />
            <Route path="refunds/status" element={<RefundStatusPage />} />
            <Route path="content/home" element={<HomeContentPage />} />
            <Route path="content/about" element={<AboutContentPage />} />
            <Route path="content/contact" element={<ContactContentPage />} />
            <Route path="content/banners" element={<BannerManagementPage />} />
            <Route path="content/blogs" element={<BlogManagementPage />} />
            <Route path="analytics" element={<AnalyticsOverviewPage />} />
            <Route path="analytics/finance" element={<FinanceReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={routes.adminDashboard} replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={routes.appHome} replace />} />
      </Routes>
    </Suspense>
  );
}
