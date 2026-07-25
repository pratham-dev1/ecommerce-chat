import { Router } from "express";

import { authRouter } from "../../../modules/auth/auth.routes";
import { cartRouter } from "../../../modules/cart/cart.routes";
import { categoriesRouter } from "../../../modules/categories/categories.routes";
import { checkoutRouter } from "../../../modules/checkout/checkout.routes";
import { ordersRouter } from "../../../modules/orders/orders.routes";
import { paymentsRouter } from "../../../modules/payments/payments.routes";
import { productsRouter } from "../../../modules/products/products.routes";
import { roleGrantsRouter } from "../../../modules/role-grants/role-grants.routes";
import { rolesRouter } from "../../../modules/roles/roles.routes";
import { usersRouter } from "../../../modules/users/users.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/checkout", checkoutRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/role-grants", roleGrantsRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/users", usersRouter);
