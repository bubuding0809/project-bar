<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "Creating or modifying tRPC routers, defining procedures (queries/mutations/subscriptions), configuring middleware, handling input/output validation, or returning errors"
    load: "node_modules/@trpc/server/skills/server-setup/SKILL.md"
  - task: "Building client components, configuring the tRPC React context, fetching or mutating data in UI components, handling cache invalidation or dehydrating state from Next.js server"
    load: "node_modules/@trpc/tanstack-react-query/skills/react-query-setup/SKILL.md"
  - task: "Configuring the tRPC client connection links (httpBatchLink, etc.) or setting up the vanilla client"
    load: "node_modules/@trpc/client/skills/client-setup/SKILL.md"
  - task: "Dealing with data serialization, parsing Dates, Maps, Sets, or configuring the SuperJSON data transformer across server and client"
    load: "node_modules/@trpc/client/skills/superjson/SKILL.md"
<!-- intent-skills:end -->
