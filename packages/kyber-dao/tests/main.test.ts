import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, describe, test } from 'matchstick-as/assembly/index'
import { createDepositedEvent, createWithdrawEvent } from './utils'
import { handleDeposited, handleWithdraw } from '../src/mappings/main'

describe('handleDeposited() & handleWithdraw()', () => {
  test('should update amount correctly', () => {
    assert.entityCount('KncStaker', 0)
    const EPOCH = 1
    const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000000'
    const depositedEvent = createDepositedEvent(
      BigInt.fromI32(EPOCH),
      Address.fromString(DUMMY_ADDRESS),
      BigInt.fromI32(10000)
    )
    handleDeposited(depositedEvent)

    assert.entityCount('KncStaker', 1)
    assert.fieldEquals('KncStaker', DUMMY_ADDRESS, 'amount', '10000')

    const withdrawEvent = createWithdrawEvent(
      BigInt.fromI32(EPOCH),
      Address.fromString(DUMMY_ADDRESS),
      BigInt.fromI32(2000)
    )
    handleWithdraw(withdrawEvent)

    assert.entityCount('KncStaker', 1)
    assert.fieldEquals('KncStaker', DUMMY_ADDRESS, 'amount', '8000')
  })
})
