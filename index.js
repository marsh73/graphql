const {
  ApolloServer,
  gql
} = require('apollo-server');
const axios = require('axios')
const { DO_KEY } = require('./env');
axios.defaults.headers.common = { 'Authorization': "bearer " + DO_KEY }

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [{
  title: 'Harry Potter and the Chamber of Secrets',
  author: 'J.K. Rowling',
},
{
  title: 'Jurassic Park',
  author: 'Michael Crichton',
},
];

const peeps = [{
    name: 'marsh',
  },
  {
    name: 'cat',
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  # Comments in GraphQL are defined with the hash (#) symbol.

  # This "Book" type can be used in other type declarations.
  type Book {
    title: String
    author: String
  }

  type Peep {
    name: String
  }

  type Droplet {
    name: String
    id: String
    disk: String
    ip_address: String
    locked: Boolean
    memory: Int
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book]
    peeps: [Peep]
    hello: String
    dropletList: [Droplet]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
    peeps: () => peeps,
    hello: () =>
      axios.get('https://fourtonfish.com/hellosalut/?mode=auto')
        .then(res => res.data.hello),
    dropletList: () =>
      axios.get('https://api.digitalocean.com/v2/droplets')
        .then(res => res.data.droplets),
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