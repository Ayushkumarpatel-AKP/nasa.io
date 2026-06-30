// src/layout/MainLayout.tsx
import { useEffect } from "react";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import ShootingStars from "../components/ShootingStars";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative">
      <ShootingStars />
      <div className="relative z-10">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
