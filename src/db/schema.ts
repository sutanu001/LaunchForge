import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const ideas = pgTable("ideas", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  category: text("category").notNull(),
  analysis: text("analysis"),
  techStack: text("tech_stack"),
  features: text("features"),
  schemaData: text("schema_data"),
  roadmap: text("roadmap"),
  monetization: text("monetization"),
  competitors: text("competitors"),
  swot: text("swot"),
  notes: text("notes")
});
