import {test, assert, log} from "matchstick-as/assembly/index"
import { 
    json,
    BigInt,
  } from '@graphprotocol/graph-ts';
import { PositionReward } from "../src/types/schema";
test("get/set json field - old token", () => {
    let inputRewardToken = "0xdac17f958d2ee523a2206206994597c13d831ec7"
    let inputRewardTokenDecimals = "18"
    let inputRewardAmount = BigInt.fromString("200")
    let dest = aggregate(inputRewardToken, inputRewardTokenDecimals, inputRewardAmount, `[{
        "rewardToken": "0xdac17f958d2ee523a2206206994597c13d831ec7",  
        "rewardTokenDecimals": "6",
        "rewardAmount": 100
    }]`)
    let jsonValues = json.fromString(dest).toArray()
    let postionRewardData = jsonValues[0].toObject()
    let rewardToken = postionRewardData.get("rewardToken")!.toString()
    let rewardTokenDecimals = postionRewardData.get("rewardTokenDecimals")!.toString()
    let rewardAmount = postionRewardData.get("rewardAmount")!.toBigInt()
    assert.stringEquals(jsonValues.length.toString(), "1" )
    assert.stringEquals(rewardToken, "0xdac17f958d2ee523a2206206994597c13d831ec7" )
    assert.stringEquals(rewardTokenDecimals, "6" )
    assert.stringEquals(rewardAmount.toString(), "200" )
}) 

test("get/set json field - new token", () => {
    let inputRewardToken = "0xeee"
    let inputRewardTokenDecimals = "18"
    let inputRewardAmount = BigInt.fromString("200")
    let dest = aggregate(inputRewardToken, inputRewardTokenDecimals, inputRewardAmount, `[{
        "rewardToken": "0xdac17f958d2ee523a2206206994597c13d831ec7",  
        "rewardTokenDecimals": "6",
        "rewardAmount": 100
    }]`)
    // log.critical(dest,[])
    let jsonValues = json.fromString(dest).toArray()
    assert.stringEquals(jsonValues.length.toString(), "2" )
    assert.stringEquals(jsonValues[0].toObject().get("rewardToken")!.toString(), "0xdac17f958d2ee523a2206206994597c13d831ec7" )
    assert.stringEquals(jsonValues[0].toObject().get("rewardTokenDecimals")!.toString(), "6" )
    assert.stringEquals(jsonValues[0].toObject().get("rewardAmount")!.toBigInt().toString(), "100" )
    assert.stringEquals(jsonValues[1].toObject().get("rewardToken")!.toString(), "0xeee" )
    assert.stringEquals(jsonValues[1].toObject().get("rewardTokenDecimals")!.toString(), "18" )
    assert.stringEquals(jsonValues[1].toObject().get("rewardAmount")!.toBigInt().toString(), "200" )
}) 

function aggregate(inputRewardToken: string, inputRewardTokenDecimals: string, inputRewardAmount: BigInt, jsonString: string) : string {
    let addNewToken = true
    let jsonValues = json.fromString(jsonString).toArray()
    let dest = `[`
    for (let i=0; i<jsonValues.length; i++ ) {
        let postionRewardData = jsonValues[i].toObject()!
        let rewardToken = postionRewardData.get("rewardToken")!.toString()
        let rewardTokenDecimals = postionRewardData.get("rewardTokenDecimals")!.toString()
        let rewardAmount = postionRewardData.get("rewardAmount")!.toBigInt()
        if (rewardToken != inputRewardToken) {
            dest += buildObject(rewardToken, rewardTokenDecimals, rewardAmount)
            continue
        }
        addNewToken = false 
        rewardAmount = rewardAmount.plus(BigInt.fromI32(100))
        // assert.stringEquals(rewardAmount.toString(), "200" )
        dest += buildObject(rewardToken, rewardTokenDecimals, rewardAmount)
        if (i < jsonValues.length-1) {
            dest += `,`
        }
    }
    if (addNewToken) {
        dest += `,` + buildObject(inputRewardToken, inputRewardTokenDecimals, inputRewardAmount)
    } 
    dest += `]`
    return dest
}
function buildObject(rewardToken: string, rewardTokenDecimals: string, rewardAmount: BigInt): string{
    let dest = `{`
        dest += `"rewardToken": "` + rewardToken + `",`
        dest += `"rewardTokenDecimals": "` + rewardTokenDecimals + `",`
        dest += `"rewardAmount": ` + rewardAmount.toString()
    dest += `}`
    return dest

}
