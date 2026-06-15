"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Expense, Frequency } from "@/types/expense";
import { Pencil, Trash2, Plus, Moon, Sun, X, Check, LogOut, Lock } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const { data: session, status } = useSession();
  const [dark, setDark] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);

  // Login form
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Expense form
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("mensuel");

  useEffect(() => {
    setDark(localStorage.getItem("dark-mode") === "true");
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(false);
    const res = await signIn("credentials", { password, redirect: false });
    setLoggingIn(false);
    if (res?.error) {
      setLoginError(true);
      setPassword("");
    }
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
              {session && (
                <button onClick={() => signOut()} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

          {/* Écran de connexion */}
          {status !== "loading" && !session && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 w-full max-w-xs shadow-sm">
                <div className="flex justify-center mb-5">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                    <Lock size={22} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <h2 className="text-center font-semibold text-lg mb-5">Mes dépenses</h2>
                <form onSubmit={handleLogin} className="space-y-3">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    autoFocus
                    required
                    className={`w-full bg-gray-50 dark:bg-gray-800 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      loginError ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                  {loginError && (
                    <p className="text-xs text-red-500 text-center">Mot de passe incorrect</p>
                  )}
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {loggingIn ? "Connexion…" : "Se connecter"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-20 text-gray-400 text-sm">Chargement…</div>
          )}

          {/* Contenu principal */}
          {session && (
            <>
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

        {session && (
          <button
            onClick={openAdd}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            style={{ width: 52, height: 52 }}
          >
            <Plus size={24} />
          </button>
        )}

        {/* Modal ajout/édition */}
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
