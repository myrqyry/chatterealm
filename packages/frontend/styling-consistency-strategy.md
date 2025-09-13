# Styling Consistency Strategy — Game / Frontend

Goal
- Reduce visual drift and duplication while keeping the productivity benefits of Tailwind and the component richness of Material-UI (MUI).

Principles
1. Single source of truth for tokens
   - Keep colors, spacing, radii, breakpoints, and typography tokens in one file: `packages/frontend/src/constants/colors.ts` (colors exist) + new `tokens.ts` if needed.
   - Use these tokens to generate both the MUI theme and to keep Tailwind config aligned.

2. Responsibilities
   - Material-UI (MUI): layout primitives, interactive complex components (dialogs, drawers, app bars, menus), accessible focus/keyboard behavior, and components that require rich theming or JS logic.
   - Tailwind CSS: low-level visual tweaks, one-off utility styling, micro-layout inside MUI components, and fast prototyping of small UI pieces.
   - Avoid styling the same component with both systems at once; prefer a single approach per component.

3. Theming & Token sync
   - Create `src/utils/materialTheme/materialTheme.ts` (already exists) to consume tokens.
   - Keep `tailwind.config.js` values (colors, spacing, borderRadius) in sync with tokens. When possible, import generated token JSON into `tailwind.config.js` or keep a short script to validate parity.
   - Use semantic names (e.g., `brand-primary`, `ui-bg`, `accent-01`) across both systems.

4. Component guidelines
   - Wrapper components: expose a small set of props and use MUI internally. Example: `MaterialButton.tsx` wraps `Button` with the project's theme and maps a small set of Tailwind-friendly props if needed.
   - Low-level visuals: prefer Tailwind classes for ephemeral/one-off styles (margins, paddings, flex utilities).
   - Complex widgets: build with MUI primitives + sx prop. Use Tailwind inside MUI where only utility classes are needed for layout that doesn't affect MUI internals.
   - Prefer MUI `sx` over inline styles when the style is theme-aware.

5. Accessibility and Interaction
   - Use MUI components for anything where keyboard focus, aria roles, or complex interactions matter.
   - Keep Tailwind purely presentational (no focus management logic).

6. Linting / Enforcement
   - Add ESLint rules and a short code review checklist:
     - "If component contains aria/focus/keyboard logic -> use MUI".
     - "If styling is just layout/spacing -> Tailwind allowed".
   - Create a small codemod / script to detect MUI components that also use Tailwind classes heavily (optional).

7. Migration & Adoption plan
   - Short-term (1–2 days)
     - Document the rules above in `styling-consistency-strategy.md` (this file).
     - Audit the top 20 UI components and mark ones that violate the guideline.
   - Mid-term (1–2 weeks)
     - Create wrappers for commonly used MUI components (Button, Card, Tooltip, Drawer) to standardize usages.
     - Sync tokens between Tailwind and MUI (generate JSON or small script).
   - Long-term
     - Replace duplicated styles (e.g., `MaterialCard` + Tailwind classes) with the wrapper that accepts utility props but applies theme tokens internally.

8. Small, practical patterns to follow
   - Use `className` for Tailwind utilities, `sx` or `classes` for theme-aware MUI styling.
   - Avoid relying on Tailwind for global theme variables (colors, font sizes). Use tokens instead.
   - When using both on same element, prefer MUI for spacing/margins that affect layout consistency across breakpoints; Tailwind for quick, isolated tweaks.

9. Developer ergonomics
   - Keep `Material*` wrapper components in `src/components/` (they exist).
   - Add short examples in `README.md` of how to style a component correctly with both systems.

10. Automation & tests
    - Add simple jest/unit tests for token parity (colors and spacing exist in both configurations).
    - Add Storybook or visual snapshots for critical components to catch regressions.

References & Action Items
- Proof-of-concept: create one canonical `PrimaryButton` that uses MUI but can accept a `className` for Tailwind utilities.
- Script: `scripts/sync-tokens.js` (optional) — export tokens to JSON and import in `tailwind.config.js`.
- Add lint rule / PR checklist item: "Check styling system used and token usage."

Implementation checklist (project-level)
- [x] Create strategy doc (this file)
- [ ] Audit top UI components for mixed usage (Material + lots of Tailwind)
- [ ] Create MUI wrapper components with consistent prop surface
- [ ] Sync tokens (script or generated file) between MUI theme and tailwind.config.js
- [ ] Add token parity tests
- [ ] Update onboarding README with new guidelines
