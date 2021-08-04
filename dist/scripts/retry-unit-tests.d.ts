#!/usr/bin/env ts-node
/**
 * https://github.com/Chatie/wechaty/issues/1084
 * WebDriver / Puppeteer sometimes will fail(i.e. timeout) with no reason.
 * That will cause the unit tests fail randomly.
 * So we need to retry again when unit tests fail,
 * and treat it's really fail after MAX_RETRY_NUM times.
 */
export {};
//# sourceMappingURL=retry-unit-tests.d.ts.map