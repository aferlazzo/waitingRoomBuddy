# Waiting Room Buddy

A small Netlify app that uses a Netlify Function to call the OpenAI Responses API.

Production: https://waitingroombuddy.netlify.app/

Netlify deploys the repository root and `netlify/functions` from `main`. The Netlify GitHub app must include `waitingRoomBuddy` in its selected repositories for pushes to trigger automatic deployments. Environment-variable changes take effect on a new deployment.

The PWA uses network-first navigation and installation files, with a cached shell for offline opening. AI requests require a connection. The existing allowance is 20 requests per device per UTC day.
