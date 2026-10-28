// Landing page + sign in / sign up, and the route gate for the whole app.
// Flow: #/home (landing) -> Get started -> onboarding as a guest -> #/signup to save -> dashboard
//       #/signin -> dashboard (or onboarding if unfinished)
// The full former landing page is kept on branch backup/landing-page.
// Accounts live in this browser only (localStorage); passwords are stored as SHA-256 hashes.

(() => {
  const ACCOUNTS = 'probank.accounts';
  const SESSION = 'probank.session';
  const ROLE = 'probank.role';
  const DEMO = { email: 'demo@probank.test', name: 'Alex Morgan', business: 'Bennett Precision Manufacturing' };

  const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  const auth = {
    current: () => read(SESSION, null),
    account: (email) => read(ACCOUNTS, {})[email],
    obKey: (email = auth.current()) => `probank.onboarding.${email || 'guest'}`,
    onboarding: (email) => read(auth.obKey(email), {}),
    role: () => read(ROLE, 'client'),
    signIn(email, role = 'client') { write(SESSION, email); write(ROLE, role); },
    signOut() { try { localStorage.removeItem(SESSION); localStorage.removeItem(ROLE); } catch {} location.hash = '#/home'; },
    nextRoute(email = auth.current()) {
      if (auth.role() === 'advisor') return '#/overview';
      return auth.onboarding(email).done ? '#/owner' : '#/welcome';
    },
  };
  window.ProBankAuth = auth;

  // Seeded test account (credentials in TEST_ACCOUNTS.md). Only the password hash is stored here.
  const TEST = { email: 'james@pncnexus.test', name: 'James Bennett', business: 'Bennett Precision Manufacturing', hash: '9fd953642bb77d88b45b626d1f0da32ddae6c940db4e642b2a33eb2acae37291' };
  (() => {
    const accounts = read(ACCOUNTS, {});
    if (accounts[TEST.email]?.hash === TEST.hash) return;
    accounts[TEST.email] = { name: TEST.name, business: TEST.business, hash: TEST.hash };
    write(ACCOUNTS, accounts);
    const ob = read(auth.obKey(TEST.email), {});
    write(auth.obKey(TEST.email), { reason: 'family', ...ob, name: TEST.name, business: TEST.business, email: TEST.email, done: true });
  })();

  async function hash(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const img = (n) => `assets/img/home/${n}`;
  const logo = `<a class="lp-logo" href="#/home"><img src="assets/img/nexus-logo.png" alt="PNC NEXUS"></a>`;

  const ico = {
    go: `<svg width="14" height="12" viewBox="0 0 14 12" fill="none"><path d="M1 6h11m0 0L7.5 1.5M12 6l-4.5 4.5" stroke="#F2711C" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };

  const root = document.createElement('div');
  root.className = 'lp';
  document.body.appendChild(root);

  /* ---------------- Screens ---------------- */

  function landing() {
    const signed = auth.current();
    const head = signed
      ? `<a class="lp-link" href="#" data-signout>Sign out</a><a class="lp-btn fill sm" href="#/signin">Dashboard</a>`
      : `<a class="lp-link" href="#/signin">Sign in</a><a class="lp-btn fill sm" href="#/welcome">Get started</a>`;
    return `
    <a class="lp-skip" href="#lp-main" data-jump="main">Skip to content</a>
    <header class="lp-head"><div class="lp-wrap">
      ${logo}
      <div class="right">${head}</div>
    </div></header>

    <main id="lp-main">
    <section class="lp-hero"><div class="lp-wrap lp-hero-grid">
      <div class="lp-hero-copy">
        <span class="lp-eyebrow">Your business. Your next chapter.</span>
        <h1 class="lp-h1">A thoughtful transition starts with a connected plan.</h1>
        <p>Bring your business goals, family priorities, and advisory team together, from first questions to life beyond a sale.</p>
        <div class="lp-hero-btns">
          <a class="lp-btn fill" href="${signed ? '#/signin' : '#/welcome'}">${signed ? 'Go to dashboard' : 'Start your transition profile'}</a>
          <a class="lp-btn line" href="#" data-demo="client">Explore the sample</a>
        </div>
        <p class="lp-tagline">Owner-guided discovery. Advisor-reviewed decisions. AI support along the way.</p>
        <a class="lp-more" href="#" data-jump="research">Explore the research behind PNC NEXUS ${ico.go}</a>
      </div>
      <figure class="lp-visual">
        <div class="lp-family"><img src="${img('family.png')}" alt="Business owners considering their family's next chapter"></div>
        <figcaption>Business owners considering their family's next chapter</figcaption>
      </figure>
    </div></section>

    <section class="lp-more-than"><div class="lp-wrap">
      <div class="lp-sec-h">
        <h2>More than a transaction.</h2>
        <p>A common understanding of what matters, who is helping, and what happens next.</p>
      </div>
      <div class="lp-cards">
        <article class="lp-card">
          <span class="lp-eyebrow">For business owners</span>
          <h3>Know your options. Keep your voice.</h3>
          <p>Explore transition paths, prepare your family, model liquidity, and control specialist sharing. Your AI assistant helps you prepare for a trusted human conversation.</p>
          <a class="lp-more" href="#" data-demo="client">Explore the owner journey ${ico.go}</a>
        </article>
        <article class="lp-card">
          <span class="lp-eyebrow">For relationship advisors</span>
          <h3>See the whole relationship.</h3>
          <p>Manage your client portfolio, surface cases that need attention, map family relationships, and coordinate the next step across PNC teams.</p>
          <a class="lp-more" href="#" data-demo="advisor">Explore the advisor workspace ${ico.go}</a>
        </article>
      </div>
    </div></section>

    <section class="lp-research" id="lp-research"><div class="lp-wrap lp-research-grid">
      <div>
        <span class="lp-eyebrow">Why connected advice matters</span>
        <h2>Business decisions are personal decisions.</h2>
        <p>PNC's 2026 research found that 89% of surveyed owners value advice integrating business and personal needs; 55% currently use one advisor for both.</p>
        <a class="lp-more" href="#">Read the PNC research ${ico.go}</a>
        <small>300 U.S. private business owners and co-owners; surveyed Nov–Dec 2025. Research supports the problem, not this product's effectiveness.</small>
      </div>
      <div class="lp-figs">
        <div class="lp-fig"><b>89%</b><span>value advice integrating business and personal needs</span></div>
        <div class="lp-fig"><b>55%</b><span>currently use one advisor for both</span></div>
      </div>
    </div></section>

    <section class="lp-one"><div class="lp-wrap">
      <h2>One relationship.</h2>
      <div class="lp-pills"><span>Business</span><i>+</i><span>Family</span><i>+</i><span>Personal wealth</span></div>
    </div></section>
    </main>

    <footer class="lp-foot2"><div class="lp-wrap">PNC NEXUS · Case competition concept · Not an official PNC service</div></footer>
  `;
  }

  function authScreen(mode) {
    const up = mode === 'signup';
    const side = `<aside class="au-side">
      ${logo}
      <div class="copy">
        <h2>${up ? 'Start Your Next Chapter' : 'Welcome Back'}</h2>
        <p>${up ? 'Create your account, then take the 5-minute quick start to see your value range, readiness and pathways.' : 'Pick up where you left off. Your answers, plans and advisory team are waiting.'}</p>
        <ul><li>Preliminary value range</li><li>Transition readiness score</li><li>Matched PNC specialists</li></ul>
      </div>
      <div class="fam"><img src="${img('family.png')}" alt=""></div>
    </aside>`;
    const fields = up
      ? `<div class="au-row2">
          <div class="au-field"><label>Your name</label><input class="au-input" name="name" autocomplete="name" placeholder="Alex Morgan"></div>
          <div class="au-field"><label>Business name</label><input class="au-input" name="business" autocomplete="organization" placeholder="Your company"></div>
        </div>`
      : '';
    return `<div class="au">${side}
      <main class="au-main"><div class="au-card">
        <h1>${up ? 'Create your account' : 'Sign in'}</h1>
        <div class="sub">${up ? 'It takes less than a minute.' : 'Good to see you again.'}</div>
        <form class="au-form" id="auForm" data-mode="${mode}" novalidate>
          ${up ? '' : `<div class="au-field"><label>I am signing in as</label>
            <div class="au-role" role="radiogroup" aria-label="Account type">
              <label><input type="radio" name="role" value="client" ${auth.role() !== 'advisor' ? 'checked' : ''}><span><b>Client</b><small>Business owner</small></span></label>
              <label><input type="radio" name="role" value="advisor" ${auth.role() === 'advisor' ? 'checked' : ''}><span><b>Advisor</b><small>PNC team member</small></span></label>
            </div></div>`}
          ${fields}
          <div class="au-field"><label>Email</label><input class="au-input" name="email" type="email" autocomplete="email" placeholder="you@company.com"></div>
          <div class="au-field"><label>Password</label><div class="au-pw"><input class="au-input" name="password" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" placeholder="${up ? '8+ characters' : 'Your password'}"><button type="button" data-showpw>Show</button></div></div>
          <div class="au-err" id="auErr"></div>
          <div class="au-actions">
            <button class="lp-btn fill" type="submit">${up ? 'Create account' : 'Sign in'}</button>
            <button class="lp-btn line" type="button" data-demo>Explore the demo account</button>
          </div>
        </form>
        <div class="au-switch">${up ? 'Already have an account? <a href="#/signin">Sign in</a>' : 'New to PNC NEXUS? <a href="#/signup">Create an account</a>'}</div>
        <a class="au-back" href="#/home">Back to home</a>
      </div></main>
    </div>`;
  }

  /* ---------------- Router + gate ---------------- */

  const PUBLIC = ['', 'home', 'signin', 'signup'];
  const ONBOARDING = ['welcome', 'start/reason', 'start/notes', 'start/building', 'start/done'];
  const route = () => location.hash.replace(/^#\/?/, '');

  function gate() {
    const r = route();
    const user = auth.current();
    if (!user) {
      // Guests may take the onboarding before creating an account
      if (r === '' || r === 'landing') { location.replace('#/home'); return false; }
      if (!PUBLIC.includes(r) && !ONBOARDING.includes(r)) { location.replace('#/home'); return false; }
      return true;
    }
    // The front page is always shown; it offers a dashboard button when signed in
    if (r === '' || r === 'landing') { location.replace('#/home'); return false; }
    if (r === 'signup') { location.replace(auth.nextRoute()); return false; }
    // Signed in but onboarding unfinished: dashboard routes go to onboarding
    if (auth.role() !== 'advisor' && !PUBLIC.includes(r) && !ONBOARDING.includes(r) && !auth.onboarding().done) { location.replace('#/welcome'); return false; }
    return true;
  }

  function render() {
    if (!gate()) return;
    const r = route();
    if (r === 'home') root.innerHTML = landing();
    else if (r === 'signin' || r === 'signup') root.innerHTML = authScreen(r);
    else { root.classList.remove('show'); return; }
    root.classList.add('show');
    root.scrollTop = 0;
  }

  /* ---------------- Events ---------------- */

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-signout]')) { e.preventDefault(); auth.signOut(); render(); return; }
    const jump = e.target.closest('[data-jump]');
    if (jump) {
      e.preventDefault();
      root.querySelector('#lp-' + jump.dataset.jump)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const pw = e.target.closest('[data-showpw]');
    if (pw) {
      const input = pw.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      pw.textContent = input.type === 'password' ? 'Show' : 'Hide';
      return;
    }
    if (e.target.closest('[data-demo]')) {
      const accounts = read(ACCOUNTS, {});
      accounts[DEMO.email] = { ...accounts[DEMO.email], name: DEMO.name, business: DEMO.business };
      write(ACCOUNTS, accounts);
      const ob = auth.onboarding(DEMO.email);
      write(auth.obKey(DEMO.email), { ...ob, name: DEMO.name, business: DEMO.business, reason: ob.reason || 'family', done: true });
      const role = e.target.closest('[data-demo]').dataset.demo || root.querySelector('input[name="role"]:checked')?.value || 'client';
      auth.signIn(DEMO.email, role);
      location.hash = auth.nextRoute(DEMO.email);
    }
  });

  root.addEventListener('submit', async (e) => {
    if (e.target.id === 'lpNews') {
      e.preventDefault();
      const input = e.target.querySelector('input');
      const ok = /^\S+@\S+\.\S+$/.test(input.value);
      root.querySelector('#lpNewsOk').textContent = ok ? 'Thanks! You are on the list.' : 'Please enter a valid email address.';
      if (ok) input.value = '';
      return;
    }
    if (e.target.id !== 'auForm') return;
    e.preventDefault();
    const f = e.target;
    const up = f.dataset.mode === 'signup';
    const v = Object.fromEntries(new FormData(f));
    const errEl = f.querySelector('#auErr');
    f.querySelectorAll('.au-input').forEach((el) => el.classList.remove('err'));
    const fail = (name, msg) => { if (name) { f[name].classList.add('err'); f[name].focus(); } errEl.textContent = msg; };
    const email = (v.email || '').trim().toLowerCase();

    if (up && !v.name.trim()) return fail('name', 'Please enter your name.');
    if (up && !v.business.trim()) return fail('business', 'Please enter your business name.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail('email', 'Please enter a valid email address.');
    if (up && v.password.length < 8) return fail('password', 'Password must be at least 8 characters.');
    if (!up && !v.password) return fail('password', 'Please enter your password.');

    const accounts = read(ACCOUNTS, {});
    const h = await hash(v.password);
    if (up) {
      if (accounts[email]?.hash) return fail('email', 'An account with this email already exists. Sign in instead.');
      accounts[email] = { name: v.name.trim(), business: v.business.trim(), hash: h };
      write(ACCOUNTS, accounts);
      // Keep anything answered during guest onboarding
      const guest = read(auth.obKey(null), {});
      write(auth.obKey(email), { ...guest, name: v.name.trim(), business: v.business.trim(), email });
      try { localStorage.removeItem(auth.obKey(null)); } catch {}
    } else {
      if (!accounts[email] || accounts[email].hash !== h) return fail(null, 'Email or password is incorrect.');
    }
    auth.signIn(email, up ? 'client' : v.role || 'client');
    location.hash = auth.nextRoute(email);
  });

  window.addEventListener('hashchange', render);
  render();
})();
