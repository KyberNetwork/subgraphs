import { assert, describe, test } from 'matchstick-as/assembly/index'
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { createExchangeEvent, DUMMY_ADDRESS } from './utils'
import { handleExecutorExchange } from '../../src/router/executor'
import { log } from 'matchstick-as/assembly/log'

// Coverage
export { handleExecutorExchange }

describe('handleExecutorExchange()', () => {
	test('should new executor', () => {
		assert.entityCount('ExecutorExchange', 0)
		let exchangEvent = createExchangeEvent(
			Address.fromString(DUMMY_ADDRESS),
			BigInt.fromI32(12308),
			Address.fromString(DUMMY_ADDRESS),
		)

		handleExecutorExchange(exchangEvent)

		assert.entityCount('ExecutorExchange', 1)
		log.success("test successfully", [])
	})
})
