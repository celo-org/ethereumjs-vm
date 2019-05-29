import { PrecompileInput, PrecompileResult, PrecompileFunc } from './types';
interface Precompiles {
    [key: string]: PrecompileFunc;
}
declare const precompiles: Precompiles;
declare function getPrecompile(address: string): PrecompileFunc;
export { precompiles, getPrecompile, PrecompileFunc, PrecompileInput, PrecompileResult };
