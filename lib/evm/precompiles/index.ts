import { ExecResult } from '../evm'
import { PrecompileInput, PrecompileFunc } from './types'
import { default as p1 } from './01-ecrecover'
import { default as p2 } from './02-sha256'
import { default as p3 } from './03-ripemd160'
import { default as p4 } from './04-identity'
import { default as p5 } from './05-modexp'
import { default as p6 } from './06-ecadd'
import { default as p7 } from './07-ecmul'
import { default as p8 } from './08-ecpairing'
import { default as p9 } from './09-blake2f'
import { default as pf8 } from './f8-epochsize'
import { default as pfc } from './fc-fractionmulexp'
import { default as pfd } from './fd-transfer'

interface Precompiles {
  [key: string]: PrecompileFunc
}
export interface Func {
  (opts: PrecompileInput): ExecResult
}

function toAsync(a: Func): PrecompileFunc {
  return async function(opts: PrecompileInput) {
    return a(opts)
  }
}

const ripemdPrecompileAddress = '0000000000000000000000000000000000000003'
const precompiles: Precompiles = {
  '0000000000000000000000000000000000000001': toAsync(p1),
  '0000000000000000000000000000000000000002': toAsync(p2),
  [ripemdPrecompileAddress]: toAsync(p3),
  '0000000000000000000000000000000000000004': toAsync(p4),
  '0000000000000000000000000000000000000005': toAsync(p5),
  '0000000000000000000000000000000000000006': toAsync(p6),
  '0000000000000000000000000000000000000007': toAsync(p7),
  '0000000000000000000000000000000000000008': toAsync(p8),
  '0000000000000000000000000000000000000009': toAsync(p9),
  '00000000000000000000000000000000000000f8': toAsync(pf8),
  '00000000000000000000000000000000000000fc': toAsync(pfc),
  '00000000000000000000000000000000000000fd': pfd,
}

function getPrecompile(address: string): PrecompileFunc {
  return precompiles[address]
}

export { precompiles, getPrecompile, PrecompileFunc, PrecompileInput, ripemdPrecompileAddress }
