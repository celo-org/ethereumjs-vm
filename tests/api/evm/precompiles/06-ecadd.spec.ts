import tape from 'tape'
import { Address, BN } from 'ethereumjs-util'
import Common, { Chain, Hardfork } from '@ethereumjs/common'
import VM from '../../../../src'
import { getPrecompile } from '../../../../src/evm/precompiles'

tape('Precompiles: ECADD', (t) => {
  t.test('ECADD', async (st) => {
    const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Petersburg })
    const vm = new VM({ common: common })
    const address = new Address(Buffer.from('0000000000000000000000000000000000000006', 'hex'))
    const ECADD = getPrecompile(address, common)

    const result = await ECADD({
      data: Buffer.alloc(0),
      gasLimit: new BN(0xffff),
      _common: common,
      _VM: vm,
    })

    st.deepEqual(result.gasUsed.toNumber(), 500, 'should use petersburg gas costs')
    st.end()
  })
})
