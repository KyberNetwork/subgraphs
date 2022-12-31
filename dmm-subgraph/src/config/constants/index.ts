import { BigDecimal } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const ADDRESS_LOCK = '0xffffffffffffffffffffffffffffffffffffffff'

export const DMM_DYNAMIC_FEE_FACTORY_ADDRESS = ''
export const DMM_STATIC_FEE_FACTORY_ADDRESS = '0x1c758af0688502e49140230f6b0ebd376d429be5'
export const DMM_STATIC_FEE_FACTORY_LEGACY_ADDRESS = ''

export const ETH_PRICING_POOLS = '0x5cd7c1efec89f0a6bcec73ec72b69e7376ed6349'

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('0')

// minimum liquidity for price to get tracked
export let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0.01') // default is 2

export const WRAPPED_NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'

export const KNC_ADDRESS = ''
export const KNC_NAME = 'Kyber Network'
export const KNC_SYMBOL = 'KNC'

export const KNCL_ADDRESS = ''
export const KNCL_NAME = 'Kyber Network Legacy'
export const KNCL_SYMBOL = 'KNCL'

export let FACTORY_BPS = BigDecimal.fromString('10000')

export let NETWORK = 'optimism'

export let WHITELISTED_TOKENS = '0x4200000000000000000000000000000000000006,0xda10009cbd5d07dd0cecc66161fc93d7c9000da1,0x7f5c764cbc14f9669b88837ca1490cca17c31607,0x94b008aa00579c1307b0ef2c499ad98a8ce58e58,0x4200000000000000000000000000000000000042'
