#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-shadowed-variable
const blue_tape_1 = __importDefault(require("blue-tape"));
const version_1 = require("./version");
blue_tape_1.default('Make sure the VERSION is fresh in source code', async (t) => {
    t.equal(version_1.VERSION, '0.0.0', 'version should be 0.0.0 in source code, only updated before publish to NPM');
});
//# sourceMappingURL=version.spec.js.map