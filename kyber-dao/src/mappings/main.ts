import { Deposited, Withdraw } from '../types/KyberStaking/KyberStaking'
import { Address } from '@graphprotocol/graph-ts'
import { KncStaker } from '../types/schema'
import { ZERO_BI } from './utils'

export function handleDeposited(event: Deposited): void {
  const user = event.params.staker
  const amount = event.params.amount

  let staker = createOrLoadStaker(user)
  staker.amount = staker.amount.plus(amount)

  staker.save()
}

export function handleWithdraw(event: Withdraw): void {
  const user = event.params.staker
  const amount = event.params.amount

  let staker = createOrLoadStaker(user)
  staker.amount = staker.amount.minus(amount)

  staker.save()
}


function createOrLoadStaker(user: Address): KncStaker {
  const id = user.toHex()

  let staker = KncStaker.load(id)
  if (staker === null) {
    staker = new KncStaker(id)
    staker.amount = ZERO_BI
  }

  return staker as KncStaker
}
