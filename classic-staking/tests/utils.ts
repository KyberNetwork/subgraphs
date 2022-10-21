import { AddNewPool, Deposit, Withdraw } from '../src/types/templates/KyberFairLaunch/KyberFairLaunch'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'

export const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000001'

export function createAddNewPoolEvent(
  address: Address,
  stakeToken: Address,
  startBlock: i32,
  endBlock: i32,
  rewardPerBlocks: ethereum.Value[]
): AddNewPool {
  let event = changetype<AddNewPool>(newMockEvent())

  event.address = address
  event.parameters = []

  event.parameters.push(new ethereum.EventParam('stakeToken', ethereum.Value.fromAddress(stakeToken)))
  event.parameters.push(new ethereum.EventParam('startBlock', ethereum.Value.fromI32(startBlock)))
  event.parameters.push(new ethereum.EventParam('endBlock', ethereum.Value.fromI32(endBlock)))
  event.parameters.push(new ethereum.EventParam('rewardPerBlocks', ethereum.Value.fromArray(rewardPerBlocks)))

  return event
}

export function createDepositEvent(
  address: Address,
  user: Address,
  pid: BigInt,
  blockNumber: BigInt,
  amount: BigInt
): Deposit {
  let event = changetype<Deposit>(newMockEvent())

  event.address = address
  event.parameters = []

  event.parameters.push(new ethereum.EventParam('user', ethereum.Value.fromAddress(user)))
  event.parameters.push(new ethereum.EventParam('pid', ethereum.Value.fromUnsignedBigInt(pid)))
  event.parameters.push(new ethereum.EventParam('blockNumber', ethereum.Value.fromUnsignedBigInt(blockNumber)))
  event.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)))

  return event
}

export function createWithdrawEvent(
  address: Address,
  user: Address,
  pid: BigInt,
  blockNumber: BigInt,
  amount: BigInt
): Withdraw {
  let event = changetype<Withdraw>(newMockEvent())

  event.address = address
  event.parameters = []

  event.parameters.push(new ethereum.EventParam('user', ethereum.Value.fromAddress(user)))
  event.parameters.push(new ethereum.EventParam('pid', ethereum.Value.fromUnsignedBigInt(pid)))
  event.parameters.push(new ethereum.EventParam('blockNumber', ethereum.Value.fromUnsignedBigInt(blockNumber)))
  event.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)))

  return event
}
