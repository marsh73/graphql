const { ApolloServer, gql } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
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

  type Pagination {
    current_page: Int
    next_page: Int
    offset: Int
    pages: Int
    per_page: Int
    previous_page: Int
    total: Int
  }

  type Meta {
    total: Int
  }

  type DropletList {
    droplets: [Droplet]
    meta: Meta
  }

  type VolumeList {
    volumes: [Volume]
    meta: Meta
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    dropletList: DropletList
    volumeList: VolumeList
  }
`;

const resolvers = {
  Query: {
    dropletList: () =>
      DO_API.get('/droplets')
        .then(res => res.data),
    volumeList: (parent, args, context, info) =>
      DO_API.get('/volumes')
        .then(res => {
          console.log('1', arguments[0], res);
          console.log('2', arguments[1]);
          return 'hello';
        }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();

app.use(cors());
app.use(cookieParser());

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);


