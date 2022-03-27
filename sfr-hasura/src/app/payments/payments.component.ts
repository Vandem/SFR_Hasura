import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';

const GET_PAYMENTS = gql`
query getPayments {
  payments {
    id
    recipient
    amount
    created_at
  }
}`;

const SUBSCRIBE_TO_PAYMENTS = gql`
subscription subscribeToPayments {
  payments(order_by: {created_at: desc}) {
    amount
    recipient
    id
    created_at
    completed
  }
}`;

const POST_PAYMENT = gql`
  mutation ($recipient: String!, $amount: numeric!) {
    insert_payments(objects: {recipient: $recipient, amount: $amount}) {
      affected_rows
      returning {
        id
        recipient
        amount      
        created_at
      }
    }
  }`;

const SUBSCRIBE_TO_TRANSACTIONS = gql`
subscription subscribeToTransactions {
  transactions(order_by: {id: desc}) {
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
}`;

interface Payment {
  id: number;
  recipient: string;
  amount: number;
  created_at: Date;
  completed: boolean;
}

interface GetPaymentsResponse {
  payments: Payment[];
}

interface Transaction {
  id: number;
  payment_id: number;
  payment: Payment;
}

interface GetTransactionsRespone {
  transactions: Transaction[];
}

interface InsertPaymentResult {
  insert_payments: {
    affected_rows: number;
    returning: Payment[];
  };
}

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {

  transactions: Transaction[];
  payments: Payment[];
  loading: boolean;

  recipientInput: string;
  amountInput: number;

  constructor(private apollo: Apollo) { }

  ngOnInit() {
    // this.apollo.watchQuery<PaymentsComponent>({
    //   query: GET_PAYMENTS
    // })
    //   .valueChanges
    //   .subscribe(({ data, loading }) => {
    //     this.loading = loading;
    //     this.payments = data.payments;
    //   });

    // Subscription
    this.apollo.subscribe<GetPaymentsResponse>({
      query: SUBSCRIBE_TO_PAYMENTS,
    }).subscribe(({ data }) => {
      if (data) {
        const users = data.payments;
        // this.loading = false;
        this.payments = [];
        users.forEach((p, index) => {
          this.payments.push(p)
        })
      }
      console.log('got payments ', data);
    },
      (error) => {
        console.log('there was an error sending the payment query', error);
      });

    this.apollo.subscribe<GetTransactionsRespone>({
      query: SUBSCRIBE_TO_TRANSACTIONS,
    }).subscribe(({ data }) => {
      if (data) {
        const users = data.transactions;
        // this.loading = false;
        this.transactions = [];
        users.forEach((t, index) => {
          this.transactions.push(t)
        })
      }
      console.log('got transactions ', data);
    },
      (error) => {
        console.log('there was an error sending the transcation query', error);
      });


  }

  addPayment() {
    this.apollo.mutate<InsertPaymentResult>({
      mutation: POST_PAYMENT,
      variables: {
        recipient: this.recipientInput,
        amount: this.amountInput
      },
      // update: (cache, { data }) => {
      //   const existingPayments: any = cache.readQuery({
      //     query: GET_PAYMENTS
      //   });
      //   const newPayment = data.insert_payments.returning[0];
      //   cache.writeQuery({
      //     query: GET_PAYMENTS,
      //     data: { payments: [newPayment, ...existingPayments.payments] }
      //   });
      // },
    }).subscribe(({ data }) => {
      this.loading = false;
      this.recipientInput = '';
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

}
