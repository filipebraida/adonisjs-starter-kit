# AdonisJS Starter Kit

This is a starter kit for AdonisJS projects using a monorepo setup. It leverages cutting-edge tools like TurboRepo, pnpm, ShadCN, Inertia.js, Tailwind CSS, and PostgreSQL to streamline the development process and get your projects up and running faster. Additionally, it includes a documentation project built with Next.js to make maintaining your project's documentation seamless.

## Features

- **Monorepo Setup**: Powered by TurboRepo and pnpm for efficient package management and build processes.
- **UI Framework**: ShadCN for reusable and customizable UI components.
- **Frontend Integration**: Inertia.js for a modern single-page app experience.
- **Styling**: Tailwind CSS for rapid and responsive UI development.
- **Database**: PostgreSQL for robust and scalable data storage.
- **User Management**: Fully implemented user management system.
- **Authorization & Authentication**: Secure access control for users.
- **Password Recovery**: Built-in functionality for password reset and recovery.

## Installation

### Cloning the Repository
To initialize a new project based on this starter kit, run:
```bash
npm init adonisjs@latest -- -K="filipebraida/adonisjs-shadcn-ui-monorepo.git"
```

### Installing Dependencies
Navigate to the project directory and install the dependencies:
```bash
pnpm install
```

### Setting Up the Environment
Copy the example environment file and generate the app key:
```bash
cp apps/web/.env.example apps/web/.env
```
```bash
node apps/web/ace generate:key
```

### Adding a New Component
To add a new UI component using ShadCN, execute:
```bash
pnpm dlx shadcn@latest add button -c apps/web
```
Replace `button` with the name of the component you want to add.

## Running the Development Server

Start the development server for your project:
```bash
pnpm run dev
```
This command will start the AdonisJS server and any related apps.

## Project Structure

```
root/
├── apps/
│   ├── web/        # Backend and Frontend app using AdonisJS with Inertia.js
│   ├── docs/       # Documentation app powered by Next.js
├── packages/       # Shared packages and utilities
├── pnpm-workspace.yaml # Monorepo configuration
├── turbo.json      # TurboRepo configuration
```

## Tools and Technologies

- **TurboRepo**: For monorepo management and build caching.
- **pnpm**: Fast and efficient package management.
- **ShadCN**: Modern UI component library.
- **Inertia.js**: Seamless frontend-backend integration.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **PostgreSQL**: High-performance database.

## Contributing

Contributions are welcome! Feel free to open issues and submit pull requests to improve this starter kit.

## License

This project is licensed under the [MIT License](LICENSE).
