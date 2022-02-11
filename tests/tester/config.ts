import path from 'path'
import Common, { Chain } from '@ethereumjs/common'

/**
 * Default tests path (git submodule: ethereum-tests)
 */
export const DEFAULT_TESTS_PATH = path.resolve('../ethereum-tests')

/**
 * Default hardfork rules to run tests against
 */
export const DEFAULT_FORK_CONFIG = 'Istanbul'

/**
 * Tests which should be fixed
 */
export const SKIP_BROKEN = [
  'ForkStressTest', // Only BlockchainTest, temporary till fixed (2020-05-23)
  'ChainAtoChainB', // Only BlockchainTest, temporary, along expectException fixes (2020-05-23)
  'undefinedOpcodeFirstByte', // https://github.com/ethereumjs/ethereumjs-monorepo/issues/1271 (2021-05-26)

  // In these tests, we have access to two forked chains. Their total difficulty is equal. There are errors in the second chain, but we have no reason to execute this chain if the TD remains equal.
  'blockChainFrontierWithLargerTDvsHomesteadBlockchain2_FrontierToHomesteadAt5',
  'blockChainFrontierWithLargerTDvsHomesteadBlockchain_FrontierToHomesteadAt5',
  'HomesteadOverrideFrontier_FrontierToHomesteadAt5',
]

/**
 * Tests skipped due to system specifics / design considerations
 */
export const SKIP_PERMANENT = [
  'SuicidesMixingCoinbase', // suicides to the coinbase, since we run a blockLevel we create coinbase account.
  'static_SuicidesMixingCoinbase', // suicides to the coinbase, since we run a blockLevel we create coinbase account.
  'ForkUncle', // Only BlockchainTest, correct behavior unspecified (?)
  'UncleFromSideChain', // Only BlockchainTest, same as ForkUncle, the TD is the same for two different branches so its not clear which one should be the finally chain
]

/**
 * tests running slow (run from time to time)
 */
export const SKIP_SLOW = [
  'Call50000',
  'Call50000_ecrec',
  'Call50000_identity',
  'Call50000_identity2',
  'Call50000_sha256',
  'Call50000_rip160',
  'Call50000bytesContract50_1',
  'Call50000bytesContract50_2',
  'Call1MB1024Calldepth',
  'static_Call1MB1024Calldepth',
  'static_Call50000',
  'static_Call50000_ecrec',
  'static_Call50000_identity',
  'static_Call50000_identity2',
  'static_Call50000_rip160',
  'static_Return50000_2',
  'Callcode50000',
  'Return50000',
  'Return50000_2',
  'static_Call50000',
  'static_Call50000_ecrec',
  'static_Call50000_identity',
  'static_Call50000_identity2',
  'static_Call50000_sha256',
  'static_Call50000_rip160',
  'static_Call50000bytesContract50_1',
  'static_Call50000bytesContract50_2',
  'static_Call1MB1024Calldepth',
  'static_Callcode50000',
  'static_Return50000',
  'static_Return50000_2',
  'QuadraticComplexitySolidity_CallDataCopy',
  'CALLBlake2f_MaxRounds',
  'randomStatetest94_Istanbul',
  // vmPerformance tests
  'ackermann',
  'fibonacci',
  'loop-add-10M',
  'loop-divadd-10M',
  'loop-divadd-unr100-10M',
  'loop-exp',
  'loop-mul',
  'manyFunctions100',
  'loopMul',
  'loopExp',
]

/**
 * VMTests have been deprecated, see https://github.com/ethereum/tests/issues/593
 * skipVM test list is currently not used but might be useful in the future since VMTests
 * have now been converted to BlockchainTests, see https://github.com/ethereum/tests/pull/680
 * Disabling this due to ESLint, but will keep it here for possible future reference
 */
/*const SKIP_VM = [
  // slow performance tests
  'loop-mul',
  'loop-add-10M',
  'loop-divadd-10M',
  'loop-divadd-unr100-10M',
  'loop-exp-16b-100k',
  'loop-exp-1b-1M',
  'loop-exp-2b-100k',
  'loop-exp-32b-100k',
  'loop-exp-4b-100k',
  'loop-exp-8b-100k',
  'loop-exp-nop-1M',
  'loop-mulmod-2M',
  'ABAcalls0',
  'ABAcallsSuicide0',
  'ABAcallsSuicide1',
  'sha3_bigSize',
  'CallRecursiveBomb0',
  'CallToNameRegistrator0',
  'CallToPrecompiledContract',
  'CallToReturn1',
  'PostToNameRegistrator0',
  'PostToReturn1',
  'callcodeToNameRegistrator0',
  'callcodeToReturn1',
  'callstatelessToNameRegistrator0',
  'callstatelessToReturn1',
  'createNameRegistrator',
  'randomTest643',
]*/

/**
 * Returns an alias for specified hardforks to meet test dependencies requirements/assumptions.
 * @param {String} forkConfig - the name of the hardfork for which an alias should be returned
 * @returns {String} Either an alias of the forkConfig param, or the forkConfig param itself
 */
export function getRequiredForkConfigAlias(forkConfig: string) {
  // Chainstart is also called Frontier and is called as such in the tests
  if (String(forkConfig).match(/^chainstart$/i)) {
    return 'Frontier'
  }
  // TangerineWhistle is named EIP150 (attention: misleading name)
  // in the client-independent consensus test suite
  if (String(forkConfig).match(/^tangerineWhistle$/i)) {
    return 'EIP150'
  }
  // SpuriousDragon is named EIP158 (attention: misleading name)
  // in the client-independent consensus test suite
  if (String(forkConfig).match(/^spuriousDragon$/i)) {
    return 'EIP158'
  }
  // Run the Istanbul tests for MuirGlacier since there are no dedicated tests
  if (String(forkConfig).match(/^muirGlacier/i)) {
    return 'Istanbul'
  }
  // Petersburg is named ConstantinopleFix
  // in the client-independent consensus test suite
  if (String(forkConfig).match(/^petersburg$/i)) {
    return 'ConstantinopleFix'
  }
  return forkConfig
}

const normalHardforks = [
  'chainstart',
  'homestead',
  'dao',
  'tangerineWhistle',
  'spuriousDragon',
  'byzantium',
  'constantinople',
  'petersburg',
  'istanbul',
  'muirGlacier',
  'berlin',
  'london',
]

const transitionNetworks: any = {
  ByzantiumToConstantinopleFixAt5: {
    byzantium: 0,
    constantinople: 5,
    petersburg: 5,
    dao: null,
    finalSupportedFork: 'petersburg',
    startFork: 'byzantium',
  },
  EIP158ToByzantiumAt5: {
    spuriousDragon: 0,
    byzantium: 5,
    dao: null,
    finalSupportedFork: 'byzantium',
    startFork: 'spuriousDragon',
  },
  FrontierToHomesteadAt5: {
    chainstart: 0,
    homestead: 5,
    dao: null,
    finalSupportedFork: 'homestead',
    startFork: 'chainstart',
  },
  HomesteadToDaoAt5: {
    homestead: 0,
    dao: 5,
    finalSupportedFork: 'dao',
    startFork: 'homestead',
  },
  HomesteadToEIP150At5: {
    homestead: 0,
    tangerineWhistle: 5,
    dao: null,
    finalSupportedFork: 'tangerineWhistle',
    startFork: 'homestead',
  },
  BerlinToLondonAt5: {
    berlin: 0,
    london: 5,
    dao: null,
    finalSupportedFork: 'london',
    startFork: 'berlin',
  },
}

const testLegacy: any = {
  chainstart: true,
  homestead: true,
  tangerineWhistle: true,
  spuriousDragon: true,
  byzantium: true,
  constantinople: true,
  petersburg: true,
  istanbul: false,
  muirGlacier: false,
  berlin: false,
  ByzantiumToConstantinopleFixAt5: false,
  EIP158ToByzantiumAt5: false,
  FrontierToHomesteadAt5: false,
  HomesteadToDaoAt5: false,
  HomesteadToEIP150At5: false,
  BerlinToLondonAt5: false,
}

/**
 * Returns an array of dirs to run tests on
 * @param network (fork identifier)
 * @param {string} Test type (BlockchainTests/StateTests)
 */
export function getTestDirs(network: string, testType: string) {
  const testDirs = [testType]
  for (const key in testLegacy) {
    if (key.toLowerCase() == network.toLowerCase() && testLegacy[key]) {
      // Tests for HFs before Istanbul have been moved under `LegacyTests/Constantinople`:
      // https://github.com/ethereum/tests/releases/tag/v7.0.0-beta.1
      testDirs.push('LegacyTests/Constantinople/' + testType)
      break
    }
  }
  return testDirs
}

/**
 * Returns a Common for the given network (a test parameter)
 * @param {String} network - the network field of a test.
 * If this network has a `+` sign, it will also include these EIPs.
 * For instance, London+3855 will activate the network on the London hardfork, but will also activate EIP 3855.
 * Multiple EIPs can also be activated by seperating them with a `+` sign.
 * For instance, "London+3855+3860" will also activate EIP-3855 and EIP-3860.
 * @returns {Common} the Common which should be used
 */
export function getCommon(targetNetwork: string) {
  let network = targetNetwork
  if (network.includes('+')) {
    const index = network.indexOf('+')
    network = network.slice(0, index)
  }
  const networkLowercase = network.toLowerCase()
  if (normalHardforks.map((str) => str.toLowerCase()).includes(networkLowercase)) {
    // normal hard fork, return the common with this hard fork
    // find the right upper/lowercased version
    const hfName = normalHardforks.reduce((previousValue, currentValue) =>
      currentValue.toLowerCase() == networkLowercase ? currentValue : previousValue
    )
    const mainnetCommon = new Common({ chain: Chain.Mainnet, hardfork: hfName })
    const hardforks = mainnetCommon.hardforks()
    const testHardforks = []
    for (const hf of hardforks) {
      // check if we enable this hf
      // disable dao hf by default (if enabled at block 0 forces the first 10 blocks to have dao-hard-fork in extraData of block header)
      if (mainnetCommon.gteHardfork(hf.name) && hf.name != 'dao') {
        // this hardfork should be activated at block 0
        testHardforks.push({
          name: hf.name,
          // Current type definition Partial<Chain> in Common is currently not allowing to pass in forkHash
          // forkHash: hf.forkHash,
          block: 0,
        })
      } else {
        // disable hardforks newer than the test hardfork (but do add "support" for it, it just never gets activated)
        testHardforks.push({
          name: hf.name,
          //forkHash: hf.forkHash,
          block: null,
        })
      }
    }
    const common = Common.custom(
      {
        hardforks: testHardforks,
        defaultHardfork: hfName,
      },
      { eips: [3607] }
    )
    const eips = targetNetwork.match(/(?<=\+)(.\d+)/g)
    if (eips) {
      common.setEIPs(eips.map((e: string) => parseInt(e)))
    }
    return common
  } else {
    // this is not a "default fork" network, but it is a "transition" network. we will test the VM if it transitions the right way
    const transitionForks =
      transitionNetworks[network] ||
      transitionNetworks[network.substring(0, 1).toUpperCase() + network.substr(1)]
    if (!transitionForks) {
      throw new Error('network not supported: ' + network)
    }
    const mainnetCommon = new Common({
      chain: Chain.Mainnet,
      hardfork: transitionForks.finalSupportedFork,
    })
    const hardforks = mainnetCommon.hardforks()
    const testHardforks = []
    for (const hf of hardforks) {
      if (mainnetCommon.gteHardfork(hf.name)) {
        // this hardfork should be activated at block 0
        const forkBlockNumber = transitionForks[hf.name]
        testHardforks.push({
          name: hf.name,
          // forkHash: hf.forkHash,
          block: forkBlockNumber === null ? null : forkBlockNumber || 0, // if forkBlockNumber is defined as null, disable it, otherwise use block number or 0 (if its undefined)
        })
      } else {
        // disable the hardfork
        testHardforks.push({
          name: hf.name,
          // forkHash: hf.forkHash,
          block: null,
        })
      }
    }
    return Common.forCustomChain(
      'mainnet',
      {
        hardforks: testHardforks,
      },
      transitionForks.startFork
    )
  }
}

const expectedTestsFull: any = {
  BlockchainTests: {
    Chainstart: 4385,
    Homestead: 7001,
    Dao: 0,
    TangerineWhistle: 4255,
    SpuriousDragon: 4305,
    Byzantium: 15379,
    Constantinople: 32750,
    Petersburg: 32735,
    Istanbul: 35378,
    MuirGlacier: 35378,
    Berlin: 33,
    ByzantiumToConstantinopleFixAt5: 3,
    EIP158ToByzantiumAt5: 3,
    FrontierToHomesteadAt5: 12,
    HomesteadToDaoAt5: 18,
    HomesteadToEIP150At5: 3,
    BerlinToLondonAt5: 0,
  },
  GeneralStateTests: {
    Chainstart: 896,
    Homestead: 1847,
    Dao: 0,
    TangerineWhistle: 969,
    SpuriousDragon: 1094,
    Byzantium: 4626,
    Constantinople: 10402,
    Petersburg: 10397,
    Istanbul: 10715,
    MuirGlacier: 10715,
    Berlin: 13065,
    ByzantiumToConstantinopleFixAt5: 0,
    EIP158ToByzantiumAt5: 0,
    FrontierToHomesteadAt5: 0,
    HomesteadToDaoAt5: 0,
    HomesteadToEIP150At5: 0,
    BerlinToLondonAt5: 0,
  },
}

/**
 * Returns the amount of expected tests for a given fork, assuming all tests are ran
 */
export function getExpectedTests(fork: string, name: string) {
  if (expectedTestsFull[name] == undefined) {
    return
  }
  for (const key in expectedTestsFull[name]) {
    if (fork.toLowerCase() == key.toLowerCase()) {
      return expectedTestsFull[name][key]
    }
  }
}

/**
 * Returns an aggregated array with the tests to skip
 * @param choices comma-separated list with skip options, e.g. BROKEN,PERMANENT
 * @param defaultChoice if to use `NONE` or `ALL` as default choice
 * @returns array with test names
 */
export function getSkipTests(choices: string, defaultChoice: string): string[] {
  let skipTests: string[] = []
  if (!choices) {
    choices = defaultChoice
  }
  choices = choices.toLowerCase()
  if (choices !== 'none') {
    const choicesList = choices.split(',')
    const all = choicesList.includes('all')
    if (all || choicesList.includes('broken')) {
      skipTests = skipTests.concat(SKIP_BROKEN)
    }
    if (all || choicesList.includes('permanent')) {
      skipTests = skipTests.concat(SKIP_PERMANENT)
    }
    if (all || choicesList.includes('slow')) {
      skipTests = skipTests.concat(SKIP_SLOW)
    }
  }
  return skipTests
}
