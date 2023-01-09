import { RewardContractAdded } from '../types/KyberRewardLocker/KyberRewardLocker'
import {
  AddPool,
  RenewPool,
  Join,
  Exit,
  KyberFairLaunch as KyberFairLaunchContract,
  SyncLiq,
  Withdraw,
  EmergencyWithdraw,
  Deposit,
  Harvest
} from '../types/templates/KyberFairLaunch/KyberFairLaunch'
import { Farm, JoinedPosition, FarmingPool, Token, DepositedPosition, RewardToken,ContractEvent, HarvestEventGroup, PositionReward } from '../types/schema'
import { KyberFairLaunch as KyberFairLaunchTemplate } from '../types/templates'
import { ZERO_BI, ADDRESS_ZERO, WETH_ADDRESS, ZERO_BD } from '../utils/constants'
import { BigInt, log, Address, store, Bytes, ByteArray, ethereum, json, Value } from '@graphprotocol/graph-ts'
import { fetchTokenSymbol, fetchTokenName, fetchTokenTotalSupply, fetchTokenDecimals } from '../utils/token'

function getToken(item: Address): string {
  if (item.toHexString() === ADDRESS_ZERO) return WETH_ADDRESS

  let token = Token.load(item.toHexString())
  if (token === null) {
    token = new Token(item.toHexString())
    token.symbol = fetchTokenSymbol(item)
    token.name = fetchTokenName(item)
    token.totalSupply = fetchTokenTotalSupply(item)
    let decimals = fetchTokenDecimals(item)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return item.toHexString()
    }

    token.decimals = decimals
    token.derivedETH = ZERO_BD
    token.volume = ZERO_BD
    token.volumeUSD = ZERO_BD
    token.feesUSD = ZERO_BD
    token.untrackedVolumeUSD = ZERO_BD
    token.totalValueLocked = ZERO_BD
    token.totalValueLockedUSD = ZERO_BD
    token.totalValueLockedUSDUntracked = ZERO_BD
    token.txCount = ZERO_BI
    token.poolCount = ZERO_BI
    token.whitelistPools = []
    token.save()
  }
  return token.id
}
export function handleRewardContractAdded(event: RewardContractAdded): void {
  let fairLaunch = Farm.load(event.params.rewardContract.toHex())
  if (fairLaunch !== null) {
    return
  }

  KyberFairLaunchTemplate.create(event.params.rewardContract)
  //init reward contract
  fairLaunch = new Farm(event.params.rewardContract.toHex())
  log.debug('locker: {}', [event.address.toHexString()])
  fairLaunch.rewardLocker = event.address.toHexString()
  fairLaunch.save()

  // get pool
  let fairLaunchContract = KyberFairLaunchContract.bind(event.params.rewardContract)
  let len = fairLaunchContract.try_poolLength()

  if (len.reverted) {
    return
  }

  // look back to get current farm
  for (let i: i32 = 0; i < len.value.toI32(); i++) {
    let poolInfo = fairLaunchContract.getPoolInfo(BigInt.fromI32(i))
    let farmingPool = new FarmingPool(event.params.rewardContract.toHexString() + '_' + i.toString())
    farmingPool.pid = BigInt.fromI32(i)
    farmingPool.startTime = poolInfo.value1
    farmingPool.endTime = poolInfo.value2
    farmingPool.feeTarget = poolInfo.value5
    farmingPool.vestingDuration = poolInfo.value3
    farmingPool.pool = poolInfo.value0.toHexString()
    farmingPool.farm = fairLaunch.id
    farmingPool.rewardTokens = []
    let rewardTokens = farmingPool.rewardTokens
    for (let j = 0; j < poolInfo.value7.length; j++) {
      let token = getToken(poolInfo.value7[j])
      let amount = poolInfo.value8[j]
      let rewardToken = new RewardToken(
        event.params.rewardContract.toHexString() + '_' + i.toString() + '_' + poolInfo.value7[j].toHexString()
      )
      rewardToken.token = token
      rewardToken.amount = amount
      rewardToken.farmingPool = farmingPool.id
      rewardToken.priority = j
      rewardToken.save()
      rewardTokens.push(rewardToken.id)
    }
    farmingPool.rewardTokens = rewardTokens
    let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
    ev.logIndex = event.logIndex
    ev.name = "RewardContractAdded"
    ev.transaction= event.transaction.hash.toHex()
    ev.address = event.address.toHexString()
    ev.extra = "{" + `"poolLength": ` + len.value.toString() + "," + `"farm":"` +  event.params.rewardContract.toHex() + `"}`
    ev.save()
    farmingPool.save()
  }
}

export function handleAddPool(event: AddPool): void {
  let fairLaunchContract = KyberFairLaunchContract.bind(event.address)
  let len = fairLaunchContract.poolLength()
  let pid = len.minus(BigInt.fromI32(1))
  let poolInfo = fairLaunchContract.getPoolInfo(len.minus(BigInt.fromI32(1)))
  let farmingPool = new FarmingPool(event.address.toHexString() + '_' + pid.toString())
  farmingPool.pid = pid
  farmingPool.startTime = event.params.startTime
  farmingPool.endTime = event.params.endTime
  farmingPool.feeTarget = event.params.feeTarget
  farmingPool.vestingDuration = event.params.vestingDuration
  farmingPool.pool = poolInfo.value0.toHexString()
  farmingPool.farm = event.address.toHexString()
  farmingPool.rewardTokens = []
  let rewardTokens = farmingPool.rewardTokens
  for (let i = 0; i < poolInfo.value7.length; i++) {
    let token = getToken(poolInfo.value7[i])
    let amount = poolInfo.value8[i]
    let rewardToken = new RewardToken(
      event.address.toHexString() + '_' + pid.toString() + '_' + poolInfo.value7[i].toHexString()
    )
    rewardToken.token = token
    rewardToken.amount = amount
    rewardToken.farmingPool = farmingPool.id
    rewardToken.priority = i
    rewardToken.save()
    rewardTokens.push(rewardToken.id)
  }
  farmingPool.rewardTokens = rewardTokens
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "AddPool"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" + `"pid": ` + pid.toString() + "}"
  ev.save()
  farmingPool.save()
}

export function handleRenewPool(event: RenewPool): void {
  let fairLaunchContract = KyberFairLaunchContract.bind(event.address)
  let farmingPool = FarmingPool.load(event.address.toHexString() + '_' + event.params.pid.toString())

  if (farmingPool === null) {
    farmingPool = new FarmingPool(event.address.toHexString() + '_' + event.params.pid.toString())
  }
  
  let poolInfo = fairLaunchContract.getPoolInfo(event.params.pid)
  farmingPool.pid = event.params.pid
  farmingPool.startTime = event.params.startTime
  farmingPool.endTime = event.params.endTime
  farmingPool.feeTarget = event.params.feeTarget
  farmingPool.vestingDuration = event.params.vestingDuration
  farmingPool.pool = poolInfo.value0.toHexString()
  farmingPool.farm = event.address.toHexString()
  farmingPool.rewardTokens = []
  let rewardTokens = farmingPool.rewardTokens
  for (let i = 0; i < poolInfo.value7.length; i++) {
    let token = getToken(poolInfo.value7[i])
    let amount = poolInfo.value8[i]
    let rewardToken = new RewardToken(
      event.address.toHexString() + '_' + event.params.pid.toString() + '_' + poolInfo.value7[i].toHexString()
    )
    rewardToken.token = token
    rewardToken.amount = amount
    rewardToken.farmingPool = farmingPool.id
    rewardToken.priority = i
    rewardToken.save()
    rewardTokens.push(rewardToken.id)
  }
  farmingPool.rewardTokens = rewardTokens
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "RenewPool"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" + `"pid": `+ farmingPool.pid.toString() + "}"
  ev.save()
  farmingPool.save()
}

export function handleJoin(event: Join): void {
  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
  )

  if (joinedPosition === null) {
    joinedPosition = new JoinedPosition(
      event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
    )
  }

  joinedPosition.user = event.transaction.from
  joinedPosition.pid = event.params.pId
  joinedPosition.liquidity = event.params.liq
  joinedPosition.farmingPool = event.address.toHexString() + '_' + event.params.pId.toString()
  joinedPosition.position = event.params.nftId.toString()

  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Join"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"pid":`+ event.params.pId.toString() + "," +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
  joinedPosition.save()
}

export function handleSync(event: SyncLiq): void {
  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
  )

  if (joinedPosition === null) {
    joinedPosition = new JoinedPosition(
      event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
    )
    joinedPosition.liquidity = ZERO_BI
  }

  joinedPosition.pid = event.params.pId
  joinedPosition.liquidity = event.params.liq.plus(joinedPosition.liquidity)
  joinedPosition.farmingPool = event.address.toHexString() + '_' + event.params.pId.toString()
  joinedPosition.position = event.params.nftId.toString()

  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Sync"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"pid":`+ event.params.pId.toString() + "," +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
  joinedPosition.save()
}

export function handleExit(event: Exit): void {
  let joinedPosition = JoinedPosition.load(
    event.address.toHexString() + '_' + event.params.pId.toString() + '_' + event.params.nftId.toString()
  )

  if (joinedPosition === null) {
    return
  }


  let newLiq = joinedPosition.liquidity.minus(event.params.liq)
  if (newLiq.equals(ZERO_BI)) {
    store.remove('JoinedPosition', joinedPosition.id)
  } else {
    joinedPosition.liquidity = newLiq
    joinedPosition.save()
  }
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Exit"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"pid": `+ event.params.pId.toString() + "," +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
}

export function handleDeposit(event: Deposit): void {
  let depostedPosition = new DepositedPosition(event.params.nftId.toString())
  depostedPosition.user = event.params.sender
  depostedPosition.farm = event.address.toHexString()
  depostedPosition.position = event.params.nftId.toString()
  // note event info
  let ev = new ContractEvent(event.transaction.hash.toHex()+event.logIndex.toString())
  ev.logIndex = event.logIndex
  ev.name = "Deposit"
  ev.transaction= event.transaction.hash.toHex()
  ev.address = event.address.toHexString()
  ev.extra = "{" +`"nftId": `+ event.params.nftId.toString() + "}"
  ev.save()
  depostedPosition.save()
}

export function handleWithdraw(event: Withdraw): void {
  handleWithdrawAnyway(event.params.nftId, event.transaction, event.logIndex, event.address)
}

export function handleEmergencyWithdraw(event: EmergencyWithdraw): void {
  // handleWithdraw(event as Withdraw)
  handleWithdrawAnyway(event.params.nftId, event.transaction, event.logIndex, event.address)

  // TODO: remove joinedPositions when EmergencyWithdraw
  // let farm = Farm.load(event.address.toHexString())
  // farm.farmingPools.forEach(pool => {
  //   let joinedPositions = JoinedPosition.load(pool.toString() + '_' + event.params.nftId.toString())
  //   if (joinedPositions) {
  //     store.remove('JoinedPosition', pool.toString() + '_' + event.params.nftId.toString())
  //   }
  // })
}

function handleWithdrawAnyway(nftId: BigInt, transaction: ethereum.Transaction, logIndex: BigInt, address: Address): void {
  let depostedPosition = DepositedPosition.load(nftId.toString())
  if (depostedPosition) {
    store.remove('DepositedPosition', depostedPosition.id)
  }
  // note event info
  let ev = new ContractEvent(transaction.hash.toHex()+logIndex.toString())
  ev.logIndex = logIndex
  ev.name = "Withdraw"
  ev.transaction= transaction.hash.toHex()
  ev.address = address.toHexString()
  ev.extra = "{" +`"nftId": `+ nftId.toString() + "}"
  ev.save() 
}
export function handleHarvest(event: Harvest): void {
    
  // if (event.block.number.gt(BigInt.fromI32(16249614))) {
  //   throw Error('VTTTT')
  // }
  log.error("+++ tx hash: {}",[event.transaction.hash.toHexString()])
  let decodedValues = DecodeHarvestEvent(event.transaction.input, event.transaction.hash.toHex()).toArray()
  if (decodedValues.length == 0) {
    //TODO: invalid tx
    log.error("--handleHarvest nfts.length == 0",[])
    return 
  }
  let nfts = decodedValues[0].toI32Array()
  let pids = decodedValues[1].toI32Array()
  log.error("+++nfts number: {} , pids number: {}",[nfts.length.toString(), pids.length.toString()])
  let rewardToken = Token.load(event.params.reward.toHexString())!
  // from pid -> FarmingPool -> rewards.length 
  if (nfts.length == 1)  {
    // TODO: only 1 nft -> no need to check index of the event 
    let positionID = nfts[0]
    let positionReward = PositionReward.load(positionID.toString())
    if (positionReward == null) {
      positionReward = new PositionReward(positionID.toString())
      positionReward.rewards = `[]`
      // vutien
    } 
    positionReward = AggregateReward(rewardToken.id, rewardToken.decimals.toString(), event.params.amount, positionReward)
    positionReward.save()

    log.error("-- nfts number == 1, nft: {}",[nfts[0].toString()])
  } else {
    log.error("-- nfts number > 1",[])
    // TODO: there are more than 1 nft emitted from 1 tx -> need to check index of the event inside the tx, to map to nft from []nfts
    let harvestGroup = HarvestEventGroup.load(event.transaction.hash.toHexString())
    if (harvestGroup == null) {
      harvestGroup = new HarvestEventGroup(event.transaction.hash.toHexString())
      harvestGroup.handledEvents = 0
    }
    let assignedNFTIndex = 0 
    let numberOfRewards = 0 
    for (let i=0; i< pids.length; i++) {
      // let farmingPool = FarmingPool.load(event.address.toHexString() + "_" + pids[i].toString())
      // if (farmingPool == null) {
      //   log.error("+++farm pool null: {}",[event.address.toHexString() + "_" + pids[i].toString()])
      // } else {
      //   log.error("+++farm pool id: {}",[farmingPool.id])
      //   if (farmingPool.rewardTokens == null) {
      //     log.error("+++farm pool reward tokens number: 0",[])
      //   }else {
      //     log.error("+++farm pool reward tokens number: {}",[farmingPool.rewardTokens.length.toString()])
      //   }
      // }
      numberOfRewards += FarmingPool.load(event.address.toHexString() + "_" + pids[i].toString())!.rewardTokens.length
      log.error("+++farm pool reward tokens number: {}, pool: {}",[numberOfRewards.toString(), event.address.toHexString() + "_" + pids[i].toString()])
      log.error("+++farm pool current harvestGroup handled events: {}",[harvestGroup.handledEvents.toString()])
      if (numberOfRewards > harvestGroup.handledEvents) {
        assignedNFTIndex = i
        break
      }
    }
    log.error("+++farm pool assignedNFTIndex: {}",[assignedNFTIndex.toString()])
    let positionID = nfts[assignedNFTIndex]
    log.error("+++nft id: {}, assignedNFTIndex: {}",[positionID.toString(), assignedNFTIndex.toString()])
    log.error("+++rewards input id: {}, amount: {} ",[rewardToken.id, event.params.amount.toString()])
    let positionReward = PositionReward.load(positionID.toString())
    if (positionReward == null) {
      positionReward = new PositionReward(positionID.toString())
      positionReward.rewards = `[]`
    } 
    positionReward = AggregateReward(rewardToken.id, rewardToken.decimals.toString(), event.params.amount, positionReward)
    positionReward.save()
    harvestGroup.handledEvents += 1
    harvestGroup.save()
  }
}

function AggregateReward(inputRewardToken: string, inputRewardTokenDecimals: string, inputRewardAmount: BigInt, positionReward: PositionReward): PositionReward {
  let addNewToken = true
  log.error("+++rewards before: {}", [positionReward.rewards!])
  let jsonValues = json.fromString(positionReward.rewards!).toArray()
  let dest = `[`
    for (let i=0; i<jsonValues.length; i++ ) {
        let postionRewardData = jsonValues[i].toObject()
        let rewardToken = postionRewardData.get("rewardToken")!.toString()
        let rewardTokenDecimals = postionRewardData.get("rewardTokenDecimals")!.toString()
        let rewardAmount = postionRewardData.get("rewardAmount")!.toBigInt()
        if (rewardToken != inputRewardToken) {
            dest += buildRewardObject(rewardToken, rewardTokenDecimals, rewardAmount)
            if (i < jsonValues.length-1) {
                dest += `,`
            }
            continue
        }
        addNewToken = false 
        rewardAmount = rewardAmount.plus(inputRewardAmount)
        // assert.stringEquals(rewardAmount.toString(), "200" )
        dest += buildRewardObject(rewardToken, rewardTokenDecimals, rewardAmount)
        if (i < jsonValues.length-1) {
            dest += `,`
        }
    }
    if (addNewToken) {
        if (jsonValues.length > 0 ) {
          dest += `,`
        }
        dest += buildRewardObject(inputRewardToken, inputRewardTokenDecimals, inputRewardAmount)
    } 
    dest += `]`
    log.error("+++rewards after: {}", [dest])
    positionReward.rewards = dest
    return positionReward
}

function buildRewardObject(rewardToken: string, rewardTokenDecimals: string, rewardAmount: BigInt): string {
  let dest = `{`
        dest += `"rewardToken": "` + rewardToken + `",`
        dest += `"rewardTokenDecimals": "` + rewardTokenDecimals + `",`
        dest += `"rewardAmount": ` + rewardAmount.toString()
    dest += `}`
    return dest
}


function DecodeHarvestEvent(txBytes: Bytes, txHash: string): Value {
  
  const functionInput = Bytes.fromUint8Array(txBytes.subarray(4));
  const tuplePrefix = ByteArray.fromHexString(
      '0x0000000000000000000000000000000000000000000000000000000000000020'
  );
  const functionInputAsTuple = new Uint8Array(
      tuplePrefix.length + functionInput.length
  );
  //concat prefix & original input
  functionInputAsTuple.set(tuplePrefix, 0);
  functionInputAsTuple.set(functionInput, tuplePrefix.length);

  const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);

  // harvest event can be emitted from both harvest and exit action
  // there should be a kind of try catch process with tx input to classify them

  //exit 
  var decoded = ethereum.decode(
      '(uint256,uint256[],uint256[])',
      tupleInputBytes
  );
  if (decoded != null){
    //exit tx
    const t = decoded.toTuple();
    const pid = t[0].toI32()
    const nfts = t[1].toI32Array()
    const liqs = t[2].toBigIntArray()
    let pids = new Array<i32>()
    for (let i=0; i<nfts.length; i++){
      pids.push(pid)
    }

    log.error("+++decode exit: {} {} {} {}", [pid.toString(), nfts.length.toString(), liqs.length.toString(), pids.length.toString()])
    return Value.fromArray([Value.fromI32Array(nfts), Value.fromI32Array(pids)])
  }

  //harvestMultiplePools
  decoded = ethereum.decode(
    '(uint[],bytes[])',
    tupleInputBytes
  );
  if (decoded != null){
    //harvestMultiplePools tx
    const t = decoded.toTuple();
    const nfts = t[0].toI32Array()
    const bytes = t[1].toBytesArray()

    let pids= new Array<i32>()
    for (let i=0; i< bytes.length; i++ ){
        const decodedPid = ethereum.decode(
            '(uint[])',
            bytes[i]
        );
        if (decodedPid == null){
            throw Error('Decode harvest tx failed: get pids step')

        } 
        pids.push(decodedPid.toTuple()[0].toI32Array()[0])
    }
    log.error("+++decode harvest: {} {}", [nfts.length.toString(), pids.length.toString()])
    return Value.fromArray([Value.fromI32Array(nfts), Value.fromI32Array(pids)])
  }
  log.error("+++decode invalid tx", [])
  return Value.fromArray([])
}
