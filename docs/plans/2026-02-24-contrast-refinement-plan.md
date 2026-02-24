# Contrast & Visual Depth Refinement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the Luma Vitae landing page from monotone cream/rose to a dynamically contrasted design with a warm espresso-plum anchor, without killing the brand vibe.

**Architecture:** Single-file CSS changes in `index.html` (inline styles). No structural HTML changes except swapping a few color values in inline SVG strokes. All work is in `:root` variables and section-specific CSS rules.

**Tech Stack:** Vanilla HTML/CSS. No build tools. Live reload at `http://localhost:8090/index.html`.

---

### Task 1: Add New Color Variables

**Files:**
- Modify: `index.html:13-28` (CSS `:root` block)

**Step 1: Add new variables to :root**

Add these after the existing variables (after line 28, before the closing `}`):

```css
--dark: #2D1F21;
--dark-warm: #3A2428;
--cream-deep: #F0E6DC;
--rose-deep: #C4868C;
```

Note: `--text-on-dark` is already covered by `--text-cream: #FAF3EB`. No need for a duplicate.

**Step 2: Verify in browser**

Open `http://localhost:8090/index.html`. Nothing should visually change yet — we've only defined variables.

**Step 3: Commit**

```bash
git add index.html
git commit -m "Add dark anchor and deep tone CSS variables"
```

---

### Task 2: Fix Hero Section Contrast

**Files:**
- Modify: `index.html:123-126` (hero overlay gradient)
- Modify: `index.html:144-149` (hero subtitle)

**Step 1: Darken hero bottom gradient**

Change `.hero-overlay` background (line 125):

```css
/* OLD */
background: linear-gradient(180deg, rgba(250,243,235,0.55) 0%, rgba(250,243,235,0.7) 50%, rgba(250,243,235,0.9) 100%);

/* NEW */
background: linear-gradient(180deg, rgba(250,243,235,0.5) 0%, rgba(250,243,235,0.65) 50%, rgba(250,243,235,0.92) 100%);
```

**Step 2: Boost hero subtitle readability**

In `.hero-subtitle` (around line 146), the opacity is embedded in the animation. Change the `opacity: 0.7` inline value. Actually, the 0.7 is overridden by the fadeUp animation which sets `opacity: 1`. The subtitle just inherits from `.hero-subtitle` color styling. The issue is `opacity: 0.7` on line 146 is the initial state before animation. The animated final state is `opacity: 1` via fadeUp. So the subtitle is fine — it's the `color` that matters. No change needed here.

**Step 3: Verify in browser**

The hero bottom should have slightly more cream coverage, making "descubre" and the scroll line more visible.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Improve hero bottom gradient for scroll indicator readability"
```

---

### Task 3: Transform Philosophy Section to Dark Anchor

**Files:**
- Modify: `index.html:195-196` (philosophy overlay CSS)
- Modify: `index.html:200-208` (philosophy text styles)

**Step 1: Change philosophy overlay to dark**

Change `.philosophy-overlay` (line 195-196):

```css
/* OLD */
.philosophy-overlay {
  position: absolute; inset: 0;
  background: rgba(242, 191, 196, 0.88);
}

/* NEW */
.philosophy-overlay {
  position: absolute; inset: 0;
  background: rgba(45, 31, 33, 0.92);
}
```

**Step 2: Verify philosophy text contrast**

The `.philosophy-quote` already uses `color: var(--cream)` (line 202). The `.philosophy-sub` already uses `color: var(--cream)` (line 207). The SVG icon in the HTML (line 533) already strokes `#FAF3EB` (cream). All text should now read beautifully against the dark overlay.

**Step 3: Verify in browser**

Philosophy section should now be a deep warm dark with cream text. The butterfly icon and quote should feel magnetic.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Transform philosophy section to dark espresso-plum anchor"
```

---

### Task 4: Improve About & Classes Section Contrast

**Files:**
- Modify: `index.html:229` (about section label color)
- Modify: `index.html:243` (classes background)

**Step 1: Bump about section label**

`.about-text .section-label` (line 229) already uses `color: var(--text-rose)`. This is `#8C6369` which is ~4.5:1 on cream. Acceptable — leave as-is.

**Step 2: Change classes background to cream-deep**

Change `.classes` (line 243):

```css
/* OLD */
.classes { background: var(--cream-light); padding: 7rem 3rem; }

/* NEW */
.classes { background: var(--cream-deep); padding: 7rem 3rem; }
```

**Step 3: Verify in browser**

Classes section should have a subtle warmth distinction from the about section above it. Cards should "lift" off the slightly darker cream.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Deepen classes section background for tonal rhythm"
```

---

### Task 5: Transform Experience Quote Section to Dark

**Files:**
- Modify: `index.html:332-341` (experience text styles)
- Modify: `index.html:337` (experience icon opacity)
- Modify: `index.html:338-341` (experience quote color)
- Modify: `index.html:671` (SVG stroke color in HTML)

**Step 1: Change experience-text background to dark**

Change `.experience-text` (line 332-334):

```css
/* OLD */
.experience-text {
  padding: 5rem; display: flex; flex-direction: column; align-items: flex-start;
  background: var(--cream);
}

/* NEW */
.experience-text {
  padding: 5rem; display: flex; flex-direction: column; align-items: flex-start;
  background: var(--dark);
}
```

**Step 2: Change experience icon and quote colors**

Change `.experience-icon svg` (line 337):

```css
/* OLD */
.experience-icon svg { height: 42px; width: auto; opacity: 0.5; }

/* NEW */
.experience-icon svg { height: 42px; width: auto; opacity: 0.6; }
```

Change `.experience-quote` (line 338-341):

```css
/* OLD */
.experience-quote {
  font-family: var(--font-body); font-size: clamp(1.15rem, 1.8vw, 1.5rem);
  font-weight: 400; font-style: italic; line-height: 1.8; color: #4D3A3D;
  max-width: 400px;
}

/* NEW */
.experience-quote {
  font-family: var(--font-body); font-size: clamp(1.15rem, 1.8vw, 1.5rem);
  font-weight: 400; font-style: italic; line-height: 1.8; color: var(--cream);
  max-width: 400px;
}
```

**Step 3: Change SVG icon stroke in HTML**

In the experience section HTML (line 671), change the SVG stroke from `#DBA8AD` to `#FAF3EB`:

```html
<!-- OLD -->
<svg ... ><g stroke="#DBA8AD" ...>

<!-- NEW -->
<svg ... ><g stroke="#FAF3EB" ...>
```

**Step 4: Verify in browser**

Experience quote section should now have a dark left panel with cream text, matching the philosophy section's weight. Creates a visual "bookend" effect.

**Step 5: Commit**

```bash
git add index.html
git commit -m "Transform experience quote section to dark anchor bookend"
```

---

### Task 6: Deepen CTA Section Overlay

**Files:**
- Modify: `index.html:360-362` (CTA overlay)

**Step 1: Deepen the CTA overlay**

Change `.cta-overlay` (line 360-362):

```css
/* OLD */
.cta-overlay {
  position: absolute; inset: 0;
  background: rgba(219, 168, 173, 0.85);
}

/* NEW */
.cta-overlay {
  position: absolute; inset: 0;
  background: rgba(196, 134, 140, 0.92);
}
```

**Step 2: Verify in browser**

CTA text "Hoy es un día perfecto para empezar" should now pop clearly against the deeper rose overlay. The "reservar clase" button should read crisply.

**Step 3: Commit**

```bash
git add index.html
git commit -m "Deepen CTA overlay for better text contrast"
```

---

### Task 7: Make Buttons Confident

**Files:**
- Modify: `index.html:234-240` (btn-outline styles)
- Modify: `index.html:373-379` (btn-light styles)

**Step 1: Make btn-outline filled by default**

Change `.btn-outline` (line 234-240):

```css
/* OLD */
.btn-outline {
  display: inline-block; font-family: var(--font-brand); font-size: 0.78rem;
  font-weight: 500; letter-spacing: 0.1em; text-transform: lowercase;
  padding: 0.9rem 2.5rem; border: 1.5px solid var(--rose);
  border-radius: 100px; color: var(--rose); transition: all 0.4s var(--ease-out-expo);
}
.btn-outline:hover { background: var(--rose); color: var(--cream); }

/* NEW */
.btn-outline {
  display: inline-block; font-family: var(--font-brand); font-size: 0.78rem;
  font-weight: 500; letter-spacing: 0.1em; text-transform: lowercase;
  padding: 0.9rem 2.5rem; border: 1.5px solid var(--rose);
  border-radius: 100px; background: var(--rose); color: var(--cream); transition: all 0.4s var(--ease-out-expo);
}
.btn-outline:hover { background: var(--dark-warm); border-color: var(--dark-warm); color: var(--cream); }
```

**Step 2: Add subtle glow to btn-light hover**

Change `.btn-light:hover` (line 379):

```css
/* OLD */
.btn-light:hover { background: var(--cream); color: var(--rose); }

/* NEW */
.btn-light:hover { background: var(--cream); color: var(--rose); box-shadow: 0 4px 20px rgba(250,243,235,0.3); }
```

**Step 3: Verify in browser**

The "conócenos" button should now be a filled rose pill with cream text. On hover, it deepens to espresso-plum. The CTA "reservar clase" button should glow warmly on hover.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Make buttons confident with filled default state and warm hover"
```

---

### Task 8: Bump Contact & Footer Contrast

**Files:**
- Modify: `index.html:387-393` (contact detail label/value)
- Modify: `index.html:422-432` (footer styles)

**Step 1: Bump contact label contrast**

The `.contact-detail-label` (line 388-389) uses `color: var(--text-rose)` which is `#8C6369`. This is acceptable (~4.5:1). Leave as-is.

The `.contact-detail-value` (line 391-393) uses `color: #4D3A3D`. Change to use the CSS variable for consistency:

```css
/* OLD */
.contact-detail-value {
  font-family: var(--font-body); font-size: 1.05rem; font-weight: 400; color: #4D3A3D;
}

/* NEW */
.contact-detail-value {
  font-family: var(--font-body); font-size: 1.05rem; font-weight: 400; color: var(--text-dark);
}
```

**Step 2: Improve footer divider**

Change footer border (line 423):

```css
/* OLD */
footer {
  background: var(--cream); border-top: 1px solid var(--rose-wash);
  ...
}

/* NEW */
footer {
  background: var(--cream); border-top: 1px solid var(--rose-light);
  ...
}
```

**Step 3: Verify in browser**

Contact details should read slightly more clearly. Footer divider line should be a touch more visible.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Improve contact text consistency and footer divider visibility"
```

---

### Task 9: Visual QA Pass

**Step 1: Full scroll-through in browser**

Scroll the entire page top to bottom at `http://localhost:8090/index.html` and verify:
- [ ] Hero: text readable, scroll indicator visible
- [ ] Philosophy: dark background, cream text, high contrast, butterfly visible
- [ ] About: clean, label readable
- [ ] Classes: subtle warm background shift, cards lift
- [ ] Studio: features text readable
- [ ] Products: labels visible
- [ ] Experience: dark left panel, cream text, bookends philosophy
- [ ] CTA: deeper rose, text pops, button inviting
- [ ] Contact: labels and values clear
- [ ] Footer: divider visible

**Step 2: Check mobile (resize to 375px)**

Verify no breakage on mobile layout.

**Step 3: Test language toggle**

Click EN/ES and verify text still renders correctly in both languages.

**Step 4: Fix any issues found**

Address any visual inconsistencies discovered during QA.

**Step 5: Final commit if needed**

```bash
git add index.html
git commit -m "Visual QA fixes"
```
