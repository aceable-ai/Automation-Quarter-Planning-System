import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const dashboardOverrides = pgTable('dashboard_overrides', {
  id:           integer('id').primaryKey().default(1),
  names:        jsonb('names').default({}).$type<Record<string, string>>(),
  quarters:     jsonb('quarters').default({}).$type<Record<string, string>>(),
  colors:       jsonb('colors').default({}).$type<Record<string, string>>(),
  impacts:      jsonb('impacts').default({}).$type<Record<string, string>>(),
  dbPlanned:    jsonb('db_planned').default({}).$type<Record<string, string>>(),
  descriptions: jsonb('descriptions').default({}).$type<Record<string, string>>(),
  taskOverrides: jsonb('task_overrides').default({}).$type<Record<string, { n: string; s: number; j?: string; f?: string }[]>>(),
});

export const projectComments = pgTable('project_comments', {
  id:          uuid('id').primaryKey().defaultRandom(),
  projectName: text('project_name').notNull(),
  author:      text('author').notNull().default('Anonymous'),
  content:     text('content').notNull(),
  vetted:      boolean('vetted').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
