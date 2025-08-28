import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput } from '../schema';
import { createExpense } from '../handlers/create_expense';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateExpenseInput = {
  amount: 29.99,
  date: new Date('2024-01-15'),
  description: 'Lunch at restaurant',
  category: 'Food'
};

describe('createExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an expense', async () => {
    const result = await createExpense(testInput);

    // Basic field validation
    expect(result.amount).toEqual(29.99);
    expect(typeof result.amount).toBe('number');
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.description).toEqual('Lunch at restaurant');
    expect(result.category).toEqual('Food');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save expense to database', async () => {
    const result = await createExpense(testInput);

    // Query using proper drizzle syntax
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, result.id))
      .execute();

    expect(expenses).toHaveLength(1);
    expect(expenses[0].description).toEqual('Lunch at restaurant');
    expect(parseFloat(expenses[0].amount)).toEqual(29.99);
    expect(expenses[0].date).toEqual('2024-01-15');
    expect(expenses[0].category).toEqual('Food');
    expect(expenses[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different expense categories', async () => {
    const transportExpense: CreateExpenseInput = {
      amount: 15.50,
      date: new Date('2024-01-16'),
      description: 'Bus ticket',
      category: 'Transport'
    };

    const result = await createExpense(transportExpense);

    expect(result.category).toEqual('Transport');
    expect(result.amount).toEqual(15.50);
    expect(result.description).toEqual('Bus ticket');
  });

  it('should handle decimal amounts correctly', async () => {
    const preciseAmount: CreateExpenseInput = {
      amount: 123.45,
      date: new Date('2024-01-17'),
      description: 'Shopping purchase',
      category: 'Shopping'
    };

    const result = await createExpense(preciseAmount);

    expect(result.amount).toEqual(123.45);
    expect(typeof result.amount).toBe('number');

    // Verify in database
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, result.id))
      .execute();

    expect(parseFloat(expenses[0].amount)).toEqual(123.45);
    
    // Also verify the date is stored correctly as string
    expect(expenses[0].date).toEqual('2024-01-17');
  });

  it('should create multiple expenses independently', async () => {
    const expense1: CreateExpenseInput = {
      amount: 50.00,
      date: new Date('2024-01-18'),
      description: 'Grocery shopping',
      category: 'Food'
    };

    const expense2: CreateExpenseInput = {
      amount: 25.75,
      date: new Date('2024-01-19'),
      description: 'Movie ticket',
      category: 'Entertainment'
    };

    const result1 = await createExpense(expense1);
    const result2 = await createExpense(expense2);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.amount).toEqual(50.00);
    expect(result2.amount).toEqual(25.75);
    expect(result1.category).toEqual('Food');
    expect(result2.category).toEqual('Entertainment');

    // Verify both exist in database
    const allExpenses = await db.select()
      .from(expensesTable)
      .execute();

    expect(allExpenses).toHaveLength(2);
  });
});