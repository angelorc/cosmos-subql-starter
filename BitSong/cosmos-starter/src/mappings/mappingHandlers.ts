import { Transaction, Fantoken, FantokenIssueEvent } from "../types";
import {
  CosmosEvent,
  CosmosBlock,
  CosmosMessage,
  CosmosTransaction,
} from "@subql/types-cosmos";

export async function handleBlock(block: CosmosBlock): Promise<void> {
  // If you wanted to index each block in Cosmos (CosmosHub), you could do that here
}

export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
  const transactionRecord = Transaction.create({
    id: tx.hash,
    blockHeight: BigInt(tx.block.block.header.height),
    timestamp: tx.block.block.header.time,
  });
  await transactionRecord.save();
}

export async function handleMessage(msg: CosmosMessage): Promise<void> {
  const messageRecord = Fantoken.create({
    id: `${msg.tx.hash}-${msg.idx}`,
    blockHeight: BigInt(msg.block.block.header.height),
    txHash: msg.tx.hash,
    symbol: msg.msg.decodedMsg.symbol,
  });
  await messageRecord.save();
}

export async function handleEvent(event: CosmosEvent): Promise<void> {
  const eventRecord = new FantokenIssueEvent(`${event.tx.hash}-${event.msg.idx}-${event.idx}`,);
  eventRecord.blockHeight = BigInt(event.block.block.header.height);
  eventRecord.txHash = event.tx.hash;
  for(const attr of event.event.attributes) {
    switch(attr.key) {
      case "denom":
        eventRecord.denom = attr.value.slice(1, -1);
        break;
      default:
        break;
    }
  }
  await eventRecord.save();
}
