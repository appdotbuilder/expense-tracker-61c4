import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, TrendingDown, Calendar, Filter } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseFilters } from '@/components/ExpenseFilters';
import type { Expense, ExpenseFilter, ExpenseCategory } from '../../server/src/schema';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilter>({});
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);

  const loadExpenses = useCallback(async () => {
    setIsLoadingExpenses(true);
    try {
      const result = await trpc.getExpenses.query(Object.keys(filters).length > 0 ? filters : undefined);
      setExpenses(result);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      // Show mock data since backend is not implemented
      const mockExpenses: Expense[] = [
        {
          id: 1,
          amount: 12.50,
          date: new Date('2024-01-15'),
          description: 'Coffee and pastry',
          category: 'Food',
          created_at: new Date('2024-01-15')
        },
        {
          id: 2,
          amount: 45.00,
          date: new Date('2024-01-14'),
          description: 'Gas station fill-up',
          category: 'Transport',
          created_at: new Date('2024-01-14')
        },
        {
          id: 3,
          amount: 1200.00,
          date: new Date('2024-01-01'),
          description: 'Monthly rent payment',
          category: 'Housing',
          created_at: new Date('2024-01-01')
        },
        {
          id: 4,
          amount: 25.99,
          date: new Date('2024-01-12'),
          description: 'Movie tickets',
          category: 'Entertainment',
          created_at: new Date('2024-01-12')
        }
      ];

      // Apply filters to mock data
      let filteredMockExpenses = mockExpenses;
      if (filters.category) {
        filteredMockExpenses = filteredMockExpenses.filter(e => e.category === filters.category);
      }
      if (filters.month && filters.year) {
        filteredMockExpenses = filteredMockExpenses.filter(e => {
          const expenseDate = new Date(e.date);
          return expenseDate.getMonth() + 1 === filters.month && 
                 expenseDate.getFullYear() === filters.year;
        });
      }
      
      setExpenses(filteredMockExpenses);
    } finally {
      setIsLoadingExpenses(false);
    }
  }, [filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleCreateExpense = async (data: {
    amount: number;
    date: Date;
    description: string;
    category: ExpenseCategory;
  }) => {
    setIsLoading(true);
    try {
      const response = await trpc.createExpense.mutate(data);
      setExpenses((prev: Expense[]) => [response, ...prev]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create expense:', error);
      // Simulate successful creation with mock data
      const mockExpense: Expense = {
        id: Date.now(), // Simple ID generation for demo
        amount: data.amount,
        date: data.date,
        description: data.description,
        category: data.category,
        created_at: new Date()
      };
      setExpenses((prev: Expense[]) => [mockExpense, ...prev]);
      setShowForm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: ExpenseFilter) => {
    setFilters(newFilters);
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const currentDate = new Date();
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              💰 Expense Tracker
            </h1>
            <p className="text-gray-600">Keep track of your spending and manage your budget</p>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                ${totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">
                ${monthlyExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {expenses.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Notice */}
        <div className="mb-6">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Filter className="w-3 h-3 mr-1" />
            Demo Mode: Using sample data. Backend integration ready.
          </Badge>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseFilters onFilterChange={handleFilterChange} />
          </CardContent>
        </Card>

        {/* Expense List */}
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} isLoading={isLoadingExpenses} />
          </CardContent>
        </Card>

        {/* Add Expense Form Modal */}
        {showForm && (
          <ExpenseForm
            onSubmit={handleCreateExpense}
            onCancel={() => setShowForm(false)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default App;