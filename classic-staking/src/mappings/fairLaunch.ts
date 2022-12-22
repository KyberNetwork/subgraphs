import { AddNewPool, Deposit, EmergencyWithdraw, Withdraw } from '../types/templates/KyberFairLaunch/KyberFairLaunch'
import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { KyberFairLaunch, StakingPosition } from '../types/schema'
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

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  log.debug('handleEmergencyWithdraw v1', [])
  // Fix the case pid over int32.
  // Example: https://polygonscan.com/tx/0x8d22466996c1f9b2965b7894ec7784858ccbc2ed05ce2a0e2fcb2c2581121a9e#eventlog
  if (event.params.amount == BigInt.fromI32(0)) {
    return
  }

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
      position.stakeToken = stakeTokens[poolID.toI32()]
    }
  }

  return position as StakingPosition
}
