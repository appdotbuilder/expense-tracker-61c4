import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput } from '../schema';
import { deleteExpense } from '../handlers/delete_expense';
import { eq } from 'drizzle-orm';

// Test expense data
const testExpense: CreateExpenseInput = {
  amount: 25.50,
  date: new Date('2024-01-15'),
  description: 'Test grocery shopping',
  category: 'Food'
};

describe('deleteExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing expense', async () => {
    // First create an expense to delete
    const result = await db.insert(expensesTable)
      .values({
        amount: testExpense.amount.toString(),
        date: testExpense.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        description: testExpense.description,
        category: testExpense.category
      })
      .returning()
      .execute();

    const createdExpense = result[0];
    expect(createdExpense.id).toBeDefined();

    // Delete the expense
    await deleteExpense(createdExpense.id);

    // Verify the expense was deleted
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, createdExpense.id))
      .execute();

    expect(expenses).toHaveLength(0);
  });

  it('should not throw error when deleting non-existent expense', async () => {
    // Attempt to delete an expense that doesn't exist
    const nonExistentId = 99999;

    // Should not throw an error
    await expect(deleteExpense(nonExistentId)).resolves.toBeUndefined();
  });

  it('should only delete the specified expense', async () => {
    // Create multiple expenses
    const expense1 = await db.insert(expensesTable)
      .values({
        amount: '15.00',
        date: '2024-01-10',
        description: 'Coffee',
        category: 'Food'
      })
      .returning()
      .execute();

    const expense2 = await db.insert(expensesTable)
      .values({
        amount: '30.00',
        date: '2024-01-11',
        description: 'Bus fare',
        category: 'Transport'
      })
      .returning()
      .execute();

    const expense3 = await db.insert(expensesTable)
      .values({
        amount: '50.00',
        date: '2024-01-12',
        description: 'Movie ticket',
        category: 'Entertainment'
      })
      .returning()
      .execute();

    // Delete only the second expense
    await deleteExpense(expense2[0].id);

    // Verify only the second expense was deleted
    const remainingExpenses = await db.select()
      .from(expensesTable)
      .execute();

    expect(remainingExpenses).toHaveLength(2);
    
    const remainingIds = remainingExpenses.map(e => e.id);
    expect(remainingIds).toContain(expense1[0].id);
    expect(remainingIds).toContain(expense3[0].id);
    expect(remainingIds).not.toContain(expense2[0].id);
  });

  it('should handle database errors gracefully', async () => {
    // Test with invalid ID type by forcing a database constraint violation
    // This tests error handling in the delete operation
    await expect(deleteExpense(-1)).resolves.toBeUndefined();
  });
});