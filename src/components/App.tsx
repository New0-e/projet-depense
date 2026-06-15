"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Expense, Frequency } from "@/types/expense";
import { Pencil, Trash2, Plus, Moon, Sun, X, Check, LogIn, LogOut } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const { data: session, status } = useSession();
  const [dark, setDark] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("mensuel");

  useEffect(() => {
    const savedDark = localStorage.getItem("dark-mode") === "true";
    setDark(savedDark);
  }, []);

  const fetchExpenses = useCallback(async () => {
    const res = await fetch("/api/expenses");
    if (res.ok) setExpenses(await res.json());
  }, []);

  useEffect(() => {
    if (session) fetchExpenses();
    else setExpenses([]);
  }, [session, fetchExpenses]);

  async function persist(updated: Expense[]) {
    setSaving(true);
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSaving(false);
  }

  function toggleDark() {
    setDark((d) => {
      localStorage.setItem("dark-mode", String(!d));
      return !d;
    });
  }

  function openAdd() {
    setEditing(null);
    setName("");
    setAmount("");
    setFrequency("mensuel");
    setShowForm(true);
  }

  function openEdit(e: Expense) {
    setEditing(e);
    setName(e.name);
    setAmount(String(e.amount));
    setFrequency(e.frequency);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!name.trim() || !amount) return;
    let updated: Expense[];
    if (editing) {
      updated = expenses.map((e) =>
        e.id === editing.id
          ? { ...e, name: name.trim(), amount: parseFloat(amount), frequency }
          : e
      );
    } else {
      updated = [...expenses, { id: uuidv4(), name: name.trim(), amount: parseFloat(amount), frequency }];
    }
    setExpenses(updated);
    persist(updated);
    closeForm();
  }

  function handleDelete(id: string) {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    persist(updated);
  }

  const toMonthly = (e: Expense) =>
    e.frequency === "mensuel" ? e.amount : e.amount / 12;

  const totalMonthly = expenses.reduce((s, e) => s + toMonthly(e), 0);
  const totalAnnual = totalMonthly * 12;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">

        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-lg tracking-tight">Mes dépenses</span>
            <div className="flex items-center gap-2">
              {saving && <span className="text-xs text-gray-400">Sauvegarde…</span>}
              <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              ) : (
                <button
                  onClick={() => signIn("google")}
                  className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogIn size={15} />
                  Connexion
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

          {/* Pas connecté */}
          {status !== "loading" && !session && (
            <div className="text-center py-20 space-y-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Connecte-toi pour sauvegarder tes dépenses sur tous tes appareils.
              </p>
              <button
                onClick={() => signIn("google")}
                className="inline-flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-shadow font-medium text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Se connecter avec Google
              </button>
            </div>
          )}

          {/* Chargement */}
          {status === "loading" && (
            <div className="text-center py-20 text-gray-400 text-sm">Chargement…</div>
          )}

          {/* Contenu connecté */}
          {session && (
            <>
              {/* Info utilisateur */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {session.user?.image && (
                  <img src={session.user.image} className="w-5 h-5 rounded-full" alt="" />
                )}
                <span>{session.user?.name}</span>
              </div>

              {/* Totaux */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl p-4">
                  <p className="text-xs font-medium opacity-75 mb-1">Par mois</p>
                  <p className="text-2xl font-bold">{totalMonthly.toFixed(2)} €</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                  <p className="text-xs font-medium text-gray-400 mb-1">Par année</p>
                  <p className="text-2xl font-bold">{totalAnnual.toFixed(2)} €</p>
                </div>
              </div>

              {/* Liste */}
              {expenses.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-600">
                  <p className="text-sm">Aucune dépense. Clique sur + pour commencer.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {expenses.map((e) => (
                    <div key={e.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{e.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {e.frequency === "mensuel"
                            ? `${e.amount.toFixed(2)} €/mois · ${(e.amount * 12).toFixed(2)} €/an`
                            : `${(e.amount / 12).toFixed(2)} €/mois · ${e.amount.toFixed(2)} €/an`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        e.frequency === "mensuel"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      }`}>
                        {e.frequency}
                      </span>
                      <button onClick={() => openEdit(e)} className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(e.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Bouton + */}
        {session && (
          <button
            onClick={openAdd}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            style={{ width: 52, height: 52 }}
          >
            <Plus size={24} />
          </button>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-xl">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold">{editing ? "Modifier" : "Ajouter une dépense"}</h2>
                <button onClick={closeForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Nom</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Netflix, Loyer, Épicerie…"
                    required
                    autoFocus
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Montant (€)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Fréquence</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["mensuel", "annuel"] as Frequency[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFrequency(f)}
                        className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                          frequency === f
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-400"
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  <Check size={16} />
                  {editing ? "Sauvegarder" : "Ajouter"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
