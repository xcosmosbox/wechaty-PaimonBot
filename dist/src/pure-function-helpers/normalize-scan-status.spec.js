#!/usr/bin/env ts-node
"use strict";
/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tstest_1 = require("tstest");
const wechaty_puppet_1 = require("wechaty-puppet");
const normalize_scan_status_1 = require("./normalize-scan-status");
tstest_1.test('normalizeScanStatus()', async (t) => {
    const SCAN_STATUS_LIST = [
        [0, wechaty_puppet_1.ScanStatus.Waiting],
        [200, wechaty_puppet_1.ScanStatus.Confirmed],
        [201, wechaty_puppet_1.ScanStatus.Scanned],
        [408, wechaty_puppet_1.ScanStatus.Timeout],
    ];
    for (const [puppeteerStatus, EXPECT_PUPPET_STATUS] of SCAN_STATUS_LIST) {
        const puppetStatus = normalize_scan_status_1.normalizeScanStatus(puppeteerStatus);
        t.is(puppetStatus, EXPECT_PUPPET_STATUS, `should convert status code from puppeer(${puppeteerStatus}) to puppet(${EXPECT_PUPPET_STATUS})`);
    }
});
//# sourceMappingURL=normalize-scan-status.spec.js.map