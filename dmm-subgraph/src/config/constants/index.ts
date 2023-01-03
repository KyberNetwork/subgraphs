import { BigDecimal } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

export const ADDRESS_LOCK = '0xffffffffffffffffffffffffffffffffffffffff'

export const DMM_DYNAMIC_FEE_FACTORY_ADDRESS = ''
export const DMM_STATIC_FEE_FACTORY_ADDRESS = '0x1c758af0688502e49140230f6b0ebd376d429be5'
export const DMM_STATIC_FEE_FACTORY_LEGACY_ADDRESS = '0x51e8d106c646ca58caf32a47812e95887c071a62'

export const ETH_PRICING_POOLS = '0xb3081636d9ccce1cd19fd404f4ff30776b7cb137'

// minimum liquidity required to count towards tracked volume for pairs with small # of Lps
export let MINIMUM_USD_THRESHOLD_NEW_PAIRS = BigDecimal.fromString('50')

// minimum liquidity for price to get tracked
export let MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('0.05') // default is 2

export const WRAPPED_NATIVE_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'

export const KNC_ADDRESS = ''
export const KNC_NAME = 'Kyber Network'
export const KNC_SYMBOL = 'KNC'

export const KNCL_ADDRESS = ''
export const KNCL_NAME = 'Kyber Network Legacy'
export const KNCL_SYMBOL = 'KNCL'

export let FACTORY_BPS = BigDecimal.fromString('10000')

export let NETWORK = 'arbitrum'

export let WHITELISTED_TOKENS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1,0xda10009cbd5d07dd0cecc66161fc93d7c9000da1,0xff970a61a04b1ca14834a43f5de4533ebddb5cc8,0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9,0x3f56e0c36d275367b8c502090edf38289b3dea0d,0x316772cfec9a3e976fde42c3ba21f5a13aaaff12,0xe4dddfe67e7164b0fe14e218d80dc4c08edc01cb'
