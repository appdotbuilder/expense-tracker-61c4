import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Tag, Receipt } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../../../server/src/schema';

interface ExpenseListProps {
  expenses: Expense[];
  isLoading?: boolean;
}

const categoryColors: Record<ExpenseCategory, string> = {
  'Food': 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  'Transport': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  'Housing': 'bg-green-100 text-green-700 hover:bg-green-200',
  'Entertainment': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  'Utilities': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  'Shopping': 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  'Salary': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
};

const categoryEmojis: Record<ExpenseCategory, string> = {
  'Food': '🍽️',
  'Transport': '🚗',
  'Housing': '🏠',
  'Entertainment': '🎬',
  'Utilities': '💡',
  'Shopping': '🛍️',
  'Salary': '💰'
};

export function ExpenseList({ expenses, isLoading = false }: ExpenseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-16 ml-auto" />
                  <Skeleton className="h-4 w-20 ml-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-500 mb-4">
          Start tracking your expenses by adding your first transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense: Expense) => (
        <Card key={expense.id} className="border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{categoryEmojis[expense.category]}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {expense.description}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{expense.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <Badge
                          variant="secondary"
                          className={categoryColors[expense.category]}
                        >
                          {expense.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  ${expense.amount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  ID: {expense.id}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}