# MediCare+ Marketing & Subscription Site

A **static website** (pure HTML / CSS / vanilla JS — no build step, no backend)
that lets hospital owners buy a subscription plan in Indian Rupees. After a
successful purchase the site generates and downloads a text file containing
the hospital's **super-admin email and password**, ready to use in the main
Angular admin dashboard.

It also acts as the "hospital directory" source for the patient sign-up form:
every hospital that buys a plan is added to a shared `localStorage` key that
the Angular registration screen reads to populate its hospital dropdown.

---

## Pages

| Page             | Purpose                                                              |
|------------------|----------------------------------------------------------------------|
| `index.html`     | Landing — about the software, features, roles, how it works          |
| `pricing.html`   | 3 plans in INR + FAQ                                                 |
| `checkout.html`  | Hospital details + (mock) payment form                               |
| `success.html`   | Generated admin credentials, file auto-downloaded                    |

## Plans (Indian Rupees)

| Plan          | Price / month | Best for                              |
|---------------|---------------|---------------------------------------|
| Basic         | ₹4,999        | Small clinics, up to 5 doctors        |
| Professional  | ₹14,999       | Growing hospitals, up to 25 doctors   |
| Enterprise    | ₹49,999       | Hospital chains, unlimited            |

All plans billed in INR. GST of 18% is added at checkout. Annual billing
saves 15–20% depending on the plan.

## How a hospital owner uses it

1. Opens `index.html` → clicks **Get started**.
2. Chooses a plan on `pricing.html`.
3. Fills hospital details + (mock) card on `checkout.html`.
4. Clicks **Complete purchase** → redirected to `success.html`.
5. The browser **automatically downloads** a file like:
   `medicare-sunshine-multispeciality-hospital-credentials.txt`
6. They open that file and use the email + password to log in at
   `http://localhost:4200/login` (the Angular admin app).

The text file looks like:

```
========================================================
   MediCare+ Hospital Activation Details
========================================================

  Hospital Name  : Sunshine Multispeciality Hospital
  Plan           : Professional
  Plan Price     : ₹14,999 / month
  Purchase Date  : 17 October 2026
  Transaction ID : TXN-MXN8K2L-4X7TQ

--------------------------------------------------------
    SUPER ADMIN CREDENTIALS
--------------------------------------------------------

    Email         : admin@sunshine-hospital.com
    Password      : Hy9!Km2@nP7z

--------------------------------------------------------
  Login URL      : http://localhost:4200/login
========================================================
```

## How the file is generated (no server)

`assets/js/script.js` exposes a small `MediCare` namespace:

```js
MediCare.generatePassword(12)               // → secure random password
MediCare.generateTransactionId()            // → TXN-XXXX-XXXX
MediCare.buildCredentialsText(record)       // → file contents
MediCare.downloadText(fileName, content)    // → triggers browser download
```

Checkout writes the hospital record to `localStorage["medicare_hospitals"]`,
redirects to `success.html` with the credentials in the query string, and
`success.html` auto-runs `downloadText(...)` on page load.

## How patients see the hospital

The Angular sign-up form (`/register`) injects `HospitalService`, which reads
the same `localStorage["medicare_hospitals"]` key on boot and lists those
hospitals in the **"Register with hospital"** dropdown. If the list is empty
(for local testing without going through checkout), the form shows a
**"+ Seed demo hospitals"** button that injects three sample hospitals.

A `storage` event listener + a same-tab `medicare:hospitals-updated` custom
event keep the dropdown in sync if the user buys a plan in another tab.

## Running it

The site is fully static — open `index.html` directly in your browser, or:

```bash
# Option A — double-click index.html
# Option B — serve over a local server (recommended)
cd "marketing-site"
python -m http.server 8080
# then visit http://localhost:8080
```

No `npm install`, no build, no backend.
