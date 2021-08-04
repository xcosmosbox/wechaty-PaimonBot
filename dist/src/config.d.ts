/// <reference path="../../src/typings.d.ts" />
import { FileBox, log } from 'wechaty-puppet';
import { VERSION } from './version';
export declare function retry<T>(retryableFn: (retry: (error: Error) => never, attempt: number) => Promise<T>): Promise<T>;
export declare function envHead(): boolean;
export declare function envStealthless(): boolean;
export declare function qrCodeForChatie(): FileBox;
export declare const MEMORY_SLOT = "PUPPET_WECHAT";
export { VERSION, log, };
//# sourceMappingURL=config.d.ts.map