'use strict';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { NodejsClient } from 'contensis-management-api/lib/client/nodejs-client.js';

// Set some variables.
const port = 3001;
const ROOT_URL = `https://cms-${process.env.alias}.cloud.contensis.com/`;
const PROJECT = process.env.projectId;
//import {} from 'dotenv/config';

const client = NodejsClient.create({
  clientType: 'client_credentials',
  clientDetails: {
    clientId: process.env.CONTENSIS_CLIENT_ID,
    clientSecret: process.env.CONTENSIS_CLIENT_SECRET,
  },
  projectId: PROJECT,
  rootUrl: ROOT_URL,
});

// Start the server.
const app = express();
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});

// Log all requests to the server
const myLogger = function (req, _, next) {
  console.log(`Incoming: ${req.url}`);
  next();
};

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(myLogger);

// Routes

app.post('/*', (req, res) => {
  let entry = req.body;
  if (req.query.type === 'create') {
    entry.sys = {
      id: uuidv4(),
      contentTypeId: 'commentLikeReply',
      projectId: PROJECT,
      language: 'en-GB',
      dataFormat: 'entry',
    };
    client.entries
      .create(entry)
      .then((result) => {
        console.log(result);
        return res.json(result);
      })
      .catch((error) => {
        console.log(error);
        return res.json(error);
      });
  } else {
    client.entries
      .update(entry)
      .then((result) => {
        return res.json(result);
      })
      .catch((error) => {
        if (error.data.type === 'validation') {
          client.entries.get(entry.sys.id).then((result) => {
            return res.json({ statusText: 'retry', data: result });
          });
        } else {
          return res.json(error);
        }
      });
  }
});
