import type { CodegenConfig } from '@graphql-codegen/cli';
import { printSchema } from 'graphql';

import { schema } from './src/schema';

const config: CodegenConfig = {
  schema: printSchema(schema),
  documents: ['./__tests__/**/*.ts'],
  generates: {
    './__tests__/gql/': {
      preset: 'client-preset',
    },
  },
};

export default config;
