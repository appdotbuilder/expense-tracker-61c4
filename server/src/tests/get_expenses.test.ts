import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type ExpenseFilter } from '../schema';
import { getExpenses } from '../handlers/get_expenses';

describe('getExpenses', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return all expenses when no filter is provided', async () => {
    // Create test expenses
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-12-15',
        description: 'Lunch',
        category: 'Food'
      },
      {
        amount: '50.00',
        date: '2023-11-20',
        description: 'Groceries',
        category: 'Food'
      },
      {
        amount: '15.75',
        date: '2023-10-10',
        description: 'Bus fare',
        category: 'Transport'
      }
    ]).execute();

    const result = await getExpenses();

    expect(result).toHaveLength(3);
    
    // Verify numeric conversion
    result.forEach(expense => {
      expect(typeof expense.amount).toBe('number');
      expect(expense.id).toBeDefined();
      expect(expense.date).toBeInstanceOf(Date);
      expect(expense.created_at).toBeInstanceOf(Date);
    });

    // Check specific values
    const lunchExpense = result.find(e => e.description === 'Lunch');
    expect(lunchExpense?.amount).toEqual(25.50);
    expect(lunchExpense?.category).toEqual('Food');
  });

  it('should filter expenses by category', async () => {
    // Create test expenses with different categories
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-12-15',
        description: 'Lunch',
        category: 'Food'
      },
      {
        amount: '15.75',
        date: '2023-12-10',
        description: 'Bus fare',
        category: 'Transport'
      },
      {
        amount: '100.00',
        date: '2023-12-05',
        description: 'Movie tickets',
        category: 'Entertainment'
      }
    ]).execute();

    const filter: ExpenseFilter = { category: 'Food' };
    const result = await getExpenses(filter);

    expect(result).toHaveLength(1);
    expect(result[0].description).toEqual('Lunch');
    expect(result[0].category).toEqual('Food');
    expect(result[0].amount).toEqual(25.50);
  });

  it('should filter expenses by year', async () => {
    // Create test expenses across different years
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-12-15',
        description: 'Lunch 2023',
        category: 'Food'
      },
      {
        amount: '30.00',
        date: '2022-06-20',
        description: 'Lunch 2022',
        category: 'Food'
      },
      {
        amount: '35.00',
        date: '2023-03-10',
        description: 'Another 2023 expense',
        category: 'Transport'
      }
    ]).execute();

    const filter: ExpenseFilter = { year: 2023 };
    const result = await getExpenses(filter);

    expect(result).toHaveLength(2);
    result.forEach(expense => {
      expect(expense.date.getFullYear()).toEqual(2023);
    });

    const descriptions = result.map(e => e.description);
    expect(descriptions).toContain('Lunch 2023');
    expect(descriptions).toContain('Another 2023 expense');
    expect(descriptions).not.toContain('Lunch 2022');
  });

  it('should filter expenses by month', async () => {
    // Create test expenses across different months
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-12-15',
        description: 'December expense',
        category: 'Food'
      },
      {
        amount: '30.00',
        date: '2023-06-20',
        description: 'June expense',
        category: 'Food'
      },
      {
        amount: '35.00',
        date: '2022-12-10',
        description: 'December 2022 expense',
        category: 'Transport'
      }
    ]).execute();

    const filter: ExpenseFilter = { month: 12 };
    const result = await getExpenses(filter);

    expect(result).toHaveLength(2);
    result.forEach(expense => {
      expect(expense.date.getMonth() + 1).toEqual(12); // getMonth() is 0-based
    });

    const descriptions = result.map(e => e.description);
    expect(descriptions).toContain('December expense');
    expect(descriptions).toContain('December 2022 expense');
    expect(descriptions).not.toContain('June expense');
  });

  it('should filter expenses by both month and year', async () => {
    // Create test expenses across different months and years
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-12-15',
        description: 'December 2023',
        category: 'Food'
      },
      {
        amount: '30.00',
        date: '2022-12-20',
        description: 'December 2022',
        category: 'Food'
      },
      {
        amount: '35.00',
        date: '2023-06-10',
        description: 'June 2023',
        category: 'Transport'
      },
      {
        amount: '40.00',
        date: '2023-12-25',
        description: 'Another December 2023',
        category: 'Entertainment'
      }
    ]).execute();

    const filter: ExpenseFilter = { month: 12, year: 2023 };
    const result = await getExpenses(filter);

    expect(result).toHaveLength(2);
    result.forEach(expense => {
      expect(expense.date.getMonth() + 1).toEqual(12);
      expect(expense.date.getFullYear()).toEqual(2023);
    });

    const descriptions = result.map(e => e.description);
    expect(descriptions).toContain('December 2023');
    expect(descriptions).toContain('Another December 2023');
    expect(descriptions).not.toContain('December 2022');
    expect(descriptions).not.toContain('June 2023');
  });

  it('should filter expenses by category and date', async () => {
    // Create test expenses with mixed categories and dates
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-12-15',
        description: 'Food December 2023',
        category: 'Food'
      },
      {
        amount: '30.00',
        date: '2023-12-20',
        description: 'Transport December 2023',
        category: 'Transport'
      },
      {
        amount: '35.00',
        date: '2023-06-10',
        description: 'Food June 2023',
        category: 'Food'
      },
      {
        amount: '40.00',
        date: '2022-12-25',
        description: 'Food December 2022',
        category: 'Food'
      }
    ]).execute();

    const filter: ExpenseFilter = { category: 'Food', month: 12, year: 2023 };
    const result = await getExpenses(filter);

    expect(result).toHaveLength(1);
    expect(result[0].description).toEqual('Food December 2023');
    expect(result[0].category).toEqual('Food');
    expect(result[0].date.getMonth() + 1).toEqual(12);
    expect(result[0].date.getFullYear()).toEqual(2023);
    expect(result[0].amount).toEqual(25.50);
  });

  it('should return empty array when no expenses match filter', async () => {
    // Create some test expenses
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-12-15',
        description: 'Food expense',
        category: 'Food'
      }
    ]).execute();

    // Filter for non-existent category
    const filter: ExpenseFilter = { category: 'Housing' };
    const result = await getExpenses(filter);

    expect(result).toHaveLength(0);
  });

  it('should return empty array when no expenses exist', async () => {
    // No expenses in database
    const result = await getExpenses();

    expect(result).toHaveLength(0);
  });

  it('should handle edge case months correctly', async () => {
    // Create test expenses in January and December
    await db.insert(expensesTable).values([
      {
        amount: '25.50',
        date: '2023-01-15',
        description: 'January expense',
        category: 'Food'
      },
      {
        amount: '30.00',
        date: '2023-12-20',
        description: 'December expense',
        category: 'Transport'
      }
    ]).execute();

    // Test month 1 (January)
    const januaryFilter: ExpenseFilter = { month: 1 };
    const januaryResult = await getExpenses(januaryFilter);
    expect(januaryResult).toHaveLength(1);
    expect(januaryResult[0].description).toEqual('January expense');

    // Test month 12 (December)
    const decemberFilter: ExpenseFilter = { month: 12 };
    const decemberResult = await getExpenses(decemberFilter);
    expect(decemberResult).toHaveLength(1);
    expect(decemberResult[0].description).toEqual('December expense');
  });
});