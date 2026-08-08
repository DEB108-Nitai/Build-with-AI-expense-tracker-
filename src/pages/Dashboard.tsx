import { useState, useEffect, useRef } from "react";
import { Plus, Users, ArrowRight, Plane, PartyPopper, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { api } from "../lib/api";
import CreateGroupModal from "../components/CreateGroupModal";

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        // Hero animation
        gsap.from(".hero-content > *", {
          y: 30,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "expo.out"
        });

        // ScrollTrigger for group cards
        gsap.from(".group-card", {
          scrollTrigger: {
            trigger: ".groups-grid",
            start: "top 80%",
          },
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  return (
    <div ref={containerRef} className="space-y-20">
      <div className="hero-content flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <span className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase bg-indigo-50 px-3 py-1.5 rounded-full">Finance Reimagined</span>
          <h1 className="text-5xl font-bold tracking-tight text-text-main sm:text-6xl">
            Settle expenses,<br /><span className="text-primary">keep the vibe.</span>
          </h1>
          <p className="text-lg text-text-muted max-w-xl leading-relaxed">
            Beautifully simple group tracking for travelers, event planners, and friends who value clarity and style.
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-[0_20px_40px_rgb(99,102,241,0.25)] hover:shadow-[0_25px_50px_rgb(99,102,241,0.35)] transition-all duration-500 hover:-translate-y-1 active:scale-95"
        >
          <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-2xl" />
          <Plus size={20} strokeWidth={2.5} className="relative z-10" />
          <span className="relative z-10">Create New Squad</span>
        </button>
      </div>

      <div className="groups-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-50 rounded-[2rem] border border-slate-100 animate-pulse" />
          ))
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <Link 
              key={group.id} 
              to={`/group/${group.id}`}
              className="group-card block p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgb(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group"
            >
              <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
                {group.name.toLowerCase().includes('trip') || group.name.toLowerCase().includes('travel') ? (
                  <Plane size={150} strokeWidth={1} />
                ) : group.name.toLowerCase().includes('party') || group.name.toLowerCase().includes('event') ? (
                  <PartyPopper size={150} strokeWidth={1} />
                ) : (
                  <Briefcase size={150} strokeWidth={1} />
                )}
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-text-muted font-semibold text-[10px] uppercase tracking-widest">
                    <Users size={14} className="text-primary" />
                    <span>{group.members.length} Squad Members</span>
                  </div>
                  <h3 className="text-2xl font-bold text-text-main leading-tight">{group.name}</h3>
                  <p className="text-text-muted text-sm leading-relaxed line-clamp-2">{group.description || "No description provided."}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-primary transition-colors">Details</span>
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-6 bg-white border border-slate-100 rounded-[3rem] shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
              <Users size={40} />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold text-text-main">No squads yet</p>
              <p className="text-text-muted max-w-xs mx-auto">Track your collective spending in one beautiful place.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-primary font-bold hover:underline underline-offset-4"
            >
              Start your first adventure &rarr;
            </button>
          </div>
        )}
      </div>

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(id) => {
          setIsModalOpen(false);
          loadGroups();
        }}
      />
    </div>
  );
}
