# Chrimata UI/UX Guidelines for AI Agents

## Icons
**CRITICAL**: Use `iconsax-react` for all icons in this project.
DO NOT use `lucide-react` under any circumstances. The user has specifically requested `iconsax-react` for the development of Chrimata.

When adding new icons, import them from `iconsax-react`:
```tsx
import { DocumentText, Judge, Data, Refresh2 } from "iconsax-react";
```

## Styling
- Avoid generic SaaS styling, glow, glassmorphism, or excessive "sparkles".
- The final impression should be: quiet, expensive, institutional, editorial, and unmistakably Chrimata.
- *Exception*: The `ThinkingOrb` component from `thinking-orbs` is explicitly allowed and encouraged to be used for AI loading states, AI feedback, and empty states.
