import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Transfer } from '../src/types/KNC/Erc20'
import { newMockEvent } from 'matchstick-as'

export function createTransferEvent(from: Address, to: Address, amount: BigInt): Transfer {
  let event = changetype<Transfer>(newMockEvent())

  event.parameters = []
  event.parameters.push(new ethereum.EventParam('from', ethereum.Value.fromAddress(from)))
  event.parameters.push(new ethereum.EventParam('to', ethereum.Value.fromAddress(to)))
  event.parameters.push(new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)))

  return event
}
