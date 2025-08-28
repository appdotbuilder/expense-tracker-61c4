import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput } from '../schema';
import { getExpenseById } from '../handlers/get_expense_by_id';

// Test expense data
const testExpenseInput: CreateExpenseInput = {
  amount: 25.50,
  date: new Date('2024-01-15'),
  description: 'Lunch at restaurant',
  category: 'Food'
};

describe('getExpenseById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return expense when it exists', async () => {
    // Create test expense in database
    const insertResult = await db.insert(expensesTable)
      .values({
        amount: testExpenseInput.amount.toString(),
        date: testExpenseInput.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        description: testExpenseInput.description,
        category: testExpenseInput.category
      })
      .returning()
      .execute();

    const createdId = insertResult[0].id;

    // Test the handler
    const result = await getExpenseById(createdId);

    // Verify the expense is returned correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdId);
    expect(result!.amount).toEqual(25.50);
    expect(typeof result!.amount).toEqual('number'); // Verify numeric conversion
    expect(result!.date).toBeInstanceOf(Date);
    expect(result!.description).toEqual('Lunch at restaurant');
    expect(result!.category).toEqual('Food');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null when expense does not exist', async () => {
    // Test with non-existent ID
    const result = await getExpenseById(999999);

    expect(result).toBeNull();
  });

  it('should handle different expense categories correctly', async () => {
    // Create expense with different category
    const transportExpense = await db.insert(expensesTable)
      .values({
        amount: '15.75',
        date: '2024-01-16',
        description: 'Bus ticket',
        category: 'Transport'
      })
      .returning()
      .execute();

    const result = await getExpenseById(transportExpense[0].id);

    expect(result).not.toBeNull();
    expect(result!.category).toEqual('Transport');
    expect(result!.amount).toEqual(15.75);
    expect(result!.description).toEqual('Bus ticket');
  });

  it('should handle large monetary amounts correctly', async () => {
    // Test with large amount to verify numeric precision
    const largeAmount = 1234.56;
    const expenseResult = await db.insert(expensesTable)
      .values({
        amount: largeAmount.toString(),
        date: '2024-01-17',
        description: 'Large expense',
        category: 'Shopping'
      })
      .returning()
      .execute();

    const result = await getExpenseById(expenseResult[0].id);

    expect(result).not.toBeNull();
    expect(result!.amount).toEqual(1234.56);
    expect(typeof result!.amount).toEqual('number');
  });

  it('should handle zero ID gracefully', async () => {
    // Test with zero ID
    const result = await getExpenseById(0);

    expect(result).toBeNull();
  });

  it('should handle negative ID gracefully', async () => {
    // Test with negative ID
    const result = await getExpenseById(-1);

    expect(result).toBeNull();
  });
});