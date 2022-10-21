import { log, Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { StakingPosition, KyberFairLaunch } from '../types/schema'
import { AddNewPool, Deposit, Withdraw } from '../types/templates/KyberFairLaunch/KyberFairLaunch'
import { ZERO_BI } from './utils'

export function handleDeposit(event: Deposit): void {
  log.debug('handleDeposit v1', [])
  let position = createOrLoadStakingPosition(event.params.user, event.address, event.params.pid)
  position.amount = position.amount.plus(event.params.amount)
  position.save()
}

export function handleWithdraw(event: Withdraw): void {
  log.debug('handleWithdraw v1', [])
  let position = createOrLoadStakingPosition(event.params.user, event.address, event.params.pid)
  position.amount = position.amount.minus(event.params.amount)
  position.save()
}

export function handleAddNewPool(event: AddNewPool): void {
  log.debug('handleAddNewPool v1', [])
  let fairLaunch = KyberFairLaunch.load(event.address.toHex())
  if (fairLaunch === null) {
    return
  }
  fairLaunch.stakeTokens = fairLaunch.stakeTokens.concat([event.params.stakeToken])
  fairLaunch.save()
}

function createOrLoadStakingPosition(user: Bytes, fairLaunchAddress: Address, poolID: BigInt): StakingPosition {
  let id = `${user.toHex()}-${fairLaunchAddress.toHex()}-${poolID}`

  let position = StakingPosition.load(id)
  if (position === null) {
    position = new StakingPosition(id)

    position.user = user
    position.fairLaunch = fairLaunchAddress.toHex()
    position.poolID = poolID.toI32()
    position.amount = ZERO_BI

    let fairLaunch = KyberFairLaunch.load(fairLaunchAddress.toHex())
    if (fairLaunch !== null) {
      let stakeTokens = fairLaunch.stakeTokens
      position.stakeToken = stakeTokens[position.poolID]
    }
  }

  return position as StakingPosition
}
