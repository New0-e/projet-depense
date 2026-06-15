"use client";

import { Expense } from "@/types/expense";
import { Pencil, Trash2, Calendar, CalendarDays } from "lucide-react";

interface Props {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Logement: "bg-blue-100 text-blue-700",
  Alimentation: "bg-green-100 text-green-700",
  Transport: "bg-yellow-100 text-yellow-700",
  Santé: "bg-red-100 text-red-700",
  Loisirs: "bg-purple-100 text-purple-700",
  Abonnements: "bg-pink-100 text-pink-700",
  Épargne: "bg-teal-100 text-teal-700",
  Autres: "bg-gray-100 text-gray-700",
};

export default function ExpenseCard({ expense, onEdit, onDelete }: Props) {
  const monthlyAmount =
    expense.frequency === "annuel" ? expense.amount / 12 : expense.amount;
  const annualAmount =
    expense.frequency === "mensuel" ? expense.amount * 12 : expense.amount;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800 truncate">{expense.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                CATEGORY_COLORS[expense.category] || CATEGORY_COLORS["Autres"]
              }`}
            >
              {expense.category}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {monthlyAmount.toFixed(2)} $/mois
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={14} />
              {annualAmount.toFixed(2)} $/an
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="text-right mr-2">
            <div className="text-lg font-bold text-gray-800">
              {expense.amount.toFixed(2)} $
            </div>
            <div className="text-xs text-gray-400">{expense.frequency}</div>
          </div>
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
