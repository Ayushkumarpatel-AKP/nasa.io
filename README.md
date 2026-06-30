# 🌍 NASA.io - Earth Observation Dashboard

A next-generation environmental intelligence dashboard powered by Earth observation data.

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app.

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Navigation bar
│   ├── HeroIntro.tsx            # Hero section with tagline
│   ├── EarthGlobe.tsx           # 3D Earth placeholder
│   ├── MapPreview.tsx           # Map preview card
│   └── ARVisionButton.tsx       # Premium AR button
│
├── pages/
│   └── Home.tsx                 # Main dashboard page
│
├── layout/
│   └── MainLayout.tsx           # Shared layout with header
│
├── App.tsx                      # Main app component
├── main.tsx                     # React entry point
└── index.css                    # Global styles + Tailwind
```

---

## 🔧 Configuration

### AR Vision Button

Update the AR link in `src/pages/Home.tsx`:

```tsx
<ARVisionButton link="https://YOUR-AR-LINK-HERE" />
```

---

## 🎨 Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation (ready for future pages)

---

## 🌟 Features

✅ **Clean & Professional Design** - NASA/ISRO inspired dashboard
✅ **Dark Theme** - Space-themed gradient background
✅ **Responsive** - Mobile-first design
✅ **Premium AR Button** - Glassmorphic, animated button
✅ **Modular Components** - Easy to extend and maintain
✅ **TypeScript** - Full type safety
✅ **Ready for 3D** - Earth globe placeholder for Three.js integration

---

## 🛠️ Next Steps

1. **3D Earth Globe** - Integrate Three.js for interactive Earth
2. **Real Map** - Add Leaflet/Mapbox for live pollution data
3. **Backend API** - Connect to environmental data sources
4. **Analytics Dashboard** - Add charts and metrics
5. **User Authentication** - Implement sign-in functionality

---

## 📝 License

MIT License - Feel free to use for portfolio or commercial projects.

---

**Built with 💙 for Earth observation enthusiasts**
