# SFR_Hasura

## Implementation

### Hasura Client
The Hasura client is deployed on the cloud and uses a PostgreSQL database with a payments and a transactions table. They have a 1:1 relationship through payment.id -> transaction.payment_id

### Transaction Service
I implemented a small express transaction service that subscribes to payments, marks them as completed and inserts corresponding transactions.
The payment subscription can be found in index.js.
Functions to mutate the payments and transactions tables are in the transactionsService.js file.

Start with "node index.js"

### Frontend Client (folder "sfr-hasura")
The client is built with angular and uses Apollo as an abstraction layer.
It can be used to create new payments via mutation and subscribes to payment and transaction changes.
Payments and transactions are presented in the GUI.

You can find everything relevant in the sfr-hasura\src\app\payments component.

Start with "ng serve"
