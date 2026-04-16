import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

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

/* ── Portfolio Planning tables ── */

export const masterProjects = pgTable('master_projects', {
  id:          text('id').primaryKey(),
  name:        text('name').notNull(),
  description: text('description').notNull().default(''),
  repoUrl:     text('repo_url'),
  stack:       text('stack'),
  status:      text('status').notNull().default('active'),
  launchedAt:  date('launched_at'),
  users:       text('users'),
  color:       text('color').notNull().default('#6366f1'),
  phases:      jsonb('phases').default([]).$type<{ name: string; description: string; status: string }[]>(),
  diagramData: jsonb('diagram_data').$type<{ nodes: unknown[]; edges: unknown[] }>(),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cycles = pgTable('cycles', {
  id:             text('id').primaryKey(),
  name:           text('name').notNull(),
  startDate:      date('start_date').notNull(),
  endDate:        date('end_date').notNull(),
  goal:           text('goal'),
  budgetWeeks:    numeric('budget_weeks').notNull().default('4.5'),
  status:         text('status').notNull().default('planning'),
  retroShipped:   text('retro_shipped'),
  retroMissed:    text('retro_missed'),
  retroLearnings: text('retro_learnings'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const feedbackInbox = pgTable('feedback_inbox', {
  id:          uuid('id').primaryKey().defaultRandom(),
  source:      text('source').notNull(),
  sourceId:    text('source_id'),
  projectId:   text('project_id'),
  category:    text('category').notNull().default('feature-request'),
  author:      text('author').notNull().default('Anonymous'),
  title:       text('title').notNull(),
  body:        text('body'),
  status:      text('status').notNull().default('pending'),
  backlogItemId: text('backlog_item_id'),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const backlogItems = pgTable('backlog_items', {
  id:            text('id').primaryKey(),
  projectId:     text('project_id').notNull(),
  title:         text('title').notNull(),
  description:   text('description'),
  businessValue: integer('business_value').notNull().default(3),
  reach:         integer('reach').notNull().default(3),
  urgency:       integer('urgency').notNull().default(3),
  impact:        numeric('impact').notNull().default('3.0'),
  effort:        text('effort').notNull().default('M'),
  effortWeeks:   numeric('effort_weeks').notNull().default('2'),
  priority:      numeric('priority').notNull().default('1.5'),
  status:        text('status').notNull().default('backlog'),
  cycleId:       text('cycle_id'),
  jiraKey:       text('jira_key'),
  jiraProject:   text('jira_project').notNull().default('MAUT'),
  notes:         text('notes'),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const standaloneDiagrams = pgTable('standalone_diagrams', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull(),
  color:       text('color').notNull().default('#6366f1'),
  diagramData: jsonb('diagram_data').default({ nodes: [], edges: [] }).$type<{ nodes: unknown[]; edges: unknown[] }>(),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const epicTasks = pgTable('epic_tasks', {
  id:            uuid('id').primaryKey().defaultRandom(),
  backlogItemId: text('backlog_item_id').notNull(),
  title:         text('title').notNull(),
  status:        text('status').notNull().default('todo'),
  assignee:      text('assignee'),
  jiraKey:       text('jira_key'),
  sortOrder:     integer('sort_order').notNull().default(0),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
