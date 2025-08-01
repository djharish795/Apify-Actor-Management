# 🕷️ Apify Actor Manager

A web application for managing and executing Apify actors with a modern, interactive interface. Built as part of a learning project to understand web scraping automation and API integration.

## What This Project Does

This app lets you connect to your Apify account, browse your actors, configure their inputs dynamically, and execute them with real-time feedback. I wanted to create something that makes working with Apify actors more visual and user-friendly than the console.

## Why I Built This

I've been learning about web scraping and automation, and Apify's platform seemed really powerful but I found myself always going back to the console to run actors. So I thought - why not build a custom interface that's more intuitive and shows the data better?

## Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript (kept it simple, no frameworks)
- Font Awesome for icons
- Custom CSS animations (probably went overboard here 😅)

**Backend:**
- Node.js with Express
- Axios for API calls
- CORS middleware for development

## Getting Started

### Prerequisites
- Node.js (I'm using v16, but v14+ should work)
- An Apify account with some actors
- Your Apify API key

### Installation

1. **Download/Clone the project**
   ```bash
   git clone <your-repo>
   cd apify-actor-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Go to `http://localhost:3000`

## How to Use

### Step 1: Authentication
- Enter your Apify API key (you can find it in your Apify Console under Integrations)
- Click "Connect to Apify"
- The app will validate your key and load your actors

### Step 2: Choose an Actor
- Browse through your available actors in either grid or list view
- Use the search bar to find specific actors
- Click on any actor to select it

### Step 3: Configure Parameters
- The app automatically generates a form based on the actor's input schema
- Fill in the required parameters (marked with red asterisks)
- Optional: Save your configuration as a preset for later use

### Step 4: Execute and View Results
- Click "Execute Actor" to start the run
- Watch the real-time progress
- View results in multiple formats (cards, table, or raw JSON)
- Download results or share the execution

## Features I'm Proud Of

- **Dynamic Schema Loading**: Automatically creates forms based on each actor's input requirements
- **Real-time Updates**: Shows execution progress and updates
- **Multiple View Modes**: Grid/list for actors, cards/table/JSON for results
- **Theme Support**: Light and dark themes (dark theme looks amazing!)
- **Search & Filter**: Quickly find actors or filter results
- **Responsive Design**: Works on desktop and mobile
- **Keyboard Shortcuts**: Power user features (Ctrl+T for theme, Ctrl+K for search)

## Testing

I've been testing primarily with these actors:
- **apify/web-scraper**: Great for testing complex schemas
- **apify/url-list-scraper**: Simple URL input testing
- **apify/instagram-scraper**: Good for testing authentication flows

Example test configuration for web-scraper:
```json
{
  "startUrls": [{"url": "https://example.com"}],
  "pageFunction": "async function pageFunction(context) { return context.window.document.title; }",
  "maxRequestsPerCrawl": 5
}
```

## Architecture Decisions

### Why Vanilla JavaScript?
I wanted to keep dependencies minimal and really understand the core concepts before adding frameworks. Plus, it loads faster!

### Why This File Structure?
```
/
├── index.html          # Main UI
├── app.js             # All frontend logic
├── styles.css         # Custom styling
├── server.js          # Express backend
└── package.json       # Dependencies
```

Simple and straightforward - each file has a clear purpose.

### Security Considerations
- API keys are never stored in frontend code
- All API calls go through the backend proxy
- Input validation on both client and server side
- Error messages don't expose sensitive information

## Current Limitations

- Only supports single actor execution (no batch processing yet)
- Results are limited to prevent memory issues
- No run history/persistence across sessions
- Some complex input types might not render perfectly

## Future Ideas

Things I'd like to add when I have more time:
- [ ] Execution history with local storage
- [ ] Preset configurations save/load
- [ ] Actor performance analytics
- [ ] Batch execution capabilities
- [ ] Export results to different formats
- [ ] Actor scheduling
- [ ] Collaborative features (share configs)

## What I Learned

This project taught me a lot about:
- Working with external APIs and handling authentication
- Dynamic form generation based on JSON schemas
- Creating responsive, modern web interfaces
- Proper error handling and user feedback
- Backend proxy patterns for API security

## Assumptions Made

- Users have basic knowledge of Apify and web scraping
- Users will primarily run shorter-duration actors (< 5 minutes)
- Users prefer visual interfaces over command-line tools
- API keys are trusted to be valid and have necessary permissions

## Demo Screenshots

The app flows through these main screens:

1. **Authentication**: Clean API key input with validation
2. **Actor Selection**: Visual grid of available actors with search
3. **Configuration**: Auto-generated form based on actor schema
4. **Results**: Structured display with multiple view options

*Note: Screenshots would be included in a real deployment*

## Known Issues

- Occasionally the theme toggle icon doesn't update immediately (refresh fixes it)
- Very long actor descriptions might overflow in grid view
- Results with deeply nested objects could be hard to read in card view

## Contributing

This is a learning project, but if you find bugs or have suggestions, feel free to open an issue!

---

**Project Status**: ✅ Core functionality complete  
**Last Updated**: August 2025  
**Development Time**: ~2 weeks (learning as I go)
