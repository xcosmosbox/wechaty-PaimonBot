#!/usr/bin/env ts-node
/**
 * https://github.com/Chatie/wechaty/issues/1084
 * WebDriver / Puppeteer sometimes will fail(i.e. timeout) with no reason.
 * That will cause the unit tests fail randomly.
 * So we need to retry again when unit tests fail,
 * and treat it's really fail after MAX_RETRY_NUM times.
 */

// tslint:disable:no-console

import { spawn } from 'child_process'

const MAX_RETRY_NUM = 3

async function main (): Promise<number> {
  console.info('Safe Test: starting...')

  let round = 0
  let succ = false
  do {
    console.info(`Safe Test: running for round #${round}`)
    succ = await unitTest()
    if (succ) { // success!
      console.info(`Safe Test: successed at round #${round}!`)
      return 0
    }
  } while (round++ < MAX_RETRY_NUM)
  return 1  // fail finally :(
}

async function unitTest () {
  const child = spawn(
    'npm',
    [
      'run',
      'test:unit',
    ],
    {
      shell: true,  // https://stackoverflow.com/a/39682805/1123955
      stdio: 'inherit',
    },
  )
  return new Promise<boolean>((resolve, reject) => {
    child.once('exit', (code) =>
      code === 0 ? resolve(true) : resolve(false),
    )
    child.once('error', reject)
  })
}

main()
  .then(process.exit)
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
