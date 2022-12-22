import { Deposit } from '../generated/KyberFairLaunch/KyberFairLaunch'
import { DepositEntity } from '../generated/schema'

export function handleDeposit(event: Deposit): void {
  const id = `${event.params.user.toHex()}-${event.params.blockNumber}-${event.params.pid}`
  const depositEvent = new DepositEntity(id)

  depositEvent.user = event.params.user
  depositEvent.pid = event.params.pid
  depositEvent.amount = event.params.amount

  depositEvent.transaction = event.transaction.hash
  depositEvent.blockNumber = event.block.number
  depositEvent.logIndex = event.logIndex

  depositEvent.save()
}
