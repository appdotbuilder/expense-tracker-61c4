import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type CreateExpenseInput, type Expense } from '../schema';

export const createExpense = async (input: CreateExpenseInput): Promise<Expense> => {
  try {
    // Insert expense record
    const result = await db.insert(expensesTable)
      .values({
        amount: input.amount.toString(), // Convert number to string for numeric column
        date: input.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string for date column
        description: input.description,
        category: input.category
      })
      .returning()
      .execute();

    // Convert fields back to proper types before returning
    const expense = result[0];
    return {
      ...expense,
      amount: parseFloat(expense.amount), // Convert string back to number
      date: new Date(expense.date) // Convert date string back to Date object
    };
  } catch (error) {
    console.error('Expense creation failed:', error);
    throw error;
  }
};