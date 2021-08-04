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
// tslint:disable:no-shadowed-variable
// tslint:disable:no-var-requires
// tslint:disable:only-arrow-functions
// tslint:disable:arrow-parens
Object.defineProperty(exports, "__esModule", { value: true });
const tstest_1 = require("tstest"); // const sinonTest   = require('sinon-test')(sinon, {
//   useFakeTimers: {  // https://github.com/sinonjs/lolex
//     advanceTimeDelta  : 10,
//     shouldAdvanceTime : true,
//   },
// })
// import { log }    from './config'
// log.level('silly')
const bridge_1 = require("./bridge");
const event_1 = require("./event");
const puppet_wechat_1 = require("./puppet-wechat");
class PuppetTest extends puppet_wechat_1.PuppetWeChat {
    contactRawPayload(id) {
        return super.contactRawPayload(id);
    }
    roomRawPayload(id) {
        return super.roomRawPayload(id);
    }
    messageRawPayload(id) {
        return super.messageRawPayload(id);
    }
}
// test('Puppet smoke testing', async t => {
//   const puppet  = new PuppetTest()
//   const wechaty = new WechatyTest({ puppet })
//   wechaty.initPuppetAccessory(puppet)
//   t.ok(puppet.state.off(), 'should be OFF state after instanciate')
//   puppet.state.on('pending')
//   t.ok(puppet.state.on(), 'should be ON state after set')
//   t.ok(puppet.state.pending(), 'should be pending state after set')
// })
tstest_1.test('login/logout events', async (t) => {
    const sandbox = tstest_1.sinon.createSandbox();
    try {
        const puppet = new PuppetTest();
        sandbox.stub(event_1.Event, 'onScan'); // block the scan event to prevent reset logined user
        sandbox.stub(bridge_1.Bridge.prototype, 'getUserName').resolves('mockedUserName');
        sandbox.stub(bridge_1.Bridge.prototype, 'contactList')
            .onFirstCall().resolves([])
            .onSecondCall().resolves(['1'])
            .resolves(['1', '2']);
        sandbox.stub(puppet, 'contactRawPayload').resolves({
            NickName: 'mockedNickName',
            UserName: 'mockedUserName',
        });
        // sandbox.stub(puppet, 'waitStable').resolves()
        const readySpy = sandbox.spy();
        puppet.on('ready', readySpy);
        await puppet.start();
        t.pass('should be inited');
        t.is(puppet.logonoff(), false, 'should be not logined');
        const future = new Promise(resolve => puppet.once('login', resolve))
            .catch(e => t.fail(e));
        puppet.bridge.emit('login', 'TestPuppetWeChat');
        await future;
        t.is(puppet.logonoff(), true, 'should be logined');
        t.ok(puppet.bridge.getUserName.called, 'bridge.getUserName should be called');
        // FIXME: improve the performance of the test by mocking the time
        // TODO(huan) July 2018: use sinon.clock / sinon.useFakeTimers() at here
        await new Promise(resolve => setTimeout(resolve, 7000));
        // Puppet will not ready the contact, so the contactRawPayload might not be called at here. Huan, 2018.6
        // t.ok((puppet.contactRawPayload as any).called,  'puppet.contactRawPayload should be called')
        t.ok(bridge_1.Bridge.prototype.contactList.called, 'contactList stub should be called');
        /**
         * 6 times is:
         *
         * 0, 1, 2 is for first 3 calls for contactList()
         *
         * 3, 4, 5 is PuppetWeChat.waitStable() for `unchangedNum` to reach 3 times.
         */
        t.is(bridge_1.Bridge.prototype.contactList.callCount, 6, 'should call stubContacList 6 times');
        t.ok(readySpy.called, 'should emit ready event, after login');
        const logoutPromise = new Promise((resolve) => puppet.once('logout', () => resolve('logoutFired')));
        puppet.bridge.emit('logout');
        t.is(await logoutPromise, 'logoutFired', 'should fire logout event');
        t.is(puppet.logonoff(), false, 'should be logouted');
        await puppet.stop();
    }
    catch (e) {
        t.fail(e);
    }
    finally {
        sandbox.restore();
    }
});
/**
 * FIXME: increase test times from 1 to 3 Huan(202006)
 */
tstest_1.test('restart() 1 times', async (t) => {
    const puppet = new puppet_wechat_1.PuppetWeChat();
    let n = 1;
    while (n--) {
        await puppet.start();
        await puppet.stop();
    }
    t.pass('restarted many times');
});
//# sourceMappingURL=puppet-wechat.spec.js.map