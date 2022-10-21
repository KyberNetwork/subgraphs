import { Address, BigInt, store } from '@graphprotocol/graph-ts'
import { DUMMY_ADDRESS, createAddNewPoolEvent, createDepositEvent, createWithdrawEvent } from './utils'
import { afterAll, assert, beforeAll, describe, test } from 'matchstick-as/assembly/index'
import { handleAddNewPool, handleDeposit, handleWithdraw } from '../src/mappings/fairLaunch'
import { KyberFairLaunch } from '../src/types/schema'

describe('handleAddNewPool()', () => {
  beforeAll(() => {
    let fairLaunch = new KyberFairLaunch(DUMMY_ADDRESS)
    fairLaunch.stakeTokens = []
    fairLaunch.save()
  })

  test('should add new pool', () => {
    assert.entityCount('KyberFairLaunch', 1)
    let addNewPoolEvent = createAddNewPoolEvent(
      Address.fromString(DUMMY_ADDRESS),
      Address.fromString(DUMMY_ADDRESS),
      0,
      0,
      []
    )
    handleAddNewPool(addNewPoolEvent)

    assert.entityCount('KyberFairLaunch', 1)
    let fairLaunch = KyberFairLaunch.load(DUMMY_ADDRESS)
    assert.assertNotNull(fairLaunch)
    assert.assertTrue(fairLaunch!.stakeTokens.length === 1)
  })

  afterAll(() => {
    store.remove('KyberFairLaunch', DUMMY_ADDRESS)
  })
})

describe('handleDeposit() & handleWithdraw()', () => {
  beforeAll(() => {
    let fairLaunch = new KyberFairLaunch(DUMMY_ADDRESS)
    fairLaunch.stakeTokens = [Address.fromString(DUMMY_ADDRESS)]
    fairLaunch.save()
  })

  test('should handle amount correctly', () => {
    assert.entityCount('StakingPosition', 0)
    const pid = BigInt.fromI32(0)
    let depositEvent = createDepositEvent(
      Address.fromString(DUMMY_ADDRESS),
      Address.fromString(DUMMY_ADDRESS),
      pid,
      BigInt.fromI32(0),
      BigInt.fromI32(10000)
    )
    let withdrawEvent = createWithdrawEvent(
      Address.fromString(DUMMY_ADDRESS),
      Address.fromString(DUMMY_ADDRESS),
      pid,
      BigInt.fromI32(0),
      BigInt.fromI32(1234)
    )

    handleDeposit(depositEvent)
    handleWithdraw(withdrawEvent)

    assert.entityCount('StakingPosition', 1)
    assert.fieldEquals('StakingPosition', `${DUMMY_ADDRESS}-${DUMMY_ADDRESS}-${pid}`, 'amount', '8766')
  })

  afterAll(() => {
    store.remove('KyberFairLaunch', DUMMY_ADDRESS)
  })
})
