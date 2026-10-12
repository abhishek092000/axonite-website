# Axonite Website — Grammar & Copy Review

Review date: 2026-10-09
Fixes applied: 2026-10-12 — all 25 findings below have been corrected in the source. The "Issue" column documents the original error; the "Applied fix" column records the text now in the code.

Scope: all user-facing English content in the frontend (`src/**/*.jsx`, `index.html`) and user-visible message strings in the backend (`backend/src/**/*.py`).

Severity key:

- **Critical** — reads as plainly ungrammatical to a visitor; fix before launch.
- **Moderate** — a real grammar / punctuation error that a careful reader will notice.
- **Minor** — style, consistency, or polish issue.

Path note: all paths below are relative to `Axonite_website/` (frontend) or the repo root (backend).

---

## Summary table

| # | Severity | File | Line(s) | Issue | Applied fix |
|---|----------|------|---------|-------|--------------|
| 1 | **Critical** | `src/pages/Contact.jsx` | 459 | Subject–verb disagreement: "A few lines … **is** enough" | "A few lines about the problem **are** enough to start." |
| 2 | **Critical** | `src/pages/Home.jsx` | 29–31 | Missing punctuation after "afford"; unreadable run-on: "that can't afford downtime finance ops, field service, product planning." | "…that can't afford downtime — finance operations, field service, and product planning." |
| 3 | **Critical** | `src/pages/Home.jsx` | 133 | "the checks we agreed together" — ungrammatical | "…until it has passed the checks **we agreed on** together." |
| 4 | Moderate | `src/pages/Home.jsx` | 51 | Double spaces around `<strong>` and missing punctuation/colon produce "In production today three products…" | "**In production today** — three products across finance, field, and product" (remove the extra spaces) |
| 5 | Moderate | `src/pages/Home.jsx` | 55 | Double space before the em dash; redundant "India … across India" | "Pune, India — serving teams nationwide" (single space) |
| 6 | Moderate | `src/pages/Home.jsx` | 90–92 | Punctuation/tense: "Everything we ship, we intend to still be supporting in ten years." (comma splice + split infinitive) | "Everything we ship is built to still be supported in ten years." |
| 7 | Moderate | `src/pages/Services.jsx` | 14 | Comma splice: "We build the product, then we keep it running." | "We build the product **and** then we keep it running." |
| 8 | Moderate | `src/data/content.js` | 58 | Comma splice in "Product Support" description | "We stay on after launch: active maintenance, bug triage, and incremental improvements, so your software never degrades into technical debt." |
| 9 | Moderate | `src/pages/Career.jsx` | 19 | Comma splice: "Core overlap hours, otherwise work when you're sharpest." | "Core overlap hours; otherwise, work when you're sharpest." |
| 10 | Moderate | `src/pages/Career.jsx` | 23 | British spelling "theatre" on an otherwise US-English site | "…no approval theater." (or "no approval drama") |
| 11 | Moderate | `src/pages/Career.jsx` | 176 | Awkward modal + missing serial comma | "City **may contain only** letters, spaces, dots**,** and hyphens." |
| 12 | Moderate | `src/pages/About.jsx` | 129 | Dangling/awkward ending: "…rather than replacing essential control." | "…rather than replacing **essential human** control." |
| 13 | Moderate | `src/pages/About.jsx` | 84 | Faulty parallelism: "working both in-office and remote" | "working both **in the office and remotely**" (or "in-office and remotely") |
| 14 | Minor | `src/pages/Home.jsx` | 9 | Missing serial (Oxford) comma | "Engineers, designers**,** and support specialists" |
| 15 | Minor | `src/pages/Home.jsx` | 52 | Missing serial comma; ambiguous "field and product" | "across finance, field, and product" |
| 16 | Minor | `src/components/Footer.jsx` | 15–17 | Missing serial comma | "finance operations, field service**,** and workforce planning" |
| 17 | Minor | `src/components/Footer.jsx` | 115 | Missing serial comma | "Ledgerline, Fieldpost**,** and Rosterly" |
| 18 | Minor | `src/pages/Career.jsx` | 155, 175 | "cannot be **more** than" should be "cannot be **longer** than" (already correct in `Contact.jsx:108/154`) | "Name cannot be longer than 100 characters." / "City cannot be longer than 20 characters." |
| 19 | Minor | `src/pages/Career.jsx` | 326 | Comma splice / misplaced "below" | "Check back soon, or write to us anyway." |
| 20 | Minor | `src/pages/Career.jsx` | 227, 257 | "the founder…" is used in the third person directly beneath the founder's name | Use the name ("Subodh Mahant brings…" / "David Havenridge helps shape…") |
| 21 | Minor | `src/pages/About.jsx` | 24 | Hyphen as dash and ambiguous abbreviation | Use an en dash: "Pune — IN & US"; consider spelling out "India & USA" |
| 22 | Minor | `src/pages/About.jsx` + others | 46, 214, 244, `Navbar.jsx:65`, `Footer.jsx:104`, `index.html:7–8` | Brand name used inconsistently ("Axonite Technologies" vs "Axonite Technology Pvt Ltd") | Standardized on the legal form **"Axonite Technology Pvt Ltd"** everywhere |
| 23 | Minor | `src/data/content.js` | 145 | Time format "11pm" lacks a space and a space-based style used elsewhere | "11 pm" |
| 24 | Minor | `src/components/chatbot.jsx` | 100 | Sentence fragment in tooltip | "Need help? Ask our AI assistant" |
| 25 | Minor | `backend/src/contact.py` | 60 | Terminology inconsistent with the UI, which calls it "Cloudflare verification"; also "captcha" should be uppercase "CAPTCHA" | "Security verification is missing. Please complete the CAPTCHA." |

---

## Details & evidence

### 1. `src/pages/Contact.jsx:459` — subject–verb disagreement (Critical)

```
A few lines about the problem is enough to start.
We reply within one working day.
```

The subject is plural ("A few lines"), so the verb must be plural: **"A few lines about the problem are enough to start."**

---

### 2. `src/pages/Home.jsx:29–31` — missing punctuation / unreadable run-on (Critical)

```
We build and run product software for teams that can't afford
downtime finance ops, field service, product planning. Fewer
features, all of them load-bearing.
```

There is no boundary between "downtime" and the list that follows, so the sentence reads as nonsense ("afford downtime finance ops"). The same sentence is written correctly in the footer:

```
src/components/Footer.jsx:15–17
Axonite builds and runs product software for teams that cannot
afford downtime — finance operations, field service and workforce
planning. Fewer features, all of them load-bearing.
```

**Fix:** add the em dash and align the wording, e.g. "…for teams that can't afford downtime — finance operations, field service, and product planning."

---

### 3. `src/pages/Home.jsx:132–133` — ungrammatical "agreed together" (Critical)

```
Five stages, repeated every release. Nothing reaches production
until it has passed the checks we agreed together.
```

"agree" is intransitive here and needs a preposition: **"the checks we agreed on together."**

---

### 4–6. `src/pages/Home.jsx` — punctuation and spacing defects

- **Line 51** — literal double spaces around the emphasis tag and no punctuation before the list:
  ```jsx
  <strong className="text-ink font-semibold">In production today  </strong>  three
  products across finance, field and product
  ```
  renders as "In production today three products across finance…". Remove the doubled spaces and insert a dash/colon.

- **Line 55** — `<span>Pune, India  — serving teams across India</span>` has two spaces before the dash, and repeats "India" twice in one clause.

- **Lines 90–92** — "Everything we ship, we intend to still be supporting in ten years." uses a comma splice and a split infinitive; the sentence is also logically odd ("we intend to still be supporting").

---

### 7 & 9. Comma splices in `Services.jsx` and `Career.jsx`

```
Services.jsx:14         We build the product, then we keep it running.
Career.jsx:19           Core overlap hours, otherwise work when you're sharpest.
```

Two independent clauses cannot be joined by a comma alone. Use a conjunction, a semicolon, or a period.

---

### 10. `src/pages/Career.jsx:23` — British/American spelling inconsistency

```
desc: "Courses, books, and conferences — no approval theatre.",
```

The rest of the site is US English ("operations", "-ize" spellings, "program"). Use **"theater"** for consistency, or replace the idiom entirely.

---

### 11. `src/pages/Career.jsx:176` — awkward modal and missing serial comma

```
City can contain only letters, spaces, dots and hyphens.
```

- "can contain only" → **"may contain only"** (permission/constraint, not ability).
- Add the serial comma: "letters, spaces, dots, **and** hyphens."

---

### 12–13. `src/pages/About.jsx` — awkward and non-parallel phrasing

- **Line 129**: "…ensuring that automation supports people and processes rather than **replacing essential control**." The noun "control" cannot really be "replaced" in the singular; **"replacing essential human control"** (or "essential controls") reads correctly.

- **Line 84**: "with engineers and designers working both **in-office and remote**." Not parallel — pair a prepositional phrase with a prepositional phrase: **"both in the office and remotely"**.

---

### 14–17. Serial-comma inconsistency (site-wide)

The site mixes Oxford and non-Oxford commas, sometimes within the same page:

| File | Line | Text |
|------|------|------|
| `Home.jsx` | 9 | "Engineers, designers and support specialists" |
| `Home.jsx` | 52 | "across finance, field and product" |
| `Footer.jsx` | 16 | "finance operations, field service and workforce planning" |
| `Footer.jsx` | 115 | "Ledgerline, Fieldpost and Rosterly" |
| `Career.jsx` | 176 | "letters, spaces, dots and hyphens" |

Elsewhere the same files *do* use the serial comma (e.g. `About.jsx:129`, `content.js:58`). Standardize on one convention (an Oxford comma is recommended, matching the majority of the existing copy).

---

### 18. `src/pages/Career.jsx:155, 175` — inconsistent limit wording

```
Career.jsx:155   Name cannot be more than 100 characters.
Career.jsx:175   City cannot be more than 20 characters.
Contact.jsx:108  Name cannot be longer than 100 characters.
Contact.jsx:154  Company name cannot be longer than 200 characters.
```

"More than" for a character count is imprecise; the Contact page already uses the correct **"longer than"**. Align the Career page.

---

### 20. `src/pages/About.jsx:227, 257` — third-person "the founder" under a named heading

The card heading is the person's name (e.g. "Subodh Mahant"), but the body text refers to "the founder", which reads oddly:

```
With extensive experience in manufacturing automation and
enterprise technology, the founder brings a practical
understanding of industrial operations…
```

Refer to the person directly by name or second person ("Subodh brings…").

---

### 22. Brand-name inconsistency

```
"Axonite Technologies"        — index.html:7, index.html:8 (<title>), About.jsx:46, About.jsx:214, About.jsx:244
"Axonite Technology Pvt Ltd"  — Navbar.jsx:61, Navbar.jsx:65, Footer.jsx:10, Footer.jsx:104, Footer.jsx:115, Home.jsx:22
```

Pick the correct legal entity name and apply it everywhere (including `<title>` and meta description).

---

### 25. `backend/src/contact.py:60` — UI/backend terminology mismatch

```python
"message": "Security verification is missing. Please complete the captcha.",
```

The frontend labels this step "Security verification" / "Cloudflare verification". Use consistent vocabulary and uppercase the acronym: **"Please complete the CAPTCHA."**

---

## Items reviewed and found clean

For completeness, the following content was checked and reads correctly: `src/data/content.js` (products, services, gallery, jobs, blog seeds — apart from #8, #23), `src/pages/Products.jsx` (apart from none), `src/pages/Blog.jsx` prose, `src/admin/pages/*` UI labels, `src/components/Navbar.jsx`, `src/lib/store.jsx` and all backend API response messages except #25.

---

## Verification (2026-10-12)

All 25 findings have been corrected. Files changed:

| File | Findings fixed |
|------|----------------|
| `src/pages/Home.jsx` | 2, 3, 4, 5, 6, 14, 15 |
| `src/pages/Contact.jsx` | 1 |
| `src/pages/Services.jsx` | 7 |
| `src/data/content.js` | 8, 23 |
| `src/pages/Career.jsx` | 9, 10, 11, 18, 19, 20 |
| `src/pages/About.jsx` | 12, 13, 20, 21, 22 |
| `src/components/Footer.jsx` | 16, 17 |
| `src/components/chatbot.jsx` | 24 |
| `index.html` | 22 |
| `backend/src/contact.py` | 25 |

Checks run:

- `npm run build` — **passed** (60 modules transformed, no errors).
- `python -m py_compile backend/src/contact.py` (via `backend/.venv`) — **passed**.

Note: `npm run lint` cannot run in this repo as-is — ESLint 9 is installed but there is no `eslint.config.js` (flat config) file, which is a pre-existing configuration gap unrelated to these copy changes.
