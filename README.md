# Atlas CSV

Atlas CSV is a polished React and CrewAI web extraction interface that turns a public website URL into a downloadable CSV file. The project combines a storytelling landing page, an animated product walkthrough, a live agent console, progress tracking, CSV parsing, table preview, and a local Vite proxy that keeps API credentials out of the browser.

The goal is simple: make AI-powered scraping feel clear, trustworthy, and usable for non-technical users.

## Project Highlights

- **End-to-end AI workflow UI**: users enter a website URL, start the CrewAI automation, watch status updates, preview structured rows, and download the final CSV.
- **Secure local proxy pattern**: the browser calls local `/api/*` routes while `vite.config.js` attaches the CrewAI API key server-side.
- **Recruiter-ready product polish**: fixed navbar, animated landing sections, hero imagery, tutorial video, creator footbar, and responsive layouts.
- **Fast CSV preview engine**: parses quoted CSV fields, multiline rows, escaped quotes, dynamic column counts, and fallback raw output.
- **Progressive feedback**: shows each automation stage so users are never left waiting without context.
- **Autoplay tutorial experience**: local screencast plays as a clean walkthrough preview and asks users whether they want to replay it.

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | React 18, Vite |
| Styling | Tailwind CDN utility classes |
| Automation backend | CrewAI kickoff/status API |
| Proxy layer | Custom Vite middleware |
| Assets | Local hero image and MP4 tutorial |

## Core User Flow

1. User opens the landing page and sees the product story.
2. User can watch the embedded walkthrough video.
3. User opens the agent console.
4. User pastes any public website URL.
5. React sends a kickoff request to `/api/kickoff`.
6. Vite middleware forwards the request to CrewAI with the API key attached server-side.
7. The app polls `/api/status/:kickoffId` until the agent completes.
8. The final response is normalized into CSV text.
9. The CSV is parsed into a preview table.
10. User downloads `extracted_data.csv`.

## Architecture

```text
Browser
  |
  | POST /api/kickoff
  v
Vite dev server proxy
  |
  | Adds CREWAI_API_KEY server-side
  v
CrewAI kickoff endpoint
  |
  | returns kickoff_id or direct result
  v
Browser polls /api/status/:kickoffId
  |
  v
CrewAI status endpoint
  |
  | final CSV/result
  v
React CSV parser -> preview table -> download
```

## Notable Implementation Details

### Credential Safety

The browser never directly sends the CrewAI API key. Instead, `vite.config.js` defines a custom proxy plugin with:

- `POST /api/kickoff`
- `GET /api/status/:kickoffId`
- Authorization and `x-api-key` headers attached inside the Vite middleware
- JSON error responses for failed upstream calls

### CSV Extraction

The UI handles several possible CrewAI response shapes:

- `tasks`
- `task_outputs`
- `result`
- `final_output`
- `output`
- `raw`
- fenced CSV blocks like ````csv ... ````

The CSV parser supports quoted fields, escaped quotes, blank-line filtering, and dynamic column counts.

### UX Polish

The app includes:

- fixed glass-style navbar
- scroll reveal animations with reduced-motion support
- animated CrewAI workflow diagram
- autoplay tutorial video with replay prompt
- progress stage cards
- responsive CSV preview table
- creator footer with LinkedIn, GitHub, and portfolio icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A CrewAI kickoff endpoint
- Optional CrewAI API key

### Install

```bash
npm install
```

### Configure Environment

Create a `.env` file:

```bash
cp .env.example .env
```

Set the values:

```env
CREWAI_API_URL=https://your-crewai-app.example.com/kickoff
CREWAI_API_KEY=your_api_key_if_required
```

If no URL is provided, the app falls back to the default CrewAI kickoff URL configured in `vite.config.js`.

### Run Locally

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Vercel Deployment

This project now includes serverless routes in `api/` so it can run on Vercel.

Set these environment variables in the Vercel project settings before redeploying:

| Variable | Purpose |
| --- | --- |
| `CREWAI_API_URL` | Full CrewAI kickoff URL, usually ending in `/kickoff`. |
| `CREWAI_API_KEY` | Your active CrewAI API key. Rotate/revoke any old leaked key first. |

Deployment checklist:

1. Add the environment variables in Vercel.
2. Redeploy the project.
3. Open the deployed site and run one extraction.
4. Confirm the browser calls `/api/kickoff` and `/api/status/:id` on your Vercel domain, not a 404.

If you still see `CREWAI_API_URL not configured`, the Vercel environment variable was not saved for the production environment.

## Project Structure

```text
.
├── index.jsx                         # Main React application
├── src/main.jsx                      # React entry point
├── vite.config.js                    # Vite config and CrewAI proxy middleware
├── index.html                        # HTML shell with Tailwind CDN
├── public/assets/data-story-hero.png # Landing page hero/poster image
├── public/assets/tutorial-how-it-works.mp4
├── package.json
└── .env.example
```

## Key Files

- `index.jsx`: contains the landing page, console view, CSV parsing, progress UI, tutorial video, and footer.
- `vite.config.js`: implements the local proxy that protects credentials and forwards kickoff/status requests.
- `public/assets/tutorial-how-it-works.mp4`: local walkthrough video used in the tutorial section.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `CREWAI_API_URL` | CrewAI kickoff endpoint. |
| `CREWAI_API_KEY` | Optional API key attached by the local proxy. |

## Why This Project Stands Out

This project is more than a basic scraper UI. It shows product thinking and engineering judgment:

- The experience explains what the AI system is doing instead of hiding behind a loading spinner.
- The proxy design avoids exposing API secrets in client-side JavaScript.
- The parser handles practical CSV edge cases instead of assuming perfect output.
- The UI is designed for trust: visible progress, preview before download, and clear recovery messaging.
- The implementation stays lightweight with React and Vite, without unnecessary backend complexity.

## Future Improvements

- Add persisted extraction history.
- Add cancellation support for long-running CrewAI jobs.
- Add CSV column editing before download.
- Add drag-and-drop upload for sitemap or URL lists.
- Add automated tests for CSV parsing and response normalization.
- Move Tailwind from CDN to a build-time configuration for production hardening.

## Creator

Built by **Pria Nandhini M A**.

- Portfolio: <https://prianandhini.tech/>
- GitHub: <https://github.com/Prinan-99>
- LinkedIn: <https://www.linkedin.com/in/prianandhinii>

# Atlas-CSV---CrewAI-Agent
