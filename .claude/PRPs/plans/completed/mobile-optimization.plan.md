# Plan: Mobile Optimization

## Summary
Ruch mobilny stanowi 83% wejsc na copyli.pl, ale aplikacja nie ma hamburger menu (nawigacja calkowicie ukryta na mobile przez `hidden md:flex`), CityPage renderuje sidebar przed glowna trescia w widoku mobilnym, a hero mapa zajmuje 75svh wypychajac dane pod fold. Plan dostarcza 7 atomowych zmian w 5 plikach (2 nowe komponenty + 5 modyfikacji).

## User Story
As a mobile user of copyli.pl, I want smooth navigation and readable content, so that I can check pollen levels on my phone without friction.

## Problem -> Solution

| # | Problem | Solution | Severity |
|---|---------|----------|----------|
| 1 | `Layout.tsx:69` — `<nav className="hidden md:flex">` ukrywa Mapa/Rosliny/Kalendarz/Porady na mobile | Hamburger button + slide-down drawer z tymi samymi linkami | P0 |
| 2 | Linki `/porady/*` niedostepne z mobile nav | Drawer zawiera pelna nawigacje ze stopki | P0 |
| 3 | CityPage sidebar laduje sie przed Walk Index na mobile (DOM order) | CSS `order` na mobile: Walk -> AQI -> Pollen | P1 |
| 4 | Brak sticky CTA "Sprawdz inne miasto" | Sticky bottom bar z CitySearch na CityPage/PlantPage/CalendarPage | P1 |
| 5 | Hero `75svh` blokuje fold na mobile | `60svh` na mobile, `75svh` na md+ przez CSS var | P2 |
| 6 | ForecastChart bez scroll hint | overflow-x: auto + gradient fade po prawej | P2 |

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 7 (2 nowe + 5 modyfikacji)

---

## UX Design

### Before
```
Mobile header: [Logo] [CitySearch?] [UserMenu]
               BRAK NAV — uzytkownik nie moze przejsc do Rosliny/Kalendarz/Porady

CityPage mobile scroll order:
  1. PollenCard (szczegoly)
  2. ForecastChart
  3. HistoryChart
  4. FAQ
  5. WalkIndexCard  <-- TUTAJ dopiero rekomendacja spaceru!
  6. AQI
  7. Inne miasta
```

### After
```
Mobile header: [Logo] [CitySearch?] [UserMenu] [hamburger]
                                                otwiera drawer:
                                                  Mapa / Rosliny / Kalendarz
                                                  Porady / Reaktywnosc / Sezon
                                                  ---
                                                  Profil lub Login

CityPage mobile scroll order:
  1. WalkIndexCard  <-- PIERWSZE: czy wyjsc?
  2. AQI
  3. PollenCard
  4. ForecastChart (scrollowalny horyzontalnie)
  5. HistoryChart / FAQ / Inne miasta
  [sticky bottom: CitySearch "Sprawdz inne miasto"]
```

### Interaction Changes

| Touchpoint | Before | After | Notes |
|------------|--------|-------|-------|
| Header tap (mobile) | Brak nav | Hamburger toggle drawer | aria-expanded, Esc zamyka |
| Drawer | n/a | Slide-down, blur backdrop | click outside = close, route change = close |
| CityPage scroll | Walk Index po 5 sekcjach | Walk Index pierwszy | CSS order, bez zmiany DOM |
| Sticky CTA | Brak | Fixed bottom z CitySearch | safe-area-inset-bottom |
| Hero scroll | 75svh ~600px blocker | 60svh ~480px | sezonowy strip widoczny |
| ForecastChart | Scisniete 5 kol, bez scroll | Scroll + gradient hint | md:flex-1 na desktop |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|----------|------|-------|-----|
| P0 | `src/components/Layout.tsx` | 1-100 | Header struktura, `hidden md:flex` nav, isHome, UserMenu |
| P0 | `src/pages/CityPage.tsx` | 117-290 | Grid `md:grid-cols-[1fr_320px]`, kolejnosc kart |
| P1 | `src/pages/HomePage.tsx` | 129-180 | Hero `75svh`, glass panel |
| P1 | `src/components/ForecastChart.tsx` | 36-83 | Flex container, struktura dnia |
| P2 | `src/components/UserMenu.tsx` | 35-45, 111-120, 147-167 | Dropdown pattern: outside-click, animacja, linki |
| P2 | `src/components/CitySearch.tsx` | 1-50 | `compact` prop, `onSelect` callback |
| P2 | `src/index.css` | 1-60 | CSS vars, brak custom breakpointow |

---

## Patterns to Mirror

### MOBILE_BREAKPOINT_PATTERN
```tsx
// Layout.tsx:69 — jedyny istniejacy wzorzec hide na mobile
<nav className="hidden md:flex items-center" style={{ gap: 2 }}>

// HomePage.tsx:305 — ukrycie na desktopie
<section className="md:hidden" style={{ ... }}>
```
Zasada: `md:` = >=768px (Tailwind defaults). Wszystkie responsive show/hide przez Tailwind utility. Brak custom `@media` w TSX.

### INLINE_STYLE_PATTERN
```tsx
// Layout.tsx:75-90 — wzorzec link z hover
<Link
  to={to}
  className="transition-all"
  style={{ padding: "5px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "var(--ink-2)", textDecoration: "none" }}
  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--forest-soft)"; (e.currentTarget as HTMLElement).style.color = "var(--forest)"; }}
  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "var(--ink-2)"; }}
>
```

### OUTSIDE_CLICK_PATTERN
```tsx
// UserMenu.tsx:35-41
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
  const handler = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener('mousedown', handler);
  return () => document.removeEventListener('mousedown', handler);
}, []);
```

### ANIMATION_PATTERN
```tsx
// UserMenu.tsx:120 — inline keyframes
<style>{`@keyframes menuIn { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }`}</style>
```

### GLASS_PANEL_PATTERN
```tsx
// Layout.tsx:33-36 — sticky header backdrop
background: "rgba(247,242,235,0.88)",
backdropFilter: "blur(24px) saturate(1.6)",
WebkitBackdropFilter: "blur(24px) saturate(1.6)",
borderBottom: "1px solid rgba(24,24,15,0.10)",
```

---

## Files to Change

| File | Action | Justification |
|------|--------|---------------|
| `src/components/Layout.tsx` | Modify | Hamburger button + import MobileDrawer + NAV_LINKS ekstrakcja |
| `src/components/MobileDrawer.tsx` | Create | Slide-down drawer z nav links, focus-trap, Esc |
| `src/components/StickyMobileCTA.tsx` | Create | Fixed bottom bar z CitySearch |
| `src/pages/CityPage.tsx` | Modify | CSS order na mobile + `<StickyMobileCTA />` + padding-bottom |
| `src/pages/PlantPage.tsx` | Modify | Dodac `<StickyMobileCTA />` |
| `src/pages/CalendarPage.tsx` | Modify | Dodac `<StickyMobileCTA />` |
| `src/pages/HomePage.tsx` | Modify | Hero height przez CSS var `--hero-h` |
| `src/components/ForecastChart.tsx` | Modify | overflow-x: auto + gradient fade + md:flex-1 |
| `src/index.css` | Modify | Dodac `--hero-h: 60svh; @media md { --hero-h: 75svh; }` |

## NOT Building
- Bottom tab navigation (app-like) — drawer + sticky CTA wystarczy
- PWA manifest / install prompt
- Touch gesture swipe nawigacja
- Refactor inline styles do CSS modules
- Optymalizacja PollenMap pod mobile (osobny plan)
- Testy vitest UI (projekt nie ma testow UI, zmieniane czesci to CSS/JSX)

---

## Step-by-Step Tasks

### Task 1: Ekstrakcja NAV_LINKS w Layout.tsx
- **ACTION**: Wyciagnac inline tablice nav linkow (Layout.tsx:70) do stalej module-level, wspoldzielonej z MobileDrawer
- **IMPLEMENT**:
  ```tsx
  // Pod importami w Layout.tsx, przed komponentem
  const NAV_LINKS = [
    { to: "/", label: "Mapa" },
    { to: "/pylek/rosliny", label: "Rośliny" },
    { to: "/kalendarz-pylenia", label: "Kalendarz" },
    { to: "/porady/alergia-na-pylek", label: "Porady" },
  ] as const;
  ```
  W desktop nav (linia 70) zastapic inline array przez `NAV_LINKS.map(...)`.
- **MIRROR**: INLINE_STYLE_PATTERN (linki)
- **IMPORTS**: Brak nowych
- **GOTCHA**: `as const` daje narrow typing — ReadonlyArray. Sprawdzic ze `to` i `label` sa kompatybilne
- **VALIDATE**: `npx tsc --noEmit`, desktop nav wygla identycznie jak przed zmiana

### Task 2: MobileDrawer.tsx — nowy komponent
- **ACTION**: Stworzyc `src/components/MobileDrawer.tsx`
- **IMPLEMENT**:
  ```tsx
  import { useEffect, useRef } from "react";
  import { Link, useLocation } from "react-router-dom";
  import { useAuth } from "../context/AuthContext";

  const DRAWER_LINKS = [
    { to: "/", label: "Mapa" },
    { to: "/pylek/rosliny", label: "Rośliny" },
    { to: "/kalendarz-pylenia", label: "Kalendarz" },
    { to: "/porady/alergia-na-pylek", label: "Porady" },
    { to: "/porady/reaktywnosc-krzyzowa", label: "Reaktywność krzyżowa" },
    { to: "/porady/sezon-pylkowy-2026", label: "Sezon pyłkowy 2026" },
  ] as const;

  export default function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { user } = useAuth();
    const firstLinkRef = useRef<HTMLAnchorElement>(null);
    const location = useLocation();

    useEffect(() => { onClose(); }, [location.pathname]);
    useEffect(() => { if (open) firstLinkRef.current?.focus(); }, [open]);
    useEffect(() => {
      const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", fn);
      return () => document.removeEventListener("keydown", fn);
    }, [onClose]);

    if (!open) return null;

    return (
      <>
        <div aria-hidden onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1090, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(2px)" }} />
        <div id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Menu nawigacyjne" style={{
          position:"fixed", top:52, left:0, right:0, zIndex:1100,
          background:"rgba(247,242,235,0.98)",
          backdropFilter:"blur(24px) saturate(1.6)",
          WebkitBackdropFilter:"blur(24px) saturate(1.6)",
          borderBottom:"1px solid rgba(24,24,15,0.10)",
          padding:"12px 16px 20px",
          animation:"drawerIn 0.18s ease",
        }}>
          <style>{`@keyframes drawerIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }`}</style>
          {DRAWER_LINKS.map(({ to, label }, i) => (
            <Link
              key={to}
              ref={i === 0 ? (firstLinkRef as React.RefObject<HTMLAnchorElement>) : undefined}
              to={to}
              style={{ display:"block", padding:"11px 12px", borderRadius:10, fontSize:15, fontWeight:500, color:"var(--ink-2)", textDecoration:"none", transition:"background 0.12s, color 0.12s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="var(--forest-soft)"; (e.currentTarget as HTMLElement).style.color="var(--forest)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background=""; (e.currentTarget as HTMLElement).style.color="var(--ink-2)"; }}
            >{label}</Link>
          ))}
          <div style={{ borderTop:"1px solid rgba(24,24,15,0.07)", marginTop:8, paddingTop:8 }}>
            {user ? (
              <Link to="/profil" style={{ display:"block", padding:"11px 12px", borderRadius:10, fontSize:14, color:"var(--ink-3)", textDecoration:"none" }}>Mój profil</Link>
            ) : (
              <Link to="/login" style={{ display:"block", padding:"11px 12px", borderRadius:10, fontSize:14, fontWeight:600, color:"var(--forest)", textDecoration:"none" }}>Zaloguj się →</Link>
            )}
          </div>
        </div>
      </>
    );
  }
  ```
- **MIRROR**: OUTSIDE_CLICK_PATTERN (backdrop click), ANIMATION_PATTERN, GLASS_PANEL_PATTERN
- **IMPORTS**: `useEffect`, `useRef` (react); `Link`, `useLocation` (react-router-dom); `useAuth` (../context/AuthContext)
- **GOTCHA**: `top: 52` (liczba = px) musi rownal sie wysokosci headera; `useEffect` na `location.pathname` (nie caly location) unika petli na query params; `ref` na Link wymaga `React.RefObject<HTMLAnchorElement>` cast
- **VALIDATE**: Tap hamburger -> drawer z animacja; Esc -> zamkniecie; tap link -> navigate + close; tap backdrop -> close; `npx tsc --noEmit`

### Task 3: Hamburger button w Layout.tsx
- **ACTION**: Dodac `useState(false)` dla drawera i przycisk hamburgera w headerze
- **IMPLEMENT**:
  ```tsx
  const [drawerOpen, setDrawerOpen] = useState(false);

  // W JSX, po UserMenu, przed zamykajacym </div> flex kontenera:
  <button
    className="md:hidden"
    aria-label="Otwórz menu"
    aria-expanded={drawerOpen}
    aria-controls="mobile-drawer"
    onClick={() => setDrawerOpen(v => !v)}
    style={{ background:"transparent", border:"none", padding:8, cursor:"pointer", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--ink-2)" }}
  >
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
      <path d="M0 1H20M0 7H20M0 13H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  </button>

  // Po </header>, przed pioneer banner:
  <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
  ```
- **MIRROR**: INLINE_STYLE_PATTERN, wzorzec button z UserMenu.tsx:82-109
- **IMPORTS**: `MobileDrawer` from `./MobileDrawer`; `useState` juz jest w imporcie
- **GOTCHA**: Hamburger musi byc OSTATNI w flex (po UserMenu) — inaczej pcha UserMenu w lewo; `md:hidden` ukrywa go na desktop
- **VALIDATE**: Mobile: hamburger widoczny, nav ukryty; Desktop: hamburger ukryty, nav widoczny

### Task 4: CityPage — reorder na mobile
- **ACTION**: Walk Index i AQI pierwsze na mobile przez CSS order
- **IMPLEMENT**:
  W grid containerze CityPage (linia ~118), Right sidebar div:
  ```tsx
  // Dodac className "order-first md:order-none" na Right sidebar div
  <div className="order-first md:order-none" style={{ display:"flex", flexDirection:"column", gap:12 }}>
    {/* Walk Index, AQI, porownania, inne miasta, porady */}
  </div>
  ```
  Left div zostawic bez order (domyslne 0, wiec renderuje sie po sidebarze na mobile).

  JESLI CSS order nie dziala w tym grid (sprawdz w devtools): fallback Strategia B —
  wstaw przed Left div:
  ```tsx
  <div className="md:hidden" style={{ display:"flex", flexDirection:"column", gap:12 }}>
    {data && <WalkIndexCard ... />}
    {wx?.aqi != null && <AirQualityCard ... />}
  </div>
  ```
  i owin Walk+AQI w Right sidebar: `<div className="hidden md:flex md:flex-col md:gap-3">`.
- **MIRROR**: MOBILE_BREAKPOINT_PATTERN (`order-first md:order-none`)
- **IMPORTS**: Brak
- **GOTCHA**: CSS `order` dziala w grid i flex; `grid-cols-1` (mobile) z `order-first` na Right = Right laduje wizualnie przed Left; DOM order nie zmieniony (SEO bezpieczne)
- **VALIDATE**: Mobile 375px: Walk/AQI na gorze; Desktop: layout bez zmian

### Task 5: StickyMobileCTA.tsx — nowy komponent
- **ACTION**: Stworzyc `src/components/StickyMobileCTA.tsx`
- **IMPLEMENT**:
  ```tsx
  import CitySearch from "./CitySearch";

  export default function StickyMobileCTA() {
    return (
      <div
        className="md:hidden"
        style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:850,
          padding:"10px 16px calc(10px + env(safe-area-inset-bottom, 0px))",
          background:"rgba(247,242,235,0.94)",
          backdropFilter:"blur(20px) saturate(1.6)",
          WebkitBackdropFilter:"blur(20px) saturate(1.6)",
          borderTop:"1px solid rgba(24,24,15,0.08)",
          boxShadow:"0 -4px 20px rgba(24,24,15,0.06)",
        }}
      >
        <CitySearch compact />
      </div>
    );
  }
  ```
  Dodac `<StickyMobileCTA />` przed `</>` w: `CityPage.tsx`, `PlantPage.tsx`, `CalendarPage.tsx`.
  Dodac `paddingBottom: 80` na main content div w tych stronach (zeby karta nie chowala sie pod CTA).
  NIE dodawac do `HomePage.tsx`.
- **MIRROR**: GLASS_PANEL_PATTERN, MOBILE_BREAKPOINT_PATTERN (`md:hidden`)
- **IMPORTS**: `CitySearch` from `./CitySearch`
- **GOTCHA**: `env(safe-area-inset-bottom, 0px)` — fallback konieczny; z-index 850 (pod drawer 1100, nad trescia); main content potrzebuje `paddingBottom: 80` na mobile
- **VALIDATE**: Mobile: CTA na dole, search dziala; Desktop: niewidoczny; iPhone z notchem: CTA nad home indicator

### Task 6: Hero height — HomePage.tsx + index.css
- **ACTION**: Zredukowac hero height na mobile
- **IMPLEMENT**:
  W `src/index.css` (pod istniejacymi :root vars):
  ```css
  :root {
    --hero-h: 60svh;
  }
  @media (min-width: 768px) {
    :root {
      --hero-h: 75svh;
    }
  }
  ```
  W `HomePage.tsx` linia ~135: `height: "75svh"` -> `height: "var(--hero-h)"`.
- **MIRROR**: CSS vars wzorzec z `src/index.css:5-52`
- **IMPORTS**: Brak
- **GOTCHA**: `min-height` na hero zostawic bez zmian; `60svh` na 390x844 = ~506px (z 660px) — wystarczy miejsca na sezonowy strip
- **VALIDATE**: Mobile portrait: hero ~480-510px; Desktop 1440px: hero ~675px (bez zmian)

### Task 7: ForecastChart — horizontal scroll
- **ACTION**: Owinac flex container w scroll wrapper z gradient hint
- **IMPLEMENT**:
  ```tsx
  // ForecastChart.tsx — zewnetrzny wrapper:
  return (
    <div style={{ position:"relative" }}>
      <div style={{ display:"flex", gap:8, overflowX:"auto", WebkitOverflowScrolling:"touch", paddingBottom:4 }}>
        {days.map(day => (
          <div
            key={day.date}
            className="md:flex-1"
            style={{ flex:"0 0 auto", minWidth:68, /* reszta kolumny bez zmian */ }}
          >
            {/* content dnia */}
          </div>
        ))}
      </div>
      {/* Gradient scroll hint */}
      <div
        aria-hidden
        className="md:hidden"
        style={{ position:"absolute", right:0, top:0, bottom:4, width:32, pointerEvents:"none", background:"linear-gradient(to right, transparent, var(--surface, #f7f2eb))" }}
      />
    </div>
  );
  ```
- **MIRROR**: GLASS_PANEL_PATTERN (gradient), MOBILE_BREAKPOINT_PATTERN (`md:flex-1`, `md:hidden`)
- **IMPORTS**: Brak
- **GOTCHA**: `md:flex-1` przywraca `flex: 1` na desktopie (5 rownych kolumn); bez tego desktop pokazuje 5x68px zamiast pelnej szerokosci; sprawdz ze Tailwind scannuje ForecastChart.tsx
- **VALIDATE**: Mobile: scrollowalny z gradient; Desktop: 5 rownych kolumn jak przed

---

## Testing Strategy

Projekt nie ma testow UI. Walidacja wylacznie manualna + TypeScript.

### Manualna inspekcja (Chrome DevTools)
- iPhone SE (375x667)
- iPhone 14 Pro (393x852)
- Pixel 7 (412x915)
- iPad Mini (768x1024) — granica md breakpoint

### Checklist
- [ ] Hamburger widoczny <768px, nav widoczny >=768px
- [ ] Drawer: 6 linkow + profil/login; Esc zamyka; link = navigate + close; backdrop = close
- [ ] CityPage mobile: Walk/AQI pierwsze
- [ ] Sticky CTA: mobile widoczny, search dziala; desktop ukryty
- [ ] Hero mobile: nizszy (~480px); desktop bez zmian
- [ ] ForecastChart: scrollowalny horyzontalnie z gradient; desktop rowne kolumny

---

## Validation Commands

```bash
# Type check
npx tsc --noEmit

# Testy (nie powinno byc regresji)
npm test

# Dev server do manualnej inspekcji
npm run dev
# Otworz http://localhost:5173 -> Chrome DevTools -> Toggle Device Toolbar -> iPhone 14 Pro

# Commit (ASCII-only — Cloudflare odrzuci polskie znaki)
git commit -m "feat(mobile): hamburger menu, sticky CTA, walk index first, hero height"
git push origin main
```

---

## Acceptance Criteria

- [ ] Hamburger widoczny na <768px, ukryty na >=768px
- [ ] Drawer zawiera 6 linkow nav + profil/login
- [ ] Drawer zamyka sie przez Esc, click outside, route change
- [ ] Walk Index + AQI pierwsze na CityPage mobile
- [ ] Sticky CTA z CitySearch na CityPage / PlantPage / CalendarPage mobile
- [ ] Sticky CTA NIE ma na HomePage
- [ ] `env(safe-area-inset-bottom)` zabezpiecza notch iPhone
- [ ] Hero 60svh na mobile, 75svh na desktop
- [ ] ForecastChart scrollowalny z gradient hint na mobile, identyczny na desktop
- [ ] `npx tsc --noEmit` zero bledow
- [ ] `npm test` 146/146 przechodzi
- [ ] Deploy Cloudflare Pages: success

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| CSS `order` w grid nie daje oczekiwanego wyniku | Srednie | Niskie | Fallback Strategia B opisana w Task 4 |
| Sticky CTA przyslania ostatnia karte | Wysokie | Niskie | `paddingBottom: 80` na main content |
| Drawer z-index koliduje z UserMenu | Srednie | Niskie | Explicit: drawer 1100, backdrop 1090, UserMenu 1000 |
| Commit message z polskimi znakami | Wysokie | Srednie | ASCII-only commit messages |
| `md:flex-1` Tailwind class nie skanowana | Niskie | Srednie | Sprawdz ze Tailwind content config obejmuje ForecastChart.tsx |
