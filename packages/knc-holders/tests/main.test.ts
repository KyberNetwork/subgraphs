import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, describe, test } from 'matchstick-as/assembly/index'
import { createTransferEvent } from './utils'
import { handleTransfer } from '../src/mappings/main'

describe('handleTransfer()', () => {
  test('should update amount correctly', () => {
    assert.entityCount('KncHolder', 0)
    const FIRST_ADDRESS = '0x0000000000000000000000000000000000000000'
    const SECOND_ADDRESS = '0x0000000000000000000000000000000000000001'
    const transferEvent = createTransferEvent(
      Address.fromString(FIRST_ADDRESS),
      Address.fromString(SECOND_ADDRESS),
      BigInt.fromI32(10000)
    )
    handleTransfer(transferEvent)

    assert.entityCount('KncHolder', 2)
    assert.fieldEquals('KncHolder', FIRST_ADDRESS, 'amount', '-10000')
    assert.fieldEquals('KncHolder', SECOND_ADDRESS, 'amount', '10000')

    const anotherTransferEvent = createTransferEvent(
      Address.fromString(SECOND_ADDRESS),
      Address.fromString(FIRST_ADDRESS),
      BigInt.fromI32(2000)
    )
    handleTransfer(anotherTransferEvent)

    assert.entityCount('KncHolder', 2)
    assert.fieldEquals('KncHolder', FIRST_ADDRESS, 'amount', '-8000')
    assert.fieldEquals('KncHolder', SECOND_ADDRESS, 'amount', '8000')

  })
})
