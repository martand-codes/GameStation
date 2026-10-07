# 🎮 GameStation

GameStation is a modern, full-stack game marketplace and platform that connects players with game developers. Built with a scalable architecture, it allows developers to seamlessly publish and manage their games while enabling players to discover, purchase, and play them.

This project was built to demonstrate full-stack proficiency, database normalization, state management, and modern UI/UX design.

## ✨ Key Features

- **Multi-Role Authentication**: Secure role-based access control (`PLAYER`, `DEVELOPER`, `ADMIN`, `OWNER`) with JWT & Bcrypt.
- **Dynamic Game Catalog**: Browse games with rich media (covers, trailers, screenshots) and detailed requirements.
- **Advanced Pricing Engine**: Support for multiple game editions (Standard, Deluxe, Ultimate) and promotional discounts.
- **Shopping Cart & Wishlist**: Intuitive state-managed shopping experience for game purchases.
- **Developer Portal**: Tools for developers to submit games, manage game versions (changelogs, download URLs), and track playtime telemetry.
- **Responsive UI**: Fully responsive, beautifully styled interface using Tailwind CSS v4 and Lucide icons.

## 🧠 AI-Powered Features (Upcoming)

To enhance the user and developer experience, GameStation is integrating the following AI capabilities:
- **Personalized Game Recommendations**: An AI recommendation engine that analyzes player telemetry (playtime, genres) to suggest tailored games.
- **Smart Search & NLP**: Natural language search allowing users to find games using conversational queries (e.g., "Find me a multiplayer RPG with low PC requirements").
- **Automated Content Moderation**: AI-driven moderation for game reviews, user avatars, and developer-submitted assets to maintain a safe community.
- **Dynamic Pricing Optimization**: Machine learning models that suggest optimal discount percentages and sale periods to developers to maximize revenue.
- **AI Game Summaries**: Automatically generated, concise summaries of game lore and changelogs to save time for players.

## 🏗️ Project Architecture

The project is structured as a monorepo containing a full-stack web application:
- **`Frontend/`**: The client-side application built with React & Vite.
- **`Backend/`**: The server-side REST API built with Node.js and Express.
- **`compose.yaml`**: Docker compose file to effortlessly spin up the PostgreSQL database.

## 💻 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **State Management**: React Context API (Cart, Wishlist)
- **Icons & HTTP**: Lucide React, Axios

### Backend
- **Framework**: Express.js (v5)
- **Language**: TypeScript
- **Database ORM**: Prisma (v6)
- **Database**: PostgreSQL (v18)
- **Security & Auth**: JWT (JSON Web Tokens), Bcrypt, Helmet, CORS
- **Validation**: Zod

## 🗄️ Database Schema & Core Entities

The application's data model is highly normalized and scalable, revolving around these core entities:
- **User & Session**: Manages users, roles, and secure authentication sessions.
- **Game**: Core entity handling statuses (`DRAFT`, `PENDING`, `REJECTED`, `PUBLISHED`, `HIDDEN`).
- **GamePricing & Discount**: Manages game editions, base prices, and temporary promotional discounts.
- **GameMedia**: Stores game visual assets (cover, banner, screenshots, trailer).
- **GameVersion**: Tracks game updates, download URLs, and historical changelogs.
- **GameRequirements**: Defines minimum and optimal hardware requirements for bare-metal and enjoyable experiences.
- **GameTelemetry**: Tracks game playtime stats (main story, extras, completionist).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker (for database)

### Installation & Setup

1. **Start the Database**
   ```bash
   docker-compose up -d
   ```

2. **Setup Backend**
   ```bash
   cd Backend
   npm install
   # Configure your .env file with DATABASE_URL and JWT_SECRET
   npm run db:generate
   # Run migrations (if applicable) or push schema
   npx prisma db push
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd Frontend
   npm install
   # Configure your .env file with the Backend API URL
   npm run dev
   ```

## 🔮 Roadmap & Upcoming Features

- **Stripe Integration**: Secure payment processing for checkout.
- **Player Library**: A centralized hub where players can view and download their purchased games.
- **Review & Rating System**: Enable players to leave feedback and rate games they have played.
- **Social Features**: Friend lists, user profiles, and activity feeds.

## 📝 License
ISC
