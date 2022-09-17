import { Claim, Merkledrop } from "../types";
import { CosmosEvent, CosmosMessage } from "@subql/types-cosmos";

export async function handleMsgCreate(msg: CosmosMessage): Promise<void> {
  const merkledrop = Merkledrop.create({
    id: `${msg.tx.hash}-${msg.idx}`,
    blockHeight: BigInt(msg.block.block.header.height),
    txHash: msg.tx.hash,
    merkledropId: "0",
    merkleRoot: msg.msg.decodedMsg.merkleRoot,
    startHeight: BigInt(msg.msg.decodedMsg.startHeight),
    endHeight: BigInt(msg.msg.decodedMsg.endHeight),
    denom: msg.msg.decodedMsg.coin.denom,
    amount: BigInt(msg.msg.decodedMsg.coin.amount),
    claimed: BigInt(0),
    owner: msg.msg.decodedMsg.owner,
    createdAt: new Date(msg.block.block.header.time),
    updatedAt: new Date(msg.block.block.header.time)
  });

  await merkledrop.save();
}

export async function handleEventCreate(event: CosmosEvent): Promise<void> {
  const merkledrop = await Merkledrop.get(`${event.tx.hash}-${event.msg.idx}`)
  
  for(const attr of event.event.attributes) {
    switch(attr.key) {
      case "merkledrop_id":
        merkledrop.merkledropId = attr.value.slice(1, -1);
        break;
      default:
        break;
    }
  }

  await merkledrop.save();
}

export async function handleMsgClaim(msg: CosmosMessage): Promise<void> {
  logger.info(`
    
    sender: ${msg.msg.decodedMsg.sender}
    mdid: ${msg.msg.decodedMsg.merkledropId}
    index: ${msg.msg.decodedMsg.index}
    amount: ${msg.msg.decodedMsg.amount}

  `)
  const merkledrops = await Merkledrop.getByMerkledropId(`${msg.msg.decodedMsg.merkledropId}`)

  if (merkledrops.length > 0) {
    const merkledrop = merkledrops[0]
    merkledrop.claimed += BigInt(msg.msg.decodedMsg.amount)
    merkledrop.updatedAt = new Date(msg.block.block.header.time)

    await merkledrop.save()

    const claim = Claim.create({
      id: `${msg.tx.hash}-${msg.idx}`,
      blockHeight: BigInt(msg.block.block.header.height),
      txHash: msg.tx.hash,
      sender: msg.msg.decodedMsg.sender,
      merkledropId: `${msg.msg.decodedMsg.merkledropId}`,
      denom: merkledrop.denom,
      amount: BigInt(msg.msg.decodedMsg.amount),
      index: BigInt(msg.msg.decodedMsg.index),
      claimedAt: new Date(msg.block.block.header.time)
    })

    await claim.save()
  }
}