# AdonisJS Starter Kit

AdonisJS Starter Kit is a robust, monorepo-based template for developing full-stack applications with AdonisJS. Leveraging modern tools such as TurboRepo, pnpm, ShadCN, Inertia.js, Tailwind CSS, and PostgreSQL, this starter kit streamlines your development process and enables you to rapidly bootstrap your projects.

<p align="center">
  <img src="https://raw.githubusercontent.com/filipebraida/adonisjs-starter-kit/main/.github/screenshot.png" alt="Screenshot" width="600" />
</p>

## Features

- **Monorepo Setup**: Efficient package management and build processes powered by TurboRepo and pnpm.
- **UI Framework**: Reusable and customizable components provided by ShadCN.
- **Frontend Integration**: Inertia.js delivers a modern single-page application (SPA) experience.
- **Styling**: Rapid and responsive UI development using Tailwind CSS.
- **Database**: PostgreSQL ensures robust, scalable, and high-performance data storage.
- **User Management**: Comprehensive user management system.
- **Authorization & Authentication**: Secure access control mechanisms.
- **Password Recovery**: Built-in functionality for password reset and recovery.
- **Social Authentication**: Easily authenticate users via social providers (Google, GitHub, etc.) using the [@adonisjs/ally package](https://docs.adonisjs.com/guides/authentication/social-authentication).
- **User Impersonation**: Administrators can temporarily assume any user's identity for support or testing purposes.
- **Multiple Layouts**: Choose between two distinct layouts: sidebar for enhanced navigation and Header for a streamlined top-bar interface.

## Installation

### Cloning the Repository

To create a new project using this starter kit, run:

```bash
pnpm create adonisjs@latest -K="filipebraida/adonisjs-starter-kit"
```

### Setting Up the Environment

1. **Copy the Example Environment File**  
   Duplicate the example file to create your own environment configuration.

```bash
cp apps/web/.env.example apps/web/.env
```

2. **Generate the App Key**  
   Generate a cryptographically secure key and assign it to the `APP_KEY` environment variable.

```bash
node apps/web/ace generate:key
```

3. **Configure Social Auth & Email**  
   Social authentication and email settings can be configured later as needed.

### Database Setup

The project includes a Dockerfile that automatically initializes the necessary configurations using your environment variables. To set up the database:

1. **Start the Database with Docker**  
   Launch the database container:

```bash
docker compose up -d
```

2. **Run Migrations**  
   Apply all migrations to create the database schema:

```bash
pnpm --filter web exec node ace migration:run
```

3. **Seed the Database**  
   Populate the database with initial data (e.g., default users and roles):

```bash
pnpm --filter web exec node ace db:seed
```

## Running the Development Server

Start the development server with the following command:

```bash
pnpm run dev
```

This command launches the AdonisJS server along with any associated applications.

## Project Structure

```bash
    root/
    ├── apps/
    │   └── web/        # Backend and frontend application using AdonisJS with Inertia.js
    ├── packages/       # Shared packages and utilities
    ├── pnpm-workspace.yaml  # Monorepo configuration
    └── turbo.json      # TurboRepo configuration
```

## Tools and Technologies

- **TurboRepo**: Monorepo management and build caching.
- **pnpm**: Fast and efficient package management.
- **ShadCN**: Modern UI component library.
- **Inertia.js**: Seamless integration between frontend and backend.
- **Tailwind CSS**: Utility-first CSS framework for rapid styling.
- **PostgreSQL**: Reliable and high-performance relational database.

## Adding a New Component

To add a new UI component using ShadCN, execute:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

Replace `button` with the name of the component you wish to add.

## Layouts

AdonisJS Starter Kit offers two distinct layouts so you can choose the interface that best fits your application's needs.

```typescript
export default function ListUsersPage({ users, roles }: InferPageProps<UsersController, 'index'>) {
  return (
    <AppLayout breadcrumbs={[{ label: 'Users' }]} layout="sidebar">
      // code ...
    </AppLayout>
  )
}
```

### Header Layout

A minimalist design with top-aligned navigation, providing a clean and intuitive user experience.

<p align="center">
  <img src="https://raw.githubusercontent.com/filipebraida/adonisjs-starter-kit/main/.github/header.png" alt="Header Layout" width="600" />
</p>

### Sidebar Layout

A layout featuring side navigation, ideal for applications that require quick and organized access to various sections.

<p align="center">
  <img src="https://raw.githubusercontent.com/filipebraida/adonisjs-starter-kit/main/.github/sidebar.png" alt="Sidebar Layout" width="600" />
</p>

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests with improvements and suggestions to enhance this starter kit.

## Inspirations

This project draws inspiration from the following sources:

- [ShadCN UI](https://ui.shadcn.com/)
- [AdonisJS Starter Kit by Batosai](https://github.com/batosai/adonis-starter-kit)
- [ShadCN Blocks](https://www.shadcnblocks.com/)
- [ShadCN Admin by Satnaing](https://github.com/satnaing/shadcn-admin)
- [Laravel React Starter Kit](https://github.com/laravel/react-starter-kit)

## License

This project is licensed under the [MIT License](LICENSE).
