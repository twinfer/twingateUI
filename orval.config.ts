import { defineConfig } from 'orval'

export default defineConfig({
  twincore: {
    input: {
      target: './swagger/swagger.yaml',
    },
    output: {
      mode: 'split',
      target: './src/api/generated',
      schemas: './src/api/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/api/mutator.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useMutation: true,
          options: {
            staleTime: 10000,
          },
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
  // MSW generation disabled due to compatibility issues
  // Manual MSW handlers will be created instead
})