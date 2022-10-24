import { server } from './src/server';

const path = '/graphql';
const port = process.env.PORT || 8080;

server.listen({ port, path }, () =>
  console.log(`🚀  Server ready at http://localhost:${port}${server.graphqlPath}`)
);
