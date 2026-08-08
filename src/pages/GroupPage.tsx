import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Receipt, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { api } from "../lib/api";
import AddExpenseModal from "../components/AddExpenseModal";

gsap.registerPlugin(ScrollTrigger);

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<any>(null);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      const groupData = await api.getGroup(id);
      const balanceData = await api.getBalances(id);
      setGroup(groupData);
      setBalances(balanceData.balances);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && group) {
      const ctx = gsap.context(() => {
        gsap.from(".animate-header > *", {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out"
        });

        gsap.from(".expense-item", {
          scrollTrigger: {
            trigger: ".expenses-list",
            start: "top 90%",
          },
          x: -20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.out"
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, group]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 animate-pulse text-text-muted">Fetching squad ledger...</div>;
  }

  if (!group) return <div className="p-20 text-center font-bold text-rose-500">Squad not found.</div>;

  const totalSpend = group.expenses.reduce((acc: number, curr: any) => acc + curr.amount, 0);

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto space-y-12 pb-20">
      <Link to="/" className="group inline-flex items-center gap-2 text-text-muted hover:text-primary transition-all font-semibold text-sm">
        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
          <ArrowLeft size={14} strokeWidth={3} />
        </div>
        Back to Dashboard
      </Link>

      <div className="animate-header flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary bg-indigo-50 px-3 py-1.5 rounded-full">Active Ledger</span>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-text-muted opacity-50"># {id?.slice(0, 8)}</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-text-main leading-none">{group.name}</h1>
          <p className="text-lg text-text-muted max-w-2xl font-medium">{group.description || "A collaborative expense group."}</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-[0_20px_40px_rgb(99,102,241,0.2)] hover:shadow-[0_25px_50px_rgb(99,102,241,0.3)] hover:-translate-y-1 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={2.5} />
          Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <h2 className="font-bold text-text-main flex items-center gap-3">
                <Receipt size={18} strokeWidth={2.5} className="text-primary" />
                Expenses Ledger
              </h2>
              <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-bold text-text-muted uppercase tracking-widest">{group.expenses.length} Entries</span>
            </div>
            
            <div className="expenses-list divide-y divide-slate-50">
              {group.expenses.length > 0 ? (
                group.expenses.map((expense: any) => (
                  <div key={expense.id} className="expense-item p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50/50 text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <DollarSign size={24} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-lg text-text-main group-hover:text-primary transition-colors">{expense.description}</p>
                        <p className="text-xs text-text-muted font-medium">
                          Paid by <span className="text-text-main font-bold px-2 py-0.5 bg-slate-100 rounded-md ml-1">{expense.payer}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="text-2xl font-bold text-text-main tracking-tight">${expense.amount.toFixed(2)}</p>
                      <div className="flex justify-end gap-1.5 items-center">
                        <Calendar size={12} className="text-slate-300" />
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter opacity-60">
                          {new Date(expense.date?._seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: '2-digit' }).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-24 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-slate-200">
                    <Receipt size={32} />
                  </div>
                  <p className="text-text-muted font-medium italic">The ledger is currently silent.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-text-main rounded-[2.5rem] p-10 text-white shadow-[0_30px_60px_rgb(15,23,42,0.15)] animate-header">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-300/50 mb-8 flex items-center gap-3">
              <TrendingUp size={18} strokeWidth={3} />
              Balance Sheet
            </h3>
            
            <div className="space-y-6">
              {Object.entries(balances).map(([name, balance]: [string, any]) => (
                <div key={name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white text-xs font-bold uppercase group-hover:bg-primary transition-colors">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${balance >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70 italic'}`}>
                        {balance >= 0 ? 'To Receive' : 'To Pay'}
                      </p>
                      <p className="font-bold text-lg tracking-tight">{name}</p>
                    </div>
                  </div>
                  <div className={`text-xl font-bold tracking-tighter ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {balance >= 0 ? '+' : '-'}${Math.abs(balance).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-40">Total Squad Spend</p>
              <p className="text-4xl font-bold tracking-tight">
                ${totalSpend.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="font-bold text-sm uppercase tracking-widest text-text-muted mb-6 flex items-center gap-3">
              <Users size={16} strokeWidth={2.5} className="text-primary" />
              Squad Manifest
            </h2>
            <div className="flex flex-wrap gap-2">
              {group.members.map((member: string) => (
                <div key={member} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-text-main uppercase tracking-widest">
                  {member}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal 
        isOpen={isModalOpen}
        members={group.members}
        groupId={id!}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
