import { BigInt } from "@graphprotocol/graph-ts";
import {
  LimitOrderProtocol,
  NonceIncreased,
  OrderCanceled,
  OrderFilled,
  OrderFilledRFQ,
} from "../generated/LimitOrderProtocol/LimitOrderProtocol";
import * as schema from "../generated/schema";

export function handleNonceIncreased(event: NonceIncreased): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const entity = new schema.NonceIncreased(id);
  entity.maker = event.params.maker;
  entity.oldNonce = event.params.oldNonce;
  entity.newNonce = event.params.newNonce;
  entity.blockNumber = event.block.number;
  entity.tx = event.transaction.hash;
  entity.save();
}

export function handleOrderCanceled(event: OrderCanceled): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const entity = new schema.OrderCancelled(id);
  entity.maker = event.params.maker;
  entity.orderHash = event.params.orderHash;
  entity.remaining = event.params.remainingRaw;
  entity.blockNumber = event.block.number;
  entity.tx = event.transaction.hash;
  entity.save();
}

export function handleOrderFilled(event: OrderFilled): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const entity = new schema.OrderFilled(id);
  entity.taker = event.params.taker;
  entity.orderHash = event.params.orderHash;
  entity.remaining = event.params.remaining;
  entity.makingAmount = event.params.makingAmount;
  entity.takingAmount = event.params.takingAmount;
  entity.blockNumber = event.block.number;
  entity.blockTime = event.block.timestamp;
  entity.tx = event.transaction.hash;
  entity.save();
}

export function handleOrderFilledRFQ(event: OrderFilledRFQ): void {
  const id = `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`;
  const entity = new schema.OrderFilledRFQ(id);
  entity.taker = event.params.taker;
  entity.orderHash = event.params.orderHash;
  entity.makingAmount = event.params.makingAmount;
  entity.takingAmount = event.params.takingAmount;
  entity.blockNumber = event.block.number;
  entity.blockTime = event.block.timestamp;
  entity.tx = event.transaction.hash;
  entity.save();
}
