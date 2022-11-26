import {
  EmergencyWithdraw,
} from "../generated/KyberSwapElasticLM/KyberSwapElasticLM"
import { EmergencyWithdrawInfo } from "../generated/schema"

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  let info = new EmergencyWithdrawInfo(event.transaction.hash.toHex() + event.params.nftId.toString())

  info.number = event.block.number
  info.timestamps = event.block.timestamp
  info.sender = event.params.sender.toHex()
  info.nftID = event.params.nftId
  info.transaction = event.transaction.hash

  info.save()
}

