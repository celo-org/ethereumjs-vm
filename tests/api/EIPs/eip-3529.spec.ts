import tape from 'tape'
import { Address, BN } from 'ethereumjs-util'
import VM from '../../../src'
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import { InterpreterStep } from '../../../src/evm/interpreter'
import { EIP2929StateManager } from '../../../src/state/interface'
import { Transaction } from '@ethereumjs/tx'

const address = new Address(Buffer.from('11'.repeat(20), 'hex'))
const pkey = Buffer.from('20'.repeat(32), 'hex')

const testCases = [
  {
    code: '0x60006000556000600055',
    original: 0,
    usedGas: 212,
    effectiveGas: 212,
  },
  {
    code: '0x60006000556001600055',
    original: 0,
    usedGas: 20112,
    effectiveGas: 20112,
  },
  {
    code: '0x60016000556000600055',
    original: 0,
    usedGas: 20112,
    effectiveGas: 212,
  },
  {
    code: '0x60016000556002600055',
    original: 0,
    usedGas: 20112,
    effectiveGas: 20112,
  },
  {
    code: '0x60016000556001600055',
    original: 0,
    usedGas: 20112,
    effectiveGas: 20112,
  },
  {
    code: '0x60006000556000600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: -1788,
  },
  {
    code: '0x60006000556001600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: 212,
  },
  {
    code: '0x60006000556002600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: 3012,
  },
  {
    code: '0x60026000556000600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: -1788,
  },
  {
    code: '0x60026000556003600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: 3012,
  },
  {
    code: '0x60026000556001600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: 212,
  },
  {
    code: '0x60026000556002600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: 3012,
  },
  {
    code: '0x60016000556000600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: -1788,
  },
  {
    code: '0x60016000556002600055',
    original: 1,
    usedGas: 3012,
    effectiveGas: 3012,
  },
  {
    code: '0x600160005560006000556001600055',
    original: 0,
    usedGas: 40118,
    effectiveGas: 20218,
  },
  {
    code: '0x600060005560016000556000600055',
    original: 1,
    usedGas: 5918,
    effectiveGas: -1682,
  },
]

tape('EIP-3529 tests', (t) => {
  const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Berlin, eips: [3529] })

  t.test('should verify EIP test cases', async (st) => {
    const vm = new VM({ common })

    let gasRefund: BN
    let gasLeft: BN

    vm.on('step', (step: InterpreterStep) => {
      if (step.opcode.name === 'STOP') {
        gasRefund = step.gasRefund.clone()
        gasLeft = step.gasLeft.clone()
      }
    })

    const gasLimit = new BN(100000)
    const key = Buffer.from('00'.repeat(32), 'hex')

    for (const testCase of testCases) {
      const code = Buffer.from((testCase.code + '00').slice(2), 'hex') // add a STOP opcode (0 gas) so we can find the gas used / effective gas

      await vm.stateManager.putContractStorage(
        address,
        key,
        Buffer.from(testCase.original.toString().padStart(64, '0'), 'hex')
      )

      await vm.stateManager.getContractStorage(address, key)
      ;(<EIP2929StateManager>vm.stateManager).addWarmedStorage(address.toBuffer(), key)

      await vm.runCode({
        code,
        address,
        gasLimit,
      })

      const gasUsed = gasLimit.sub(gasLeft!)
      const effectiveGas = gasUsed.sub(gasRefund!)

      st.equals(effectiveGas.toNumber(), testCase.effectiveGas, 'correct effective gas')
      st.equals(gasUsed.toNumber(), testCase.usedGas, 'correct used gas')

      // clear the storage cache, otherwise next test will use current original value
      vm.stateManager.clearOriginalStorageCache()
    }

    st.end()
  })

  t.test('should not refund selfdestructs', async (st) => {
    const vm = new VM({ common })

    const tx = Transaction.fromTxData({
      data: '0x6000ff',
      gasLimit: 100000,
    }).sign(pkey)

    const result = await vm.runTx({
      tx,
    })

    st.ok(result.execResult.exceptionError === undefined, 'transaction executed succesfully')
    st.ok(BN.isBN(result.execResult.gasRefund), 'gas refund is defined')
    st.ok(result.execResult.gasRefund?.isZero(), 'gas refund is zero')
    st.end()
  })

  t.test('refunds are capped at 1/5 of the tx gas used', async (st) => {
    /**
     * This test initializes a contract with slots 0-99 initialized to a nonzero value
     * Then, it resets all these 100 slots back to 0. This is to check if the
     * max gas refund is respected.
     */
    const vm = new VM({ common })

    let startGas: any
    let finalGas: any

    vm.on('step', (step: InterpreterStep) => {
      if (startGas === undefined) {
        startGas = step.gasLeft.clone()
      }
      if (step.opcode.name === 'STOP') {
        finalGas = step.gasLeft.clone()
      }
    })

    const address = new Address(Buffer.from('20'.repeat(20), 'hex'))

    const value = Buffer.from('01'.repeat(32), 'hex')

    let code = ''

    for (let i = 0; i < 100; i++) {
      const key = Buffer.from(i.toString(16).padStart(64, '0'), 'hex')
      await vm.stateManager.putContractStorage(address, key, value)
      const hex = i.toString(16).padStart(2, '0')
      // push 0 push <hex> sstore
      code += '600060' + hex + '55'
    }

    code += '00'

    await vm.stateManager.putContractCode(address, Buffer.from(code, 'hex'))

    const tx = Transaction.fromTxData({
      to: address,
      gasLimit: 10000000,
    }).sign(pkey)

    const result = await vm.runTx({ tx })

    const actualGasUsed = startGas.sub(finalGas).addn(21000)
    const maxRefund = actualGasUsed.divn(5)
    const minGasUsed = actualGasUsed.sub(maxRefund)
    const gasUsed = result.execResult.gasUsed

    st.ok(result.execResult.gasRefund?.gt(maxRefund), 'refund is larger than the max refund')
    st.ok(gasUsed.gte(minGasUsed), 'gas used respects the max refund quotient')
    st.end()
  })
})
