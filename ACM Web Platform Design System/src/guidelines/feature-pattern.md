# Feature Pattern Guide

Standard structure for features in `src/features/`.

## Folder Structure

```
features/{domain}/{feature-name}/
├── index.tsx          # Main container (View)
├── types.ts           # Feature-specific types
├── constants.ts       # Feature constants & config
├── utils.ts           # Transform & helper functions
├── hooks/
│   ├── use{Feature}.ts      # Main ViewModel hook
│   └── use{Feature}Filters.ts # (Optional) Filter logic
└── components/
    └── {Component}.tsx  # Sub-components
```

## View/ViewModel Pattern

### View (`index.tsx`)
- Pure UI rendering
- Minimal logic, just destructure from hook
- Handles layout and composition

```typescript
export function PlotManagement() {
  const {
    plots,
    isLoading,
    handleAddPlot,
    // ... other state/handlers
  } = usePlotManagement();

  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <div>
      <PlotToolbar onAdd={handleAddPlot} />
      <PlotList plots={plots} />
    </div>
  );
}
```

### ViewModel (`hooks/use{Feature}.ts`)
- All business logic
- State management
- API calls via entity hooks
- Returns typed interface

```typescript
export interface UsePlotManagementReturn {
  plots: Plot[];
  isLoading: boolean;
  handleAddPlot: (data: PlotRequest) => void;
}

export const usePlotManagement = (): UsePlotManagementReturn => {
  const { data, isLoading } = usePlots();
  
  const handleAddPlot = useCallback((data) => {
    createMutation.mutate(data);
  }, [createMutation]);

  return { plots: data ?? [], isLoading, handleAddPlot };
};
```

## Key Principles

1. **View = Dumb**: Only render, no complex logic
2. **ViewModel = Smart**: All state, effects, handlers
3. **Typed Returns**: Every hook has explicit return type
4. **Utils = Pure Functions**: No React, easily testable
5. **Constants**: Extract magic values and configs
