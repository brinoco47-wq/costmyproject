# Project Atlas — Phase 1 Build Notes
**Date:** September 23, 2026 · **Site:** CostMyProject (costmyproject.me) · **Stack:** static HTML/CSS/JS, no build step

## What was built (resumed after halted attempt)
The halted attempt left only `assets/css/style.css` + empty directories. All HTML pages, the calculator JS, sitemap, robots.txt, and 404 were written fresh in this session. Existing CSS was kept and extended.

## File tree
```
site/
├── index.html                          homepage — positions the toolbox
├── 404.html                            custom 404 (noindex) with navigation
├── robots.txt                          allow all + sitemap reference
├── sitemap.xml                         16 URLs, lastmod 2026-09-23
├── BUILD_NOTES.md                      this file
├── assets/
│   ├── css/style.css                   mobile-first, no frameworks (~9KB)
│   └── js/paint-calculator.js          calculator engine (vanilla JS)
├── calculators/
│   ├── index.html                      calculators hub (paint live; moving/flooring/fence+deck "in workshop")
│   └── paint-cost/index.html           FLAGSHIP calculator + price table + measuring guide + FAQ
│   ├── moving-cost/ (empty — phase 2)
│   ├── flooring-cost/ (empty — phase 2)
│   ├── fence-cost/ (empty — phase 2)
│   └── deck-cost/ (empty — phase 2)
├── cost-guides/
│   ├── index.html                      guides hub
│   ├── interior-paint-cost/index.html  room-by-room table, DIY vs pro, savings
│   ├── exterior-paint-cost/index.html  1-story vs 2-story, siding types, prep
│   ├── ceiling-door-paint-cost/index.html  pro cheat sheet, bundling rule, DIY notes
│   └── paint-finishes/index.html       5 finishes, room cheat sheet, cost angle
├── comparisons/
│   ├── index.html                      comparisons hub
│   └── paint-brand-coverage/index.html Behr vs SW vs BM by cost per sq ft covered
├── about/index.html
├── methodology/index.html              full formula, sources table, cadence, limitations
├── contact/index.html
├── privacy/index.html
├── disclosure/index.html               FTC-ready affiliate/ad disclosure
└── editorial-policy/index.html         sourcing standards, AI-use policy, corrections
```

## Verified data (Sept 23, 2026 — sourced on-page)
- Behr Premium Plus 1 gal $43.98 / 5-gal $39.20·gal⁻¹ / coverage 400 sqft — Home Depot listing #303901388
- SW SuperPaint ~$70/gal (range $60–$77; frequent 30–40% sales) — engineerfix.com MSRP reporting, lightmenpainting.com
- BM Regal Select ~$74/gal (range $70–$78 by sheen) — Ace Hardware listings, O-Gee Paint Miami
- Zinsser Bulls Eye 1-2-3 primer ~$30/gal, coverage 400 — Ace ($29.99), Home Depot 2-gal $46.98
- Pro labor $1–$6/sqft paintable, $25–$75/hr — HomeGuide + HomeAdvisor 2026 guides
- Labor share 70–85% of pro job — digitalestimating.com 2026
- Trim/door/ceiling rates — digitalestimating.com 2026

## UNVERIFIED / estimated — re-check at quarterly review
1. SW SuperPaint coverage default 375 = midpoint of mfr 350–400 spec (not re-pulled from current TDS).
2. BM Regal Select coverage default 425 = midpoint of mfr 400–450 spec (same).
3. SW $70 / BM $74 defaults = midpoints of observed ranges, from secondary sources (not manufacturer direct listings).
4. Exterior paint ~$50/gal in exterior guide table = interior price +15–25% premium per HomeAdvisor (derived, not a listing).
5. Whole-home wall area ≈ floor area × 3 — labeled on-page as estimator's rule of thumb.
6. Two-story access premium ~30% — labeled on-page as estimate.
7. Pro labor default $2.50/sqft — midpoint of $1–$3 band; user-adjustable.
8. Door 21 sqft / window 15 sqft subtraction constants — standard sizes, disclosed.
9. Surface factors (ceiling 0.9, exterior 0.8) — methodological assumptions, disclosed on methodology page.
10. hello@costmyproject.me on contact page — inbox NOT set up; Dom must create/verify the address.

## Overhaul 2026-10-03 — competitor-beating pass (research: research_notes/atlas-competitor-research-20261003-1632/report.md)
Changed files: assets/css/style.css (trust-badge, range, split-bar, incl/excl, 44px tap targets),
assets/js/paint-calculator.js (±25% planning range, materials-vs-labor split + bar, strengthened math panel + "budgeting estimate" framing),
calculators/paint-cost/index.html (trust badge, fully itemized 12×15 worked example, included/excluded checklists, data-freshness note, FAQ accuracy aligned to ±25%),
methodology/index.html (formula block now documents materials/labor split + planning range; new "Why cost estimates disagree across the web" section),
cost-guides/interior-paint-cost/index.html (7-question quote-itemization checklist),
cost-guides/exterior-paint-cost/index.html (included/excluded exterior-quote checklists),
cost-guides/paint-finishes/index.html ("lifetime cost of the wrong finish" worked example),
cost-guides/index.html + comparisons/index.html (visible "Updated September 2026" stamps).
Path convention: parent converted all files to relative internal links for the GitHub Pages project URL (https://brinoco47-wq.github.io/costmyproject/); all new links follow it (../../-style by depth).

### New UNVERIFIED / labeled-estimate items from this overhaul
11. ±25% planning range = stated methodological convention (documented on methodology page), not a measured statistic. Labeled on-page as "planning band".
12. Finishes lifetime-cost example: repaint cycles (flat 3–4 yrs, satin 7–10 yrs in busy hallways) are illustrative assumptions, labeled on-page as "Illustrative, not a guarantee".
13. Methodology "why estimates disagree" cites Houzz $16,007–$17,692 vs RemodelingCalculator $3,560–$5,120 deck figures — third-party-observed via competitor research 2026-10-03, not our measurements.
14. Worked-example numbers on paint calculator page are calculator outputs (verified by functional test 2026-10-03), not independent data.

### Validation done (2026-10-03)
- `node --check` on calculator JS: clean
- Functional test (stubbed DOM): 11/11 PASS — DIY total $137.96 + range $103.47–$172.45; pro total $1,037.96 + range $778.47–$1,297.45; split bar 13/87; primer auto-select; budgeting-estimate framing present
- Link audit: 0 root-absolute internal links remain (all relative per Pages convention); canonicals/sitemap on deployment domain
- Site weight: ~210KB total, under 300KB budget

## Validation done
- `node --check` on calculator JS: clean
- Functional test of calculator math (stubbed DOM): 12×15 room → 360 sqft, 2 gal, $137.96 DIY total, $0.38/sqft; exterior 2500 sqft → 18 gal; SW what-if delta $122.04 — all correct
- Internal link check across 17 HTML files: 0 broken, 0 duplicate titles, every page has meta description + canonical + H1 (except 404, intentionally no meta/noindex)

## Deploy readiness
- ✅ Static, zero build step — deploy `site/` as-is to Cloudflare Pages
- ✅ robots.txt + sitemap.xml ready (submit sitemap to Search Console post-launch)
- ✅ 404.html present (Cloudflare Pages serves it automatically)
- ✅ Breadcrumbs + JSON-LD sitewide (WebSite, BreadcrumbList, SoftwareApplication, FAQPage, Article)
- ⬜ Awaiting Dom: domain claim (costmyproject.me via Student Pack) + DNS → Cloudflare Pages
- ⬜ Post-launch: add GA4 + Search Console, verify hello@costmyproject.me inbox
- ⬜ Next content phase: Cluster 2 moving calculator (days 11–17 per roadmap)

---

# Phase 2 — Cluster 2: Moving (built 2026-10-03)

## What was built
- `calculators/moving-cost/index.html` — FLAGSHIP estimator: home size (studio→5BR), distance (auto local ≤100 mi / long-distance), move-type selector (DIY truck / container / full-service), packing add-ons (none / fragile-only / full), **side-by-side 3-way comparison table for the user's inputs**, "show the math" panel, price-data table, model explainer, FAQ. Engine: `assets/js/moving-calculator.js` (vanilla JS).
- `cost-guides/local-vs-long-distance-move-cost/index.html` — hourly vs. weight billing, 2026 cost tables by home size, shopping advice per type.
- `cost-guides/hidden-moving-fees/index.html` — 9 accessorial charges (stairs, long carry, shuttle, bulky items, materials markup, valuation gap, fuel surcharge, SIT, elevator/COI) with typical ranges labeled as industry estimates + pre-signing checklist.
- `cost-guides/moving-checklist-timeline/index.html` — 8-week timeline, timing tricks (20–30% off-peak savings), first-night box, post-move steps.
- `comparisons/truck-vs-container-vs-movers/index.html` — 3 scenarios priced head-to-head (studio local / 2BR 500mi / 3BR 1,200mi) from the calculator model + trade-off table.
- Hub updates: `calculators/index.html` (moving LIVE, flooring now "Next up"), `cost-guides/index.html` (+Moving section), `comparisons/index.html` (+moving comparison card).
- `sitemap.xml`: +6 URLs (22 total).

## Verified data (Oct 3, 2026 — sourced on-page)
- Local full-service: $400–$1,500 studio, $1,200–$2,500 2BR, $1,500–$4,000 3BR; national avg $1,250 local / $4,300 long-distance — Lugg / American Moving and Storage Association
- 2-mover hourly $80–$100 — ConsumerAffairs 2026
- Crew hours by home size (studio 3–4 … 4BR 10–14) + shipment weights (studio 1,400–2,100 … 4BR 9,800–14,600 lbs) — mygoodmovers.com 2026
- U-Haul: $19.95–$39.95/day + $0.79–$1.29/mi local; one-way 2,500 mi ≈ $2,600 (10ft) / $3,900 (26ft) incl. fuel — easystoragesearch.com 2026
- PODS: $400–$800 local 1BR, $1,800–$3,000 regional, $3,200–$5,500+ cross-country — freightwaves.com 2026
- U-Pack 3BR × 1,000 mi ≈ $4,100 — freightwaves.com 2026
- Pro packing $60–$80/hr per packer; 1BR $280–$650, 2BR $530–$1,000, 3BR $1,030–$2,200 — extraspace.com 2026
- Full-value protection ≈ 1% of declared value; released value $0.60/lb by law — freightwaves.com 2026
- Model spot-checks vs. published ranges: studio 15mi DIY $160 ✓; studio 15mi full $485 ✓; 2BR 500mi full $3,613 ✓; 3BR 1,200mi full+pack $8,495 ✓; 4BR 2,500mi full $15,350 (within mygoodmovers $9,274–$16,842; above Lugg's $7,500–$12,500 band — see UNVERIFIED #11)

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1 items 1–10 unchanged; new items 11–20 for the moving cluster)
11. Long-distance formula `weight × ($0.50 + $0.0003 × miles)` — our linear fit to 2026 published ranges; runs high at 2,000+ mi vs. Lugg's band, in-range vs. mygoodmovers' distance-specific data. Labeled on-page as modeled estimate.
12. $1,200 long-distance minimum charge — industry practice, not a published carrier tariff. Labeled estimate.
13. Default crew hourly rates ($110/2 movers, $150/3, $190/4, $230/5) — typical-market estimates; user-adjustable.
14. One-way truck pricing (`$400+$0.85/mi` 10ft … `$700+$1.25/mi` 26ft) — fitted to 2,500-mi 2026 quotes; interpolates between anchor points. Labeled estimate.
15. Container long-distance (`base + $2.50/mi`) — fitted to PODS/U-Pack 2026 ranges. Labeled estimate.
16. Local container flats ($500 studio … $2,800 5BR) — midpoints of diyvspros.com ranges. Labeled estimates.
17. Full-pack prices ($465 studio … $2,800 5BR) — midpoints of extraspace.com ranges. Labeled estimates.
18. Fragile-only packing = 40% of full-pack — heuristic, not published. Labeled on-page.
19. Hidden-fee ranges (stairs $50–$200, long carry $75–$200, shuttle $200–$500+, bulky $150–$600+, SIT $100–$300/mo, elevator $50–$200, fuel surcharge 5–15%) — typical industry ranges, not carrier tariffs. Each labeled "industry estimate" on-page.
20. Off-peak savings "20–30%" and tipping "$20–$40/mover" — widely reported rules of thumb, not sourced studies. Presented as typical guidance on-page.

## Validation done
- `node --check` on moving-calculator.js: clean
- Functional test of calculator math (stubbed DOM, 8 scenarios): all totals match hand calculations; cheapest-type detection correct in every scenario
- Internal link check across 27 HTML files: 0 broken, 0 duplicate titles, every page has meta description + canonical + H1 (except 404)
- Conventions: all new pages use depth-relative links (`../../`), canonicals + JSON-LD to https://brinoco47-wq.github.io/costmyproject/ (live GitHub Pages project URL); no root-absolute paths in new files

---

# Phase 3 — Cluster 3: Flooring (built 2026-10-03)

## What was built
- `calculators/flooring-cost/index.html` — FLAGSHIP estimator: room dims or direct sqft, 6 materials (LVP/laminate/engineered/solid/tile/carpet), budget/standard/premium tier (= range low/mid/high), DIY vs pro toggle, editable material/underlay/labor prices, waste % (default 10), old-floor removal toggle ($1.50/sqft), subfloor prep toggle ($3.00/sqft), trim flat input, **side-by-side 6-material comparison for the user's inputs**, "show the math" panel, price-data table, worked example, included/excluded checklists. Engine: `assets/js/flooring-calculator.js` (vanilla JS, mirrors paint/moving architecture).
- `cost-guides/flooring-material-comparison/index.html` — 6-material table (installed $/sqft, lifespan, $/sqft/year, waterproof, DIY difficulty), lifetime-cost insight (hardwood cheapest per year), 1,000-sqft 20-year worked example, room-match table, resale ROI.
- `cost-guides/flooring-installation-cost/index.html` — pro labor rates by material, hidden-extras table (removal/prep/furniture/trim/stairs/patterns), DIY decision table, quote-itemization checklist + red flags, 300-sqft LVP worked example.
- `cost-guides/how-to-measure-sqft/index.html` — rectangles, L-shapes (worked example), closets/doorways, stairs per-step method, waste-factor table, measuring mistakes.
- `comparisons/flooring-material-costs/index.html` — 3 scenarios (1,000-sqft whole home / 200-sqft kitchen LVP-vs-tile / 400-sqft basement) + 10/20-year amortization table, all from the calculator model.
- Hub wiring NOT done (parent handles afterward): calculators/index.html, cost-guides/index.html, comparisons/index.html, sitemap.xml untouched per constraint.

## Verified data (Oct 3, 2026 — sourced on-page)
- Material $/sqft ranges: LVP $2.50–$6.00, laminate $1.50–$4.00, engineered $4.00–$10.00, solid $6.00–$12.00, tile $2.50–$8.00, carpet $1.50–$5.00 — Bhumi Calculator 2026, UseCalcPro 2026, Home Depot listings via Woodworking Advisor, Angi 2026
- Pro labor $/sqft: carpet $0.50–$1.50, laminate/LVP $1.50–$4.00, engineered/solid $4.00–$8.00, tile $4.00–$10.00 — UseCalcPro, FlooringCostPro, Woodworking Advisor 2026
- Lifespan ranges: carpet 5–15, laminate 10–20, LVP 15–25, engineered 20–40, tile 25–75, solid 50–100 — industry-standard ranges (AskDoss 2026)
- Resale: hardwood +2.5–3% value, 70–80% recovery (NAR via UseCalcPro); LVP/tile 50–70%, laminate 30–50%, carpet 25–40% (industry-reported)
- Removal $1–$3/sqft, leveling $2–$5/sqft, furniture $50–$150/room, trim $2–$6/lin ft, stairs $40–$100+/step — 2026 installer guides

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1 items 1–10, Phase 2 items 11–20, overhaul items 11–14 unchanged; new items 21–28)
21. All calculator price/labor defaults = midpoints of the published ranges above; tier mapping budget=low/standard=mid/premium=high is a methodological convention. User-adjustable.
22. Removal $1.50 and prep $3.00 defaults = midpoints of industry ranges; labeled "industry estimate" on-page.
23. Underlayment defaults (laminate $0.50, engineered $0.50, tile $1.00 thinset/grout, carpet $0.75 pad, LVP $0.00 attached pad, hardwood $0.25 felt) — typical-material estimates, user-adjustable.
24. Lifespan midpoints used for per-year math (LVP 20, laminate 15, engineered 30, solid 75, tile 50, carpet 10) — midpoints of published ranges.
25. 10/20-year tables = straight-line amortization (installed × horizon ÷ lifespan), illustrative; excludes refinish/grout-refresh costs. Labeled on-page.
26. Trim hint "$150–$400" — typical range, user-entered (default $0).
27. Waste 10% default (12–15% diagonal/irregular) — industry-standard planning convention.
28. Worked-example numbers are calculator outputs (verified by functional test 2026-10-03), not independent data.

## Validation done
- `node --check` on flooring-calculator.js: clean
- Functional test (stubbed DOM, 2 scenarios, 14 checks): ALL PASS — S1 (20×15 LVP DIY): $1,402.50, range $1,051.88–$1,753.13, 330.0 sqft ordered, materials 100%; S2 (12×12 carpet budget pro + removal): $730.80, range $548.10–$913.50, materials $356.40 / labor $374.40, split 49/51
- Internal link check on 5 new files: 0 broken, 0 root-absolute; unique titles/metas site-wide; exactly one H1 per page; all JSON-LD parses
- Conventions: depth-relative links (`../../`), canonicals + JSON-LD to https://brinoco47-wq.github.io/costmyproject/, GA4 tag on all 5 pages, no invented numbers presented as fact

---

# Phase 4 — Cluster 4: Fence (built 2026-10-03)

## What was built
- `calculators/fence-cost/index.html` — FLAGSHIP estimator: linear feet (direct or 2×(L+W) perimeter), 5 materials (wood privacy / chain-link / vinyl / aluminum / composite), quality tier (budget/standard/premium), 3 heights (4/6/8 ft), DIY-vs-pro toggle, terrain selector (level/sloped/rocky), old-fence removal toggle, walk + driveway gate counts with editable prices, editable material/labor/removal prices, permit flat input, **side-by-side 5-material comparison for the user's inputs**, "show the math" panel, price-data table with sources, worked example, included/excluded checklists. Engine: `assets/js/fence-calculator.js` (vanilla JS, mirrors paint/moving/flooring architecture).
- `cost-guides/fence-material-comparison/index.html` — 5-material table (installed $/LF, lifespan, maintenance), 15-year true-cost table (150 LF), material notes, yard-match table.
- `cost-guides/fence-installation-cost/index.html` — pro labor rates by material, extras table (gates/removal/permit/terrain/survey), DIY-vs-pro decision table, 6 quote red flags, 3-bid rule.
- `comparisons/wood-vs-vinyl-fence-cost/index.html` — 150-LF worked example + year-by-year 15-year amortization (crossover ~year 11–12), when-wood-wins / when-vinyl-wins.
- Hub wiring NOT done (parent handles afterward): calculators/index.html, cost-guides/index.html, comparisons/index.html, sitemap.xml untouched per constraint.

## Verified data (Oct 3, 2026 — sourced on-page)
- Installed $/LF: chain-link $13–$25, wood privacy $18–$45, vinyl $30–$55, aluminum $37–$60 — Bhumi Calculator 2026 (material/labor splits), HowMuchFence 2026, UseCalcPro 2026
- Labor $/LF: chain-link $5–$10, wood $8–$15, vinyl $10–$20, aluminum $12–$20 — Bhumi / HowMuchFence 2026
- Lifespans: wood 15–20, vinyl 25–30, chain-link 20–25, aluminum 30+ — industry-standard ranges (Dubya Fence 2026, Bhumi)
- Gates: walk $150–$400, driveway/double $400–$1,500 — HowMuchFence 2026
- Removal $3–$10/LF; permit $20–$400 — Angie Hicks via Livingetc; Home Depot install breakdown
- Wood staining $300–$700 per 150 ft every 2–3 yrs — YardAndGardenGuru 2026

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1 items 1–10, Phase 2 items 11–20, overhaul items 11–14, Phase 3 items 21–28 unchanged; new items 29–36)
29. All calculator material/labor defaults = midpoints of the published ranges above; tier mapping budget=low/standard=mid/premium=high is a methodological convention. User-adjustable.
30. Composite defaults (material $30–$50, labor $14–$22, installed ~$44–$72) — fewer published data points; labor range is an industry estimate. Labeled on-page.
31. Height multipliers (4 ft ×0.85, 8 ft ×1.30 vs. 6-ft baseline) — industry rule of thumb (HowMuchFence 2026), not measured. Labeled on-page as estimate.
32. Terrain adders (sloped +15%, rocky +35% applied to labor portion only) — industry rule of thumb. Labeled on-page as estimate.
33. Removal default $5.00/LF = within $3–$10 industry range; permit default $75 = within $20–$400 range; walk-gate $250 / driveway-gate $800 defaults = within published ranges. User-adjustable.
34. Vinyl gate $450 in wood-vs-vinyl scenario — industry estimate (vinyl gates need reinforced frames).
35. 15-year tables = straight-line, no discounting, illustrative; staining assumed $500/cycle hired (midpoint of $300–$700). Labeled on-page.
36. Worked-example numbers are calculator outputs (verified by functional test 2026-10-03), not independent data.

## Validation done
- `node --check` on fence-calculator.js: clean
- Functional test (stubbed DOM, 3 scenarios, 13 checks): ALL PASS — S1 (150 LF wood std 6ft pro + gate + permit): $4,975.00, range $3,731.25–$6,218.75, $33.17/LF, split 67/33; S2 (150 LF chain-link budget 4ft DIY sloped + removal): $1,770.00, range $1,327.50–$2,212.50, split 58/42; S3 (200 LF vinyl premium 8ft pro rocky + 3 gates): $15,765.00, range $11,823.75–$19,706.25
- Internal link check on 4 new files: 0 broken, 0 root-absolute; unique titles/metas site-wide; exactly one H1 per page; all JSON-LD parses (3 blocks each); GA4 + AdSense tags present on all 4 pages
- Conventions: depth-relative links (`../../`), canonicals + JSON-LD to https://brinoco47-wq.github.io/costmyproject/, "budgeting estimate, not a quote" framing, ±25% planning ranges, dated October 2026 stamps

---

# Phase 5 — Cluster 5: Deck (built 2026-10-04)

## What was built
- `calculators/deck-cost/index.html` — FLAGSHIP estimator: deck dims (L×W) or direct sqft, 4 materials (pressure-treated wood / cedar-redwood / composite / PVC), quality tier (budget/standard/premium), 3 height levels (ground-level / raised / rooftop-second-story), DIY-vs-pro toggle, stair steps input with editable price, railing LF input with editable price, built-in bench count with editable price, old-deck removal toggle, permit flat input, editable material/labor prices, **side-by-side 4-material comparison for the user's inputs**, "show the math" panel, price-data table with sources, worked example (16×20 composite raised pro: $16,296), included/excluded checklists, 6-question FAQ. Engine: `assets/js/deck-calculator.js` (vanilla JS, mirrors fence/flooring architecture).
- `cost-guides/deck-material-comparison/index.html` — 4-material table (installed $/sqft, lifespan, maintenance, $/sqft-per-year), 25-year true-cost table (400 sqft: PT $26,400 / cedar $28,400 / composite $14,900 / PVC $17,700), yard-match table, resale ROI (Remodeling Cost vs. Value 2026: wood 63.9%, composite 64.5%).
- `cost-guides/deck-building-cost-guide/index.html` — pro labor rates ($10–$30/sqft, 40–60% of quote), cost-driver table (height/railing/stairs/footings/permit/removal/benches/lighting), DIY decision table, 6 quote red flags, footing/ledger/final inspection tips.
- `comparisons/composite-vs-wood-deck-cost/index.html` — 400-sqft worked example + year-by-year 25-year amortization (crossover ≈ year 11), when-wood-wins / when-composite-wins.
- Hub wiring NOT done (parent handles afterward): calculators/index.html, cost-guides/index.html, comparisons/index.html, sitemap.xml untouched per constraint.

## Verified data (Oct 4, 2026 — sourced on-page)
- Installed $/sqft: PT wood $15–$30, cedar/redwood $22–$45, composite $30–$58, PVC $35–$85 — FixUpFirst 2026, HonestCasa 2026, RemodelCalculators 2026, IARemodelings 2026 (materials-only and installed figures reconciled; installed ranges used)
- Pro labor $10–$30/sqft, 40–60% of installed quote — Home Depot installer breakdown, FixUpFirst 2026
- Lifespans: PT 10–15, cedar 15–20, composite 25–30, PVC 30–50 — industry-standard ranges (multiple 2026 guides)
- Stairs $50–$100/step; railing wood $25–$40 / composite $40–$80 / metal $60–$120 / cable $80–$150 / glass $150–$300 per LF — HonestCasa, FixUpFirst 2026
- Built-in benches $500–$1,200; old-deck removal $2–$5/sqft — HonestCasa 2026, Puetz Construction 2026
- Permit $100–$800 — Home Depot installer breakdown 2026
- Resale: wood deck addition $17,364 → $11,099 (63.9%); composite $25,623 → $16,533 (64.5%) — 2026 Remodeling Cost vs. Value via HonestCasa
- Wood staining: ~$1,000/cycle per 400 sqft hired every 2 yrs (PT), ~$1,200 every 3 yrs (cedar); composite/PVC wash ~$100/yr — industry estimates (Woodworking Advisor, HonestCasa 2026)

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1 items 1–10, Phase 2 items 11–20, overhaul items 11–14, Phase 3 items 21–28, Phase 4 items 29–36 unchanged; new items 37–44)
37. All calculator material/labor defaults = midpoints of the published ranges above; tier mapping budget=low/standard=mid/premium=high is a methodological convention. User-adjustable.
38. Height multipliers (raised ×1.30, rooftop/second-story ×1.55 vs. ground-level) — industry rule of thumb fitted to FixUpFirst's elevated +$5–$10/sqft and second-story +$10–$20/sqft adders. Labeled estimate on-page.
39. Stair default $75/step = within $50–$100 industry range; railing default $45/LF = within $25–$80 range; bench default $800 = within $500–$1,200 range; removal default $3.00/sqft = within $2–$5 range; permit default $250 = within $100–$800 range. User-adjustable.
40. 25-year tables = straight-line, no discounting, illustrative; staining cycles hired-out ($1,000/2yr PT, $1,200/3yr cedar); rebuild at lifespan midpoint (PT yr 12, cedar yr 18). DIY staining roughly halves maintenance cost — noted on-page.
41. Crossover ≈ year 11 (400-sqft example) — derived from the model above; moves with local staining prices. Labeled illustrative on-page.
42. PVC labor range $16–$26/sqft — fewer published data points; industry estimate. Labeled on-page.
43. Resale ROI figures — third-party 2026 Remodeling Cost vs. Value data via HonestCasa, not our measurements.
44. Worked-example numbers are calculator outputs (verified by functional test 2026-10-04), not independent data.

## Validation done
- `node --check` on deck-calculator.js: clean
- Functional test of the REAL JS (stubbed DOM, 5 scenarios): ALL PASS — S1 (16×20 composite std raised pro + 6 steps + 60 LF railing + $250 permit): $16,296.00, range $12,222.00–$20,370.00, $50.93/sqft; S2 (12×16 PT budget ground DIY + 4 steps + $250 permit): $1,318.00; S3 (20×24 PVC premium rooftop pro + 12 steps + 80 LF railing + removal + $400 permit): $39,076.00, range $29,307.00–$48,845.00, $81.41/sqft; S4 (16×20 cedar std ground DIY): $3,360.00; S5 (400 sqft direct composite std ground pro): $12,400.00. Comparison table + math panel render checks: PASS.
- One real bug caught before delivery: worked-example arithmetic in the HTML ($16,246 → corrected to $16,296 after hand-verification; test then matched).
- Internal link check on 4 new files: 91 links, 0 broken, 0 root-absolute; unique titles/metas site-wide; exactly one H1 per page; all JSON-LD parses (3 blocks each); GA4 + AdSense tags present on all 4 pages
- Conventions: depth-relative links (`../../`), canonicals + JSON-LD to https://brinoco47-wq.github.io/costmyproject/, "budgeting estimate, not a quote" framing, ±25% planning ranges, dated October 2026 stamps, 44px tap targets via shared .seg/.preset CSS

## Phase 6 — roof cluster (2026-10-07)
- `assets/js/roof-calculator.js` (19KB) — engine mirroring deck architecture: state → compute → render, segmented controls, aria-live results, presets (ranch 40×30, colonial 40×50, estate 50×60), side-by-side 5-material comparison, show-the-math panel, materials/labor split bar, ±25% planning range.
- `calculators/roof-cost/index.html` — flagship: footprint L×W or direct roof sqft; pitch selector (shows multiplier); 5 materials (3-tab, architectural, standing-seam metal, wood shake, clay/concrete tile); stories 1/2/3; tear-off layers 0/1/2; DIY/pro toggle (pro recommended, strong DIY warning); ice-shield toggle; skylight re-flash; permit; editable prices; side-by-side 5-material comparison; show-the-math; price table; worked example; included/excluded; 6 FAQ.
- `cost-guides/roof-material-comparison/index.html` — 5-material table: installed $/sqft, lifespan, weight, fire rating, maintenance, 30-year true cost.
- `cost-guides/roof-replacement-cost-guide/index.html` — pro labor rates, tear-off costs, pitch/height multipliers, permits, DIY warning, 6 quote red flags, bid-comparison checklist.
- `comparisons/asphalt-vs-metal-roof-cost/index.html` — 2,000-sqft-footprint head-to-head ($17,120 vs. $33,890) + 30-year amortization.
- Hub wiring NOT done (parent handles afterward): calculators/index.html, cost-guides/index.html, comparisons/index.html, sitemap.xml untouched per constraint.

## Verified data (Oct 7, 2026 — sourced on-page)
- Installed $/sqft (pro, 2026): 3-tab asphalt $3.50–$5.50; architectural asphalt $4.50–$7.50; standing-seam metal $10–$16; wood shake/shingle $8.50–$14; clay/concrete tile $11–$18 — bestroofingestimates 2026, Bhumi Calculator 2026, newenglandmetalroof 2026, Angi 2026, rangerroofingdfw 2026, domroofing 2026
- Materials-only $/sqft: asphalt $1.00–$2.50 / arch $1.50–$3.50; metal $3.00–$8.50 / standing seam $5.00–$12.00; tile $4.00–$10.00 — bestroofingestimates 2026, Bhumi Calculator 2026
- Tear-off $1–$2/sqft per layer (second layer doubles); disposal $300–$600; deck repair ~$85/sheet (industry estimate) — martinandsons-stl 2026, theflhomepros 2026
- Labor share 55–65% of total (higher for metal/tile/slate) — theflhomepros 2026
- Lifespans: 3-tab 15–20; architectural 25–30; metal 40–70; wood 25–40; tile 50–100 — industry-standard ranges (multiple 2026 guides)
- Pitch multipliers are exact geometry √(1+(rise/12)²): 3/12 → 1.031; 6/12 → 1.118; 9/12 → 1.250; 12/12 → 1.414

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1 items 1–10, Phase 2 items 11–20, overhaul items 11–14, Phase 3 items 21–28, Phase 4 items 29–36, Phase 5 items 37–44 unchanged; new items 45–54)
45. All calculator material/labor defaults = midpoints of the published ranges above; tier mapping budget=low/standard=mid/premium=high is a methodological convention. User-adjustable.
46. Steep-pitch labor surcharges (+15% at 9/12, +25% at 12/12) and stories multipliers (+10%/+20%) — industry rules of thumb. Labeled estimates on-page.
47. Ice-and-water shield default $0.75/sqft (within $0.50–$1.00), skylight re-flash default $350 (within $200–$500), permit default $350 (within $150–$500) — industry estimates, user-adjustable.
48. Wood shake labor range $3.50–$6.00/sqft — fewer published data points; industry estimate. Labeled on-page.
49. 30-year true-cost tables = straight-line prorating (total × 30÷lifespan), no discounting, illustrative; maintenance adders are labeled industry estimates (3-tab $1,200; arch $600; metal ~$0; wood $9,000 = ~$1,500 treatment every 5 yrs; tile $5,000 = underlayment refresh ~yr 25).
50. Per-year-of-life figures ($623 arch / $616 metal / $819 3-tab) derived from calculator standard-tier totals ÷ lifespan midpoints; the "metal cheaper from day one" claim rests on these midpoints.
51. Tile structural reinforcement costs are NOT in any number on-site; tile weight 6–10 lbs/sqft is an industry-standard estimate.
52. Worked-example numbers are calculator outputs (verified by functional test 2026-10-07), not independent data.
53. One inconsistency caught and fixed before delivery: calculator FAQ claimed metal ~$29,980 (~$500/yr) from an earlier draft; corrected to calculator-verified $33,890 (~$616/yr).
54. Search volumes for roof keywords UNVERIFIED — validate via Search Console post-launch (standing Project Atlas caveat).
55. Thin-page expansion (2026-10-08): 5 pages expanded to 1,500+ body words. New per-size/per-scenario worked math (room sizes, yard sizes, deck sizes, project sizes) is derived arithmetic from the same mid-range rates already on each page — internally consistent, not independently sourced.
56. Add-on/upcharge tables (popcorn removal, skim coat, slope surcharge, demo, railings, stairs, prep adders, primer/supplies) are industry estimates labeled on-page; confirm against local quotes.
57. DIY-vs-pro tables (time estimates, difficulty ratings, DIY material totals) are methodological conventions / planning estimates.
58. Paint brand tier table budget/premium rows ($25–$100/gal bands) are labeled typical ranges, not verified shelf prices; only the mid-tier row uses verified Sept 2026 prices.
59. Deck material tier table ($15–$45/sqft bands) and cedar notes are labeled planning ranges.
60. Fence resale recoup (50–70%), deck Cost vs. Value (~64%), repaint cycles, and maintenance calendars are industry-reported typicals — labeled as such, not guarantees.
61. New FAQ answers added 2026-10-08 (visible + FAQPage JSON-LD) restate page content; no new sourced facts introduced.

## Validation done
- `node --check` on roof-calculator.js: clean
- Functional test of the REAL JS (stubbed DOM, 3 scenarios): ALL PASS — S1 (40×50, 6/12, arch std, pro, 1 layer, $350 permit): $17,120.00, range $12,840.00–$21,400.00; S2 (30×50, 3/12, 3-tab budget, DIY, 2 layers): $6,536.00; S3 (40×60, 12/12, metal premium, pro, 2-story, shield, 2 skylights, $500 permit): $61,012.20. Pitch conversion, comparison table, and math-panel render checks: PASS.
- One test-harness issue caught: harness bypassed the material-change sync (the browser fires it on change); fixed by simulating change events — all pass.
- Internal link check on 4 new files: 90 links, 0 broken, 0 root-absolute; titles/metas unique site-wide; exactly one H1 per page; all JSON-LD blocks parse (3 per page); GA4 + AdSense tags present on all 4 pages; 44px tap targets via shared .seg CSS

## Phase 7 — state moving pages (2026-10-08)
- 10 pages: `cost-guides/moving-costs-in-{california,texas,florida,new-york,pennsylvania,illinois,ohio,georgia,north-carolina,arizona}/index.html` (1,002–1,120 body words each). Built by generator `~/workspace/project-atlas/build_state_pages.py` (re-runnable).
- Each page: H1 + lede + byline, local cost table (studio/2BR/4BR), long-distance corridor table (4 destinations, mileage band, 2BR/4BR ranges), worked 2BR example with effective hourly rate, 5 state-specific price drivers, DIY-vs-pro table, 4–5 money-saving tips, 5 state-specific FAQs (visible + FAQPage JSON-LD), Related box, methodology note.
- Head: proper canonical (closed tag), OG tags, GA4, AdSense; JSON-LD: Article + BreadcrumbList + FAQPage (all parse).
- Hub wiring + sitemap NOT done (parent handles).

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1–6 items 1–61 unchanged; new items 62–67)
62. State multipliers are CostMyProject planning adjustments, NOT sourced state price data: CA 1.20, NY 1.20, IL 1.10, FL 1.10, TX 1.05, AZ 1.05, GA 1.00, NC 1.00, PA 0.95, OH 0.95. Labeled on-page as methodological conventions.
63. Distance factor (<500 mi → 0.65×, 500–1,000 mi → 0.85× of the 1,000+ mile national base) is a labeled convention, not carrier tariff data.
64. Corridor mileages are approximate (rounded, labeled "~"); actual origin/destination cities within states vary widely.
65. DIY table anchors ($150–$300 local truck, $1,500–$2,500 long-distance truck, $2,000–$4,000 container) are planning estimates derived from the site's existing comparison-page figures — labeled on-page.
66. State-specific factors/tips/FAQs (peak seasons, snowbird inversions, elevator/COI rules, weather patterns) are general industry knowledge, not state-sourced statistics. Cheapest-month claims are typical patterns, not guarantees.
67. Worked-example effective hourly rates are back-derived from the page's own table midpoints (midpoint ÷ 21 crew-hours) — internally consistent arithmetic, not quoted rates.

## Phase 8 — long-tail ranking pages (2026-10-08)
- 5 pages: `cost-guides/deck-inspection-cost/`, `cost-guides/cost-to-paint-12x12-room/`, `cost-guides/roof-cost-per-square/`, `cost-guides/fence-cost-per-foot/`, `cost-guides/how-much-does-lvp-flooring-cost/` (1,210–1,435 body words each).
- Each page: H1 + lede + byline ("Prices checked October 2026"), cost tables, worked examples with ±25% ranges, DIY-vs-pro content, 5 FAQs (visible + FAQPage JSON-LD), Related box.
- Head: proper canonical (closed tag), OG tags, GA4, AdSense; JSON-LD: Article + BreadcrumbList + FAQPage (all parse). One H1/page; 0 broken internal links; relative links only.
- Hub wiring + sitemap NOT done (parent handles).

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1–7 items 1–67 unchanged; new items 68–75)
68. Deck inspection costs ($150–$250 basic, $250–$400 detailed, $300–$500 with certification, $350–$600 multi-level) — contractor-reported industry estimates, labeled on-page.
69. Deck post-inspection repair table ($200–$800 minor … $8,000–$25,000+ full rebuild) — planning figures, labeled on-page; repair-vs-rebuild framing is editorial guidance.
70. Paint tier bands ($25–$35 budget, $40–$60 mid, $65–$90 premium per gallon) — labeled shelf-price ranges, not brand quotes. DIY supply costs ($60–$120) and primer guidance are planning estimates.
71. Roof per-square material-only splits (3-tab $100–$150 … tile $450–$800) — derived estimates from installed rates. Tear-off $100–$200/square, underlayment upgrades $50–$100/square, flashing $200–$500/penetration, decking $50–$100/sheet — industry estimates, labeled.
72. Fence materials-only per-foot splits (~40–60% of installed) — derived estimates. Terrain adders (slope +$3–$8, rocky +$5–$15, removal +$2–$5/ft), gate costs ($150–$400 walk, $400–$1,200 drive), height multipliers — industry estimates, labeled.
73. LVP material tier bands ($2–$3 budget, $3–$5 mid, $5–$8 premium) — labeled retail ranges. Extras (removal $1–$3, leveling $2–$5, underlayment $0.30–$0.60/sq ft) — industry estimates.
74. All worked-example totals are internally consistent derived arithmetic from each page's own mid-range rates — not independently sourced project totals.
75. Pro labor mid-rates used in worked examples (paint $3/sq ft wall, roof tear-off $150/square, LVP install $2.75/sq ft) are mid-range planning figures, not quoted rates.

---

# Phase 9 — Cluster 7: Siding (built 2026-10-09)

## What was built
- `calculators/siding-cost/index.html` — FLAGSHIP estimator: wall sqft (direct or auto from house footprint L×W×stories via 2(L+W)×9ft/story), 5 materials (vinyl / fiber cement / engineered wood / cedar / brick veneer), quality tier, stories 1/2/3, DIY-vs-pro toggle, old-siding tear-off toggle, house-wrap toggle, trim/soffit/fascia flat input, permit flat input, editable material/labor prices, **side-by-side 5-material comparison for the user's inputs**, "show the math" panel, price-data table with sources, worked example (40×50 colonial fiber cement pro: $38,250), included/excluded checklists, 6-question FAQ. Engine: `assets/js/siding-calculator.js` (vanilla JS, mirrors roof/deck architecture).
- `cost-guides/siding-material-comparison/index.html` — 5-material table (installed $/sqft, lifespan, maintenance, fire rating) + 25-year true-cost table (2,500 sqft wall: vinyl $10,938 / brick $13,833 / fiber $18,063 / engwood $19,625 / cedar $34,375 — vinyl wins, brick surprises second).
- `cost-guides/siding-installation-cost-guide/index.html` — pro labor rates by material, tear-off/sheathing section, house-wrap case, trim package guidance, permits, DIY decision table, 6 quote red flags, bid-normalization checklist.
- `comparisons/vinyl-vs-fiber-cement-siding-cost/index.html` — same-house head-to-head (2,500 sqft: $19,300 vs. $28,675, ~49% more upfront) + 25-year amortization (vinyl $16,083 / $643-yr vs. fiber $21,922 / $877-yr — vinyl wins on cost; fiber cement's premium framed as durability/fire/resale, not value).
- Hub wiring + sitemap NOT done (parent handles): calculators/index.html ("Next up: Siding Estimator" placeholder replaced), cost-guides/index.html, comparisons/index.html, sitemap.xml untouched per constraint.

## Verified data (Oct 9, 2026 — sourced on-page)
- Installed $/sqft (pro, 2026): vinyl $3.50–$7.50; engineered wood $5.50–$10; fiber cement $7–$12; cedar/wood $8–$14; brick veneer $9.50–$18 — Angi 2026, HomeGuide 2026, LatestCost 2026, HomeGuide brick guide 2026 (installed ranges reconciled across sources)
- Fiber cement detail: materials $1.50–$4.50/sqft, labor $4–$9/sqft, installed $8–$13 — LatestCost 2026; 30-yr product warranty, ColorPlus 15-yr finish warranty — James Hardie via contractor guides 2026
- Lifespans: vinyl 20–40; engineered wood 20–40; fiber cement 30–50; cedar 20–40; brick veneer 50–100 — industry-standard ranges (Angi/HomeGuide 2026)
- Tear-off $1,000–$3,000 flat for typical home — contractor-published 2026 guides
- Resale ROI: fiber cement 70–85%+, vinyl ~60–70% — industry-reported (labeled estimates)

## UNVERIFIED / estimated — re-check at quarterly review
(Phase 1–8 items 1–75 unchanged; new items 76–83)
76. All calculator material/labor defaults = midpoints of the published ranges above; tier mapping budget=low/standard=mid/premium=high is a methodological convention. Labor default = material base rate regardless of tier (matches roof/deck pattern). User-adjustable.
77. Wall-area formula 2(L+W) × 9 ft/story — 9 ft/story and no window/door deduction are planning conventions (cutouts roughly offset gables/corners/waste), labeled on-page.
78. Stories labor multipliers (+10%/+20%) — industry rule of thumb, labeled estimate.
79. Tear-off default $1.00/sqft (typical $0.50–$1.50), wrap $0.75/sqft (typical $0.50–$1.00), trim $1,500 (typical $1,000–$3,000), permit $300 (typical $200–$500) — industry estimates, user-adjustable, labeled on-page.
80. Engineered wood / cedar / brick labor ranges — fewer published data points; industry estimates, labeled on-page.
81. 25-year true-cost tables = straight-line prorating (total × 25÷lifespan), no discounting, illustrative; maintenance adders labeled industry estimates (vinyl ~$0; engwood $4,000 one repaint; fiber $4,000 one repaint; cedar $12,500 = ~$2,500 stain every 5 yrs; brick $3,000 repoint ~yr 25–30).
82. Sheathing repair ~$75–$100/sheet — industry estimate, labeled on-page.
83. Worked-example numbers are calculator outputs (verified by functional test 2026-10-09), not independent data. Cross-page figures verified consistent (comparison-page $19,300/$28,675 reproducible in calculator; 25-yr table totals match calculator standard-tier outputs).

## Validation done
- `node --check` on siding-calculator.js: clean
- Functional test of the REAL JS (stubbed DOM, 4 scenarios, 14 checks): ALL PASS — S1 (40×50 2-story fiber std pro + tear-off + wrap + $1,500 trim + $300 permit): $38,250.00, range $28,687.50–$47,812.50, $11.81/sqft; S2 (40×30 1-story vinyl budget DIY, no tear-off/wrap/trim/permit): $2,520.00; S3 (50×60 2-story brick premium pro + tear-off + wrap + $2,500 trim + $500 permit): $71,706.00, range $53,779.50–$89,632.50; S4 (2,500 sqft direct engwood std pro): $24,925.00. Comparison table + math panel render checks: PASS.
- Two test-harness issues caught (not code bugs): DIY explainer text contains "Tear-off" (test string refined to row label); labor default is material base rate not tier-adjusted (matches roof pattern — hand-calc corrected).
- Internal link check on 5 new files: 0 broken, 0 root-absolute; titles/metas unique site-wide; exactly one H1 per page; all JSON-LD parses (3 blocks each); GA4 + AdSense + OG tags + byline + October 2026 footer stamps on all pages; canonical tags verified well-formed (closed `>`, regression test for the Oct 9 OG-script bug)
- Tap targets: forms use shared .seg/.preset CSS (44px, validated in earlier phases)
