import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type Expense } from '../schema';
import { eq } from 'drizzle-orm';

export const getExpenseById = async (id: number): Promise<Expense | null> => {
  try {
    // Query for expense by ID
    const results = await db.select()
      .from(expensesTable)
      .where(eq(expensesTable.id, id))
      .execute();

    // Return null if expense not found
    if (results.length === 0) {
      return null;
    }

    // Convert numeric and date fields back to proper types before returning
    const expense = results[0];
    return {
      ...expense,
      amount: parseFloat(expense.amount), // Convert string back to number
      date: new Date(expense.date) // Convert string date back to Date object
    };
  } catch (error) {
    console.error('Failed to get expense by ID:', error);
    throw error;
  }
};