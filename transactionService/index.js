const express = require("express");
const bodyParser = require("body-parser");
const { execute } = require('apollo-link');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');
const ws = require('ws');
const gql = require('graphql-tag');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const { executeInsertTransaction, executeSetPaymentComplete } = require("./transactionService");

const SUBSCRIBE_TO_PAYMENTS = gql`
  subscription getPayments {
    payments {
      amount
      created_at
      id
      recipient
      completed
    }
  }`;

const getWsClient = function (wsurl) {
    const client = new SubscriptionClient(
        wsurl, { reconnect: true, connectionParams: { headers: { 'x-hasura-admin-secret': "77R0DYi6IM9eAnr1kBCLC9tT8QbY0zrFdF5P9nsOBZ16v7u3rrwHb4oLwcXwH5f8" } } }, ws
    );
    return client;
};

const createSubscriptionObservable = (wsurl, query, variables) => {
    const link = new WebSocketLink(getWsClient(wsurl));
    return execute(link, { query: query, variables: variables });
};

function subscribeToPayments() {
    const subscriptionClient = createSubscriptionObservable(
        'wss://sfr-transactions.hasura.app/v1/graphql', // GraphQL endpoint
        SUBSCRIBE_TO_PAYMENTS                           // Subscription query
    );
    var consumer = subscriptionClient.subscribe(eventData => {
        console.log("Received event: ");
        console.log(JSON.stringify(eventData, null, 2));

        for (const payment of eventData.data.payments) {
            if (!payment.completed) {
                executeSetPaymentComplete(payment.id);
            }
            executeInsertTransaction(payment.id);
        }
    }, (err) => {
        console.log('Err');
        console.log(err);
    });
}

subscribeToPayments();

app.listen(PORT, () => console.log(`Listening on port ${PORT}...`))