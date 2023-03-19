import { startStandaloneServer } from '@apollo/server/standalone';

import { createContext } from './src/context';
import { server } from './src/server';

const path = '/graphql';
const port = process.env.PORT || '8080';

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    context: createContext,
    listen: { path, port: Number.parseInt(port) },
  });

  console.log(`🚀  Server ready at ${url}`);
}

startServer();
