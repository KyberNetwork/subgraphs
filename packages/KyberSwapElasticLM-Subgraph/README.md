# Subgraph for Elastic LM 
Extract data from Elastic Liquidity Mining contract


# Deploy subgraph 

1. Build subgraph

Because we will track the contract on multiple chains, re-run build command will update the `subgraph.yaml` file for correct network

```
yarn build --network avalanche/arbitrum/optimism...
```

**Note**: need to check and update `networks.json` file for the correct data before running the command

2. Create subgraph to ipfs
This step will create a subgraph slot in ipfs

```
graph create $subgraph-name
```

3. Deploy subgraph
This step will push the build to the subgraph slot in ipfs and pull the data to start indexing

```
graph deploy $subgraph-name --network $network-name --node $graph-node-endpoint --ipfs $ipfs-endpdoint
```

If the result is success, the graph-node will start indexing the subgraph, you can later can go to the graphql explorer to request
 
