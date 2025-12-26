# A Modern Stock Broking App

A React Native mobile application that simulates a stock trading experience. It enables users to explore real-time market data, manage their watchlist, and make smarter investment decisions — all within a sleek and responsive interface.

---

## Features

### Real-Time Market Data
- **Top Gainers** - Stocks with highest gains today
- **Top Losers** - Stocks with biggest drops today  
- **Most Active** - Highest volume traded stocks
- Live price updates with pull-to-refresh
- Intelligent caching to minimize API calls

### Advanced Charting
- **Line Chart** - Clean price movement visualization
- **Candlestick Chart** - OHLC data for technical analysis
- Interactive touch with crosshair & price labels
- Multiple time ranges: 1D, 1W, 1M, 3M, 1Y, ALL

### Technical Indicators
- **SMA** - Simple Moving Average (20-period)
- **EMA** - Exponential Moving Average (20-period)
- **RSI** - Relative Strength Index (14-period)
- **MACD** - Moving Average Convergence Divergence

### Stock News & Sentiment
- Latest news for each stock
- AI-powered sentiment analysis (Bullish/Bearish/Neutral)
- Source attribution and timestamps

### Watchlist Management
- Create unlimited watchlists
- Add/remove stocks easily
- Multi-select delete with checkboxes
- Persistent storage across sessions

### Smart Search
- Real-time stock symbol search
- Search history with quick access
- Category filters (All, Stocks, Gainers, Losers, Active)
- Trending stocks grid

### Stock Comparison
- Compare 2-3 stocks side by side
- Key metrics comparison table
- Market Cap, P/E, EPS, Dividend Yield, Beta & more

### Beautiful UI/UX
- **Light & Dark themes** with instant toggle
- Smooth animations throughout
- Haptic feedback on interactions
- Animated splash screen
- Responsive design for all devices

---

## Assignment Checklist

### Basic Requirements
- Two tabs - Stocks & Watchlist
- Explore Screen with Top Gainers/Losers/Most Active
- Grid of Stock Cards with avatars
- Watchlist with empty state
- Product/Stock Detail screen with chart
- Add/Remove from Watchlist with icon change
- Popup to create/select Watchlist
- View All with pagination
- Loading, Error, and Empty states
- Clean folder structure
- API caching with expiration

### Brownie Points
- Creative UI with avatars and animations
- Light/Dark theme toggle (instant)
- Extra features (Compare, Search History, Multi-delete)
- Interactive chart with touch

### Additional Features
- Stock News with sentiment analysis
- Stock Comparison (2-3 stocks)
- Search History
- Smooth animations (Reanimated)
- Animated Splash Screen
- Pull-to-Refresh with animation
- Technical Indicators (SMA, EMA, RSI, MACD)
- Candlestick Chart
- Haptic Feedback



---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React Native with Expo SDK 52 |
| **Language** | TypeScript |
| **Navigation** | Expo Router (File-based routing) |
| **State Management** | Zustand |
| **Animations** | React Native Reanimated |
| **Charts** | React Native SVG |
| **HTTP Client** | Axios |
| **Storage** | AsyncStorage |
| **Haptics** | Expo Haptics |
| **Icons** | Expo Vector Icons (Ionicons) |
| **API** | Alpha Vantage |

---

## API Reference

This app uses the [Alpha Vantage API](https://www.alphavantage.co/documentation/) for stock market data:

| Endpoint | Description |
|----------|-------------|
| `TOP_GAINERS_LOSERS` | Top gainers, losers & most active |
| `GLOBAL_QUOTE` | Real-time stock quote |
| `OVERVIEW` | Company fundamentals |
| `TIME_SERIES_INTRADAY` | Intraday price data |
| `TIME_SERIES_DAILY` | Daily price data |
| `SYMBOL_SEARCH` | Stock symbol search |
| `NEWS_SENTIMENT` | News with sentiment |
| `SMA`, `EMA`, `RSI`, `MACD` | Technical indicators |

---

## Key Features Explained

### Intelligent Caching
The app implements smart caching to minimize API calls:
- **Top Movers**: 10 minutes cache
- **Stock Quotes**: 10 minutes cache  
- **Company Overview**: 1 hour cache
- **Search Results**: 30 minutes cache
- **Chart Data**: 15 minutes cache

### Fallback System
When API rate limits are reached, the app automatically falls back to realistic mock data, ensuring the app always displays content.

### API Key Rotation
Support for multiple API keys with automatic rotation to maximize daily API calls.

## Setup and Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/AnujKumarSingh-Code/StockMonitorApp.git
   cd StockSell
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory:

   ```
   API_URL=https://www.alphavantage.co/
   API_KEY=api_key
   ```

4. **Start the App**

   ```bash
   npx expo start
   ```

   Scan the QR code to open it in Expo Go or run on an emulator.

---


## Screenshots

### Dark Mode
<p align="center">
  <img src="screenshots/dark/1.jpeg" width="250" />
  <img src="screenshots/dark/2.jpeg" width="250" />
  <img src="screenshots/dark/3.jpeg" width="250" />
  <img src="screenshots/dark/4.jpeg" width="250" />
  <img src="screenshots/dark/5.jpeg" width="250" />
  <img src="screenshots/dark/6.jpeg" width="250" />
  <img src="screenshots/dark/7.jpeg" width="250" />
  <img src="screenshots/dark/8.jpeg" width="250" />
  <img src="screenshots/dark/9.jpeg" width="250" />
  <img src="screenshots/dark/10.jpeg" width="250" />
  <img src="screenshots/dark/11.jpeg" width="250" />
  <img src="screenshots/dark/12.jpeg" width="250" />
  <img src="screenshots/dark/13.jpeg" width="250" />
  <img src="screenshots/dark/14.jpeg" width="250" />
  <img src="screenshots/dark/15.jpeg" width="250" />
  <img src="screenshots/dark/16.jpeg" width="250" />
  <img src="screenshots/dark/17.jpeg" width="250" />
</p>

### Light Mode
<p align="center">
  <img src="screenshots/light/1.jpeg" width="250" />
  <img src="screenshots/light/2.jpeg" width="250" />
  <img src="screenshots/light/3.jpeg" width="250" />
  <img src="screenshots/light/4.jpeg" width="250" />
  <img src="screenshots/light/5.jpeg" width="250" />
  <img src="screenshots/light/6.jpeg" width="250" />
  <img src="screenshots/light/7.jpeg" width="250" />
  <img src="screenshots/light/8.jpeg" width="250" />
  <img src="screenshots/light/9.jpeg" width="250" />
  <img src="screenshots/light/10.jpeg" width="250" />
  <img src="screenshots/light/11.jpeg" width="250" />
  <img src="screenshots/light/12.jpeg" width="250" />
</p>

---






