import { ApolloServer } from '@apollo/server';

import { schema } from './schema';

export const server = new ApolloServer({
  schema,
  cache: 'bounded',
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
