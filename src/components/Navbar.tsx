import { Link } from "react-router-dom";
import { Wallet, PlusCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
    );
  }, []);

  return (
    <nav ref={navRef} className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-[100] bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl h-20 px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform duration-500">
          <Wallet size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <h1 className="font-bold text-lg tracking-tight text-text-main leading-none">SquadSplit</h1>
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-[0.1em] mt-1">Light Edition</span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden sm:block text-right">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted opacity-60 mb-0.5">Profile</p>
          <p className="font-semibold text-sm">Me</p>
        </div>
      </div>
    </nav>
  );
}
