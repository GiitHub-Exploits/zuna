# ZUNA TAILORS — Modern Bespoke Tailoring Web Application

> **"Elegance. Mastery. Custom Fit."**  
> Master Tailor: **SULTAN BAIG** (Former Pantaloons showroom master)  
> Studio: 12, Bashiruddin Munshi Lane, Howrah  
> Workshop: 31, Bashiruddin Munshi Lane, Howrah  
> Phone: 8910763123 / 628942663  

---

## What's New in This Version

1. **"Go Full Screen" Mode**:
   - A dismissable, native-app banner at the top + a quick-toggle icon in the header.
   - Triggers `requestFullscreen()` to remove browser URL bars and navigation for a pure mobile app feel.

2. **Dark & Light Mode**:
   - Instant toggle with Sun/Moon icon in the header.
   - Persists in `localStorage.getItem("theme")`.
   - Warm-white / ivory palette for light mode, deep obsidian / warm gold for dark mode.

3. **Enhanced Typography**:
   - High-contrast editorial headlines using **Cormorant Garamond** serif with refined tracking and optical sizing.
   - Ultra-crisp UI body and badge typography using **Plus Jakarta Sans**.
   - Dedicated monospace styling for Order IDs, phone numbers, and dates.

4. **Order Section Rework**:
   - **Create Order Button**: Prominent button on the ORDER tab.
   - **Order Dialog Box Window**:
     - **Cloth Category**: Freeform text input (*not a dropdown*) allowing any bespoke garment or alteration.
     - **Quantity**: Counter (+ / -).
     - **Material Provision**: *"You'll provide the fabric"* vs *"We will manage / source it"*, plus fabric specifications.
     - **Note for Customizations**: Detailed text field for cuts, lapels, collars, measurements, or event dates.
     - **Customer Numbers & Details**: Name, 10-digit phone, alternate phone, address, and measurement preference.
   - **Post-Order Experience**:
     - Celebratory confetti success screen with unique Order ID (`ZN-YYYY-XXXX`).
     - Real-time **Order Card** showing the current status (e.g. `RECEIVED`, `CONFIRMED`) and all submitted details.
     - Persists to `localStorage` so clients can track their orders whenever they visit the ORDER tab.

5. **Our Work Section Rework**:
   - All default dummy cards removed.
   - Clean, elegant empty state when no works have been published yet.
   - Public "Upload Work" button removed (only admins can upload via the Admin Panel).

6. **Admin Detection & Admin Panel**:
   - **Detection**: Checks `localStorage.getItem("adminpass")`.
   - Set/edit your custom admin key via the "Admin Device Setup" link in the footer or header.
   - **Home Tab Admin Button**: When logged in as admin, a prominent **"Atelier Admin Panel"** banner appears on the Home tab.
   - **Admin Panel Features**:
     - **Orders Manager**: View all client orders, inspect details, and update live status (`RECEIVED`, `CONFIRMED`, `MEASURING`, `CRAFTING`, `READY`, `DELIVERED`).
     - **Upload Our Work**: Upload new pieces with title, category, image URL, description, and craftsmanship notes directly to the portfolio.
     - **Portfolio Manager**: Delete or manage published pieces.

7. **MongoDB Integration**:
   - Powered by Mongoose with models for `Order` and `Work`.
   - `.env` file created in `server/.env` with `MONGODB_URI=` left open for your connection string.
   - Automatic local persistent fallback if `MONGODB_URI` is not yet set, so the app runs flawlessly immediately.

---

## Configuration & Setup

### Setting Your MongoDB Connection String
Open `server/.env` and paste your MongoDB URI:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/zuna?retryWrites=true&w=majority
```

### Setting Up Your Admin Device
1. Open the web app on your admin device.
2. Scroll to the footer and tap **"Admin Device Setup"** (or in the browser console run `localStorage.setItem("adminpass", "your_secret_key")`).
3. Enter your custom key and click **Save Key**.
4. The **Atelier Admin Panel** button will now be active on your Home tab!

---

## Running the Application

### Start Backend API Server (Port 5000)
```bash
npm run server
```

### Start Vite Development Server (Port 3000)
```bash
npm run client
```

### Build Frontend
```bash
npm run build
```
