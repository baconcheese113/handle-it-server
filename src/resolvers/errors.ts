import { GraphQLError } from 'graphql';

export function unauthenticatedError(message: string) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHENTICATED' },
  });
}
