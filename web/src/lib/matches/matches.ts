import type { Readable } from 'svelte/store';
import { derived } from 'svelte/store';
import type { TransactionStore } from 'web3w';
import type { Invalidator, Subscriber, Unsubscriber } from 'web3w/dist/esm/utils/internals';
import { SUBGRAPH_ENDPOINT } from '$lib/blockchain/subgraph';
import { transactions } from '$lib/blockchain/wallet';
import type { QueryState, QueryStore } from '$lib/utils/stores/graphql';
import { HookedQueryStore } from '$lib/utils/stores/graphql';
import type { EndPoint } from '$lib/utils/graphql/endpoint';
import { chainTempo } from '$lib/blockchain/chainTempo';

type Matches = {
  id: string;
  accountA: string;
  accountB: string;
}[];

// TODO web3w needs to export the type
type TransactionStatus = 'pending' | 'cancelled' | 'success' | 'failure' | 'mined';
type TransactionRecord = {
  hash: string;
  from: string;
  submissionBlockTime: number;
  acknowledged: boolean;
  status: TransactionStatus;
  nonce: number;
  confirmations: number;
  finalized: boolean;
  lastAcknowledgment?: TransactionStatus;
  to?: string;
  gasLimit?: string;
  gasPrice?: string;
  data?: string;
  value?: string;
  contractName?: string;
  method?: string;
  args?: unknown[];
  eventsABI?: unknown; // TODO
  metadata?: unknown;
  lastCheck?: number;
  blockHash?: string;
  blockNumber?: number;
  events?: unknown[]; // TODO
};

class MatchesStore implements QueryStore<Matches> {
  private queryStore: QueryStore<Matches>;
  private store: Readable<QueryState<Matches>>;
  constructor(endpoint: EndPoint, private transactions: TransactionStore) {
    this.queryStore = new HookedQueryStore(
      endpoint,
      `
    query {
      matches(first: 10) {
        id
        status
      }
    }`,
      chainTempo,
      { path: 'matches' }
    );
    this.store = derived([this.queryStore, this.transactions], (values) => this.update(values)); // lambda ensure update is not bound and can be hot swapped on HMR
  }

  private update([$query]: [QueryState<Matches>, TransactionRecord[]]): QueryState<Matches> {
    if (!$query.data) {
      return $query;
    } else {
      let newData = $query.data;
      return {
        step: $query.step,
        error: $query.error,
        data: newData,
      };
    }
  }

  acknowledgeError() {
    return this.queryStore.acknowledgeError();
  }

  subscribe(
    run: Subscriber<QueryState<Matches>>,
    invalidate?: Invalidator<QueryState<Matches>> | undefined
  ): Unsubscriber {
    return this.store.subscribe(run, invalidate);
  }
}

export const matches = new MatchesStore(SUBGRAPH_ENDPOINT, transactions);