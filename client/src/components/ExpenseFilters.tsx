import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X, Filter } from 'lucide-react';
import type { ExpenseFilter, ExpenseCategory } from '../../../server/src/schema';

interface ExpenseFiltersProps {
  onFilterChange: (filters: ExpenseFilter) => void;
}

const categories: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Salary'
];

const categoryEmojis: Record<ExpenseCategory, string> = {
  'Food': '🍽️',
  'Transport': '🚗',
  'Housing': '🏠',
  'Entertainment': '🎬',
  'Utilities': '💡',
  'Shopping': '🛍️',
  'Salary': '💰'
};

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

// Generate years for the dropdown (current year and previous 4 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function ExpenseFilters({ onFilterChange }: ExpenseFiltersProps) {
  const [filters, setFilters] = useState<ExpenseFilter>({});

  const handleCategoryChange = (category: ExpenseCategory | 'all') => {
    const newFilters = {
      ...filters,
      category: category === 'all' ? undefined : category
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleMonthChange = (month: string) => {
    const newFilters = {
      ...filters,
      month: month === 'all' ? undefined : parseInt(month)
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleYearChange = (year: string) => {
    const newFilters = {
      ...filters,
      year: year === 'all' ? undefined : parseInt(year)
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.category || filters.month || filters.year;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Category</Label>
          <Select
            value={filters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>All Categories</span>
                </div>
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  <div className="flex items-center gap-2">
                    <span>{categoryEmojis[category]}</span>
                    <span>{category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Month</Label>
          <Select
            value={filters.month?.toString() || 'all'}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Year</Label>
          <Select
            value={filters.year?.toString() || 'all'}
            onValueChange={handleYearChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Active filters applied</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}