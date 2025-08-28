import { db } from '../db';
import { expensesTable } from '../db/schema';
import { type UpdateExpenseInput, type Expense } from '../schema';
import { eq } from 'drizzle-orm';

export const updateExpense = async (input: UpdateExpenseInput): Promise<Expense> => {
  try {
    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    
    if (input.amount !== undefined) {
      updateData['amount'] = input.amount.toString(); // Convert number to string for numeric column
    }
    if (input.date !== undefined) {
      updateData['date'] = input.date;
    }
    if (input.description !== undefined) {
      updateData['description'] = input.description;
    }
    if (input.category !== undefined) {
      updateData['category'] = input.category;
    }

    // If no fields to update, just return the current expense
    if (Object.keys(updateData).length === 0) {
      const result = await db.select()
        .from(expensesTable)
        .where(eq(expensesTable.id, input.id))
        .execute();

      if (result.length === 0) {
        throw new Error(`Expense with id ${input.id} not found`);
      }

      const expense = result[0];
      return {
        ...expense,
        amount: parseFloat(expense.amount), // Convert string back to number
        date: new Date(expense.date) // Convert string back to Date
      };
    }

    // Update the expense record
    const result = await db.update(expensesTable)
      .set(updateData)
      .where(eq(expensesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Expense with id ${input.id} not found`);
    }

    // Convert numeric and date fields back to proper types before returning
    const expense = result[0];
    return {
      ...expense,
      amount: parseFloat(expense.amount), // Convert string back to number
      date: new Date(expense.date) // Convert string back to Date
    };
  } catch (error) {
    console.error('Expense update failed:', error);
    throw error;
  }
};