const { ApolloServer, gql } = require('apollo-server-express');
// const { ApolloServer, gql } = require('apollo-server');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const { DO_KEY } = require('./env');
const DO_API = axios.create({
  // baseURL: 'https://api.digitalocean.com/v2',
  // baseURL: 'https://cloud.digitalocean.com/api/v1',
  responseType: 'json'
});

// DO_API.defaults.headers.common = { 'Authorization': "bearer " + DO_KEY }

const typeDefs = gql`

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
    test: String
  }
`;

const doSessionKey = '_digitalocean2_session_v4';
const doSessionId = 'dGtGOWtDOXpORGFHZjloTmtHT2d1OTFZb1N6YTNHVjg2cVpnV1N5bnpmNEw1QXFQN3ZEWkg1MXZ6cm1tdEU5Z21JNFVwbFNlUmN0cVFUbVhWNFVkeVE5TmozcWFwTndMRktDeHYzK3lWZTdxT3VHV1Jqd2JTT0VUUmtlVGtOeWxMUmQwUUpGV09ZMURuelV0aHdmMUdPTk9HeVZublJxOU1xOHdGNDlDM3ZLZUdvZ0NYRGplTzNscXFPTk4weTdjMko4RlF1bHpuaXZxRy96ZUpvS0FuSW9ZTThOclhuVktuOEVxdDFNNkZmOEdkSlRFV3ZKUHovN3FsZXVDcmdHQVFwVnhJczMyVXhyQmdoeFR3RzFROFdBK3JTeThPOCs4WXZ5bXdYYVpDZzQ4Z1VTQkg1dXY1bEYxYUVZUkxOckxnYzNnNE8xenpCdU8yMS9lUjJUTTlyNU16Q0J0TG51YVh5bTJwTWlnaE94d0Y5aDZXLzFYb1hBUUF2N21xNmVScml4eFpGOENSRDZvYXBGa1c5ZDlkNVJBdXlNQnptcW4xRlhVdDlnR2NsLzJWVXp4dEI0aVJmNjFYZmI5ZThMUkJOMjZxRmFFTDRhNm5oVWM0bUxCeWM1NFFqVzRvMzU4REhWbXVmNjJuSlY1YXdjRE1PNWNHbXFETzRnYk5aaHZyLzdtNE91K0lKMEVnL1M5R0dmcS9XUGdrQiswc255YXZZZjlaUkRXL1UrTno2bGdTVGNoQXNCaHNDN3JiYnkrRmRNTEUwQklnQmFMS2FWNkxMMlBwc0pFa1AxVHAxWlNoVCs3ZFpKUVVsSHkvOUtYQU1rTG9DQnJvMkczRkJ3ZkpCUHFLN1ZZN2ZBUmh6eFBRaURDZ3RnY2ZRbkxOZ01HcVgzamhqWHJvaWtMODVmVTl0alRiZ2gzbXdpN2ZRTy8zMU1HTDJEQllwZlEvblRHOS9ad3Z4aGxJSENSN1BlMldGNWlVeEozV1hnWis1UTV6NFZXYnlhbnZvRFJMbXlQY2s1cHg2cG9ITm9PUHlVMHlUZHJZNlJOZDZ6blp5YXhVSVlXZSsvazBVK3JVMi9BMmJsM2hMT29lUktaVzJPYnk4Y2M2QlZ5SWptcmlMQXNOTkVyWXdtWkhYK2gvdS9sRnRQR2dSU2FHMCtrMFhmTm5EbVMzNGJUWkJsL21rV1JxVWIvcXB2Z3RJL0ZWcDZ5NVIyK05NVGt1aVZIU0IxVGNpTlhVRnRqSklVcFhzL3FtZ2p4UkYwZk9MZTJtcXlrLS1PYXRkQTRJSUJYemQ1ZWE2Y1dYQWRnPT0%3D--d3a2ec8e43fa6e99c78c1a4aa58503c227bd8ad3'

function defaultHeaders() {
  // let cs = Object.keys(cookies).reduce((p, c) => p + p + `${c}=${cookies[c]},`, '');
  let cookie = `${doSessionKey}=${doSessionId}`;
  let headers = {
    'Accept': 'application/json',
    'Content-type': 'application/json',
    'Connection': 'keep-alive',
    'Cookie':JSON.stringify(cookie)
  };

  return headers;
}

const resolvers = {
  Query: {
    dropletList: (parent, args, context, info) => {
      let cs = defaultHeaders(context.cookies);
      DO_API.get('https://cloud.digitalocean.com/api/v1/droplets', {
        headers: defaultHeaders()
      })
        .then(res => res.data)
        .catch(err => console.log('errrrrr', err))
        },
    volumeList: (parent, args, context, info) =>
      DO_API.get('https://api.digitalocean.com/v2/volumes', {
        headers: { 'Authorization': "bearer " + DO_KEY }
      })
        .then(res => {
          return res.data;
        })
        .catch(err => console.log('errrrrr', err)),
    test: (parent, args, context, info) => {
      return 'testing';
    },
  },
};

var corsOptions = {
  origin: ['https://localdev.internal.digitalocean.com:4500', 'http://localhost:3000'],
  optionsSuccessStatus: 200,
  methods: ['GET', 'PUT', 'POST'],
  credentials: true,
  allowedHeaders: 'x-cookie-session,cache,cookie,content-type,x-context-id,x-csrf-token,x-device-browser,x-device-operating-system,x-request-id'
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    cookies: req.cookies
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
