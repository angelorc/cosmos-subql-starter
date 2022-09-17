import { TokenSwapEvent, Coin, LiquidityEvent, LockTokensEvent, AddTokensToLockEvent } from "../types";
import { CosmosEvent } from "@subql/types-cosmos";

export async function handleTokenSwappedEvent(event: CosmosEvent): Promise<void> {
  const chunkSize = 5;

  for (let i = 0; i < event.event.attributes.length; i += chunkSize) {
    const chunk = event.event.attributes.slice(i, i + chunkSize);

    const evt = new TokenSwapEvent(`${event.tx.hash}-${event.msg.idx}-${event.idx}-${i}`);

    evt.blockHeight = BigInt(event.block.block.header.height);
    evt.blockTime = new Date(event.block.block.header.time);
    evt.txHash = event.tx.hash;

    for (const attr of chunk) {
      switch (attr.key) {
        case "sender":
          evt.sender = attr.value;
          break;
        case "pool_id":
          evt.poolId = BigInt(attr.value);
          break;
        case "tokens_in":
          evt.tokensIn = parseCoins(attr.value)[0];
          break;
        case "tokens_out":
          evt.tokensOut = parseCoins(attr.value)[0];
          break;
        default:
          break;
      }
    }

    await evt.save();
  }
}

export async function handleLiquidityEvent(event: CosmosEvent): Promise<void> {
  const chunkSize = 4;

  for (let i = 0; i < event.event.attributes.length; i += chunkSize) {
    const chunk = event.event.attributes.slice(i, i + chunkSize);

    if (chunk.length == chunkSize) {
      const evt = new LiquidityEvent(`${event.tx.hash}-${event.msg.idx}-${event.idx}-${i}`);

      evt.blockHeight = BigInt(event.block.block.header.height);
      evt.blockTime = new Date(event.block.block.header.time);
      evt.txHash = event.tx.hash;

      for (const attr of chunk) {
        switch (attr.key) {
          case "sender":
            evt.sender = attr.value;
            break;
          case "pool_id":
            evt.poolId = BigInt(attr.value);
            break;
          case "tokens_in":
            evt.tokensIn = parseCoins(attr.value)[0];
            break;
          default:
            break;
        }
      }

      await evt.save();
    }
  }
}

export async function handleLockTokensEvent(event: CosmosEvent): Promise<void> {
  const chunkSize = 6;

  for (let i = 0; i < event.event.attributes.length; i += chunkSize) {
    const chunk = event.event.attributes.slice(i, i + chunkSize);

    const evt = new LockTokensEvent(`${event.tx.hash}-${event.msg.idx}-${event.idx}-${i}`);

    evt.blockHeight = BigInt(event.block.block.header.height);
    evt.blockTime = new Date(event.block.block.header.time);
    evt.txHash = event.tx.hash;

    logger.info(`
    
    ${event.tx.hash}
    ${chunk.length}
    
    `)

    if (chunk.length == 5) {
      for (const attr of chunk) {
        switch (attr.key) {
          case "period_lock_id":
            evt.periodLockId = attr.value;
            break;
          case "owner":
            evt.owner = attr.value;
            break;
          case "amount":
            evt.amount = attr.value;
            break;
          case "duration":
            evt.duration = attr.value;
            break;
          case "unlock_time":
            evt.unlockTime = attr.value;
            break;
          default:
            break;
        }
      }

      await evt.save();
    }
    // ExtendLockup
    else if (chunk.length == 3) {
      for (const attr of chunk) {
        switch (attr.key) {
          case "period_lock_id":
            evt.periodLockId = attr.value;
            break;
          case "owner":
            evt.owner = attr.value;
            break;
          case "duration":
            evt.duration = attr.value;
            break;
          default:
            break;
        }
      }

      await evt.save();
    }
  }
}

export async function handleAddTokensToLockEvent(event: CosmosEvent): Promise<void> {
  const evt = new AddTokensToLockEvent(`${event.tx.hash}-${event.msg.idx}-${event.idx}`);

  evt.blockHeight = BigInt(event.block.block.header.height);
  evt.blockTime = new Date(event.block.block.header.time);
  evt.txHash = event.tx.hash;

  for (const attr of event.event.attributes) {
    switch (attr.key) {
      case "period_lock_id":
        evt.periodLockId = attr.value;
        break;
      case "owner":
        evt.owner = attr.value;
        break;
      case "amount":
        evt.amount = attr.value;
        break;
      default:
        break;
    }
  }

  await evt.save();
}

export function parseCoins(input: string): Coin[] {
  return input
    .replace(/\s/g, "")
    .split(",")
    .filter(Boolean)
    .map((part) => {
      // Denom regex from Stargate (https://github.com/cosmos/cosmos-sdk/blob/v0.42.7/types/coin.go#L599-L601)
      const match = part.match(/^([0-9]+)([a-zA-Z][a-zA-Z0-9/]{2,127})$/);
      if (!match) throw new Error("Got an invalid coin string");
      return {
        amount: match[1].replace(/^0+/, "") || "0",
        denom: match[2],
      };
    });
}

