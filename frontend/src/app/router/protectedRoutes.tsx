import { CartPage } from "@/pages/CartPage";
import { ChatPage } from "@/pages/ChatPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { ProductDetailsPage } from "@/pages/ProductDetailsPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { UsersPage } from "@/pages/UsersPage";

import type { AppRoute } from "./routeTypes";

export const protectedRoutes: AppRoute[] = [
  {
    element: <ForbiddenPage />,
    path: "403",
  },
  {
    element: <ProductsPage />,
    path: "products",
  },
  {
    element: <ProductDetailsPage />,
    path: "products/:productId",
  },
  {
    element: <CartPage />,
    path: "cart",
  },
  {
    element: <ChatPage />,
    path: "chat",
  },
  {
    element: <CheckoutPage />,
    path: "checkout",
  },
  {
    element: <OrdersPage />,
    path: "orders",
  },
  {
    element: <UsersPage />,
    path: "users",
  },
];
