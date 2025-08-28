import { db } from '../db';
import { expensesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteExpense = async (id: number): Promise<void> => {
  try {
    // Delete the expense record by ID
    const result = await db.delete(expensesTable)
      .where(eq(expensesTable.id, id))
      .execute();

    // Note: Drizzle's delete doesn't return affected rows count by default
    // The operation will succeed even if no rows were deleted
  } catch (error) {
    console.error('Expense deletion failed:', error);
    throw error;
  }
};