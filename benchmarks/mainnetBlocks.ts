import { readFileSync } from 'fs'
import Benchmark = require('benchmark')
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import { Block } from '@ethereumjs/block'
import blockFromRPC from '@ethereumjs/block/dist/from-rpc'
import VM from '../dist'
import { getPreState, getBlockchain, verifyResult } from './util'

const BLOCK_FIXTURE = 'benchmarks/fixture/blocks-prestate.json'

const runBlock = async (vm: VM, block: Block, receipts: any) => {
  await vm.copy().runBlock({
    block,
    generate: true,
    skipBlockValidation: true,
  })
  verifyResult(block, receipts)
}

export async function mainnetBlocks(suite?: Benchmark.Suite, numSamples?: number) {
  let data = JSON.parse(readFileSync(BLOCK_FIXTURE, 'utf8'))
  if (!Array.isArray(data)) data = [data]
  console.log(`Total number of blocks in data set: ${data.length}`)

  numSamples = numSamples ?? data.length
  console.log(`Number of blocks to sample: ${numSamples}`)
  data = data.slice(0, numSamples)

  const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.MuirGlacier })

  for (const blockData of data) {
    const block = blockFromRPC(blockData.block, [], { common })
    const blockNumber = block.header.number.toNumber()
    const { receipts, preState, blockhashes } = blockData

    if ([9422909, 9422911, 9422912, 9422913, 9422914].includes(blockNumber)) {
      // Skip problematic blocks that in normal ci operation
      // sometimes exceeds the alert threshold by 2-2.5x, could use more
      // investigation to determine exactly why this is happening.
      // https://github.com/ethereumjs/ethereumjs-monorepo/pull/1546
      continue
    }

    const stateManager = await getPreState(preState, common)
    const blockchain = getBlockchain(blockhashes) as any
    const vm = new VM({ stateManager, common, blockchain })

    if (suite) {
      suite.add(`Block ${blockNumber}`, async () => {
        await runBlock(vm, block, receipts)
      })
    } else {
      await runBlock(vm, block, receipts)
    }
  }
}
