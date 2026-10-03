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
