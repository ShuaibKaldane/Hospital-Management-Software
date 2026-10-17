/* =================================================================
   MediCare+ Marketing Site — Shared Script
   ================================================================= */

/* ----------------------------- PLAN CATALOG -----------------------------
 * Pricing kept in one place so every page shows the same numbers.
 * Currency = INR; price shown is per-month.
 * ----------------------------------------------------------------------- */
const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    tagline: 'For small clinics & individual practitioners.',
    monthly: 4999,
    annual: 4999 * 12 * 0.85, // 15% off when paid yearly
    features: [
      { text: 'Up to 5 doctors', on: true },
      { text: 'Up to 500 patients / month', on: true },
      { text: 'Appointment booking & reminders', on: true },
      { text: 'Basic dashboard & reports', on: true },
      { text: 'Email support', on: true },
      { text: 'Multi-location management', on: false },
      { text: 'Custom integrations', on: false },
      { text: 'Dedicated account manager', on: false }
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    tagline: 'For growing hospitals & specialty clinics.',
    monthly: 14999,
    annual: 14999 * 12 * 0.83, // ~17% off
    popular: true,
    features: [
      { text: 'Up to 25 doctors', on: true },
      { text: 'Unlimited patients', on: true },
      { text: 'Appointment, prescription & reports', on: true },
      { text: 'Advanced analytics & reports', on: true },
      { text: 'Salary & payment management', on: true },
      { text: 'Multi-location (up to 3)', on: true },
      { text: 'Priority email + chat support', on: true },
      { text: 'Dedicated account manager', on: false }
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For hospital chains & large networks.',
    monthly: 49999,
    annual: 49999 * 12 * 0.80,
    features: [
      { text: 'Unlimited doctors & staff', on: true },
      { text: 'Unlimited patients', on: true },
      { text: 'Full module access (all features)', on: true },
      { text: 'Custom analytics & BI dashboards', on: true },
      { text: 'Salary, payroll & finance suite', on: true },
      { text: 'Unlimited locations', on: true },
      { text: '24×7 priority phone support', on: true },
      { text: 'Dedicated account manager', on: true }
    ]
  }
};

const PLAN_ORDER = ['basic', 'professional', 'enterprise'];
const STORAGE_KEY = 'medicare_hospitals';

/* ----------------------------- HELPERS --------------------------------- */

function formatINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function getQueryParam(name) {
  const p = new URLSearchParams(window.location.search);
  return p.get(name);
}

function setQueryParam(name, value) {
  const p = new URLSearchParams(window.location.search);
  if (value === null || value === undefined) p.delete(name);
  else p.set(name, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${p.toString()}`);
}

/* ----------------------------- STORAGE --------------------------------- */

function readHospitals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeHospitals(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  // Notify the Angular app (same browser) that the list grew.
  window.dispatchEvent(new CustomEvent('medicare:hospitals-updated', { detail: list }));
}

/**
 * Add a freshly purchased hospital. Returns the stored record.
 */
function saveHospital(record) {
  const list = readHospitals();
  list.push(record);
  writeHospitals(list);
  return record;
}

/* ----------------------------- PASSWORD GEN ----------------------------- */

function generatePassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const nums  = '23456789';
  const syms  = '@#$%&*!';
  const all   = upper + lower + nums + syms;

  // Guarantee one of each category.
  const chars = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    nums [Math.floor(Math.random() * nums.length)],
    syms [Math.floor(Math.random() * syms.length)]
  ];
  for (let i = chars.length; i < length; i++) {
    chars.push(all[Math.floor(Math.random() * all.length)]);
  }
  // Shuffle.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function generateTransactionId() {
  const ts  = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `TXN-${ts}-${rnd}`;
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ----------------------------- FILE DOWNLOAD --------------------------- */

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function buildCredentialsText(hospital) {
  const bar  = '='.repeat(56);
  const rule = '-'.repeat(56);
  const dt   = new Date(hospital.purchaseDate);
  const dateStr = dt.toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return [
    bar,
    '   MediCare+ Hospital Activation Details',
    bar,
    '',
    `  Hospital Name  : ${hospital.hospitalName}`,
    `  Plan           : ${hospital.planName}`,
    `  Plan Price     : ${formatINR(hospital.planPrice)} / month`,
    `  Purchase Date  : ${dateStr}`,
    `  Transaction ID : ${hospital.transactionId}`,
    '',
    rule,
    '    SUPER ADMIN CREDENTIALS',
    rule,
    '',
    `    Email         : ${hospital.adminEmail}`,
    `    Password      : ${hospital.adminPassword}`,
    '',
    rule,
    `  Login URL      : ${hospital.loginUrl}`,
    bar,
    '',
    '  IMPORTANT:',
    '  - Keep this file in a safe place — it is the only record of your',
    '    super-admin credentials.',
    '  - Sign in at the Login URL above and change the password from your',
    '    admin profile settings once you log in for the first time.',
    '  - Patients across India will be able to select your hospital from',
    "    the registration screen once you've activated your account.",
    ''
  ].join('\n');
}

/* ----------------------------- NAV ACTIVE ----------------------------- */

function markActiveNav() {
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.dataset.nav === page) a.classList.add('active');
  });
}

/* ----------------------------- RENDER HELPERS -------------------------- */

function renderPlanCards({ containerSelector, ctaLabel = 'Get started' }) {
  const root = document.querySelector(containerSelector);
  if (!root) return;
  root.innerHTML = PLAN_ORDER.map(id => {
    const plan = PLANS[id];
    const isPop = plan.popular;
    const monthly = formatINR(plan.monthly);
    return `
      <div class="plan ${isPop ? 'popular' : ''}">
        ${isPop ? '<span class="badge">Most popular</span>' : ''}
        <h3>${plan.name}</h3>
        <div class="tag">${plan.tagline}</div>
        <div class="price">
          <span class="currency">₹</span>
          <span class="amount">${plan.monthly.toLocaleString('en-IN')}</span>
          <span class="per">/month</span>
        </div>
        <div class="gst">+ 18% GST &nbsp;·&nbsp; Billed monthly</div>
        <ul>
          ${plan.features.map(f => `
            <li class="${f.on ? '' : 'muted'}">
              ${f.on
                ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
                : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
              }
              <span>${f.text}</span>
            </li>
          `).join('')}
        </ul>
        <a class="btn ${isPop ? 'btn-primary' : 'btn-outline'} btn-lg"
           href="checkout.html?plan=${plan.id}">
          ${ctaLabel}
        </a>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  markActiveNav();
});

/* Expose to other pages */
window.MediCare = {
  PLANS, PLAN_ORDER, STORAGE_KEY,
  readHospitals, writeHospitals, saveHospital,
  formatINR, getQueryParam, setQueryParam,
  generatePassword, generateTransactionId, slugify,
  downloadText, buildCredentialsText,
  renderPlanCards
};
