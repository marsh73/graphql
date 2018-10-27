const { ApolloServer, gql } = require('apollo-server-express');
// const { ApolloServer, gql } = require('apollo-server');
const express = require('express');
const https = require('https');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const { DO_KEY } = require('./env');
const DO_API = axios.create({
  baseURL: 'https://api.digitalocean.com/v2'
});

DO_API.defaults.headers.common = { 'Authorization': "bearer " + DO_KEY }

const typeDefs = gql`

  type Droplet {
    name: String
    id: String
    disk: String
    ip_address: String
    locked: Boolean
    memory: Int
  }

  type Project {
    id: ID
    owner_uuid: ID
    owner_id: Int
    name: String
    description: String
    purpose: String
    environment: String
    is_default: Boolean
  }

  type Account {
    uuid: ID
    email: String
    droplet_limit: Int
    status: String
    status_message: String
    email_verified: Boolean
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
 #   pagination: Pagination
    total: String
  }

  type DropletList {
    droplets: [Droplet]
    meta: Meta
  }

  type VolumeList {
    volumes: [Volume]
    meta: Meta
  }

  type ProjectList {
    projects: [Project]
    meta: Meta
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    dropletList: DropletList
    volumeList: VolumeList
    account: Account
    projectList: ProjectList
  }
`;

const doSessionKey = '_digitalocean2_session_v4';
const doSessionId = 'eWdlb1ZlZncwc2lsVmhrMWJpUnU0RlI5WVlVSzJ3dTY2YjJCeXpDeWM3Y2IyTURwYlFUak5nOE50c0Vtd1E4M3QrSkNjd1pqYlJ1VFcxU1dZNGJqS3J6L2llVWQzQ2ZmTjU2bU1IQ25SSGhXNGpsb0U5MmFST0Z0N3QvUFMybHR0WExjTTNraDV5WWQyMnJ2dExmNERvdGovbHdFSFR3aDVGSUtyelo1NGhJVUczREpmMklYVUM4SHcxK2hPQ0Nva0xReDROZ0FIRVBtUTJvbzdLS3hxUTVUQzFPaDZtTXNBTDBxeXpoNS9xeFFCU1o1a1ZadnR0bnNIdUdObjZDbyt1aXVlNzl6N2hENWh0WnljYUgyUEJ3Z0w4aDAvWklSdjFEUTltZytiRXlnWnhlc0JPR2V6NytwSFBJVzVxWWxMRUJONXhMcy9qZVUrRE80YkJaTWF4UUU5bFMzK1ZGdXJUUHc3cVlWY2pmbFdnNm13ajkwUWR1TGtQWWVNUFJEWmVxcDFqVWdPNWt2NVgvNnluYWUyMUR4ZlZlTVV6VjZjVDZJajhVTSt6dkdQeWd0QitadXBJRUlma09kWGVLZEQ2Vmgyc1dmZkRFV2o3SlZRTjN6RkhPdEwxaFo5ZVZKQnJhb0IvLzMwbGJSbDRvQ1dFZXNjL0liUU1tVEJiWVBZaVkxT1JYbEdnR1gvWlNYc2VmdGZ6Wi85QTgzUXd1Ny9ubXVxZVlOYWtIVjg5QTY3UjRiZFhwK0pRNzRFdDZtUjNsT2IvVmZ3WTM4Uitqd2NZTlg1ODdhMUNCd3dpZ2lxQ1hVV1pZRzNZQXRoU1FrVXlpQldFTUZCMEZUL1FTVk1oVHN3a3lwQzFiS2xxZG41K2JxbjFMbld1eExYaHExU2Z4NjlnRzZCZGxEalM5OHRIbEhlQlN4ajY2YnJFb1FGSkkwa2YvVXg0emFsSEp6bHBCTnRycFNWR2RlYUIwbnBOR2hINk15QkJsRnNQSGlhcU85M085YzcvMDJCUVdmRldOMEpUMVdCajB0azdmV3k3eFpibFAxeTZyTzczRHhzOHR0VVdEMGo3SCt6TFdYTDVFd21jaG5XWWYzNHYvTi0tcnpIVGJsNmZaeHc4R2ZobGkrY3FMQT09--e9682d61dfaacaf10d84b098021878c8f4f3cd72'

function defaultHeaders(context) {
  let cs = Object.keys(context.cookies).reduce((p, c) => p + p + `${c}=${cookies[c]},`, '');
  let cookie = `${doSessionKey}=${doSessionId}`;

  let headers = {
    'Accept': 'application/json',
    'Content-type': 'application/json',
    'Connection': 'keep-alive',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.67 Safari/537.36',
    'Cookie': cookie
  };

  return headers;
}

const resolvers = {
  Query: {
    dropletList: () => DO_API.get('/droplets').then(res => res.data).catch(err => err),
    volumeList: () => DO_API.get('/volumes').then(res => res.data).catch(err => err),
    account: () => DO_API.get('/account').then(res => res.data.account).catch(err => err),
    projectList: () => DO_API.get('/projects').then(res => res.data).catch(err => err),
  },
};

var corsOptions = {
  origin: ['https://localdev.internal.digitalocean.com:4500', 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  methods: ['GET', 'PUT', 'POST'],
  credentials: true,
  allowedHeaders: 'user-agent,accept-language,x-cookie-session,cache,cookie,content-type,x-context-id,x-csrf-token,x-device-browser,x-device-operating-system,x-request-id'
};

const server = new ApolloServer({
  cors: false,
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    cookies: req.cookies,
    proxy_headers: req.headers
  })
});

const app = express();
const path = '/graphql';

app.use(cookieParser());
app.use( function (req, res, next) {
  // auth middleware here.
  return next();
});

server.applyMiddleware({ app, path, cors:corsOptions });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
