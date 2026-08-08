import React, { useState, useRef, useEffect } from "react";
import { X, UserPlus, Trash2 } from "lucide-react";
import gsap from "gsap";
import { api } from "../lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<string[]>(["Me"]);
  const [newMember, setNewMember] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalRef.current, 
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power4.out" }
      );
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, { 
      y: 20, 
      opacity: 0, 
      scale: 0.95, 
      duration: 0.3, 
      ease: "power2.in",
      onComplete: onClose 
    });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
  };

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember("");
    }
  };

  const removeMember = (idx: number) => {
    if (members[idx] === "Me") return;
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await api.createGroup({
        name,
        description,
        createdBy: "Me",
        members,
      });
      onSuccess(result.id);
      setName("");
      setDescription("");
      setMembers(["Me"]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        ref={overlayRef}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-md opacity-0"
      />
      
      <div 
        ref={modalRef}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgb(0,0,0,0.12)] opacity-0 overflow-hidden"
      >
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-text-main tracking-tight">New Squad</h2>
            <button 
              onClick={handleClose}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all duration-300"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Squad Designation</label>
              <input 
                autoFocus
                required
                type="text" 
                placeholder="e.g. Alpine Expedition"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Mission Parameters</label>
              <textarea 
                placeholder="Operational scope..."
                rows={2}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all resize-none font-medium"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Squad Roster</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Operator Name"
                  className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-semibold"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                />
                <button 
                  type="button"
                  onClick={addMember}
                  className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-primary transition-all duration-500 shadow-lg shadow-slate-200"
                >
                  <UserPlus size={22} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {members.map((member, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-primary group animate-in"
                  >
                    <span>{member}</span>
                    {member !== "Me" && (
                      <button 
                        type="button"
                        onClick={() => removeMember(idx)}
                        className="text-primary/40 hover:text-rose-500 transition-colors"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-[0_20px_40px_rgb(99,102,241,0.2)] hover:shadow-[0_25px_50px_rgb(99,102,241,0.3)] transition-all duration-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 mt-4"
            >
              {isSubmitting ? "Processing..." : "Deploy Squad"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
