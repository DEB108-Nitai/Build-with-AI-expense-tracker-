import React, { useState, useRef, useEffect } from "react";
import { X, Check, Users } from "lucide-react";
import gsap from "gsap";
import { api } from "../lib/api";

interface Props {
  isOpen: boolean;
  groupId: string;
  members: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddExpenseModal({ isOpen, groupId, members, onClose, onSuccess }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState(members[0] || "");
  const [splitBetween, setSplitBetween] = useState<string[]>(members);
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

  const toggleSplit = (member: string) => {
    if (splitBetween.includes(member)) {
      if (splitBetween.length > 1) {
        setSplitBetween(splitBetween.filter(m => m !== member));
      }
    } else {
      setSplitBetween([...splitBetween, member]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    
    setIsSubmitting(true);
    try {
      await api.addExpense({
        groupId,
        description,
        amount: parseFloat(amount),
        payer,
        splitBetween,
      });
      onSuccess();
      setDescription("");
      setAmount("");
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
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgb(0,0,0,0.12)] opacity-0 overflow-hidden"
      >
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-text-main tracking-tight">Record Entry</h2>
            <button 
              onClick={handleClose}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all duration-300"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Service/Item</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  placeholder="e.g. Summit Dinner"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-semibold"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Transaction Value</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-text-main font-bold">$</span>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-11 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all font-bold text-xl tracking-tight"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Primary Payer</label>
              <div className="relative">
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all appearance-none font-semibold text-text-main"
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                >
                  {members.map(member => (
                    <option key={member} value={member}>{member}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Users size={16} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Split Distribution</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {members.map(member => (
                  <button
                    key={member}
                    type="button"
                    onClick={() => toggleSplit(member)}
                    className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                      splitBetween.includes(member) 
                        ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                        : 'bg-slate-50 border-transparent text-text-muted hover:bg-slate-100'
                    }`}
                  >
                    <span>{member}</span>
                    {splitBetween.includes(member) && <Check size={16} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full py-5 bg-primary text-white font-bold rounded-2xl shadow-[0_20px_40px_rgb(99,102,241,0.2)] hover:shadow-[0_25px_50px_rgb(99,102,241,0.3)] transition-all duration-500 hover:-translate-y-1 active:scale-95 disabled:opacity-50 mt-4"
            >
              {isSubmitting ? "Committing..." : "Finalize Entry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
