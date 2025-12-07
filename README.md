# FinBoard - Customizable Finance Dashboard

![FinBoard Dashboard](https://img.shields.io/badge/Next.js-16.0.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)


## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Configuration](#api-configuration)
- [Project Structure](#project-structure)
- [Widget System](#widget-system)
- [API Integration](#api-integration)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

FinBoard is a modern, responsive finance dashboard that enables users to create personalized real-time financial monitoring interfaces. Built with Next.js 14 and React 18, it provides seamless integration with multiple financial APIs through a sophisticated widget management system.

### Key Highlights

- **Real-time Data**: Live financial data with configurable refresh intervals
- **Customizable Widgets**: Drag-and-drop interface with multiple widget types
- **Multi-API Support**: Integration with Finnhub, Yahoo Finance, and Alpha Vantage
- **Responsive Design**: Mobile-first approach with dark/light theme support
- **State Persistence**: Browser storage for dashboard configurations
- **Performance Optimized**: Intelligent caching and rate limiting

## ✨ Features

### 🎛️ Widget Management System

#### Widget Types Available:
- **📊 Finance Cards**: Market gainers, watchlists, performance metrics
- **📈 Interactive Charts**: Candlestick and line charts with multiple timeframes
- **📋 Data Tables**: Paginated stock lists with search and filtering
- **📱 Market Overview**: Broad market performance indicators

#### Widget Operations:
- ✅ **Add Widgets**: Create new widgets by selecting from available types
- ❌ **Remove Widgets**: One-click widget deletion
- 🔄 **Rearrange Layout**: Drag-and-drop positioning
- ⚙️ **Configuration Panel**: Customize data sources and display options

### 🔌 API Integration & Data Handling

#### Supported APIs:
- **Finnhub**: Real-time stock quotes and market data
- **Yahoo Finance**: Historical data and company information
- **Alpha Vantage**: Technical indicators and fundamentals

#### Data Features:
- 🔄 **Real-time Updates**: Configurable auto-refresh (30s, 1m, 5m, 15m)
- 💾 **Smart Caching**: Reduces API calls and improves performance
- 🎯 **Dynamic Mapping**: Flexible field selection from API responses
- 🛡️ **Error Handling**: Graceful fallbacks and rate limit management

### 🎨 User Interface & Experience

- **🌓 Theme Switching**: Seamless light/dark mode toggle
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile
- **⚡ Loading States**: Skeleton loaders and progress indicators
- **🚨 Error States**: User-friendly error messages and retry options
- **🎯 Intuitive Navigation**: Clean, modern interface design

### 💾 Data Persistence

- **🏪 Browser Storage**: Automatic saving of dashboard configurations
- **🔄 State Recovery**: Complete restoration on page refresh
- **📤 Export/Import**: Dashboard configuration backup and sharing
- **⚙️ Settings Management**: API key storage and preferences

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 16.0.6** - React framework with SSR/SSG capabilities
- **React 19.2.0** - Component-based UI library

### Styling & Design
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **CSS Modules** - Scoped styling for components
- **Responsive Design** - Mobile-first approach

### State Management
- **Zustand** - Lightweight state management
- **React Hooks** - Built-in state and effect management

### Data Visualization
- **Chart.js** - Interactive financial charts
- **React Chart.js 2** - React wrapper for Chart.js
- **Candlestick Charts** - OHLC financial data visualization

### API & Data
- **Fetch API** - HTTP client for API requests
- **SWR/React Query** - Data fetching and caching
- **WebSocket** - Real-time data connections

### Development Tools
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **TypeScript** - Type safety (optional)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Financial API keys (see [API Configuration](#api-configuration))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/finboard.git
   cd finboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure API Keys** (see next section)

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Configuration

### Required API Keys

#### 1. Finnhub API
1. Visit [Finnhub.io](https://finnhub.io/register)
2. Create a free account
3. Generate API key from dashboard
4. Add to `.env.local`:
   ```env
   FINNHUB_API_KEY=your_finnhub_api_key_here
   ```

#### 2. Alpha Vantage (Optional)
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get free API key
3. Add to `.env.local`:
   ```env
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
   ```

#### 3. Yahoo Finance
- Uses public endpoints (no API key required)
- Rate limited to prevent abuse

### Environment Variables

```env
# Required - Finnhub API
FINNHUB_API_KEY=your_finnhub_api_key

# Optional - Additional APIs
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
YAHOO_FINANCE_API_KEY=your_yahoo_finance_key

# Optional - Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_REFRESH_INTERVAL=30000
```

### API Rate Limits

| Provider | Free Tier Limits | Recommended Usage |
|----------|------------------|-------------------|
| Finnhub | 60 calls/minute | Real-time quotes |
| Alpha Vantage | 5 calls/minute | Historical data |
| Yahoo Finance | Unofficial limits | Backup data source |

## 📁 Project Structure

```
finboard/
├── 📁 public/                    # Static assets
│   ├── icons/
│   └── images/
├── 📁 src/
│   ├── 📁 app/                   # Next.js App Router
│   │   ├── 📁 api/              # API routes
│   │   │   ├── 📁 stocks/       # Stock data endpoints
│   │   │   └── 📁 ws/           # WebSocket endpoints
│   │   ├── favicon.ico
│   │   ├── globals.css          # Global styles
│   │   ├── layout.js           # Root layout
│   │   └── page.js             # Home page
│   ├── 📁 components/           # React components
│   │   ├── 📁 cards/           # Finance card components
│   │   ├── 📁 charts/          # Chart components
│   │   ├── 📁 tables/          # Table components
│   │   ├── 📁 widgets/         # Widget system
│   │   ├── AddWidgetModal.jsx
│   │   ├── DashboardGrid.jsx
│   │   ├── Header.jsx
│   │   └── SettingsPanel.jsx
│   ├── 📁 hooks/               # Custom React hooks
│   │   ├── useApiData.js
│   │   └── useRealTimeData.js
│   ├── 📁 lib/                 # Utility libraries
│   │   ├── socket-server.js
│   │   └── websocket.js
│   ├── 📁 store/               # State management
│   │   └── useDashboardStore.js
│   ├── 📁 utils/               # Utility functions
│   │   ├── apiUtils.js
│   │   └── formatters.js
│   └── 📁 adapters/            # API adapters
│       ├── alphaVantageAdapter.js
│       ├── finnhubAdapter.js
│       └── yahooFinanceAdapter.js
├── 📄 package.json             # Dependencies
├── 📄 next.config.js           # Next.js configuration
├── 📄 tailwind.config.js       # Tailwind configuration
└── 📄 README.md               # Documentation

```
## 🚀 Deployment

The project is live at:

👉 https://finboard-dashboard-khaki.vercel.app/


## Features

This project has following features:-

- ✅ **Widget Management**: Complete CRUD operations for widgets
- ✅ **API Integration**: Multiple financial API support with adapters
- ✅ **Real-time Data**: Live updates with configurable intervals
- ✅ **Responsive Design**: Mobile-first, cross-device compatibility
- ✅ **State Management**: Zustand for global state, local storage persistence
- ✅ **Performance**: Optimized with caching, lazy loading, and code splitting
- ✅ **Code Quality**: Clean architecture, documentation, and best practices
- ✅ **Theme Switching**: Dynamic dark/light mode implementation
- ✅ **Error Handling**: Comprehensive error states and fallbacks

---


# or
pnpm dev
# or
bun dev
```


