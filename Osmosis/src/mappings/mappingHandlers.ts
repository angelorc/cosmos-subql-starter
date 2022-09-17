import { TokenSwapEvent, Coin } from "../types";
import { CosmosEvent } from "@subql/types-cosmos";

export async function handleEventTokenSwapped(event: CosmosEvent): Promise<void> {
  const evt = new TokenSwapEvent(`${event.tx.hash}-${event.msg.idx}-${event.idx}`);    
  
  evt.blockHeight = BigInt(event.block.block.header.height);
  evt.blockTime = new Date(event.block.block.header.time);
  evt.txHash= event.tx.hash;

  for(const attr of event.event.attributes) {
    switch(attr.key) {
      case "sender":
        evt.sender = attr.value;
        break;
      case "pool_id":
        evt.poolId = BigInt(attr.value);
        break;
      case "tokens_in":
        logger.info(
          `
          
          ${parseCoins(attr.value)[0]}
          
          `
        )
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