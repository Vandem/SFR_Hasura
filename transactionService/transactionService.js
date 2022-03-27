const fetch = require('node-fetch');

function fetchGraphQL(operationsDoc, operationName, variables) {
    return fetch(
        "https://sfr-transactions.hasura.app/v1/graphql",
        {
            method: "POST",
            headers: { 'x-hasura-admin-secret': "77R0DYi6IM9eAnr1kBCLC9tT8QbY0zrFdF5P9nsOBZ16v7u3rrwHb4oLwcXwH5f8" },
            body: JSON.stringify({
                query: operationsDoc,
                variables: variables,
                operationName: operationName
            })
        }
    ).then((result) => {
        result.json();
    });
}

const setPaymentComplete = `
    mutation setPaymentComplete($paymentId: Int!) {
      update_payments_by_pk(pk_columns: {id: $paymentId}, _set: {completed: true}) {
        recipient
        id
        created_at
        completed
      }
    }
  `;

  const insertTransaction = `
    mutation insertTransaction($paymentId: Int!) {
      insert_transactions_one(object: {payment_id: $paymentId}) {
        id
        payment_id
        payment {
          amount
          completed
          created_at
          id
          recipient
        }
      }
    }
  `;

  module.exports = {
    executeSetPaymentComplete(paymentId) {
        return fetchGraphQL(
            setPaymentComplete,
            "setPaymentComplete",
            { "paymentId": paymentId }
        );
    },
    executeInsertTransaction(paymentId) {
        return fetchGraphQL(
            insertTransaction,
            "insertTransaction",
            { "paymentId": paymentId }
        );
    }
  }
