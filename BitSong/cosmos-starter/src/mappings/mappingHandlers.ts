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
    maxSupply: msg.msg.decodedMsg.maxSupply,
    supply: BigInt(0),
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

export async function handleMsgMint(msg: CosmosMessage): Promise<void> {
  const fantokens = await Fantoken.getByDenom(msg.msg.decodedMsg.coin.denom)

  if (fantokens.length > 0) {
    const fantoken = fantokens[0]
    fantoken.supply += BigInt(msg.msg.decodedMsg.coin.amount)
    fantoken.updatedAt = new Date(msg.block.block.header.time),

    await fantoken.save()
  }
}

export async function handleMsgBurn(msg: CosmosMessage): Promise<void> {
  const fantokens = await Fantoken.getByDenom(msg.msg.decodedMsg.coin.denom)

  if (fantokens.length > 0) {
    const fantoken = fantokens[0]
    fantoken.supply -= BigInt(msg.msg.decodedMsg.coin.amount)
    fantoken.updatedAt = new Date(msg.block.block.header.time),

    await fantoken.save()
  }
}