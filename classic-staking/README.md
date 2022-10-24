# Classic Staking Subgraph

This subgraph tracks staked amount of Stakers on Kyber Classic farming pools.

## Entity Overview

### KyberFairLaunch

Contains data for fair launch contracts.

### StakingPosition

Contains data of stakers.


## Note

- There are two KyberRewardLockers for Ethereum: `0xfab5186a194588f5ad5074bd52659302906b4522` & `0xbbd817b146f73f4b8022dc998b2c275ddda166bf`. Currently, the config/ethereum.json only contains `0xfab5186a194588f5ad5074bd52659302906b4522`, so:
  - When deploy Ethereum, please add to track contract `0xbbd817b146f73f4b8022dc998b2c275ddda166bf`.
  - TODO: Update the config & template to allow multiple KyberRewardLockers.
