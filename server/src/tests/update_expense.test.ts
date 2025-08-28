import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput, type UpdateExpenseInput } from '../schema';
import { updateExpense } from '../handlers/update_expense';
import { eq } from 'drizzle-orm';

describe('updateExpense', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test expense
  const createTestExpense = async () => {
    const result = await db.insert(expensesTable)
      .values({
        amount: '50.75',
        date: '2023-10-15', // Use string for date column
        description: 'Original lunch',
        category: 'Food'
      })
      .returning()
      .execute();
    
    return result[0];
  };

  it('should update expense amount only', async () => {
    const originalExpense = await createTestExpense();
    
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id,
      amount: 75.25
    };

    const result = await updateExpense(updateInput);

    // Verify updated field
    expect(result.amount).toEqual(75.25);
    expect(typeof result.amount).toBe('number');
    
    // Verify other fields unchanged
    expect(result.id).toEqual(originalExpense.id);
    expect(result.date).toEqual(new Date('2023-10-15'));
    expect(result.description).toEqual('Original lunch');
    expect(result.category).toEqual('Food');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update expense description only', async () => {
    const originalExpense = await createTestExpense();
    
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id,
      description: 'Updated dinner expense'
    };

    const result = await updateExpense(updateInput);

    // Verify updated field
    expect(result.description).toEqual('Updated dinner expense');
    
    // Verify other fields unchanged
    expect(result.amount).toEqual(50.75);
    expect(result.date).toEqual(new Date('2023-10-15'));
    expect(result.category).toEqual('Food');
  });

  it('should update expense category only', async () => {
    const originalExpense = await createTestExpense();
    
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id,
      category: 'Transport'
    };

    const result = await updateExpense(updateInput);

    // Verify updated field
    expect(result.category).toEqual('Transport');
    
    // Verify other fields unchanged
    expect(result.amount).toEqual(50.75);
    expect(result.date).toEqual(new Date('2023-10-15'));
    expect(result.description).toEqual('Original lunch');
  });

  it('should update expense date only', async () => {
    const originalExpense = await createTestExpense();
    const newDate = new Date('2023-12-25');
    
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id,
      date: newDate
    };

    const result = await updateExpense(updateInput);

    // Verify updated field
    expect(result.date).toEqual(newDate);
    
    // Verify other fields unchanged
    expect(result.amount).toEqual(50.75);
    expect(result.description).toEqual('Original lunch');
    expect(result.category).toEqual('Food');
  });

  it('should update multiple fields at once', async () => {
    const originalExpense = await createTestExpense();
    const newDate = new Date('2023-11-20');
    
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id,
      amount: 125.50,
      description: 'Updated grocery shopping',
      category: 'Shopping',
      date: newDate
    };

    const result = await updateExpense(updateInput);

    // Verify all updated fields
    expect(result.amount).toEqual(125.50);
    expect(result.description).toEqual('Updated grocery shopping');
    expect(result.category).toEqual('Shopping');
    expect(result.date).toEqual(newDate);
    
    // Verify unchanged fields
    expect(result.id).toEqual(originalExpense.id);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save changes to database', async () => {
    const originalExpense = await createTestExpense();
    
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id,
      amount: 99.99,
      description: 'Database test expense'
    };

    await updateExpense(updateInput);

    // Query database directly to verify changes were persisted
    const expenses = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, originalExpense.id))
      .execute();

    expect(expenses).toHaveLength(1);
    const savedExpense = expenses[0];
    
    expect(parseFloat(savedExpense.amount)).toEqual(99.99);
    expect(savedExpense.description).toEqual('Database test expense');
    expect(savedExpense.category).toEqual('Food'); // Unchanged
    expect(savedExpense.date).toEqual('2023-10-15'); // Unchanged
  });

  it('should throw error for non-existent expense', async () => {
    const updateInput: UpdateExpenseInput = {
      id: 99999,
      amount: 50.00
    };

    await expect(updateExpense(updateInput)).rejects.toThrow(/expense with id 99999 not found/i);
  });

  it('should handle partial updates with edge cases', async () => {
    const originalExpense = await createTestExpense();
    
    // Test with only ID (no updates)
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id
    };

    const result = await updateExpense(updateInput);

    // Should return original expense unchanged
    expect(result.amount).toEqual(50.75);
    expect(result.description).toEqual('Original lunch');
    expect(result.category).toEqual('Food');
    expect(result.date).toEqual(new Date('2023-10-15'));
  });

  it('should maintain proper numeric precision', async () => {
    const originalExpense = await createTestExpense();
    
    const updateInput: UpdateExpenseInput = {
      id: originalExpense.id,
      amount: 12.345 // Test precision handling
    };

    const result = await updateExpense(updateInput);

    expect(result.amount).toEqual(12.35); // Should round to 2 decimal places due to DB precision
    expect(typeof result.amount).toBe('number');
  });
});