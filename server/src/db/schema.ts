import { serial, text, pgTable, timestamp, numeric, pgEnum, date } from 'drizzle-orm/pg-core';

// Define expense category enum for PostgreSQL
export const expenseCategoryEnum = pgEnum('expense_category', [
  'Food',
  'Transport',
  'Housing', 
  'Entertainment',
  'Utilities',
  'Shopping',
  'Salary'
]);

export const expensesTable = pgTable('expenses', {
  id: serial('id').primaryKey(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(), // Use numeric for monetary values with precision
  date: date('date').notNull(), // Date field for expense date
  description: text('description').notNull(),
  category: expenseCategoryEnum('category').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Expense = typeof expensesTable.$inferSelect; // For SELECT operations
export type NewExpense = typeof expensesTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { expenses: expensesTable };