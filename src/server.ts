import {ApolloServer} from 'apollo-server'
import { schema } from './schema'
import { createContext } from './context'
import { print } from 'graphql'

class BasicLogging {
    requestDidStart({queryString, parsedQuery, variables}: any) {
        const query = queryString || print(parsedQuery);
        console.log(query);
        console.log(variables);
    }

    willSendResponse({graphqlResponse}: any) {
        console.log(JSON.stringify(graphqlResponse, null, 2));
    }
}

export const server = new ApolloServer({ schema, context: createContext, extensions: [() => new BasicLogging()] })

