import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { Exchange } from '../../src/types/router/templates/Executor/Executor'
import { Exchange as RouterExchange } from '../../src/types/router/Router/Router' 

export const DUMMY_ADDRESS = '0x0000000000000000000000000000000000000001'

export function createExchangeEvent(
	pair: Address,
	amountOut: BigInt,
	output: Address,
): Exchange {
	let event = changetype<Exchange>(newMockEvent())

	event.parameters =[]

	event.parameters.push(new ethereum.EventParam('pair', ethereum.Value.fromAddress(pair)))
	event.parameters.push(new ethereum.EventParam('amountOut', ethereum.Value.fromUnsignedBigInt(amountOut)))
	event.parameters.push(new ethereum.EventParam('output', ethereum.Value.fromAddress(output)))

	return event
}

export function createRouterExchangeEvent(): RouterExchange {
	let event = changetype<RouterExchange>(newMockEvent())

	return event
}
