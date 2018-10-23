const {
  ApolloServer,
  gql
} = require('apollo-server');
const axios = require('axios')
const { DO_KEY } = require('./env');
const DO_API = axios.create({
  baseURL: 'https://api.digitalocean.com/v2',
  responseType: 'json'
});
DO_API.defaults.headers.common = { 'Authorization': "bearer " + DO_KEY }

const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  type Droplet {
    name: String
    id: String
    disk: String
    ip_address: String
    locked: Boolean
    memory: Int
  }

  type Volume {
    name: String
    id: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    dropletList: [Droplet]
    volumeList: [Volume]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    dropletList: () =>
      DO_API.get('/droplets')
        .then(res => res.data.droplets),
    volumeList: () =>
      DO_API.get('/volumes')
        .then(res => res.data.volumes),
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({
  typeDefs,
  resolvers
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({
  url
}) => {
  console.log(`🚀  Server ready at ${url}`);
});