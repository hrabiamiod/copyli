# Plan: Następne kroki CoPyli.pl

## Stan obecny (zrealizowane)
- Auth pełny: rejestracja, login, OAuth Google, weryfikacja email, zmiana hasła
- Profil alergika: alergeny, lokalizacje, dziennik objawów, ustawienia alertów
- Email alerty pyłkowe (GitHub Actions cron)
- Panel admina z TOTP MFA i metrykami Cloudflare Edge
- Spersonalizowany dashboard na stronie głównej

---

## Kierunek A — SEO Quick Wins

### A1: Strony roślin `/pylek/roslina/brzoza`
Dedykowane strony dla ~15 alergenów. SEO frazy: "brzoza alergia", "kiedy pyli brzoza".

**Kroki:**
1. Sprawdzić stan `src/pages/PlantPage.tsx` i `PlantsIndexPage.tsx`
2. Dodać opis + sezon pylenia + reaktywność krzyżową (dane statyczne JSON)
3. Endpoint `GET /api/plants/:slug/current` — stężenia rośliny w miastach z D1
4. Mapę stężeń per roślina na stronie
5. Rozszerzyć sitemap o `/pylek/roslina/*`

**Pliki:** `src/pages/PlantPage.tsx`, `src/pages/PlantsIndexPage.tsx`, `functions/api/plants/[slug].ts` (nowy)

---

## Kierunek B — Retencja użytkowników

### B1: Dziennik v2 — wykresy korelacji objawów z pyłkami
1. Wykres liniowy (Recharts) objawów vs stężenie pyłków 30 dni
2. "Twoje wzorce alergiczne" — które rośliny korelują z gorszymi dniami
3. Eksport CSV

**Pliki:** `src/pages/DiaryPage.tsx`

### B2: Powiadomienia push (Service Worker + VAPID)
1. `public/sw.js` — Service Worker
2. `functions/api/user/push-subscription.ts` — zapis w D1
3. VAPID keys w Cloudflare Secrets
4. Integracja z istniejącym systemem alertów

---

## Kierunek C — Growth

### C1: Porównywarka miast — sprawdzić `src/pages/ComparePage.tsx`

### C2: "Bezpieczna trasa" — ranking 5 miast z najniższym pyleniem dziś
Widget na HomePage, wiralowy potencjał.

---

## Priorytet
1. **A1** — strony roślin (mały nakład, duży SEO)
2. **B1** — wykresy dziennika (retencja)
3. **B2** — push (zero koszt infrastruktury)
4. **C2** — ranking miast (growth)
