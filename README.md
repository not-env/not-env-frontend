# Not-Env Frontend

Next.js frontend application for managing environment variables with the not-env backend.

## Features

- **Secure Authentication**: API keys are encrypted and stored in session cookies
- **Sliding Session Expiration**: Session automatically refreshes on user activity (1 hour max)
- **Key Type Detection**: Automatically routes users based on API key type (APP_ADMIN vs ENV_*)
- **Modern UI**: Built with Next.js 14, React, and Tailwind CSS with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running not-env-backend service (default: http://localhost:1212)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:1212
SESSION_SECRET=your-secret-key-here
```

Generate a secure session secret:
```bash
openssl rand -hex 32
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
not-env-frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── app/              # APP_ADMIN interface
│   ├── environment/      # ENV_* interface
│   ├── layout.tsx        # Root layout
│   ├── page.tsx         # Login page
│   └── globals.css      # Global styles
├── hooks/                # React hooks
│   └── useSessionRefresh.ts
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   └── cookie.ts        # Session cookie management
└── package.json
```

## API Key Types

The frontend supports three types of API keys:

- **APP_ADMIN**: Full access to manage environments (routes to `/app`)
- **ENV_ADMIN**: Full access to a specific environment (routes to `/environment`)
- **ENV_READ_ONLY**: Read-only access to a specific environment (routes to `/environment`)

## Session Management

- API keys are encrypted using JWT and stored in HTTP-only cookies
- Sessions expire after 1 hour of inactivity
- Session expiration automatically refreshes on user activity (mouse, keyboard, scroll, touch)
- Sessions are refreshed on every API request

## Docker Deployment

### Using Published Image

```bash
# Generate and save your session secret (save this!)
openssl rand -hex 32
# Save the output from this and use it for your session secret

docker run -d --name not-env-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:1212 \
  -e SESSION_SECRET=[your-session-secret] \
  ghcr.io/not-env/not-env-frontend:latest
```

### Building from Source

```bash
# Generate and save your session secret (save this!)
openssl rand -hex 32
# Save the output from this and use it for your session secret

docker build -t not-env-frontend:local .
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:1212 \
  -e SESSION_SECRET=[your-session-secret] \
  not-env-frontend:local
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:1212` | Backend API URL |
| `SESSION_SECRET` | Yes | None | JWT session secret (generate with `openssl rand -hex 32`) |
| `DISABLE_SECURE_COOKIE` | No | `false` | Set to `true` to allow cookies over HTTP (for local testing) |

**Note:** For the standalone all-in-one deployment (backend + frontend + SQLite), see the [root README](../README.md#available-docker-images).

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Security Notes

- Never commit `.env.local` to version control
- Use a strong, random `SESSION_SECRET` in production
- Ensure `NEXT_PUBLIC_API_URL` uses HTTPS in production
- Session cookies are HTTP-only and secure (in production)

