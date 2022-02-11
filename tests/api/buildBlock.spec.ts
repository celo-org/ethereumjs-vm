import tape from 'tape'
import { Account, Address } from 'ethereumjs-util'
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import { Block } from '@ethereumjs/block'
import { Transaction, FeeMarketEIP1559Transaction } from '@ethereumjs/tx'
import Blockchain from '@ethereumjs/blockchain'
import VM from '../../src'
import { setBalance } from './utils'

tape('BlockBuilder', async (t) => {
  t.test('should build a valid block', async (st) => {
    const common = new Common({ chain: Chain.Mainnet })
    const genesisBlock = Block.genesis({ header: { gasLimit: 50000 } }, { common })
    const blockchain = await Blockchain.create({ genesisBlock, common, validateConsensus: false })
    const vm = await VM.create({ common, blockchain })

    const address = Address.fromString('0xccfd725760a68823ff1e062f4cc97e1360e8d997')
    await setBalance(vm, address)

    const vmCopy = vm.copy()

    const blockBuilder = await vm.buildBlock({
      parentBlock: genesisBlock,
      headerData: { coinbase: '0x96dc73c8b5969608c77375f085949744b5177660' },
      blockOpts: { calcDifficultyFromHeader: genesisBlock.header, freeze: false },
    })

    // Set up tx
    const tx = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 1 },
      { common, freeze: false }
    )
    tx.getSenderAddress = () => {
      return address
    }

    await blockBuilder.addTransaction(tx)
    const block = await blockBuilder.build()

    // block should successfully execute with VM.runBlock and have same outputs
    block.transactions[0].getSenderAddress = () => {
      return address
    }
    const result = await vmCopy.runBlock({ block })
    st.ok(result.gasUsed.eq(block.header.gasUsed))
    st.ok(result.receiptRoot.equals(block.header.receiptTrie))
    st.ok(result.stateRoot.equals(block.header.stateRoot))
    st.ok(result.logsBloom.equals(block.header.logsBloom))
    st.end()
  })

  t.test('should throw if adding a transaction exceeds the block gas limit', async (st) => {
    const common = new Common({ chain: Chain.Mainnet })
    const vm = await VM.create({ common })
    const genesis = Block.genesis({}, { common })

    const blockBuilder = await vm.buildBlock({ parentBlock: genesis })
    const gasLimit = genesis.header.gasLimit.addn(1)
    const tx = Transaction.fromTxData({ gasLimit }, { common })
    try {
      await blockBuilder.addTransaction(tx)
      st.fail('should throw error')
    } catch (error: any) {
      if (error.message.includes('tx has a higher gas limit than the remaining gas in the block')) {
        st.pass('correct error thrown')
      } else {
        st.fail('wrong error thrown')
      }
    }
    st.end()
  })

  t.test('should revert the VM state if reverted', async (st) => {
    const common = new Common({ chain: Chain.Mainnet })
    const genesisBlock = Block.genesis({ header: { gasLimit: 50000 } }, { common })
    const blockchain = await Blockchain.create({ genesisBlock, common, validateConsensus: false })
    const vm = await VM.create({ common, blockchain })

    const address = Address.fromString('0xccfd725760a68823ff1e062f4cc97e1360e8d997')
    await setBalance(vm, address)

    const root0 = await vm.stateManager.getStateRoot()

    const blockBuilder = await vm.buildBlock({ parentBlock: genesisBlock })

    // Set up tx
    const tx = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 1 },
      { common, freeze: false }
    )
    tx.getSenderAddress = () => {
      return address
    }

    await blockBuilder.addTransaction(tx)

    const root1 = await vm.stateManager.getStateRoot(true)
    st.ok(!root0.equals(root1), 'state root should change after adding a tx')

    await blockBuilder.revert()
    const root2 = await vm.stateManager.getStateRoot()

    st.ok(root2.equals(root0), 'state root should revert to before the tx was run')
    st.end()
  })

  t.test('should correctly seal a PoW block', async (st) => {
    const common = new Common({ chain: Chain.Mainnet })
    const genesisBlock = Block.genesis({ header: { gasLimit: 50000 } }, { common })
    const blockchain = await Blockchain.create({ genesisBlock, common, validateConsensus: false })
    const vm = await VM.create({ common, blockchain })

    const address = Address.fromString('0xccfd725760a68823ff1e062f4cc97e1360e8d997')
    await setBalance(vm, address)

    const blockBuilder = await vm.buildBlock({
      parentBlock: genesisBlock,
      blockOpts: { calcDifficultyFromHeader: genesisBlock.header, freeze: false },
    })

    // Set up tx
    const tx = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 1 },
      { common, freeze: false }
    )
    tx.getSenderAddress = () => {
      return address
    }

    await blockBuilder.addTransaction(tx)

    const sealOpts = {
      mixHash: Buffer.alloc(32),
      nonce: Buffer.alloc(8),
    }
    const block = await blockBuilder.build(sealOpts)

    st.ok(block.header.mixHash.equals(sealOpts.mixHash))
    st.ok(block.header.nonce.equals(sealOpts.nonce))
    st.ok(block.validateDifficulty(genesisBlock))
    st.end()
  })

  t.test('should correctly seal a PoA block', async (st) => {
    const signer = {
      address: new Address(Buffer.from('0b90087d864e82a284dca15923f3776de6bb016f', 'hex')),
      privateKey: Buffer.from(
        '64bf9cc30328b0e42387b3c82c614e6386259136235e20c1357bd11cdee86993',
        'hex'
      ),
      publicKey: Buffer.from(
        '40b2ebdf4b53206d2d3d3d59e7e2f13b1ea68305aec71d5d24cefe7f24ecae886d241f9267f04702d7f693655eb7b4aa23f30dcd0c3c5f2b970aad7c8a828195',
        'hex'
      ),
    }

    const common = new Common({ chain: Chain.Rinkeby })
    // extraData: [vanity, activeSigner, seal]
    const extraData = Buffer.concat([Buffer.alloc(32), signer.address.toBuffer(), Buffer.alloc(65)])
    const cliqueSigner = signer.privateKey
    const genesisBlock = Block.genesis(
      { header: { gasLimit: 50000, extraData } },
      { common, cliqueSigner }
    )
    const blockchain = await Blockchain.create({ genesisBlock, common })
    const vm = await VM.create({ common, blockchain })

    // add balance for tx
    await vm.stateManager.putAccount(signer.address, Account.fromAccountData({ balance: 100000 }))

    const blockBuilder = await vm.buildBlock({
      parentBlock: genesisBlock,
      headerData: { difficulty: 2 },
      blockOpts: { cliqueSigner, freeze: false },
    })

    // Set up tx
    const tx = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 1 },
      { common, freeze: false }
    ).sign(signer.privateKey)

    await blockBuilder.addTransaction(tx)

    const block = await blockBuilder.build()

    st.ok(block.header.cliqueVerifySignature([signer.address]), 'should verify signature')
    st.ok(
      block.header.cliqueSigner().equals(signer.address),
      'should recover the correct signer address'
    )
    st.end()
  })

  t.test('should throw if block already built or reverted', async (st) => {
    const common = new Common({ chain: Chain.Mainnet })
    const genesisBlock = Block.genesis({ header: { gasLimit: 50000 } }, { common })
    const blockchain = await Blockchain.create({ genesisBlock, common, validateConsensus: false })
    const vm = await VM.create({ common, blockchain })

    const address = Address.fromString('0xccfd725760a68823ff1e062f4cc97e1360e8d997')
    await setBalance(vm, address)

    let blockBuilder = await vm.buildBlock({
      parentBlock: genesisBlock,
      blockOpts: { calcDifficultyFromHeader: genesisBlock.header },
    })

    const tx = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 1 },
      { common, freeze: false }
    )
    tx.getSenderAddress = () => {
      return address
    }

    await blockBuilder.addTransaction(tx)
    await blockBuilder.build()

    try {
      await blockBuilder.revert()
      st.fail('should throw error')
    } catch (error: any) {
      if (error.message.includes('Block has already been built')) {
        st.pass('correct error thrown')
      } else {
        st.fail('wrong error thrown')
      }
    }

    blockBuilder = await vm.buildBlock({ parentBlock: genesisBlock })

    const tx2 = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 1, nonce: 1 },
      { common, freeze: false }
    )
    tx2.getSenderAddress = () => {
      return address
    }

    await blockBuilder.addTransaction(tx2)
    await blockBuilder.revert()

    try {
      await blockBuilder.revert()
      st.fail('should throw error')
    } catch (error: any) {
      if (error.message.includes('State has already been reverted')) {
        st.pass('correct error thrown')
      } else {
        st.fail('wrong error thrown')
      }
    }

    st.end()
  })

  t.test('should build a block without any txs', async (st) => {
    const common = new Common({ chain: Chain.Mainnet })
    const genesisBlock = Block.genesis({ header: { gasLimit: 50000 } }, { common })
    const blockchain = await Blockchain.create({ genesisBlock, common, validateConsensus: false })
    const vm = await VM.create({ common, blockchain })
    const vmCopy = vm.copy()

    const blockBuilder = await vm.buildBlock({
      parentBlock: genesisBlock,
      blockOpts: { calcDifficultyFromHeader: genesisBlock.header, freeze: false },
    })

    const block = await blockBuilder.build()

    // block should successfully execute with VM.runBlock and have same outputs
    const result = await vmCopy.runBlock({ block })
    st.ok(result.gasUsed.eq(block.header.gasUsed))
    st.ok(result.receiptRoot.equals(block.header.receiptTrie))
    st.ok(result.stateRoot.equals(block.header.stateRoot))
    st.ok(result.logsBloom.equals(block.header.logsBloom))
    st.end()
  })

  t.test('should build a 1559 block with legacy and 1559 txs', async (st) => {
    const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London, eips: [1559] })
    const genesisBlock = Block.genesis(
      { header: { gasLimit: 50000, baseFeePerGas: 100 } },
      { common }
    )
    const blockchain = await Blockchain.create({ genesisBlock, common, validateConsensus: false })
    const vm = await VM.create({ common, blockchain })

    const address = Address.fromString('0xccfd725760a68823ff1e062f4cc97e1360e8d997')
    await setBalance(vm, address)

    const vmCopy = vm.copy()

    const blockBuilder = await vm.buildBlock({
      parentBlock: genesisBlock,
      headerData: { coinbase: '0x96dc73c8b5969608c77375f085949744b5177660' },
      blockOpts: { calcDifficultyFromHeader: genesisBlock.header, freeze: false },
    })

    // Set up underpriced txs to test error response
    const tx1 = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 1 },
      { common, freeze: false }
    )
    tx1.getSenderAddress = () => {
      return address
    }
    const tx2 = FeeMarketEIP1559Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, maxFeePerGas: 10 },
      { common, freeze: false }
    )
    tx2.getSenderAddress = () => {
      return address
    }

    for (const tx of [tx1, tx2]) {
      try {
        await blockBuilder.addTransaction(tx)
        st.fail('should throw error')
      } catch (error: any) {
        st.ok(
          error.message.includes("is less than the block's baseFeePerGas"),
          'should fail with appropriate error'
        )
      }
    }

    // Set up correctly priced txs
    const tx3 = Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, gasPrice: 101 },
      { common, freeze: false }
    )
    tx3.getSenderAddress = () => {
      return address
    }
    const tx4 = FeeMarketEIP1559Transaction.fromTxData(
      { to: Address.zero(), value: 1000, gasLimit: 21000, maxFeePerGas: 101, nonce: 1 },
      { common, freeze: false }
    )
    tx4.getSenderAddress = () => {
      return address
    }

    for (const tx of [tx3, tx4]) {
      await blockBuilder.addTransaction(tx)
      st.ok('should pass')
    }

    const block = await blockBuilder.build()

    st.ok(
      block.header.baseFeePerGas!.eq(genesisBlock.header.calcNextBaseFee()),
      "baseFeePerGas should equal parentHeader's calcNextBaseFee"
    )

    // block should successfully execute with VM.runBlock and have same outputs
    block.transactions[0].getSenderAddress = () => {
      return address
    }
    block.transactions[1].getSenderAddress = () => {
      return address
    }
    const result = await vmCopy.runBlock({ block })
    st.ok(result.gasUsed.eq(block.header.gasUsed))
    st.ok(result.receiptRoot.equals(block.header.receiptTrie))
    st.ok(result.stateRoot.equals(block.header.stateRoot))
    st.ok(result.logsBloom.equals(block.header.logsBloom))
    st.end()
  })
})
