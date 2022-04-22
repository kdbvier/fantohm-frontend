import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { Block, BlockTag, EventType, Filter, Listener, Log, Network, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/providers";
import { BigNumber, BigNumberish } from "ethers";
import { Deferrable } from "ethers/lib/utils";

export interface Node {
  provider: Provider,
  maxConcurrentFlights: number,
}

export class FallbackProvider extends Provider {
  readonly networkName: string;
  readonly nodes: Node[];
  readonly requestsInFlight: { [key: number]: number };
  readonly maxAttempts: number; // Max attempts a single call will make (if failed)
  readonly useTopN: number; // Only use the fastest N nodes

  constructor(nodes: Node[], networkName: string, maxAttempts = 2, useTopN = 3) {
    super();
    this.networkName = networkName;
    this.nodes = nodes;
    this.requestsInFlight = {};
    this.maxAttempts = maxAttempts;
    this.useTopN = useTopN;
  }

  getBlockNumber(): Promise<number> {
    return this.nodes[0].provider.getBlockNumber();
  }

  async call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
    return this._call(transaction, blockTag);
  }


  private async _call(transaction: Deferrable<TransactionRequest>, blockTag?: BlockTag | Promise<BlockTag>, attempts: number = 0): Promise<string> {
    return new Promise((resolve, reject) => {

      // Iterate through the nodes (which are ordered by fastest)
      // and try to find one that is available for use
      for (var i = 0; i < Math.min(this.nodes.length, this.useTopN); i++) {
        if (!(i in this.requestsInFlight)) this.requestsInFlight[i] = 0;

        // Find the first available node that can take the request
        if (this.requestsInFlight[i] < this.nodes[i].maxConcurrentFlights) {
          this.requestsInFlight[i]++;

          // Attempt the request
          return this.nodes[i].provider.call(transaction, blockTag)
            .then(result => resolve(result))
            .catch(error => {
              // If call failed, let's attempt it up to some max number of times
              if (attempts < this.maxAttempts) {
                this._call(transaction, blockTag, attempts + 1).then(result => resolve(result)).catch(error => reject(error));
              } else {
                reject(error);
              }
            })
            // When done (success or failure), free up the node of this request after 1 second
            .finally(() => setTimeout(() => this.requestsInFlight[i]--, 1000));
        }
      }

      // If no nodes are currently available, wait 1 second and try again
      setTimeout(() => this._call(transaction, blockTag).then(result => resolve(result)), 1000);
    });
  }
  
  // The following are (currently) never called
  getNetwork(): Promise<Network> {
    throw new Error("Method not implemented.");
  }
  getGasPrice(): Promise<BigNumber> {
    throw new Error("Method not implemented.");
  }
  getBalance(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<BigNumber> {
    throw new Error("Method not implemented.");
  }
  getTransactionCount(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getCode(addressOrName: string | Promise<string>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getStorageAt(addressOrName: string | Promise<string>, position: BigNumberish | Promise<BigNumberish>, blockTag?: BlockTag | Promise<BlockTag>): Promise<string> {
    throw new Error("Method not implemented.");
  }
  sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
    throw new Error("Method not implemented.");
  }
  estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
    throw new Error("Method not implemented.");
  }
  getBlock(blockHashOrBlockTag: BlockTag | Promise<BlockTag>): Promise<Block> {
    throw new Error("Method not implemented.");
  }
  getBlockWithTransactions(blockHashOrBlockTag: BlockTag | Promise<BlockTag>): Promise<BlockWithTransactions> {
    throw new Error("Method not implemented.");
  }
  getTransaction(transactionHash: string): Promise<TransactionResponse> {
    throw new Error("Method not implemented.");
  }
  getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt> {
    throw new Error("Method not implemented.");
  }
  getLogs(filter: Filter): Promise<Log[]> {
    throw new Error("Method not implemented.");
  }
  resolveName(name: string | Promise<string>): Promise<string> {
    throw new Error("Method not implemented.");
  }
  lookupAddress(address: string | Promise<string>): Promise<string> {
    throw new Error("Method not implemented.");
  }
  on(eventName: EventType, listener: Listener): Provider {
    throw new Error("Method not implemented.");
  }
  once(eventName: EventType, listener: Listener): Provider {
    throw new Error("Method not implemented.");
  }
  emit(eventName: EventType, ...args: any[]): boolean {
    throw new Error("Method not implemented.");
  }
  listenerCount(eventName?: EventType): number {
    throw new Error("Method not implemented.");
  }
  listeners(eventName?: EventType): Listener[] {
    throw new Error("Method not implemented.");
  }
  off(eventName: EventType, listener?: Listener): Provider {
    throw new Error("Method not implemented.");
  }
  removeAllListeners(eventName?: EventType): Provider {
    throw new Error("Method not implemented.");
  }
  waitForTransaction(transactionHash: string, confirmations?: number, timeout?: number): Promise<TransactionReceipt> {
    throw new Error("Method not implemented.");
  }

}