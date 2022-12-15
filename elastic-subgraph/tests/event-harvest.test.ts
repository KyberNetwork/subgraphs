

import {test, assert, log} from "matchstick-as/assembly/index"
import {  
    Bytes,
    ByteArray,
    ethereum
} from '@graphprotocol/graph-ts';
test("[exit] decode tx hash: 0xa5aef9f992da7c805900fcf3a2ad5482be70a21f35179eef7ac24f3739033df5", () => {
    let hexData = "0x66b5a6640000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000101000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000e2b114c4bb2358"
    let txBytes = ByteArray.fromHexString(hexData)
    
    const exitFunctionInput = Bytes.fromUint8Array(txBytes.subarray(4));

    //prepend a "tuple" prefix (function params are arrays, not tuples)
    const tuplePrefix = ByteArray.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000020'
    );
    const functionInputAsTuple = new Uint8Array(
        tuplePrefix.length + exitFunctionInput.length
    );
    //concat prefix & original input
    functionInputAsTuple.set(tuplePrefix, 0);
    functionInputAsTuple.set(exitFunctionInput, tuplePrefix.length);

    const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);



    const decoded = ethereum.decode(
        '(uint256,uint256[],uint256[])',
        tupleInputBytes
    );

    if (decoded == null){
        throw Error('Decode harvest tx failed: multicall step')
    }

    
    const t = decoded.toTuple();
    const pid = t[0].toI32()
    const nfts = t[1].toI32Array()
    const liqs = t[2].toBigIntArray()
    
    assert.stringEquals(t.length.toString(), "3")
    assert.stringEquals(nfts.length.toString(), "1")
    assert.stringEquals(liqs.length.toString(), "1")

    assert.stringEquals(pid.toString(), "3")
    assert.stringEquals(nfts[0].toString(), "257")
    assert.stringEquals(liqs[0].toString(), "63808047494669144")

    let result = nfts.concat(nfts)
    for (let i=0; i<nfts.length; i++){
        result[i+nfts.length] = pid
    }
    assert.stringEquals(result.length.toString(), "2")
    assert.stringEquals(result[0].toString(), "257")
    assert.stringEquals(result[1].toString(), "3")
})

test("[harvestMultiplePools] decode tx hash: 0x5a83732c440533d5193d1d7e7e7e5187a788c011d0a3289980126ed0010cc5fa", () => {
    let hexData = "0x180f803600000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000001130000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003"
    let txBytes = ByteArray.fromHexString(hexData)
    
    const exitFunctionInput = Bytes.fromUint8Array(txBytes.subarray(4));

    //prepend a "tuple" prefix (function params are arrays, not tuples)
    const tuplePrefix = ByteArray.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000020'
    );
    const functionInputAsTuple = new Uint8Array(
        tuplePrefix.length + exitFunctionInput.length
    );
    //concat prefix & original input
    functionInputAsTuple.set(tuplePrefix, 0);
    functionInputAsTuple.set(exitFunctionInput, tuplePrefix.length);

    const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);
    const decoded = ethereum.decode(
        '(uint[],bytes[])',
        tupleInputBytes
    );

    if (decoded == null){
        throw Error('Decode harvest tx failed: multicall step')
    }
    const t = decoded.toTuple();
    const nfts = t[0].toI32Array()
    const bytes = t[1].toBytesArray()

    let pids= new Array<i32>()
    for (let i=0; i< bytes.length; i++ ){
        const decodedPid = ethereum.decode(
            'uint',
            bytes[i]
        );
        if (decodedPid == null){
            throw Error('Decode harvest tx failed: get pids step')

        } 
        pids.push(decodedPid.toI32())
    }
    assert.stringEquals(nfts.length.toString(), "1")
    assert.stringEquals(nfts[0].toString(), "275")
    assert.stringEquals(pids.length.toString(), "1")
    assert.stringEquals(pids[0].toString(), "32")
})

test("[harvestMultiplePools] decode tx hash: 0x16f06275ef9d26f640c683381c2ec57a204d329014ff2fa50325d1727ae06eeb", () => {
    let hexData = "0x180f8036000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000002900000000000000000000000000000000000000000000000000000000000000330000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000"
    let txBytes = ByteArray.fromHexString(hexData)
    
    const exitFunctionInput = Bytes.fromUint8Array(txBytes.subarray(4));

    //prepend a "tuple" prefix (function params are arrays, not tuples)
    const tuplePrefix = ByteArray.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000020'
    );
    const functionInputAsTuple = new Uint8Array(
        tuplePrefix.length + exitFunctionInput.length
    );
    //concat prefix & original input
    functionInputAsTuple.set(tuplePrefix, 0);
    functionInputAsTuple.set(exitFunctionInput, tuplePrefix.length);

    const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);
    const decoded = ethereum.decode(
        '(uint[],bytes[])',
        tupleInputBytes
    );

    if (decoded == null){
        throw Error('Decode harvest tx failed: multicall step')
    }
    const t = decoded.toTuple();
    const nfts = t[0].toI32Array()
    const bytes = t[1].toBytesArray()

    let pids= new Array<i32>()
    for (let i=0; i< bytes.length; i++ ){
        const decodedPid = ethereum.decode(
            '(uint)',
            bytes[i]
        );
        if (decodedPid == null){
            throw Error('Decode harvest tx failed: get pids step')

        } 

        log.critical(bytes[i].toHexString() + "_" + decodedPid.toTuple()[0].toI32().toString() + "_" + nfts[i].toString(), [])
        // pids.push(decodedPid.toI32())
    }

    // log.critical(pids[2].toString(), [])
    // assert.stringEquals(pids.length.toString(), "2")
    // assert.stringEquals(pids[0].toString(), "32")
    // assert.stringEquals(pids[1].toString(), "32")

})




test("[harvestMultiplePools] decode tx hash: 0x16f06275ef9d26f640c683381c2ec57a204d329014ff2fa50325d1727ae06eeb", () => {
    let hexData = "0x180f8036000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000002900000000000000000000000000000000000000000000000000000000000000330000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000"
    let txBytes = ByteArray.fromHexString(hexData)
    
    const exitFunctionInput = Bytes.fromUint8Array(txBytes.subarray(4));

    //prepend a "tuple" prefix (function params are arrays, not tuples)
    const tuplePrefix = ByteArray.fromHexString(
        '0x0000000000000000000000000000000000000000000000000000000000000020'
    );
    const functionInputAsTuple = new Uint8Array(
        tuplePrefix.length + exitFunctionInput.length
    );
    //concat prefix & original input
    functionInputAsTuple.set(tuplePrefix, 0);
    functionInputAsTuple.set(exitFunctionInput, tuplePrefix.length);

    const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);
    const decoded = ethereum.decode(
        '(uint[],bytes[])',
        tupleInputBytes
    );

    if (decoded == null){
        throw Error('Decode harvest tx failed: multicall step')
    }
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

        log.critical(bytes[i].toHexString() + "_" + decodedPid.toTuple()[0].toI32Array()[0].toString() + "_" + nfts[i].toString(), [])
        // pids.push(decodedPid.toI32())
    }

    // log.critical(pids[2].toString(), [])
    // assert.stringEquals(pids.length.toString(), "2")
    // assert.stringEquals(pids[0].toString(), "32")
    // assert.stringEquals(pids[1].toString(), "32")

})


