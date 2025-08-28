import { z } from 'zod';

// Expense category enum
export const expenseCategorySchema = z.enum([
  'Food',
  'Transport', 
  'Housing',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Salary'
]);

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;

// Expense schema with proper numeric handling
export const expenseSchema = z.object({
  id: z.number(),
  amount: z.number(), // Stored as numeric in DB, but we use number in TS
  date: z.coerce.date(), // Automatically converts string timestamps to Date objects
  description: z.string(),
  category: expenseCategorySchema,
  created_at: z.coerce.date()
});

export type Expense = z.infer<typeof expenseSchema>;

// Input schema for creating expenses
export const createExpenseInputSchema = z.object({
  amount: z.number().positive(), // Validate that amount is positive
  date: z.coerce.date(),
  description: z.string().min(1), // Ensure description is not empty
  category: expenseCategorySchema
});

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

// Input schema for updating expenses
export const updateExpenseInputSchema = z.object({
  id: z.number(),
  amount: z.number().positive().optional(),
  date: z.coerce.date().optional(),
  description: z.string().min(1).optional(),
  category: expenseCategorySchema.optional()
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;

// Filter schema for querying expenses
export const expenseFilterSchema = z.object({
  category: expenseCategorySchema.optional(),
  month: z.number().int().min(1).max(12).optional(), // Month 1-12
  year: z.number().int().min(1900).optional() // Year validation
});

export type ExpenseFilter = z.infer<typeof expenseFilterSchema>;