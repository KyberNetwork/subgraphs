import { AddNewPool, Deposit, EmergencyWithdraw, Withdraw } from '../types/templates/KyberFairLaunch/KyberFairLaunch'
import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { DepositEvent, EmergencyWithdrawEvent, KyberFairLaunch, StakingPosition, WithdrawEvent } from '../types/schema'
import { ZERO_BI } from './utils'

export function handleDeposit(event: Deposit): void {
  log.debug('handleDeposit v1', [])
  let position = createOrLoadStakingPosition(event.params.user, event.address, event.params.pid)
  position.amount = position.amount.plus(event.params.amount)
  position.save()

  let id = `${event.params.user.toHex()}-${event.params.blockNumber}-${event.params.pid}`
  let depositEvent = new DepositEvent(id)

  depositEvent.user = event.params.user
  depositEvent.pid = event.params.pid.toI32()
  depositEvent.blockNumber = event.params.blockNumber
  depositEvent.amount = event.params.amount

  depositEvent.save()
}

export function handleWithdraw(event: Withdraw): void {
  log.debug('handleWithdraw v1', [])
  let position = createOrLoadStakingPosition(event.params.user, event.address, event.params.pid)
  position.amount = position.amount.minus(event.params.amount)
  position.save()

  let id = `${event.params.user.toHex()}-${event.params.blockNumber}-${event.params.pid}`
  let withdrawEvent = new WithdrawEvent(id)

  withdrawEvent.user = event.params.user
  withdrawEvent.pid = event.params.pid.toI32()
  withdrawEvent.blockNumber = event.params.blockNumber
  withdrawEvent.amount = event.params.amount

  withdrawEvent.save()
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  log.debug('handleEmergencyWithdraw v1', [])
  let position = createOrLoadStakingPosition(event.params.user, event.address, event.params.pid)
  position.amount = position.amount.minus(event.params.amount)
  position.save()

  let id = `${event.params.user.toHex()}-${event.params.blockNumber}-${event.params.pid}`
  let emergencyEvent = new EmergencyWithdrawEvent(id)

  emergencyEvent.user = event.params.user
  emergencyEvent.pid = event.params.pid.toI32()
  emergencyEvent.blockNumber = event.params.blockNumber
  emergencyEvent.amount = event.params.amount

  emergencyEvent.save()
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
