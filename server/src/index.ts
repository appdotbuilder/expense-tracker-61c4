import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  createExpenseInputSchema, 
  updateExpenseInputSchema,
  expenseFilterSchema 
} from './schema';

// Import handlers
import { createExpense } from './handlers/create_expense';
import { getExpenses } from './handlers/get_expenses';
import { updateExpense } from './handlers/update_expense';
import { deleteExpense } from './handlers/delete_expense';
import { getExpenseById } from './handlers/get_expense_by_id';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new expense
  createExpense: publicProcedure
    .input(createExpenseInputSchema)
    .mutation(({ input }) => createExpense(input)),

  // Get all expenses with optional filtering
  getExpenses: publicProcedure
    .input(expenseFilterSchema.optional())
    .query(({ input }) => getExpenses(input)),

  // Get a single expense by ID
  getExpenseById: publicProcedure
    .input(z.number())
    .query(({ input }) => getExpenseById(input)),

  // Update an existing expense
  updateExpense: publicProcedure
    .input(updateExpenseInputSchema)
    .mutation(({ input }) => updateExpense(input)),

  // Delete an expense by ID
  deleteExpense: publicProcedure
    .input(z.number())
    .mutation(({ input }) => deleteExpense(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();