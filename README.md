# Union Taxi React

Converted from the supplied standalone HTML into a Vite + React project.

## Run
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
```

## Important
- The original page depended on Tailwind CDN, Font Awesome CDN and Google Fonts. Those are retained in `index.html` so the visual design remains close to the supplied source.
- The original inline DOM JavaScript was converted to React state/event handling.
- The supplied HTML referenced a local intro MP4 that was not included with the uploaded file. The React project expects `public/assets/union-intro-video.mp4` if you want to restore that intro video. The page otherwise remains functional.
- The original logo filename was not included as a separate uploaded asset, so a clean local SVG placeholder logo was added at `public/assets/union-taxi-logo.svg`.

## Main fixes
1. Converted `onclick`, `oninput`, `onchange`, and `onsubmit` handlers to React handlers.
2. Removed reliance on the global `event` object in `setCalcCar`.
3. Converted booking modal state to React state.
4. Converted fare calculator state to React state.
5. Converted text scaling to React state.
6. Converted pickup/drop-off and vehicle selection inputs to controlled React inputs.
7. Converted scroll reveal and taxi/progress animation into a `useEffect` with cleanup.
8. Added Vite React entry point and project structure.
