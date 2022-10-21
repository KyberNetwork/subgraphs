import { Address, ethereum } from '@graphprotocol/graph-ts'
import { DUMMY_ADDRESS, createRewardContractAddedEvent } from './utils'
import { assert, createMockedFunction, describe, test } from 'matchstick-as/assembly/index'
import { handleRewardContractAdded } from '../src/mappings/rewardLocker'

describe('handleRewardContractAdded()', () => {
  test('should create new KyberFairLaunch entity', () => {
    assert.entityCount('KyberFairLaunch', 0)
    const contractAddress = Address.fromString(DUMMY_ADDRESS)
    let rewardContractAddedEvent = createRewardContractAddedEvent(
      contractAddress,
      Address.fromString(DUMMY_ADDRESS),
      true
    )
    createMockedFunction(contractAddress, 'poolLength', 'poolLength():(uint256)').returns([ethereum.Value.fromI32(0)])

    handleRewardContractAdded(rewardContractAddedEvent)

    assert.entityCount('KyberFairLaunch', 1)
  })
})
