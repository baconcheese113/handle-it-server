import { ApolloServer } from '@apollo/server';

import { IContext } from './context';
import { schema } from './schema';

export const server = new ApolloServer<IContext>({
  schema,
  cache: 'bounded',
  includeStacktraceInErrorResponses: false,
  plugins: [
    {
      // BasicLogging plugin
      async requestDidStart({ request }) {
        console.log('query: ', request.query);
        console.log('variables: ', request.variables);
        return {
          async willSendResponse({ response }) {
            console.log('response: ', JSON.stringify(response, null, 2));
          },
          async didEncounterErrors() {
            console.log('Errors encountered');
          },
        };
      },
    },
  ],
});
