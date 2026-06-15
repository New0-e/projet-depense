"use client";

import { useState, useEffect, useCallback } from "react";
import { Expense, ExpenseData } from "@/types/expense";
import ExpenseCard from "./ExpenseCard";
import ExpenseForm from "./ExpenseForm";
import {
  Plus,
  CloudUpload,
  LogOut,
  CloudDownload,
  TrendingUp,
  Wallet,
  Clock,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  isConnected: boolean;
}

export default function Dashboard({ isConnected }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [saveMessage, setSaveMessage] = useState<string>("");

  const loadExpenses = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data: ExpenseData = await res.json();
        setExpenses(data.expenses || []);
        setLastSaved(data.lastSaved || "");
      }
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  async function saveExpenses(updated: Expense[]) {
    if (!isConnected) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses: updated, lastSaved: "" }),
      });
      if (res.ok) {
        const data = await res.json();
        setLastSaved(data.lastSaved);
        setSaveMessage("Sauvegardé sur Google Drive ✓");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleAdd(data: Omit<Expense, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const newExpense: Expense = { ...data, id: uuidv4(), createdAt: now, updatedAt: now };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    saveExpenses(updated);
    setShowForm(false);
  }

  function handleEdit(data: Omit<Expense, "id" | "createdAt" | "updatedAt">) {
    if (!editingExpense) return;
    const updated = expenses.map((e) =>
      e.id === editingExpense.id
        ? { ...e, ...data, updatedAt: new Date().toISOString() }
        : e
    );
    setExpenses(updated);
    saveExpenses(updated);
    setEditingExpense(null);
  }

  function handleDelete(id: string) {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.reload();
  }

  const totalMonthly = expenses.reduce(
    (sum, e) =>
      sum + (e.frequency === "mensuel" ? e.amount : e.amount / 12),
    0
  );
  const totalAnnual = totalMonthly * 12;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">Mes Dépenses</h1>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <button
                  onClick={loadExpenses}
                  disabled={loading}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Recharger"
                >
                  <CloudDownload size={18} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <a
                href="/api/auth"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <CloudUpload size={16} />
                Connecter Google Drive
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Totaux */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600 text-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1 opacity-80">
              <Clock size={16} />
              <span className="text-sm">Total mensuel</span>
            </div>
            <div className="text-3xl font-bold">{totalMonthly.toFixed(2)} $</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-gray-500">
              <TrendingUp size={16} />
              <span className="text-sm">Total annuel</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{totalAnnual.toFixed(2)} $</div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {expenses.length} dépense{expenses.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            {saveMessage && (
              <span className="text-green-600 font-medium">{saveMessage}</span>
            )}
            {lastSaved && !saveMessage && (
              <span className="text-gray-400">
                Sauvegardé le{" "}
                {new Date(lastSaved).toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            {saving && <span className="text-blue-500">Sauvegarde...</span>}
            {!isConnected && (
              <span className="text-orange-500 text-xs bg-orange-50 px-2 py-1 rounded-full">
                Non connecté à Drive
              </span>
            )}
          </div>
        </div>

        {/* Liste des dépenses */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Chargement...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16">
            <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Aucune dépense pour l&apos;instant</p>
            <p className="text-gray-400 text-sm mt-1">Cliquez sur + pour en ajouter une</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => setEditingExpense(expense)}
                onDelete={() => handleDelete(expense.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <Plus size={26} />
      </button>

      {/* Formulaire */}
      {showForm && (
        <ExpenseForm
          onSave={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}
      {editingExpense && (
        <ExpenseForm
          initial={editingExpense}
          onSave={handleEdit}
          onCancel={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}
