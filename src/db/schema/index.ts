import { integer, jsonb, pgTable } from 'drizzle-orm/pg-core';

export const dashboardOverrides = pgTable('dashboard_overrides', {
  id:       integer('id').primaryKey().default(1),
  names:    jsonb('names').default({}).$type<Record<string, string>>(),
  quarters: jsonb('quarters').default({}).$type<Record<string, string>>(),
  colors:   jsonb('colors').default({}).$type<Record<string, string>>(),
  impacts:  jsonb('impacts').default({}).$type<Record<string, string>>(),
});
