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
// tslint:disable:arrow-parens
// tslint:disable:no-shadowed-variable
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tstest_1 = require("tstest");
// import {
//   cloneClass,
// }               from 'clone-class'
const config_1 = require("../src/config");
const puppet_wechat_1 = __importDefault(require("../src/puppet-wechat"));
tstest_1.test('Contact smoke testing', async (t) => {
    /* tslint:disable:variable-name */
    const UserName = '@0bb3e4dd746fdbd4a80546aef66f4085';
    const NickName = 'NickNameTest';
    const RemarkName = 'AliasTest';
    const sandbox = tstest_1.sinon.createSandbox();
    function mockContactPayload(id) {
        config_1.log.verbose('PuppeteerContactTest', 'mockContactPayload(%s)', id);
        return new Promise(resolve => {
            if (id !== UserName)
                return resolve({});
            setImmediate(() => resolve({
                NickName,
                RemarkName,
                UserName,
            }));
        });
    }
    const puppet = new puppet_wechat_1.default();
    sandbox.stub(puppet, 'contactRawPayload').callsFake(mockContactPayload);
    const contactPayload = await puppet.contactPayload(UserName);
    // tslint:disable-next-line:variable-name
    // const MyContact = cloneClass(Contact)
    // MyContact.puppet = puppet as any  // FIXME: any
    // const c = new MyContact(UserName)
    t.is(contactPayload.id, UserName, 'id/UserName right');
    t.is(contactPayload.name, NickName, 'NickName set');
    t.is(contactPayload.alias, RemarkName, 'should get the right alias from Contact');
    sandbox.restore();
    // const contact1 = await Contact.find({name: 'NickNameTest'})
    // t.is(contact1.id, UserName, 'should find contact by name')
    // const contact2 = await Contact.find({alias: 'AliasTest'})
    // t.is(contact2.id, UserName, 'should find contact by alias')
});
//# sourceMappingURL=puppeteer-contact.spec.js.map