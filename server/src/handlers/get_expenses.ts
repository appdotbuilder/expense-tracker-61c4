import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type Expense, type ExpenseFilter } from '../schema';
import { eq, and, sql, type SQL } from 'drizzle-orm';

export const getExpenses = async (filter?: ExpenseFilter): Promise<Expense[]> => {
  try {
    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    if (filter) {
      // Filter by category if provided
      if (filter.category) {
        conditions.push(eq(expensesTable.category, filter.category));
      }

      // Filter by month and year if provided
      if (filter.month !== undefined || filter.year !== undefined) {
        // Build date filter based on what's provided
        if (filter.month !== undefined && filter.year !== undefined) {
          // Both month and year provided - filter by exact month/year
          conditions.push(
            sql`EXTRACT(MONTH FROM ${expensesTable.date}) = ${filter.month}`
          );
          conditions.push(
            sql`EXTRACT(YEAR FROM ${expensesTable.date}) = ${filter.year}`
          );
        } else if (filter.year !== undefined) {
          // Only year provided - filter by entire year
          conditions.push(
            sql`EXTRACT(YEAR FROM ${expensesTable.date}) = ${filter.year}`
          );
        } else if (filter.month !== undefined) {
          // Only month provided - filter by month across all years
          conditions.push(
            sql`EXTRACT(MONTH FROM ${expensesTable.date}) = ${filter.month}`
          );
        }
      }
    }

    // Build and execute query in one step to avoid type issues
    const results = conditions.length > 0
      ? await db.select()
          .from(expensesTable)
          .where(conditions.length === 1 ? conditions[0] : and(...conditions))
          .execute()
      : await db.select()
          .from(expensesTable)
          .execute();

    // Convert numeric amount and date fields to proper types
    return results.map(expense => ({
      ...expense,
      amount: parseFloat(expense.amount), // Convert string back to number
      date: new Date(expense.date), // Convert date string to Date object
      created_at: new Date(expense.created_at) // Convert timestamp to Date object
    }));
  } catch (error) {
    console.error('Failed to get expenses:', error);
    throw error;
  }
};