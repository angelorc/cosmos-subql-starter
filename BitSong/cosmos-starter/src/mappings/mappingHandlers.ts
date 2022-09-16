import { Fantoken } from "../types";
import {
  CosmosEvent,
  CosmosMessage,
} from "@subql/types-cosmos";

export async function handleMsgIssue(msg: CosmosMessage): Promise<void> {
  const messageRecord = Fantoken.create({
    id: `${msg.tx.hash}-${msg.idx}`,
    blockHeight: BigInt(msg.block.block.header.height),
    txHash: msg.tx.hash,
    name: msg.msg.decodedMsg.name,
    symbol: msg.msg.decodedMsg.symbol,
    denom: "",
    max_supply: msg.msg.decodedMsg.maxSupply,
    uri: msg.msg.decodedMsg.uri,
    authority: msg.msg.decodedMsg.authority,
    minter: msg.msg.decodedMsg.minter,
    createdAt: new Date(msg.block.block.header.time),
    updatedAt: new Date(msg.block.block.header.time),
  });
  await messageRecord.save();
}

export async function handleEventIssue(event: CosmosEvent): Promise<void> {
  const messageRecord = await Fantoken.get(`${event.tx.hash}-${event.msg.idx}`)
  for(const attr of event.event.attributes) {
    switch(attr.key) {
      case "denom":
        messageRecord.denom = attr.value.slice(1, -1);
        break;
      default:
        break;
    }
  }
  await messageRecord.save();
}


/*export async function handleBlock(block: CosmosBlock): Promise<void> {
  // If you wanted to index each block in Cosmos (CosmosHub), you could do that here
}

export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
  const transactionRecord = Transaction.create({
    id: tx.hash,
    blockHeight: BigInt(tx.block.block.header.height),
    timestamp: tx.block.block.header.time,
  });
  await transactionRecord.save();
}*/