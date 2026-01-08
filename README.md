# next-recipe-hub

A full-stack Next.js 15 recipe application built with TypeScript, Prisma, and modern web technologies.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or pnpm

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd next-recipe-hub-1
   npm install
   ```

2. **Start PostgreSQL:**
   ```bash
   docker compose up -d
   ```
   The Docker config binds Postgres to `127.0.0.1:5432` (local only).

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database and load the recipe dataset:**
   ```bash
   npm run db:push
    # Imports prisma/recipe-dataset.json (recipes + nutrition + images)
   npm run import:from-json
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Recipe Dataset

The repository ships with a single curated dataset that powers the app:

- `prisma/recipe-dataset.json` – contains every ingredient plus 1,448 recipes with nutrition facts and hero images.

Run `npm run import:from-json` anytime to wipe the database and re-import this dataset. No additional conversion tooling is required.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router, RSC)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js (Email magic link, GitHub/Google OAuth)
- **Validation:** Zod + react-hook-form
- **Data Fetching:** TanStack Query (client) + RSC (server)
- **Testing:** Vitest + React Testing Library + Playwright
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Marketing pages
│   ├── (app)/             # Main application
│   │   ├── recipes/[slug]/ # Recipe detail pages
│   │   ├── lists/[id]/     # Shopping list pages
│   │   ├── dashboard/      # User dashboard
│   │   └── api/           # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── recipe/            # Recipe-related components
│   ├── search/            # Search components
│   └── list/              # Shopping list components
├── lib/                   # Utilities and configurations
├── server/                # Server-side service layer
└── types/                 # TypeScript type definitions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run E2E tests
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push database schema
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:deploy` - Run production-safe migrations
- `npm run db:seed` - Seed database with sample data
- `npm run import:from-json` - Import the curated recipe dataset

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="change-me"
POSTGRES_DB="next_recipe_hub"
DATABASE_URL="postgresql://postgres:change-me@localhost:5432/next_recipe_hub?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email (optional)
EMAIL_SERVER=""
EMAIL_SERVER_HOST=""
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM=""

# Seeded demo owner (optional, used by seed/import scripts)
SEED_USER_EMAIL="demo@example.com"
SEED_USER_NAME="Demo User"

# OAuth (optional)
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_ID=""
GOOGLE_SECRET=""
```

## 🗄 Database Schema

The application uses Prisma with PostgreSQL and includes models for:

- **User** - User accounts and preferences
- **Recipe** - Recipe data with steps, ingredients, and nutrition
- **Ingredient** - Ingredient database with nutritional info
- **ShoppingList** - User shopping lists
- **Nutrition** - Recipe nutritional information

## 🧪 Testing

- **Unit Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright
- **Coverage:** Configured for comprehensive testing

Run tests:
```bash
npm run test:unit    # Unit tests
npm run test:e2e     # E2E tests
```

## 🚀 Deployment

The application is ready for deployment on platforms like Vercel, Netlify, or any Node.js hosting service.

### Production Checklist

- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up email server (if using email auth)
- [ ] Configure OAuth providers (if using OAuth)
- [ ] Run database migrations
- [ ] Seed production data

## 📝 API Routes

- `GET /api/health` - Health check
- `GET /api/recipes` - Search recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/[id]` - Get recipe by ID
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `GET /api/lists` - Get user lists
- `POST /api/lists` - Create shopping list
- `GET /api/ingredients` - Search ingredients

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
