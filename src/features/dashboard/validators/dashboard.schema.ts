import { z } from 'zod';

export const dashboardFilterSchema = z.object({
  search: z.string().optional(),
});

export type DashboardFilter = z.infer<typeof dashboardFilterSchema>;
