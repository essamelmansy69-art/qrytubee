# qrytube 🚀

An elegant and lightning-fast dynamic QR code generator & smart routing application tailored specifically for social media (YouTube, TikTok, Facebook, Instagram) with cross-platform redirection optimization, native app-launching protocols (deep links), and automated client-side visitor analytics tracking.

---

## 📱 Features

1. **Smart Redirection**: Auto-detects the visitor's operating system (iOS, Android, Desktop) and executes high-performance deep linking protocols (`youtube://watch?v=...`, etc.) to open links directly in the official YouTube or social companion apps, boosting user interaction speeds.
2. **Visitor Analytics**: Records detailed browser, device type, and approximate country origins for all visits inside your Supabase backend database securely without compromising performance.
3. **Optimized Arabic-English Interface**: Polished UI utilizing high-contrast visual themes with complete RTL Arabic and LTR English translations.
4. **Dynamic QR Codes**: Integrates Supabase to resolve and track temporary and permanent dynamic links with secure UUID-mapped redirections.

---

## 🗄️ Database Setup (Supabase)

The app stores data in **Supabase** across two main relational tables:
1. `dynamic_qr`: Manages slugs, actual destination URLs, and numeric click sums.
2. `qr_visits`: Log record for every visit containing country, device types, and browser specifications.

### How to apply the schema:
1. Login to your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** in the left sidebar.
3. Click "New Query" and copy-paste the entire contents of [/supabase_schema.sql](./supabase_schema.sql) from the root of this project.
4. Click **Run** to execute. This automatically creates both tables, adds index performance keys, and registers custom Row-Level Security (RLS) policies allowing secure client insertions.

---

## ⚙️ Environment Configuration

To allow the front-end application to connect with your database, create a `.env` file or configure your browser hosting environment with the following environment variables:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

---

## 📦 How to Run Internationally

### Install dependencies
```bash
npm install
```

### Run the development server
```bash
npm run dev
```

### Produce a production build
```bash
npm run build
```

---

## 🛠️ Tech Stack & Technologies Included
* **React 18** with **Vite** & **TypeScript**
* **Tailwind CSS** for visual responsiveness
* **Supabase JS Client** with active security policies
* **Lucide React** vector icons
* **Motion React** for smooth animations and transitions
