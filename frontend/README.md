# 🌿 Classflow AI - Frontend

Calm, human-supervised AI automation interface for educators built with React 18, TypeScript, Vite, and Tailwind CSS.

## Directory Structure

```
frontend/
├── public/                 # Static assets (favicons, SVG assets)
├── src/
│   ├── features/           # Feature modules (each feature in its own subfolder)
│   │   ├── home/           # Natural language prompt builder & live workflow preview
│   │   ├── automations/    # "My Automations" listing, filters & deep pipeline inspector
│   │   ├── integrations/   # Universal OAuth & Credential Vault modal
│   │   ├── library/        # Classroom template library & category filter pills
│   │   └── activity/       # Teacher activity log & time-saved metrics
│   ├── components/         # Shared presentation & structural components
│   │   ├── common/         # UI Primitives: Badge, Button, Card, Modal, PageHeading, Toast
│   │   └── layout/         # AppShell, Sidebar, Header, MobileNav, Modals
│   ├── services/           # aiWorkflowService.ts & storageService.ts
│   ├── types/              # TypeScript interface definitions (index.ts)
│   ├── data/               # Seed datasets (mockAutomations, mockTemplates, mockActivities)
│   ├── App.tsx             # Root application view orchestrator
│   ├── main.tsx            # DOM mount entrypoint
│   └── index.css           # Tailwind CSS directives & color tokens
├── index.html              # HTML shell
├── package.json            # Scripts & dependencies
├── vite.config.ts          # Vite build config
├── tsconfig.json           # TypeScript configuration
└── tailwind.config.js      # Custom theme tokens & palette
```

## Running Locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
```
Output will be placed in `frontend/dist/`.
