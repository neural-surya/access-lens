# AccessLens - AI-Powered Accessibility Auditing

AccessLens is a web accessibility testing tool that scans websites for WCAG compliance issues using pa11y and provides AI-powered code fix suggestions via OpenAI.

## Features

- Scan any public website for accessibility issues
- WCAG 2.1 compliance checking
- AI-generated code fix suggestions
- Modern dark mode interface with master-detail layout
- Real-time scanning progress updates
- Issue categorization (errors, warnings, notices)

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** database
- **OpenAI API key**
- **Google Chrome** or Chromium browser (for pa11y scanning)

## Local Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd AccessLens
npm install
```

### 2. Install Puppeteer (for browser-based scanning)

```bash
npm install puppeteer
```

This installs Chromium bundled with Puppeteer. Alternatively, you can use your system Chrome (see step 4).

### 3. Set Up PostgreSQL Database

Create a PostgreSQL database and note the connection URL.

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Required: Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/accesslens

# Required: OpenAI API key for AI-powered fix suggestions
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Use system Chrome instead of Puppeteer's bundled Chromium
# macOS example:
# PUPPETEER_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
# Linux example:
# PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
# Windows example:
# PUPPETEER_EXECUTABLE_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe

# Optional: Change the server port (default: 5000)
# PORT=5000
```

### 5. Run Database Migrations

```bash
npm run db:push
```

### 6. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Troubleshooting

### OpenAI API Key Error

**Error:** `OpenAIError: Missing credentials. Please pass an apiKey`

**Solution:** Make sure your `.env` file contains a valid `OPENAI_API_KEY` and is in the project root directory.

### Port Binding Error (ENOTSUP)

**Error:** `Error: listen ENOTSUP: operation not supported on socket ::1:5000`

**Solution:** This has been fixed in the codebase. If you still encounter it, ensure you have the latest version of the code.

### Scan Failed - Website Inaccessible

**Error:** Scans fail with "Unable to complete the accessibility audit"

**Possible causes and solutions:**

1. **Missing Chrome/Chromium:** Install puppeteer with `npm install puppeteer` or set `PUPPETEER_EXECUTABLE_PATH` in your `.env` to point to your Chrome installation.

2. **Website blocking automated requests:** Some websites block headless browsers. Try scanning a different URL.

3. **Network issues:** Ensure you have internet connectivity and the target URL is accessible.

### Database Connection Error

**Error:** Cannot connect to PostgreSQL

**Solution:** 
- Verify PostgreSQL is running
- Check your `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure the database exists

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Express.js, TypeScript
- **Database:** PostgreSQL with Drizzle ORM
- **Scanning:** pa11y with Puppeteer
- **AI:** OpenAI API

## API Endpoints

- `GET /api/audits` - List all audits
- `POST /api/audits` - Create a new audit (body: `{ "url": "https://..." }`)
- `GET /api/audits/:id` - Get audit details
- `DELETE /api/audits/:id` - Delete an audit
- `GET /api/audits/:id/issues` - Get issues for an audit

## License

MIT
