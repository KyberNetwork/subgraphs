import { Address } from '@graphprotocol/graph-ts'
import { KncHolder } from '../types/schema'
import { Transfer } from '../types/Knc/Erc20'
import { ZERO_BI } from './utils'

export function handleTransfer(event: Transfer): void {
  // NOTE: I still count the Null address as an user,
  // so we can track how many KNCs are minted.
  let fromHolder = createOrLoadHolder(event.params.from)
  let toHolder = createOrLoadHolder(event.params.to)

  fromHolder.amount = fromHolder.amount.minus(event.params.value)
  toHolder.amount = toHolder.amount.plus(event.params.value)

  fromHolder.save()
  toHolder.save()
}

function createOrLoadHolder(user: Address): KncHolder {
  const id = user.toHex()

  let holder = KncHolder.load(id)
  if (holder === null) {
    holder = new KncHolder(id)
    holder.amount = ZERO_BI
  }

  return holder as KncHolder
}
