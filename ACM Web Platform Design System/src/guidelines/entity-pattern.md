# Entity Pattern Guide

Standard structure for all entities in `src/entities/`.

## Folder Structure

```
entities/{entity-name}/
├── index.ts           # Public exports barrel
├── model/
│   ├── schemas.ts     # Zod schemas for validation
│   ├── types.ts       # Re-exports types from schemas
│   └── keys.ts        # React Query keys factory
└── api/
    ├── client.ts      # Pure axios API calls (no React)
    └── hooks.ts       # React Query hooks
```

## Example Files

### `model/schemas.ts`
```typescript
import { z } from 'zod';

// Response schema
export const PlotSchema = z.object({
  id: z.number().int().positive(),
  plotName: z.string(),
  area: z.number().positive().optional(),
});

export type Plot = z.infer<typeof PlotSchema>;

// Request schema
export const PlotRequestSchema = z.object({
  plotName: z.string().min(1, "Required"),
  area: z.number().positive().optional(),
});

export type PlotRequest = z.infer<typeof PlotRequestSchema>;
```

### `model/keys.ts`
```typescript
export const plotKeys = {
  all: ['plots'] as const,
  lists: () => [...plotKeys.all, 'list'] as const,
  detail: (id: number) => [...plotKeys.all, 'detail', id] as const,
};
```

### `api/client.ts`
```typescript
import httpClient from '@/shared/api/http';
import { PlotSchema, PlotRequestSchema } from '../model/schemas';
import { parseApiResponse } from '@/shared/api/types';

export const plotApi = {
  listAll: async (): Promise<Plot[]> => {
    const response = await httpClient.get('/api/v1/plots');
    return parseApiResponse(response.data, z.array(PlotSchema));
  },

  create: async (data: PlotRequest): Promise<Plot> => {
    const validated = PlotRequestSchema.parse(data);
    const response = await httpClient.post('/api/v1/plots', validated);
    return parseApiResponse(response.data, PlotSchema);
  },
};
```

### `api/hooks.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plotApi } from './client';
import { plotKeys } from '../model/keys';

export const usePlots = () => {
  return useQuery({
    queryKey: plotKeys.lists(),
    queryFn: plotApi.listAll,
  });
};

export const useCreatePlot = (options?: { onSuccess?: () => void }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: plotApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plotKeys.all });
      options?.onSuccess?.();
    },
  });
};
```

## Key Principles

1. **Zod First**: Define schemas, derive types with `z.infer<>`
2. **Pure API Client**: No React dependencies in `client.ts`
3. **Query Keys Factory**: Centralized, type-safe cache keys
4. **Minimal Exports**: Only export what features need
