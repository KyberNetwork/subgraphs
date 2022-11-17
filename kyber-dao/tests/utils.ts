import { Deposited, Withdraw } from '../src/types/KyberStaking/KyberStaking'
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'

export function createDepositedEvent(
  curEpoch: BigInt, 
  staker: Address, 
  amount: BigInt
): Deposited {
  let event = changetype<Deposited>(newMockEvent())

  event.parameters = []
  event.parameters.push(new ethereum.EventParam('curEpoch', ethereum.Value.fromUnsignedBigInt(curEpoch)))
  event.parameters.push(new ethereum.EventParam('staker', ethereum.Value.fromAddress(staker)))
  event.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)))

  return event
}

export function createWithdrawEvent(
  curEpoch: BigInt, 
  staker: Address, 
  amount: BigInt
): Withdraw {
  let event = changetype<Withdraw>(newMockEvent())

  event.parameters = []
  event.parameters.push(new ethereum.EventParam('curEpoch', ethereum.Value.fromUnsignedBigInt(curEpoch)))
  event.parameters.push(new ethereum.EventParam('staker', ethereum.Value.fromAddress(staker)))
  event.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)))

  return event
}
