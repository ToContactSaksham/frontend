/**
 * Sample documents for the A11y Audit Kit. The "broken" page contains a
 * dozen common mistakes; the "fixed" page is the same design done right.
 */

const logo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" rx="10" fill="#7c3aed"/><text x="20" y="27" font-family="sans-serif" font-size="20" font-weight="700" fill="white" text-anchor="middle">N</text></svg>',
  );

const styles = `
  body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; color: #1f2937; background: #ffffff; }
  header { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-bottom: 1px solid #e5e7eb; }
  nav a { margin-left: 16px; color: #374151; text-decoration: none; font-size: 14px; }
  .hero { padding: 48px 24px 32px; }
  .hero h1, .hero h2 { margin: 0 0 8px; font-size: 32px; letter-spacing: -0.02em; }
  .hero p { margin: 0 0 20px; max-width: 48ch; }
  .btn { display: inline-block; padding: 10px 18px; border-radius: 999px; border: 0; background: #7c3aed; color: #fff; font-weight: 600; cursor: pointer; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; padding: 0 24px 32px; }
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
  .card h3, .card h4 { margin: 0 0 6px; font-size: 16px; }
  .muted { color: #9ca3af; font-size: 14px; }
  .subtle { color: #c4c4c4; font-size: 13px; }
  form { padding: 0 24px 40px; display: flex; gap: 8px; flex-wrap: wrap; }
  input { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font: inherit; }
  .icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; display: inline-grid; place-items: center; cursor: pointer; }
  footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; font-size: 12px; }
  .menu { cursor: pointer; color: #374151; font-size: 14px; margin-left: auto; }
`;

export const a11ySamples = {
  broken: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>${styles}</style>
</head>
<body>
  <header>
    <img src="${logo}">
    <strong>Nimbus</strong>
    <nav>
      <a href="#">Product</a>
      <a href="#">Pricing</a>
      <a target="_blank" href="https://example.com/docs">Docs</a>
    </nav>
    <div class="menu" onclick="toggleMenu()">Menu</div>
  </header>

  <section class="hero">
    <h2>Ship dashboards your team will actually open.</h2>
    <p class="muted">Nimbus turns product events into answers. Connect a source, pick a template, share a link.</p>
    <button class="btn" tabindex="2">Start free trial</button>
    <button class="icon-btn" tabindex="1">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
    </button>
  </section>

  <div class="cards">
    <div class="card" id="card">
      <h4>Realtime</h4>
      <p class="subtle">Events appear within 200 ms of being sent.</p>
      <a>Learn more</a>
    </div>
    <div class="card" id="card">
      <h4>Governed</h4>
      <p class="subtle">Row-level permissions on every chart.</p>
      <a href="#">Learn more</a>
    </div>
    <div class="card">
      <h4>Embeddable</h4>
      <p class="subtle">Drop any chart into your own app.</p>
      <a href="/embed"><img src="${logo}" width="16" height="16"></a>
    </div>
  </div>

  <form>
    <input type="email" placeholder="Work email">
    <button type="submit" class="icon-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </button>
  </form>

  <footer class="subtle">© Nimbus Inc.</footer>
</body>
</html>`,

  fixed: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Nimbus — dashboards your team will actually open</title>
  <style>${styles}
    .muted { color: #4b5563; }
    .subtle { color: #4b5563; }
  </style>
</head>
<body>
  <header>
    <img src="${logo}" alt="Nimbus logo" width="40" height="40">
    <strong>Nimbus</strong>
    <nav aria-label="Primary">
      <a href="/product">Product</a>
      <a href="/pricing">Pricing</a>
      <a target="_blank" rel="noopener noreferrer" href="https://example.com/docs">Docs</a>
    </nav>
    <button class="menu" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
  </header>

  <main>
    <section class="hero" aria-labelledby="hero-title">
      <h1 id="hero-title">Ship dashboards your team will actually open.</h1>
      <p class="muted">Nimbus turns product events into answers. Connect a source, pick a template, share a link.</p>
      <button class="btn" type="button">Start free trial</button>
      <button class="icon-btn" type="button" aria-label="Search">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      </button>
    </section>

    <h2 style="padding:0 24px;font-size:20px;">Why teams pick Nimbus</h2>
    <div class="cards">
      <div class="card" id="card-realtime">
        <h3>Realtime</h3>
        <p class="subtle">Events appear within 200 ms of being sent.</p>
        <a href="/features/realtime">Learn more about realtime</a>
      </div>
      <div class="card" id="card-governed">
        <h3>Governed</h3>
        <p class="subtle">Row-level permissions on every chart.</p>
        <a href="/features/governance">Learn more about governance</a>
      </div>
      <div class="card" id="card-embed">
        <h3>Embeddable</h3>
        <p class="subtle">Drop any chart into your own app.</p>
        <a href="/embed"><img src="${logo}" width="16" height="16" alt="Embedding guide"></a>
      </div>
    </div>

    <form aria-label="Sign up">
      <label for="email" style="width:100%;font-size:14px;">Work email</label>
      <input id="email" name="email" type="email" autocomplete="email">
      <input type="submit" value="Get started">
    </form>
  </main>

  <footer class="subtle">© Nimbus Inc.</footer>
</body>
</html>`,
} as const;

export type SampleKey = keyof typeof a11ySamples;
