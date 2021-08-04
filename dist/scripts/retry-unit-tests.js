#!/usr/bin/env ts-node
"use strict";
/**
 * https://github.com/Chatie/wechaty/issues/1084
 * WebDriver / Puppeteer sometimes will fail(i.e. timeout) with no reason.
 * That will cause the unit tests fail randomly.
 * So we need to retry again when unit tests fail,
 * and treat it's really fail after MAX_RETRY_NUM times.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-console
const child_process_1 = require("child_process");
const MAX_RETRY_NUM = 3;
async function main() {
    console.info('Safe Test: starting...');
    let round = 0;
    let succ = false;
    do {
        console.info(`Safe Test: running for round #${round}`);
        succ = await unitTest();
        if (succ) { // success!
            console.info(`Safe Test: successed at round #${round}!`);
            return 0;
        }
    } while (round++ < MAX_RETRY_NUM);
    return 1; // fail finally :(
}
async function unitTest() {
    const child = child_process_1.spawn('npm', [
        'run',
        'test:unit',
    ], {
        shell: true,
        stdio: 'inherit',
    });
    return new Promise((resolve, reject) => {
        child.once('exit', (code) => code === 0 ? resolve(true) : resolve(false));
        child.once('error', reject);
    });
}
main()
    .then(process.exit)
    .catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=retry-unit-tests.js.map