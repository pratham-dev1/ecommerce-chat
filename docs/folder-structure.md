# Folder Structure

This project uses two standalone apps, not npm workspaces.

```text
.
|-- frontend
|   |-- package.json
|   |-- public
|   `-- src
|       |-- app              # app shell, providers, router, layouts
|       |-- assets           # images, icons, static app assets
|       |-- components       # reusable UI and layout components
|       |-- config           # frontend environment and runtime config
|       |-- constants        # frontend constants
|       |-- features         # domain features: auth, catalog, cart, orders
|       |-- hooks            # shared React hooks
|       |-- lib              # framework-light utilities
|       |-- pages            # route-level screens
|       |-- services         # API clients and browser services
|       |-- store            # global client state
|       |-- styles           # global CSS and design tokens
|       |-- types            # frontend-only API/UI types
|       `-- utils            # small helpers
|-- backend
|   |-- package.json
|   `-- src
|       |-- api              # versioned HTTP route composition
|       |-- common           # errors, middleware, constants, utilities
|       |-- config           # env, cors, database config
|       |-- infrastructure   # database, cache, logger, email, storage, queue
|       |-- jobs             # background jobs
|       |-- modules          # business modules
|       `-- scripts          # operational scripts
`-- docs
```

## Backend Module Pattern

```text
modules/products
|-- products.controller.ts   # HTTP request and response handling
|-- products.routes.ts       # Express routes for this module
|-- products.service.ts      # business rules
|-- products.repository.ts   # data access
|-- products.validation.ts   # request validation schemas
`-- products.types.ts        # module-specific types
```

## Frontend Feature Pattern

```text
features/catalog
|-- api                      # calls to backend endpoints
|-- components               # catalog-only UI
|-- hooks                    # catalog-only React hooks
|-- schemas                  # frontend validation schemas
|-- types                    # catalog API/UI types
`-- index.ts                 # public feature exports
```
