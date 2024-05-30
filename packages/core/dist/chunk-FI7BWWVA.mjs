import { __commonJS, __name, __toESM } from './chunk-TXZD2JN3.mjs';
import _5, { toPairs, fromPairs } from 'lodash-es';
import fs2 from 'fs';
import { exec, execSync } from 'child_process';
import Debug from 'debug';
import validatePackageName from 'validate-npm-package-name';
import graphlib from '@dagrejs/graphlib';
import crypto from 'crypto';
import * as b64ab from 'base64-arraybuffer';
import { parse } from 'jsonc-parser';
import path2 from 'path';
import { fdir } from 'fdir';
import { asyncMap, asyncForEach } from 'modern-async';
import util, { promisify } from 'util';
import os from 'os';
import net from 'net';
import tls from 'tls';
import dgram from 'dgram';
import kleur from 'kleur';

// ../../node_modules/.pnpm/js-message@1.0.7/node_modules/js-message/Message.js
var require_Message = __commonJS({
  "../../node_modules/.pnpm/js-message@1.0.7/node_modules/js-message/Message.js"(exports, module) {
    function Message3() {
      Object.defineProperties(
        this,
        {
          data: {
            enumerable: true,
            get: getData,
            set: setData
          },
          type: {
            enumerable: true,
            get: getType,
            set: setType
          },
          load: {
            enumerable: true,
            writable: false,
            value: parse
          },
          JSON: {
            enumerable: true,
            get: getJSON
          }
        }
      );
      var type = "";
      var data = {};
      function getType() {
        return type;
      }
      __name(getType, "getType");
      function getData() {
        return data;
      }
      __name(getData, "getData");
      function getJSON() {
        return JSON.stringify(
          {
            type,
            data
          }
        );
      }
      __name(getJSON, "getJSON");
      function setType(value) {
        type = value;
      }
      __name(setType, "setType");
      function setData(value) {
        data = value;
      }
      __name(setData, "setData");
      function parse(message) {
        try {
          var message = JSON.parse(message);
          type = message.type;
          data = message.data;
        } catch (err) {
          var badMessage = message;
          type = "error", data = {
            message: "Invalid JSON response format",
            err,
            response: badMessage
          };
        }
      }
      __name(parse, "parse");
    }
    __name(Message3, "Message");
    module.exports = Message3;
  }
});

// ../../node_modules/.pnpm/@node-ipc+js-queue@2.0.3/node_modules/@node-ipc/js-queue/queue.js
var require_queue = __commonJS({
  "../../node_modules/.pnpm/@node-ipc+js-queue@2.0.3/node_modules/@node-ipc/js-queue/queue.js"(exports, module) {
    function Queue3(asStack) {
      Object.defineProperties(
        this,
        {
          add: {
            enumerable: true,
            writable: false,
            value: addToQueue
          },
          next: {
            enumerable: true,
            writable: false,
            value: run
          },
          clear: {
            enumerable: true,
            writable: false,
            value: clearQueue
          },
          contents: {
            enumerable: false,
            get: getQueue,
            set: setQueue
          },
          autoRun: {
            enumerable: true,
            writable: true,
            value: true
          },
          stop: {
            enumerable: true,
            writable: true,
            value: false
          }
        }
      );
      var queue = [];
      var running = false;
      function clearQueue() {
        queue = [];
        return queue;
      }
      __name(clearQueue, "clearQueue");
      function getQueue() {
        return queue;
      }
      __name(getQueue, "getQueue");
      function setQueue(val) {
        queue = val;
        return queue;
      }
      __name(setQueue, "setQueue");
      function addToQueue() {
        for (var i in arguments) {
          queue.push(arguments[i]);
        }
        if (!running && !this.stop && this.autoRun) {
          this.next();
        }
      }
      __name(addToQueue, "addToQueue");
      function run() {
        running = true;
        if (queue.length < 1 || this.stop) {
          running = false;
          return;
        }
        queue.shift().bind(this)();
      }
      __name(run, "run");
    }
    __name(Queue3, "Queue");
    module.exports = Queue3;
  }
});
var DmnoError = class extends Error {
  static {
    __name(this, "DmnoError");
  }
  originalError;
  get isUnexpected() {
    return !!this.originalError;
  }
  icon = "\u274C";
  constructor(err) {
    if (_5.isError(err)) {
      super(err.message);
      this.originalError = err;
      this.icon = "\u{1F4A5}";
    } else {
      super(err);
    }
    this.name = this.constructor.name;
  }
  toJSON() {
    return {
      icon: this.icon,
      type: this.name,
      name: this.name,
      message: this.message,
      isUnexpected: this.isUnexpected
    };
  }
};
var ConfigLoadError = class extends DmnoError {
  static {
    __name(this, "ConfigLoadError");
  }
  cleanedStack;
  constructor(err) {
    super(err);
    let stackLines = (err.stack?.split("\n") || []).slice(1);
    stackLines = stackLines.filter((l) => {
      if (l.includes(" at ViteNodeRunner."))
        return false;
      if (l.includes("core/src/config-loader/config-loader.ts"))
        return false;
      return true;
    });
    this.message = `${err.name}: ${err.message}`;
    this.cleanedStack = stackLines || [];
  }
  toJSON() {
    return {
      ...super.toJSON(),
      cleanedStack: this.cleanedStack
    };
  }
};
var SchemaError = class extends DmnoError {
  static {
    __name(this, "SchemaError");
  }
  icon = "\u{1F9F0}";
};
var ValidationError = class extends DmnoError {
  static {
    __name(this, "ValidationError");
  }
  icon = "\u274C";
};
var CoercionError = class extends DmnoError {
  static {
    __name(this, "CoercionError");
  }
  icon = "\u{1F6D1}";
};
var ResolutionError = class extends DmnoError {
  static {
    __name(this, "ResolutionError");
  }
  icon = "\u26D4";
};
var EmptyRequiredValueError = class extends ValidationError {
  static {
    __name(this, "EmptyRequiredValueError");
  }
  icon = "\u2753";
  constructor(_val) {
    super("Value is required but is currently empty");
  }
};
var KEY_EXPORT_FORMAT = "jwk";
var ENCRYPTION_ALGO = "AES-GCM";
var IV_LENGTH = 12;
var KEY_USAGES = ["encrypt", "decrypt"];
var KEY_SPLIT_SEP = "//";
async function generateEncryptionKeyString() {
  const key = await crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGO, length: 256 },
    true,
    KEY_USAGES
  );
  const exportableKey = await crypto.subtle.exportKey(KEY_EXPORT_FORMAT, key);
  return exportableKey.k;
}
__name(generateEncryptionKeyString, "generateEncryptionKeyString");
async function importEncryptionKey(keyData) {
  return crypto.subtle.importKey(
    KEY_EXPORT_FORMAT,
    keyData,
    ENCRYPTION_ALGO,
    true,
    KEY_USAGES
  );
}
__name(importEncryptionKey, "importEncryptionKey");
async function importEncryptionKeyString(keyStr) {
  return importEncryptionKey({
    key_ops: KEY_USAGES,
    ext: true,
    kty: "oct",
    k: keyStr,
    alg: "A256GCM"
  });
}
__name(importEncryptionKeyString, "importEncryptionKeyString");
async function generateDmnoEncryptionKeyString(keyName) {
  if (keyName.includes(KEY_SPLIT_SEP)) {
    throw new Error(`dmno encryption key name must not include separator "${KEY_SPLIT_SEP}"`);
  }
  const key = await generateEncryptionKeyString();
  return `dmno${KEY_SPLIT_SEP}${keyName}${KEY_SPLIT_SEP}${key}`;
}
__name(generateDmnoEncryptionKeyString, "generateDmnoEncryptionKeyString");
async function importDmnoEncryptionKeyString(dmnoKeyStr) {
  if (!dmnoKeyStr.startsWith(`dmno${KEY_SPLIT_SEP}`)) {
    throw new Error(`dmno keys must start with dmno${KEY_SPLIT_SEP}`);
  }
  const [, keyName, keyStr] = dmnoKeyStr.split(KEY_SPLIT_SEP);
  if (!keyStr)
    throw new Error("dmno keys must have a key name");
  const cryptoKey = await importEncryptionKeyString(keyStr);
  return { key: cryptoKey, keyName };
}
__name(importDmnoEncryptionKeyString, "importDmnoEncryptionKeyString");
async function encrypt(key, rawValue, additionalData) {
  const nonce = crypto.randomBytes(IV_LENGTH);
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGO,
      iv: nonce,
      tagLength: 128,
      // ?
      ...additionalData && { additionalData: Buffer.from(additionalData, "base64") }
    },
    key,
    new TextEncoder().encode(JSON.stringify(rawValue))
  );
  const ivWithData = new Uint8Array(
    Array.from(nonce).concat(Array.from(new Uint8Array(encryptedData)))
  );
  const encryptedStr = b64ab.encode(ivWithData);
  return encryptedStr;
}
__name(encrypt, "encrypt");
async function decrypt(key, base64EncryptedVal, additionalData) {
  const nonceCiphertextTag = new Uint8Array(b64ab.decode(base64EncryptedVal));
  const decryptionNonce = nonceCiphertextTag.subarray(0, IV_LENGTH);
  const ciphertextTag = nonceCiphertextTag.subarray(IV_LENGTH);
  const decrypted = await crypto.subtle.decrypt({
    name: ENCRYPTION_ALGO,
    iv: decryptionNonce,
    ...additionalData && { additionalData: Buffer.from(additionalData, "base64") }
  }, key, ciphertextTag);
  const decryptedStr = new TextDecoder().decode(decrypted);
  const decryptedValue = JSON.parse(decryptedStr);
  return decryptedValue;
}
__name(decrypt, "decrypt");
var DmnoDataType = class _DmnoDataType {
  constructor(typeDef, typeInstanceOptions, _typeFactoryFn) {
    this.typeDef = typeDef;
    this.typeInstanceOptions = typeInstanceOptions;
    this._typeFactoryFn = _typeFactoryFn;
    if (this.typeDef.extends === PrimitiveBaseType) ; else if (this.typeDef.extends) {
      if (_5.isString(this.typeDef.extends)) {
        if (!DmnoBaseTypes[this.typeDef.extends]) {
          throw new Error(`found invalid parent (string) in extends chain - "${this.typeDef.extends}"`);
        } else {
          this.parentType = DmnoBaseTypes[this.typeDef.extends](typeInstanceOptions);
        }
      } else if (_5.isFunction(this.typeDef.extends)) {
        const initializedDataType = this.typeDef.extends(typeInstanceOptions);
        if (initializedDataType instanceof _DmnoDataType) {
          this.parentType = initializedDataType;
        } else {
          console.log(initializedDataType);
          throw new Error("found invalid parent (as result of fn) in extends chain");
        }
      } else if (this.typeDef.extends instanceof _DmnoDataType) {
        this.parentType = this.typeDef.extends;
      } else if (this.typeDef.extends) {
        throw new Error(`found invalid parent in extends chain: ${this.typeDef.extends}`);
      }
    } else {
      let inferredType;
      if (this.typeDef.value !== void 0) {
        if (_5.isBoolean(this.typeDef.value))
          inferredType = BooleanDataType();
        else if (_5.isNumber(this.typeDef.value))
          inferredType = NumberDataType();
      }
      this.parentType = inferredType || StringDataType({});
    }
    if (this.typeDef.value !== void 0) {
      this._valueResolver = processInlineResolverDef(this.typeDef.value);
    }
    if (this.isInlineDefinedType) {
      if (this.typeDef.validate) {
        const originalValidate = this.typeDef.validate;
        this.typeDef.validate = (val, _settings, ctx) => originalValidate(val, ctx);
      }
      if (this.typeDef.asyncValidate) {
        const originalAsyncValidate = this.typeDef.asyncValidate;
        this.typeDef.asyncValidate = (val, _settings, ctx) => originalAsyncValidate(val, ctx);
      }
      if (this.typeDef.coerce) {
        const originalCoerce = this.typeDef.coerce;
        this.typeDef.coerce = (val, _settings, ctx) => originalCoerce(val, ctx);
      }
    }
  }
  static {
    __name(this, "DmnoDataType");
  }
  // NOTE - note quite sure about this setup yet...
  // but the idea is to provide a wrapped version of the validate/coerce (the fns that need the type instance options)
  // while providing transparent access to the rest. This is so the ConfigItem can just walk up the chain of types
  // without having to understand the details... The other option is to revert that change and
  parentType;
  _valueResolver;
  get valueResolver() {
    return this._valueResolver ?? this.parentType?.valueResolver;
  }
  validate(val, ctx) {
    if (val === void 0 || val === null) {
      if (this.getDefItem("required")) {
        return [new EmptyRequiredValueError(val)];
      } else {
        return true;
      }
    }
    if (this.parentType && (this.typeDef.runParentValidate === "before" || this.typeDef.runParentValidate === void 0)) {
      const parentValidationResult = this.parentType?.validate(val);
      if (_5.isArray(parentValidationResult) && parentValidationResult.length > 0) {
        return parentValidationResult;
      }
    }
    if (this.typeDef.validate !== void 0) {
      try {
        const validationResult = this.typeDef.validate(val, this.typeInstanceOptions, ctx);
        if (validationResult === void 0 || validationResult === true || _5.isArray(validationResult) && validationResult.length === 0) {
        } else if (validationResult instanceof ValidationError) {
          return [validationResult];
        } else if (validationResult instanceof Error) {
          return [new ValidationError(validationResult)];
        } else if (_5.isArray(validationResult) && validationResult[0] instanceof Error) {
          return _5.map(validationResult, (e) => {
            if (e instanceof ValidationError)
              return e;
            if (e instanceof Error)
              return new ValidationError(e);
            return new ValidationError(new Error(`Threw invalid error: ${e}`));
          });
        } else {
          return [new ValidationError(new Error(`Validation returned invalid result: ${validationResult}`))];
        }
      } catch (err) {
        if (err instanceof ValidationError) {
          return [err];
        } else if (err instanceof Error) {
          return [new ValidationError(err)];
        } else if (_5.isArray(err) && err[0] instanceof Error) {
          return _5.map(err, (e) => {
            if (e instanceof ValidationError)
              return e;
            if (e instanceof Error)
              return new ValidationError(e);
            return new ValidationError(new Error(`Threw invalid error: ${e}`));
          });
        } else {
          return [new ValidationError(new Error(`Validation threw a non-error: ${err}`))];
        }
      }
    }
    if (this.parentType && this.typeDef.runParentValidate === "after") {
      const parentValidationResult = this.parentType?.validate(val);
      if (_5.isArray(parentValidationResult) && parentValidationResult.length > 0) {
        return parentValidationResult;
      }
    }
    return true;
  }
  // TODO: DRY this up - its (almost) exactly the same as the validate method but calling asyncValidate instead
  async asyncValidate(val, ctx) {
    const isValid = this.validate(val, ctx);
    if (!isValid)
      return [new Error("Cannot run async validation check on an invalid value")];
    if (val === void 0 || val === null) {
      return true;
    }
    if (this.parentType && (this.typeDef.runParentAsyncValidate === "before" || this.typeDef.runParentAsyncValidate === void 0)) {
      const parentValidationResult = await this.parentType?.asyncValidate(val);
      if (_5.isArray(parentValidationResult) && parentValidationResult.length > 0) {
        return parentValidationResult;
      }
    }
    if (this.typeDef.asyncValidate !== void 0) {
      try {
        const validationResult = await this.typeDef.asyncValidate(val, this.typeInstanceOptions, ctx);
        if (validationResult === void 0 || validationResult === true || _5.isArray(validationResult) && validationResult.length === 0) {
        } else if (validationResult instanceof Error) {
          return [validationResult];
        } else if (_5.isArray(validationResult) && validationResult[0] instanceof Error) {
          return validationResult;
        } else {
          return [new Error(`Validation returned invalid result: ${validationResult}`)];
        }
      } catch (err) {
        if (err instanceof Error) {
          return [err];
        } else if (_5.isArray(err)) {
          return err;
        } else {
          return [new Error(`Validation threw a non-error: ${err}`)];
        }
      }
    }
    if (this.parentType && this.typeDef.runParentAsyncValidate === "after") {
      const parentValidationResult = await this.parentType?.asyncValidate(val);
      if (_5.isArray(parentValidationResult) && parentValidationResult.length > 0) {
        return parentValidationResult;
      }
    }
    return true;
  }
  coerce(val, ctx) {
    let coercedVal = val;
    if (this.parentType && (this.typeDef.runParentCoerce === "before" || this.typeDef.runParentCoerce === void 0)) {
      coercedVal = this.parentType.coerce(coercedVal, ctx);
    }
    if (this.typeDef.coerce !== void 0) {
      try {
        coercedVal = this.typeDef.coerce(coercedVal, this.typeInstanceOptions, ctx);
      } catch (err) {
        if (err instanceof CoercionError) {
          return err;
        } else if (err instanceof Error) {
          return new CoercionError(err);
        } else {
          return new CoercionError(new Error(`Coerce threw a non-error: ${err}`));
        }
      }
    }
    if (this.parentType && this.typeDef.runParentCoerce === "after") {
      coercedVal = this.parentType.coerce(coercedVal, ctx);
    }
    return coercedVal;
  }
  /** helper to unroll config schema using the type chain of parent "extends"  */
  getDefItem(key) {
    if (this.typeDef[key] !== void 0) {
      return this.typeDef[key];
    } else {
      return this.parentType?.getDefItem(key);
    }
  }
  /** checks if this data type is directly an instance of the data type (not via inheritance) */
  isType(factoryFn) {
    return this.typeFactoryFn === factoryFn;
  }
  /** getter to retrieve the last type in the chain */
  get typeFactoryFn() {
    if (this._typeFactoryFn)
      return this._typeFactoryFn;
    if (!this.parentType)
      throw new Error("inline defined types must have a parent");
    return this.parentType.typeFactoryFn;
  }
  /** checks if this data type is an instance of the data type, whether directly or via inheritance */
  extendsType(factoryFn) {
    return this.isType(factoryFn) || this.parentType?.extendsType(factoryFn) || false;
  }
  /** helper to determine if the type was defined inline in a schema */
  get isInlineDefinedType() {
    return !this._typeFactoryFn;
  }
  // TODO: these names need to be thought through...
  get primitiveType() {
    if (!this.parentType) {
      if (this.typeDef.extends === PrimitiveBaseType)
        return this;
      throw new Error("Only primitive types should have no parent type");
    }
    return this.parentType?.primitiveType;
  }
  get primitiveTypeFactory() {
    return this.primitiveType.typeFactoryFn;
  }
  toJSON() {
    return {
      summary: this.getDefItem("summary"),
      description: this.getDefItem("description"),
      typeDescription: this.getDefItem("typeDescription"),
      expose: this.getDefItem("expose"),
      sensitive: this.getDefItem("sensitive"),
      externalDocs: this.getDefItem("externalDocs"),
      ui: this.getDefItem("ui"),
      required: this.getDefItem("required"),
      useAt: this.getDefItem("useAt"),
      dynamic: this.getDefItem("dynamic")
    };
  }
};
function createDmnoDataType(opts) {
  const typeFactoryFn = /* @__PURE__ */ __name((usageOpts) => new DmnoDataType(opts, usageOpts ?? {}, typeFactoryFn), "typeFactoryFn");
  return typeFactoryFn;
}
__name(createDmnoDataType, "createDmnoDataType");
var PrimitiveBaseType = createDmnoDataType({});
var StringDataType = createDmnoDataType({
  typeLabel: "dmno/string",
  extends: PrimitiveBaseType,
  // summary: 'generic string data type',
  settingsSchema: Object,
  coerce(rawVal, settings) {
    if (_5.isNil(rawVal))
      return void 0;
    let val = _5.isString(rawVal) ? rawVal : rawVal.toString();
    if (settings?.toUpperCase)
      val = val.toUpperCase();
    if (settings?.toLowerCase)
      val = val.toLowerCase();
    return val;
  },
  validate(val, settings) {
    const errors = [];
    if (val === "" && !settings.allowEmpty) {
      return [new ValidationError("If set, string must not be empty")];
    }
    if (settings.minLength !== void 0 && val.length < settings.minLength) {
      errors.push(new ValidationError(`Length must be more than ${settings.minLength}`));
    }
    if (settings.maxLength !== void 0 && val.length > settings.maxLength) {
      errors.push(new ValidationError(`Length must be less than ${settings.maxLength}`));
    }
    if (settings.isLength !== void 0 && val.length !== settings.isLength) {
      errors.push(new ValidationError(`Length must be exactly ${settings.isLength}`));
    }
    if (settings.startsWith && !val.startsWith(settings.startsWith)) {
      errors.push(new ValidationError(`Value must start with "${settings.startsWith}"`));
    }
    if (settings.endsWith && !val.endsWith(settings.endsWith)) {
      errors.push(new ValidationError(`Value must start with "${settings.endsWith}"`));
    }
    if (settings.matches) {
      const regex = _5.isString(settings.matches) ? new RegExp(settings.matches) : settings.matches;
      const matches = val.match(regex);
      if (!matches) {
        errors.push(new ValidationError(`Value must match regex "${settings.matches}"`));
      }
    }
    return errors.length ? errors : true;
  }
});
var NumberDataType = createDmnoDataType({
  typeLabel: "dmno/number",
  extends: PrimitiveBaseType,
  settingsSchema: Object,
  validate(val, settings = {}) {
    const errors = [];
    if (settings.min !== void 0 && val < settings.min) {
      errors.push(new ValidationError(`Min value is ${settings.min}`));
    }
    if (settings.max !== void 0 && val > settings.max) {
      errors.push(new ValidationError(`Max value is ${settings.max}`));
    }
    if (settings.isDivisibleBy !== void 0 && val % settings.isDivisibleBy !== 0) {
      errors.push(new ValidationError(`Value must be divisible by ${settings.isDivisibleBy}`));
    }
    return errors.length ? errors : true;
  },
  coerce(val, settings = {}) {
    let numVal;
    if (_5.isString(val)) {
      const parsed = parseFloat(val);
      if (_5.isNaN(parsed))
        throw new CoercionError("Unable to coerce string to number");
      numVal = parsed;
    } else if (_5.isFinite(val)) {
      numVal = val;
    } else {
      throw new CoercionError(`Cannot convert ${val} to number`);
    }
    if (settings.coerceToMinMaxRange) {
      if (settings.min !== void 0)
        numVal = Math.max(settings.min, numVal);
      if (settings.max !== void 0)
        numVal = Math.min(settings.max, numVal);
    }
    if (settings.isInt === true || settings.precision === 0) {
      numVal = Math.round(numVal);
    } else if (settings.precision) {
      const p = 10 ** settings.precision;
      numVal = Math.round(numVal * p) / p;
    }
    return numVal;
  }
});
var BooleanDataType = createDmnoDataType({
  typeLabel: "dmno/boolean",
  extends: PrimitiveBaseType,
  // TODO: add settings to be more strict, or to allow other values to coerce to true/false
  validate(val) {
    if (_5.isBoolean(val))
      return true;
    return new ValidationError("Value must be `true` or `false`");
  },
  coerce(val) {
    if (_5.isBoolean(val)) {
      return val;
    } else if (_5.isString(val)) {
      const cleanVal = val.toLowerCase().trim();
      if (["t", "true", "yes", "on", "1"].includes(cleanVal))
        return true;
      if (["f", "false", "no", "off", "0"].includes(cleanVal))
        return false;
      throw new CoercionError("Unable to coerce string value to boolean");
    } else if (_5.isFinite(val)) {
      if (val === 0)
        return false;
      if (val === 1)
        return true;
      throw new CoercionError("Unable to coerce number value to boolean (only 0 or 1 is valid)");
    } else {
      throw new CoercionError("Unable to coerce value to boolean");
    }
  }
});
var URL_REGEX = /(?:^|\s)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/;
var UrlDataType = createDmnoDataType({
  typeLabel: "dmno/url",
  extends: (settings) => StringDataType({
    ...settings.normalize && { toLowerCase: true }
  }),
  typeDescription: "standard URL",
  settingsSchema: Object,
  coerce(rawVal, settings) {
    if (settings?.prependProtocol && !rawVal.startsWith("https://")) {
      return `https://${rawVal}`;
    }
    return rawVal;
  },
  validate(val, settings) {
    const result = URL_REGEX.test(val);
    if (!result)
      return new ValidationError("URL doesnt match url regex check");
    if (settings?.allowedDomains) {
      const [protocol, , domain] = val.split("/");
      if (!settings.allowedDomains.includes(domain.toLowerCase())) {
        return new ValidationError(`Domain (${domain}) is not in allowed list: ${settings.allowedDomains.join(",")}`);
      }
    }
    return true;
  }
});
var SimpleObjectDataType = createDmnoDataType({
  typeLabel: "dmno/simple-object",
  extends: PrimitiveBaseType,
  validate(val) {
    if (_5.isPlainObject(val))
      return true;
    return new ValidationError("Value must be an object");
  },
  coerce(val) {
    if (_5.isPlainObject(val))
      return val;
    if (_5.isString(val)) {
      try {
        const parsedObj = JSON.parse(val);
        if (_5.isPlainObject(parsedObj))
          return parsedObj;
        return new CoercionError("Unable to coerce JSON parsed string to object");
      } catch (err) {
        return new CoercionError("Error parsing JSON string while coercing string to object");
      }
    }
    return new CoercionError("Cannot coerce value to object");
  }
});
var ObjectDataType = createDmnoDataType({
  typeLabel: "dmno/object",
  extends: PrimitiveBaseType,
  settingsSchema: Object
});
var ArrayDataType = createDmnoDataType({
  typeLabel: "dmno/array",
  extends: PrimitiveBaseType,
  settingsSchema: Array
  // TODO: validate checks if it's an array
  // helper to coerce csv string into array of strings
});
var DictionaryDataType = createDmnoDataType({
  typeLabel: "dmno/dictionary",
  extends: PrimitiveBaseType,
  settingsSchema: Object
  // TODO: validate checks if it's an object
});
var EnumDataType = createDmnoDataType({
  typeLabel: "dmno/enum",
  extends: PrimitiveBaseType,
  settingsSchema: Object
});
var EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var emailDataType = createDmnoDataType({
  typeLabel: "dmno/email",
  extends: (settings) => StringDataType({
    ...settings.normalize && { toLowerCase: true }
  }),
  typeDescription: "standard email address",
  settingsSchema: Object,
  validate(val) {
    const result = EMAIL_REGEX.test(val);
    if (result)
      return true;
    return new ValidationError("Value must be a valid email address");
  }
});
var IP_V4_ADDRESS_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/;
var IP_V6_ADDRESS_REGEX = /^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/;
var ipAddressDataType = createDmnoDataType({
  typeLabel: "dmno/ipAddress",
  extends: (settings) => StringDataType({
    ...settings.normalize && { toLowerCase: true }
  }),
  typeDescription: "ip v4 or v6 address",
  settingsSchema: Object,
  validate(val, settings) {
    const regex = settings.version === 6 ? IP_V6_ADDRESS_REGEX : IP_V4_ADDRESS_REGEX;
    const result = regex.test(val);
    if (result)
      return true;
    return new ValidationError("Value must be a valid IP address");
  }
});
var PortDataType = createDmnoDataType({
  typeLabel: "dmno/port",
  extends: NumberDataType({
    min: 0,
    max: 65535
  }),
  typeDescription: "valid port number between 0 and 65535",
  validate(val) {
    if (val >= 0 && val <= 65535)
      return true;
    return new ValidationError("Value must be a valid port number (0-65535)");
  }
});
var SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
var SemverDataType = createDmnoDataType({
  typeLabel: "dmno/semver",
  extends: (settings) => StringDataType({
    ...settings.normalize && { toLowerCase: true }
  }),
  typeDescription: "semantic version string",
  settingsSchema: Object,
  validate(val) {
    const result = SEMVER_REGEX.test(val);
    if (result)
      return true;
    return new ValidationError("Value must be a valid semantic version string");
  }
});
var ISO_DATE_REGEX = /^(?:[+-]?\d{4}(?!\d{2}\b))(?:(-?)(?:(?:0[1-9]|1[0-2])(?:\1(?:[12]\d|0[1-9]|3[01]))?|W(?:[0-4]\d|5[0-2])(?:-?[1-7])?|(?:00[1-9]|0[1-9]\d|[12]\d{2}|3(?:[0-5]\d|6[1-6])))(?:[T\s](?:(?:(?:[01]\d|2[0-3])(?:(:?)[0-5]\d)?|24:?00)(?:[.,]\d+(?!:))?)?(?:\2[0-5]\d(?:[.,]\d+)?)?(?:[zZ]|(?:[+-])(?:[01]\d|2[0-3]):?(?:[0-5]\d)?)?)?)?$/;
var IsoDateDataType = createDmnoDataType({
  typeLabel: "dmno/isoDate",
  extends: StringDataType,
  typeDescription: "ISO 8601 date string with optional time and milliseconds",
  validate(val) {
    const result = ISO_DATE_REGEX.test(val);
    if (result)
      return true;
    return new ValidationError("Value must be a valid ISO 8601 date string");
  }
});
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var UuidDataType = createDmnoDataType({
  typeLabel: "dmno/uuid",
  extends: StringDataType,
  typeDescription: "UUID string V1-V5 per RFC4122, including NIL",
  validate(val) {
    const result = UUID_REGEX.test(val);
    if (result)
      return true;
    return new ValidationError("Value must be a valid UUID string");
  }
});
var MD5_REGEX = /^[a-f0-9]{32}$/;
var Md5DataType = createDmnoDataType({
  typeLabel: "dmno/md5",
  extends: StringDataType,
  typeDescription: "MD5 hash string",
  validate(val) {
    const result = MD5_REGEX.test(val);
    if (result)
      return true;
    return new ValidationError("Value must be a valid MD5 hash string");
  }
});
var DmnoBaseTypes = {
  string: StringDataType,
  number: NumberDataType,
  boolean: BooleanDataType,
  simpleObject: SimpleObjectDataType,
  enum: EnumDataType,
  email: emailDataType,
  url: UrlDataType,
  ipAddress: ipAddressDataType,
  port: PortDataType,
  semver: SemverDataType,
  isoDate: IsoDateDataType,
  uuid: UuidDataType,
  md5: Md5DataType,
  // TODO
  // locale
  // iso 3166
  // "compound" types /////////////////
  object: ObjectDataType,
  array: ArrayDataType,
  dictionary: DictionaryDataType
  // TODO: could be called record? something else?
};
var NodeEnvType = createDmnoDataType({
  // TODO: might want to split the base types from these? (both in "dmno/" for now)
  typeLabel: "dmno/nodeEnv",
  typeDescription: "standard environment flag for Node.js",
  extends: DmnoBaseTypes.enum({
    development: { description: "true during local development" },
    test: { description: "true while running tests" },
    production: { description: "true for production" }
  }),
  // we'll set the default value, and assume it will be passed in via the environment to override
  value: "development"
});
function getConfigFromEnvVars(separator = "__") {
  const config = {};
  _5.each(process.env, (val, key) => {
    const path3 = key.replaceAll(separator, ".");
    _5.set(config, path3, val);
  });
  return config;
}
__name(getConfigFromEnvVars, "getConfigFromEnvVars");

// src/lib/json-utils.ts
function stringifyJsonWithCommentBanner(obj, banner) {
  const jsonStringWithoutBanner = JSON.stringify(obj, null, 2);
  const jsonStringWithBanner = [
    "// \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1}",
    "// \u{1F6D1} DO NOT COMMIT THIS FILE TO SOURCE CONTROL",
    "// \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1} \u{1F6D1}",
    "",
    jsonStringWithoutBanner
  ].join("\n");
  return jsonStringWithBanner;
}
__name(stringifyJsonWithCommentBanner, "stringifyJsonWithCommentBanner");
var asyncExec = promisify(exec);

// src/lib/git-utils.ts
async function checkIsFileGitIgnored(path3, warnIfNotGitRepo = false) {
  try {
    await asyncExec(`git check-ignore ${path3} -q`);
    return true;
  } catch (err) {
    if (err.stderr === "")
      return false;
    if (err.stderr.includes("not a git repository")) {
      if (warnIfNotGitRepo) {
        console.log("\u{1F536} Your code is not currently in a git repository - run `git init` to initialize a new repo.");
      }
      return false;
    }
    throw err;
  }
}
__name(checkIsFileGitIgnored, "checkIsFileGitIgnored");

// src/lib/dotenv-utils.ts
var DOTENV_LINE = /(?:^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?[^\S\r\n]*(#.*)?(?:$)/mg;
function parseDotEnvContents(dotEnvStr) {
  dotEnvStr = dotEnvStr.replace(/\r\n?/mg, "\n");
  let preComments = [];
  const dotenvItems = [];
  while (dotEnvStr) {
    let nextEndLineLoc = dotEnvStr.indexOf("\n");
    if (nextEndLineLoc === -1)
      nextEndLineLoc = dotEnvStr.length;
    if (!dotEnvStr.substring(0, nextEndLineLoc).trim()) {
      preComments = [];
      dotEnvStr = dotEnvStr.substring(nextEndLineLoc + 1);
      continue;
    }
    if (dotEnvStr.startsWith("#")) {
      const commentLineContent = dotEnvStr.substring(1, nextEndLineLoc);
      if (commentLineContent.match(DOTENV_LINE)) {
        preComments = [];
      } else {
        preComments.push(commentLineContent);
      }
      dotEnvStr = dotEnvStr.substring(nextEndLineLoc + 1);
      continue;
    }
    const match = DOTENV_LINE.exec(dotEnvStr);
    if (!match)
      break;
    dotEnvStr = dotEnvStr.substring(match.index + match[0].length);
    DOTENV_LINE.lastIndex = 0;
    const key = match[1];
    let value = match[2] || "";
    value = value.trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, "\n");
      value = value.replace(/\\r/g, "\r");
    }
    const postComment = match[3]?.substring(1);
    dotenvItems.push({
      key,
      value,
      preComment: preComments.join("\n")?.trim() || void 0,
      postComment: postComment?.trim()
    });
    preComments = [];
  }
  return dotenvItems;
}
__name(parseDotEnvContents, "parseDotEnvContents");
function loadDotEnvIntoObject(dotEnvStr) {
  const dotenvItems = parseDotEnvContents(dotEnvStr);
  const obj = {};
  for (const i of dotenvItems) {
    obj[i.key] = i.value;
  }
  return obj;
}
__name(loadDotEnvIntoObject, "loadDotEnvIntoObject");
async function loadDotEnvFile(basePath, relativePath) {
  const fileName = relativePath.split("/").pop();
  const filePath = path2.resolve(basePath, relativePath);
  if (!fileName)
    throw new Error(`Invalid filePath - ${filePath}`);
  if (!fileName.startsWith(".env"))
    throw new Error('file name must start with ".env"');
  const fileNameParts = fileName.substring(1).split(".");
  const isOverridesFile = ["local", "override"].includes(fileNameParts[fileNameParts.length - 1]);
  if (isOverridesFile)
    fileNameParts.pop();
  const isSampleFile = ["sample", "example"].includes(fileNameParts[fileNameParts.length - 1]);
  if (isSampleFile)
    fileNameParts.pop();
  if (fileNameParts.length > 2)
    throw Error(`Unsure how to interpret filename - ${fileName}`);
  let applyForEnv = fileNameParts[1];
  if (applyForEnv === "dev")
    applyForEnv = "development";
  if (applyForEnv === "prod")
    applyForEnv = "production";
  const isGitIgnored = await checkIsFileGitIgnored(filePath);
  const rawContents = await fs2.promises.readFile(filePath, "utf8");
  const parsedContents = parseDotEnvContents(rawContents);
  const envObj = {};
  for (const i of parsedContents) {
    envObj[i.key] = i.value;
  }
  return {
    path: filePath,
    relativePath,
    fileName,
    isGitIgnored,
    isOverridesFile,
    isSampleFile,
    applyForEnv,
    rawContents,
    parsedContents,
    envObj,
    items: _5.keyBy(parsedContents, (i) => i.key)
  };
}
__name(loadDotEnvFile, "loadDotEnvFile");
async function loadServiceDotEnvFiles(servicePath, opts) {
  let globs = ["**/.env", "**/.env.*", "**/.env.*.local"];
  if (opts?.onlyLoadDmnoFolder)
    globs = globs.map((p) => p.replace("**/", "./.dmno/"));
  const dotEnvFilePaths = await new fdir().withRelativePaths().glob(...globs).exclude((excludeDirName, exdlueDirPath) => {
    if (excludeDirName !== ".dmno" && excludeDirName.startsWith("."))
      return true;
    if (excludeDirName === "node_modules")
      return true;
    if (opts?.excludeDirs?.includes(exdlueDirPath.replace(/\/$/, "")))
      return true;
    return false;
  }).crawl(servicePath).withPromise();
  const dotEnvFiles = await asyncMap(dotEnvFilePaths, async (relativePath) => {
    return await loadDotEnvFile(servicePath, relativePath);
  });
  const sortedDotEnvFiles = _5.sortBy(dotEnvFiles, (d) => {
    if (d.isSampleFile)
      return 0;
    if (!d.isOverridesFile && !d.applyForEnv)
      return 1;
    if (d.applyForEnv && !d.isOverridesFile)
      return 2;
    if (!d.applyForEnv && d.isOverridesFile)
      return 3;
    if (d.applyForEnv && d.isOverridesFile)
      return 4;
    throw new Error("unknown type of env file");
  });
  return sortedDotEnvFiles;
}
__name(loadServiceDotEnvFiles, "loadServiceDotEnvFiles");
async function asyncMapValues(iterableObj, iteratee, queueOrConcurrency) {
  const objAsPairs = toPairs(iterableObj);
  const mappedPairs = await asyncMap(objAsPairs, async ([key, value]) => {
    return [key, await iteratee(value, key)];
  }, queueOrConcurrency);
  return fromPairs(mappedPairs);
}
__name(asyncMapValues, "asyncMapValues");
async function asyncEachLimit(iterable, iteratee, concurrency) {
  return asyncForEach(iterable, iteratee, concurrency);
}
__name(asyncEachLimit, "asyncEachLimit");

// src/config-engine/config-engine.ts
var debug = Debug("dmno");
function defineDmnoService(opts) {
  debug("LOADING SCHEMA!", opts);
  opts._isDmnoServiceConfig = true;
  return opts;
}
__name(defineDmnoService, "defineDmnoService");
function defineDmnoWorkspace(opts) {
  debug("LOADING ROOT SCHEMA!", opts);
  opts._isDmnoWorkspaceConfig = true;
  return opts;
}
__name(defineDmnoWorkspace, "defineDmnoWorkspace");
var VALID_ITEM_KEY_REGEX = /^[a-z]\w+$/i;
var ConfigPath = class {
  constructor(path3) {
    this.path = path3;
  }
  static {
    __name(this, "ConfigPath");
  }
};
var configPath = /* @__PURE__ */ __name((path3) => new ConfigPath(path3), "configPath");
var CacheEntry = class _CacheEntry {
  constructor(key, value, more) {
    this.key = key;
    this.value = value;
    this.updatedAt = more?.updatedAt || /* @__PURE__ */ new Date();
    this.usedByItems = new Set(_5.castArray(more?.usedBy || []));
    this.encryptedValue = more?.encryptedValue;
  }
  static {
    __name(this, "CacheEntry");
  }
  usedByItems;
  updatedAt;
  encryptedValue;
  async getEncryptedValue() {
    return encrypt(_CacheEntry.encryptionKey, this.value, _CacheEntry.encryptionKeyName);
  }
  // have to make this async because of the encryption call
  async getJSON() {
    return {
      encryptedValue: this.encryptedValue || await this.getEncryptedValue(),
      updatedAt: this.updatedAt.toISOString(),
      usedByItems: Array.from(this.usedByItems)
    };
  }
  static async fromSerialized(itemKey, raw) {
    const value = await decrypt(_CacheEntry.encryptionKey, raw.encryptedValue, _CacheEntry.encryptionKeyName);
    return new _CacheEntry(itemKey, value, {
      updatedAt: new Date(raw.updatedAt),
      encryptedValue: raw.encryptedValue
    });
  }
  // not sure about this... but for now it seems true that we'll use a single key at a time
  static encryptionKey;
  static encryptionKeyName;
};
var OverrideSource = class {
  constructor(type, values, enabled = true) {
    this.type = type;
    this.values = values;
    this.enabled = enabled;
  }
  static {
    __name(this, "OverrideSource");
  }
  /** get an env var override value using a dot notation path */
  getOverrideForPath(path3) {
    return _5.get(this.values, path3);
  }
};
var DmnoWorkspace = class {
  static {
    __name(this, "DmnoWorkspace");
  }
  services = {};
  servicesArray = [];
  servicesByPackageName = {};
  rootServiceName = "root";
  get rootService() {
    return this.services[this.rootServiceName];
  }
  get rootPath() {
    return this.rootService.path;
  }
  processEnvOverrides = new OverrideSource("process.env", getConfigFromEnvVars());
  addService(service) {
    if (this.services[service.serviceName]) {
      throw new Error(`Service names must be unique - duplicate name detected "${service.serviceName}"`);
    } else {
      this.services[service.serviceName] = service;
      this.servicesArray.push(service);
      this.servicesByPackageName[service.packageName] = service;
      if (service.isRoot)
        this.rootServiceName = service.serviceName;
    }
  }
  servicesDag = new graphlib.Graph({ directed: true });
  initServicesDag() {
    for (const service of this.servicesArray) {
      this.servicesDag.setNode(service.serviceName, {
        /* can add more metadata here */
      });
    }
    for (const service of this.servicesArray) {
      const parentServiceName = service.rawConfig?.parent;
      if (parentServiceName) {
        if (!this.services[parentServiceName]) {
          service.schemaErrors.push(new SchemaError(`Unable to find parent service "${parentServiceName}"`));
        } else if (parentServiceName === service.serviceName) {
          service.schemaErrors.push(new SchemaError("Cannot set parent to self"));
        } else {
          this.servicesDag.setEdge(parentServiceName, service.serviceName, { type: "parent" });
        }
      } else if (!service.isRoot) {
        this.servicesDag.setEdge(this.rootServiceName, service.serviceName, { type: "parent" });
      }
    }
    for (const service of this.servicesArray) {
      _5.each(service.rawConfig?.pick, (rawPick) => {
        const pickFromServiceName = _5.isString(rawPick) ? this.rootServiceName : rawPick.source || this.rootServiceName;
        if (!this.services[pickFromServiceName]) {
          service.schemaErrors.push(new SchemaError(`Invalid service name in "pick" config - "${pickFromServiceName}"`));
        } else if (pickFromServiceName === service.serviceName) {
          service.schemaErrors.push(new SchemaError('Cannot "pick" from self'));
        } else {
          this.servicesDag.setEdge(pickFromServiceName, service.serviceName, { type: "pick" });
        }
      });
    }
    const graphCycles = graphlib.alg.findCycles(this.servicesDag);
    _5.each(graphCycles, (cycleMemberNames) => {
      _5.each(cycleMemberNames, (name) => {
        this.services[name].schemaErrors.push(new SchemaError(`Detected service dependency cycle - ${cycleMemberNames.join(" + ")}`));
      });
    });
    if (!graphCycles.length) {
      const sortedServiceNames = graphlib.alg.topsort(this.servicesDag);
      this.servicesArray = _5.map(sortedServiceNames, (serviceName) => this.services[serviceName]);
      debug("DEP SORTED SERVICES", sortedServiceNames);
    }
  }
  processConfig() {
    for (const service of this.servicesArray) {
      const ancestorServiceNames = this.servicesDag.predecessors(service.serviceName) || [];
      for (const rawPickItem of service.rawConfig?.pick || []) {
        const pickFromServiceName = _5.isString(rawPickItem) ? this.rootServiceName : rawPickItem.source || this.rootServiceName;
        const isPickingFromAncestor = ancestorServiceNames.includes(pickFromServiceName);
        const rawPickKey = _5.isString(rawPickItem) ? rawPickItem : rawPickItem.key;
        const pickFromService = this.services[pickFromServiceName];
        if (!pickFromService) {
          continue;
        }
        const potentialKeysToPickFrom = [];
        if (isPickingFromAncestor) {
          potentialKeysToPickFrom.push(..._5.keys(pickFromService.config));
        } else {
          const exposedItems = _5.pickBy(pickFromService.config, (itemConfig) => !!itemConfig.type.getDefItem("expose"));
          potentialKeysToPickFrom.push(..._5.keys(exposedItems));
        }
        const keysToPick = [];
        if (_5.isString(rawPickKey) || _5.isArray(rawPickKey)) {
          for (const keyToCheck of _5.castArray(rawPickKey)) {
            if (!potentialKeysToPickFrom.includes(keyToCheck)) {
              service.schemaErrors.push(new SchemaError(`Picked item ${pickFromServiceName} > ${keyToCheck} was not found`));
            } else {
              keysToPick.push(keyToCheck);
            }
          }
        } else if (_5.isFunction(rawPickKey)) {
          const pickKeysViaFilter = _5.filter(potentialKeysToPickFrom, rawPickKey);
          if (!pickKeysViaFilter.length) {
            service.schemaErrors.push(new SchemaError(`Pick from ${pickFromServiceName} using key filter fn had no matches`));
          } else {
            keysToPick.push(...pickKeysViaFilter);
          }
        }
        for (let i = 0; i < keysToPick.length; i++) {
          const pickKey = keysToPick[i];
          let newKeyName = pickKey;
          if (!_5.isString(rawPickItem) && rawPickItem.renameKey) {
            if (_5.isString(rawPickItem.renameKey)) {
              if (keysToPick.length > 1) {
                if (i === 0) {
                  service.schemaErrors.push(new SchemaError(`Picked multiple keys from ${pickFromServiceName} using static rename`));
                }
                newKeyName = `${rawPickItem.renameKey}-${i}`;
              } else {
                newKeyName = rawPickItem.renameKey;
              }
            } else {
              newKeyName = rawPickItem.renameKey(pickKey);
            }
          }
          service.addConfigItem(new DmnoPickedConfigItem(newKeyName, {
            sourceItem: pickFromService.config[pickKey],
            transformValue: _5.isString(rawPickItem) ? void 0 : rawPickItem.transformValue
          }, service));
        }
      }
      for (const itemKey in service.rawConfig?.schema) {
        if (!itemKey.match(VALID_ITEM_KEY_REGEX)) {
          service.schemaErrors.push(new SchemaError(`Invalid item key "${itemKey}"`));
        } else {
          const itemDef = service.rawConfig?.schema[itemKey];
          service.addConfigItem(new DmnoConfigItem(itemKey, itemDef, service));
        }
      }
    }
  }
  async resolveConfig() {
    await this.loadCache();
    for (const service of this.servicesArray) {
      if (service.schemaErrors.length) {
        debug(`SERVICE ${service.serviceName} has schema errors: `);
        debug(service.schemaErrors);
      } else {
        await service.resolveConfig();
      }
    }
    await this.writeCache();
  }
  get allServices() {
    return this.servicesArray;
  }
  getService(descriptor) {
    if (_5.isString(descriptor)) {
      return this.services[descriptor];
    } else {
      if (descriptor.serviceName)
        return this.services[descriptor.serviceName];
      if (descriptor.packageName)
        return this.servicesByPackageName[descriptor.packageName];
    }
    throw new Error(`unable to find service - ${descriptor}`);
  }
  get cacheFilePath() {
    return `${this.rootPath}/.dmno/cache.json`;
  }
  get cacheKeyFilePath() {
    return `${this.rootPath}/.dmno/cache-key.json`;
  }
  valueCache = {};
  cacheLastLoadedAt;
  cacheMode = true;
  setCacheMode(cacheMode) {
    this.cacheMode = cacheMode;
  }
  async loadCache() {
    if (this.cacheMode === "skip")
      return;
    if (!fs2.existsSync(this.cacheKeyFilePath)) {
      let keyName;
      try {
        const gitUserEmail = execSync("git config user.email").toString().trim();
        keyName = `${gitUserEmail}/${(/* @__PURE__ */ new Date()).toISOString()}`;
      } catch (err) {
      }
      keyName ||= `${process.env.NODE_ENV}/${(/* @__PURE__ */ new Date()).toISOString()}`;
      const dmnoKeyStr = await generateDmnoEncryptionKeyString(keyName);
      const reimportedDmnoKey = await importDmnoEncryptionKeyString(dmnoKeyStr);
      if (reimportedDmnoKey.keyName !== keyName)
        throw new Error("reimported key name doesnt match");
      CacheEntry.encryptionKey = reimportedDmnoKey.key;
      CacheEntry.encryptionKeyName = keyName;
      const cacheKeyData = {
        version: "0.0.1",
        key: dmnoKeyStr
      };
      await fs2.promises.writeFile(this.cacheKeyFilePath, stringifyJsonWithCommentBanner(cacheKeyData));
      if (fs2.existsSync(this.cacheFilePath)) {
        await fs2.promises.unlink(this.cacheFilePath);
      }
    } else {
      const cacheKeyRawStr = await fs2.promises.readFile(this.cacheKeyFilePath, "utf-8");
      const cacheKeyRaw = parse(cacheKeyRawStr);
      const importedDmnoKey = await importDmnoEncryptionKeyString(cacheKeyRaw.key);
      CacheEntry.encryptionKey = importedDmnoKey.key;
      CacheEntry.encryptionKeyName = importedDmnoKey.keyName;
    }
    if (this.cacheMode === "clear")
      return;
    if (!fs2.existsSync(this.cacheFilePath))
      return;
    const cacheRawStr = await fs2.promises.readFile(this.cacheFilePath, "utf-8");
    const cacheRaw = parse(cacheRawStr);
    if (CacheEntry.encryptionKeyName !== cacheRaw.keyName) {
      throw new Error("DMNO cache file does not match cache key");
    }
    for (const itemCacheKey in cacheRaw.items) {
      this.valueCache[itemCacheKey] = await CacheEntry.fromSerialized(itemCacheKey, cacheRaw.items[itemCacheKey]);
    }
    this.cacheLastLoadedAt = /* @__PURE__ */ new Date();
  }
  async writeCache() {
    if (this.cacheMode === "skip")
      return;
    if (this.cacheLastLoadedAt && _5.every(this.valueCache, (item) => item.updatedAt < this.cacheLastLoadedAt)) {
      return;
    }
    const serializedCache = {
      version: "0.0.1",
      keyName: CacheEntry.encryptionKeyName,
      items: await asyncMapValues(this.valueCache, async (cacheItem) => cacheItem.getJSON())
    };
    const serializedCacheStr = stringifyJsonWithCommentBanner(serializedCache);
    await fs2.promises.writeFile(this.cacheFilePath, serializedCacheStr, "utf-8");
  }
  async getCacheItem(key, usedBy) {
    if (this.cacheMode === "skip")
      return void 0;
    if (key in this.valueCache) {
      if (usedBy)
        this.valueCache[key].usedByItems.add(usedBy);
      return this.valueCache[key].value;
    }
  }
  async setCacheItem(key, value, usedBy) {
    if (this.cacheMode === "skip")
      return void 0;
    this.valueCache[key] = new CacheEntry(key, value, { usedBy });
  }
  plugins = {};
  toJSON() {
    return {
      plugins: _5.mapValues(this.plugins, (p) => p.toJSON()),
      services: _5.mapValues(
        _5.keyBy(this.services, (s) => s.serviceName),
        (s) => s.toJSON()
      )
    };
  }
};
var DmnoService = class {
  static {
    __name(this, "DmnoService");
  }
  /** name of service according to package.json file  */
  packageName;
  /** name of service within dmno - pulled from config.ts but defaults to packageName if not provided  */
  serviceName;
  /** true if service is root */
  isRoot;
  /** path to the service itself */
  path;
  /** unprocessed config schema pulled from config.ts */
  rawConfig;
  /** error encountered while _loading_ the config schema */
  configLoadError;
  /** error within the schema itself */
  schemaErrors = [];
  // TODO: probably want a specific error type...?
  /** processed config items - not necessarily resolved yet */
  config = {};
  workspace;
  injectedPlugins = [];
  ownedPlugins = [];
  settings = {};
  overrideSources = [];
  constructor(opts) {
    this.workspace = opts.workspace;
    this.isRoot = opts.isRoot;
    this.packageName = opts.packageName;
    this.path = opts.path;
    if (_5.isError(opts.rawConfig)) {
      this.serviceName = this.packageName;
      this.configLoadError = opts.rawConfig;
    } else {
      this.rawConfig = opts.rawConfig;
      this.settings = opts.rawConfig.settings || {};
      if (this.rawConfig.name) {
        const validateNameResult = validatePackageName(this.rawConfig.name);
        if (!validateNameResult.validForNewPackages) {
          const nameErrors = _5.concat([], validateNameResult.warnings, validateNameResult.errors);
          this.schemaErrors.push(new SchemaError(`Invalid service name "${this.rawConfig.name}" - ${nameErrors.join(", ")}`));
        }
        this.serviceName = this.rawConfig.name;
      } else {
        this.serviceName = opts.isRoot ? "root" : this.packageName;
      }
    }
  }
  get parentService() {
    if (this.rawConfig?.parent) {
      const parent = this.workspace.getService({ serviceName: this.rawConfig?.parent });
      if (parent)
        return parent;
      throw new Error(`Unable to find parent service: ${this.rawConfig.parent}`);
    }
  }
  getSettingsItem(key) {
    if (key in this.settings)
      return this.settings[key];
    return this.parentService?.getSettingsItem(key);
  }
  addConfigItem(item) {
    if (item instanceof DmnoPickedConfigItem && this.rawConfig?.schema[item.key]) {
      this.schemaErrors.push(new SchemaError(`Picked config key conflicting with a locally defined item - "${item.key}"`));
    } else if (this.config[item.key]) {
      this.schemaErrors.push(new SchemaError(`Config keys must be unique, duplicate detected - "${item.key}"`));
    } else {
      this.config[item.key] = item;
    }
  }
  async loadOverrideFiles() {
    this.overrideSources = [];
    const dotEnvFiles = await loadServiceDotEnvFiles(this.path, { onlyLoadDmnoFolder: true });
    dotEnvFiles.forEach((dotEnvFile) => {
      this.overrideSources.unshift(
        new OverrideSource(
          dotEnvFile.fileName,
          dotEnvFile.envObj,
          // TODO: specific env overrides are being enabled based on process.env.NODE_ENV
          // we probably want to be smarter about how _that_ gets resolved first
          // and store it at the workspace level or something...?
          !dotEnvFile.applyForEnv || dotEnvFile.applyForEnv === process.env.NODE_ENV
        )
      );
    });
  }
  async resolveConfig() {
    await this.loadOverrideFiles();
    for (const itemKey in this.config) {
      const configItem = this.config[itemKey];
      const itemPath = configItem.getPath(true);
      configItem.overrides = [];
      _5.each([
        // process.env overrides exist at the workspace root
        this.workspace.processEnvOverrides,
        // other override sources - (just env files for now)
        ...this.overrideSources.filter((o) => o.enabled)
      ], (overrideSource) => {
        const overrideVal = overrideSource.getOverrideForPath(itemPath);
        if (overrideVal !== void 0) {
          configItem.overrides.push({
            source: overrideSource.type,
            value: overrideVal
          });
        }
      });
      await configItem.resolve();
      if (configItem.isResolved) {
        for (const plugin of this.ownedPlugins) {
          plugin.attemptInputResolutionsUsingConfigItem(configItem);
        }
      }
    }
    for (const plugin of this.ownedPlugins) {
      plugin.checkItemsResolutions();
    }
  }
  getConfigItemByPath(path3) {
    const pathParts = path3.split(".");
    let currentItem = this.config[pathParts[0]];
    for (let i = 1; i < pathParts.length; i++) {
      const pathPart = pathParts[i];
      if (_5.has(currentItem.children, pathPart)) {
        currentItem = currentItem.children[pathPart];
      } else {
        throw new Error(`Trying to access ${this.serviceName} / ${path3} failed at ${pathPart}`);
      }
    }
    return currentItem;
  }
  get isValid() {
    if (this.configLoadError)
      return false;
    if (this.schemaErrors?.length)
      return false;
    return true;
  }
  getEnv() {
    const env = _5.mapValues(this.config, (item) => {
      return item.resolvedValue;
    });
    return env;
  }
  getInjectedEnvJSON() {
    const env = _5.mapValues(this.config, (item) => {
      return item.toInjectedJSON();
    });
    return env;
  }
  toJSON() {
    return {
      isValid: this.isValid,
      isResolved: true,
      packageName: this.packageName,
      serviceName: this.serviceName,
      path: this.path,
      configLoadError: this.configLoadError?.toJSON(),
      schemaErrors: this.schemaErrors?.length ? _5.map(this.schemaErrors, (err) => err.toJSON()) : void 0,
      ownedPluginNames: _5.map(this.ownedPlugins, (p) => p.instanceName),
      injectedPluginNames: _5.map(this.injectedPlugins, (p) => p.instanceName),
      config: _5.mapValues(this.config, (item, _key) => item.toJSON())
    };
  }
};
var ResolverContext = class {
  static {
    __name(this, "ResolverContext");
  }
  // TODO: the item has everything we need, but is it what we want to pass in?
  // lots of ? and ! on ts types here because data doesn't exist at init time...
  resolver;
  configItem;
  constructor(resolverOrItem) {
    if (resolverOrItem instanceof ConfigValueResolver2) {
      this.resolver = resolverOrItem;
      this.configItem = this.resolver.configItem;
    } else {
      this.configItem = resolverOrItem;
    }
  }
  get service() {
    return this.configItem.parentService;
  }
  get serviceName() {
    return this.service?.serviceName;
  }
  get itemPath() {
    return this.configItem.getPath();
  }
  get itemFullPath() {
    return this.configItem.getFullPath();
  }
  get resolverFullPath() {
    return this.resolver ? this.resolver.getFullPath() : this.itemFullPath;
  }
  get resolverBranchIdPath() {
    return this.resolver?.branchIdPath;
  }
  get(itemPath) {
    const item = this.service?.getConfigItemByPath(itemPath);
    if (!item) {
      throw new Error(`Tried to get item that does not exist ${itemPath}`);
    }
    if (!item.isResolved) {
      throw new Error(`Tried to access item that was not resolved - ${item.getPath()}`);
    }
    return item.resolvedValue;
  }
  // TODO: probably dont want to pull cache disable setting from the workspace/service/etc
  async getCacheItem(key) {
    if (process.env.DISABLE_DMNO_CACHE)
      return void 0;
    return this.service?.workspace.getCacheItem(key, this.itemFullPath);
  }
  async setCacheItem(key, value) {
    if (process.env.DISABLE_DMNO_CACHE)
      return;
    if (value === void 0 || value === null)
      return;
    return this.service?.workspace.setCacheItem(key, value.toString(), this.itemFullPath);
  }
  async getOrSetCacheItem(key, getValToWrite) {
    if (!process.env.DISABLE_DMNO_CACHE) {
      const cachedValue = await this.getCacheItem(key);
      if (cachedValue)
        return cachedValue;
    }
    const val = await getValToWrite();
    if (!process.env.DISABLE_DMNO_CACHE) {
      await this.setCacheItem(key, val);
    }
    return val;
  }
};
var DmnoConfigItemBase = class _DmnoConfigItemBase {
  constructor(key, parent) {
    this.key = key;
    this.parent = parent;
  }
  static {
    __name(this, "DmnoConfigItemBase");
  }
  overrides = [];
  valueResolver;
  isResolved = false;
  get resolvedRawValue() {
    if (this.overrides.length) {
      return this.overrides[0].value;
    }
    return this.valueResolver?.resolvedValue;
  }
  /** error encountered during resolution */
  get resolutionError() {
    return this.valueResolver?.resolutionError;
  }
  /** resolved value _after_ coercion logic applied */
  resolvedValue;
  // not sure if the coercion error should be stored in resolution error or split?
  /** error encountered during coercion step */
  coercionError;
  /** more details about the validation failure if applicable */
  validationErrors;
  /** whether the final resolved value is valid or not */
  get isValid() {
    if (this.coercionError)
      return false;
    if (this.validationErrors && this.validationErrors?.length > 0)
      return false;
    if (this.resolutionError)
      return false;
    return true;
  }
  children = {};
  get parentService() {
    if (this.parent instanceof DmnoService) {
      return this.parent;
    } else if (this.parent instanceof _DmnoConfigItemBase) {
      return this.parent.parentService;
    }
  }
  getPath(respectImportOverride = false) {
    const itemKey = respectImportOverride && this.type.getDefItem("importEnvKey") || this.key;
    if (this.parent instanceof _DmnoConfigItemBase) {
      const parentPath = this.parent.getPath(respectImportOverride);
      return `${parentPath}.${itemKey}`;
    }
    return itemKey;
  }
  getFullPath(respectImportOverride = false) {
    if (!this.parentService?.serviceName) {
      throw new Error("unable to get full path - this item is not attached to a service");
    }
    return `${this.parentService.serviceName}!${this.getPath(respectImportOverride)}`;
  }
  get isDynamic() {
    const serviceDynamicConfigMode = this.parentService?.getSettingsItem("dynamicConfig");
    if (serviceDynamicConfigMode === "only_dynamic")
      return true;
    if (serviceDynamicConfigMode === "only_static")
      return false;
    const explicitSetting = this.type.getDefItem("dynamic");
    if (explicitSetting !== void 0)
      return explicitSetting;
    if (serviceDynamicConfigMode === "default_dynamic")
      return true;
    if (serviceDynamicConfigMode === "default_static")
      return false;
    return !!this.type.getDefItem("sensitive");
  }
  async resolve() {
    if (this.isResolved)
      return;
    const itemResolverCtx = new ResolverContext(this.valueResolver || this);
    if (this.valueResolver) {
      await this.valueResolver.resolve(itemResolverCtx);
    }
    this.isResolved = true;
    if (this.resolvedRawValue !== void 0) {
      try {
        const coerceResult = this.type.coerce(_5.cloneDeep(this.resolvedRawValue), itemResolverCtx);
        if (coerceResult instanceof CoercionError) {
          this.coercionError = coerceResult;
        } else {
          this.resolvedValue = coerceResult;
        }
      } catch (err) {
        this.coercionError = new CoercionError(err);
      }
    }
    const validationResult = this.type.validate(_5.cloneDeep(this.resolvedValue), itemResolverCtx);
    this.validationErrors = validationResult === true ? [] : validationResult;
    debug(
      `${this.parentService?.serviceName}/${this.getPath()} = `,
      JSON.stringify(this.resolvedRawValue),
      JSON.stringify(this.resolvedValue),
      this.isValid ? "\u2705" : `\u274C ${this.validationErrors?.[0]?.message}`
    );
  }
  /** this is the shape that gets injected into an serialized json env var by `dmno run` */
  toInjectedJSON() {
    return {
      ...this.type.getDefItem("sensitive") && { sensitive: 1 },
      ...this.isDynamic && { dynamic: 1 },
      value: this.resolvedValue
    };
  }
  toJSON() {
    return {
      key: this.key,
      isValid: this.isValid,
      dataType: this.type.toJSON(),
      isDynamic: this.isDynamic,
      resolvedRawValue: this.resolvedRawValue,
      resolvedValue: this.resolvedValue,
      isResolved: this.isResolved,
      children: _5.mapValues(this.children, (c) => c.toJSON()),
      resolver: this.valueResolver?.toJSON(),
      overrides: this.overrides,
      // schemaErrors
      coercionError: this.coercionError?.toJSON(),
      validationErrors: this.validationErrors?.length ? _5.map(this.validationErrors, (err) => err.toJSON()) : void 0,
      resolutionError: this.resolutionError?.toJSON()
    };
  }
};
var DmnoConfigItem = class _DmnoConfigItem extends DmnoConfigItemBase {
  static {
    __name(this, "DmnoConfigItem");
  }
  type;
  schemaError;
  constructor(key, defOrShorthand, parent) {
    super(key, parent);
    if (_5.isString(defOrShorthand)) {
      if (!DmnoBaseTypes[defOrShorthand]) {
        throw new Error(`found invalid parent (string) in extends chain - "${defOrShorthand}"`);
      } else {
        this.type = DmnoBaseTypes[defOrShorthand]({});
      }
    } else if (_5.isFunction(defOrShorthand)) {
      const shorthandFnResult = defOrShorthand({});
      if (!(shorthandFnResult instanceof DmnoDataType)) {
        console.log(DmnoDataType, shorthandFnResult);
        throw new Error("invalid schema as result of fn shorthand");
      } else {
        this.type = shorthandFnResult;
      }
    } else if (defOrShorthand instanceof DmnoDataType) {
      this.type = defOrShorthand;
    } else if (_5.isObject(defOrShorthand)) {
      this.type = new DmnoDataType(defOrShorthand, void 0, void 0);
    } else {
      throw new Error("invalid item schema");
    }
    try {
      this.initializeChildren();
    } catch (err) {
      this.schemaError = err;
      debug(err);
    }
    this.valueResolver = this.type.valueResolver;
    if (this.valueResolver)
      this.valueResolver.configItem = this;
  }
  initializeChildren() {
    if (this.type.primitiveTypeFactory === DmnoBaseTypes.object) {
      _5.each(this.type.primitiveType.typeInstanceOptions, (childDef, childKey) => {
        this.children[childKey] = new _DmnoConfigItem(childKey, childDef, this);
      });
    }
  }
};
var DmnoPickedConfigItem = class _DmnoPickedConfigItem extends DmnoConfigItemBase {
  constructor(key, def, parent) {
    super(key, parent);
    this.def = def;
    this.pickChain.unshift(this.def.sourceItem);
    while (this.pickChain[0] instanceof _DmnoPickedConfigItem) {
      this.pickChain.unshift(this.pickChain[0].def.sourceItem);
    }
    this.initializeChildren();
    this.valueResolver = createdPickedValueResolver(this.def.sourceItem, this.def.transformValue);
    this.valueResolver.configItem = this;
  }
  static {
    __name(this, "DmnoPickedConfigItem");
  }
  /** full chain of items up to the actual config item */
  pickChain = [];
  /** the real source config item - which defines most of the settings */
  get originalConfigItem() {
    return this.pickChain[0];
  }
  get type() {
    return this.originalConfigItem.type;
  }
  initializeChildren() {
    if (this.originalConfigItem.children) {
      _5.each(this.originalConfigItem.children, (sourceChild, childKey) => {
        this.children[childKey] = new _DmnoPickedConfigItem(sourceChild.key, { sourceItem: sourceChild }, this);
      });
    }
  }
};

// src/config-engine/resolvers/resolvers.ts
function createResolver(def) {
  return new ConfigValueResolver2(def);
}
__name(createResolver, "createResolver");
var ConfigValueResolver2 = class _ConfigValueResolver {
  constructor(def) {
    this.def = def;
    if (_5.isString(this.def.icon))
      this.icon = this.def.icon;
    if (_5.isString(this.def.label))
      this.label = this.def.label;
    if ("resolveBranches" in this.def) {
      _5.each(this.def.resolveBranches, (branchDef) => {
        branchDef.resolver.branchDef = branchDef;
        branchDef.resolver.parentResolver = this;
      });
    }
  }
  static {
    __name(this, "ConfigValueResolver");
  }
  isResolved = false;
  resolvedValue;
  isUsingCache = false;
  resolutionError;
  icon;
  label;
  _configItem;
  set configItem(configItem) {
    this._configItem = configItem;
    if ("resolveBranches" in this.def) {
      _5.each(this.def.resolveBranches, (branch) => {
        branch.resolver.configItem = configItem;
      });
    }
  }
  get configItem() {
    return this._configItem;
  }
  parentResolver;
  branchDef;
  get branchIdPath() {
    if (!this.branchDef)
      return void 0;
    if (this.parentResolver) {
      const parentBranchIdPath = this.parentResolver.branchIdPath;
      if (parentBranchIdPath) {
        return `${this.parentResolver.branchIdPath}/${this.branchDef.id}`;
      }
    }
    return this.branchDef?.id;
  }
  getFullPath() {
    return _5.compact([
      this.configItem?.getFullPath(),
      this.branchIdPath
    ]).join("#");
  }
  async resolve(ctx) {
    if (_5.isFunction(this.def.icon))
      this.icon = this.def.icon(ctx);
    if (_5.isFunction(this.def.label))
      this.label = this.def.label(ctx);
    let cacheKey;
    if (_5.isString(this.def.cacheKey))
      cacheKey = this.def.cacheKey;
    else if (_5.isFunction(this.def.cacheKey)) {
      cacheKey = await this.def.cacheKey(ctx);
    }
    if (cacheKey) {
      const cachedValue = await ctx.getCacheItem(cacheKey);
      if (cachedValue !== void 0) {
        this.resolvedValue = cachedValue;
        this.isResolved = true;
        this.isUsingCache = true;
        return;
      }
    }
    let resolutionResult;
    if ("resolveBranches" in this.def) {
      let matchingBranch = _5.find(this.def.resolveBranches, (branch) => {
        if (branch.isDefault)
          return false;
        return branch.condition(ctx);
      });
      if (!matchingBranch) {
        matchingBranch = _5.find(this.def.resolveBranches, (branch) => branch.isDefault);
      }
      _5.each(this.def.resolveBranches, (branch) => {
        branch.isActive = branch === matchingBranch;
      });
      if (!matchingBranch) {
        throw new Error("no matching resolver branch found and no default");
      }
      resolutionResult = matchingBranch.resolver || void 0;
    } else {
      try {
        resolutionResult = await this.def.resolve(ctx);
      } catch (err) {
        if (err instanceof ResolutionError) {
          this.resolutionError = err;
        } else {
          this.resolutionError = new ResolutionError(err);
        }
        this.isResolved = false;
        return;
      }
    }
    if (resolutionResult instanceof _ConfigValueResolver) {
      const childCtx = new ResolverContext(resolutionResult);
      await resolutionResult.resolve(childCtx);
      this.resolvedValue = resolutionResult.resolvedValue;
    } else {
      this.resolvedValue = resolutionResult;
    }
    this.isResolved = true;
    if (cacheKey && this.resolvedValue !== void 0 && this.resolvedValue !== null) {
      await ctx.setCacheItem(cacheKey, this.resolvedValue);
    }
  }
  toJSON() {
    return {
      isResolved: this.isResolved,
      icon: this.icon,
      label: this.label,
      createdByPluginInstanceName: this.def.createdByPlugin?.instanceName,
      // itemPath: this.configItem?.getFullPath(),
      // branchIdPath: this.branchIdPath,
      ..."resolveBranches" in this.def && {
        branches: _5.map(this.def.resolveBranches, (b) => ({
          id: b.id,
          label: b.label,
          isDefault: b.isDefault,
          isActive: b.isActive,
          resolver: b.resolver.toJSON()
        }))
      },
      resolvedValue: this.resolvedValue,
      resolutionError: this.resolutionError?.toJSON()
    };
  }
};
function processInlineResolverDef(resolverDef) {
  if (_5.isFunction(resolverDef)) {
    return createResolver({
      icon: "f7:function",
      label: "fn",
      resolve: resolverDef
    });
  } else if (resolverDef instanceof ConfigValueResolver2) {
    return resolverDef;
  } else if (resolverDef !== void 0) {
    return createResolver({
      icon: "material-symbols:check-circle",
      label: "static",
      resolve: async () => resolverDef
    });
  } else {
    throw new Error("invalid resolver definition");
  }
}
__name(processInlineResolverDef, "processInlineResolverDef");
function cacheFunctionResult(cacheKeyOrResolverFn, resolverFn) {
  const explicitCacheKey = _5.isString(cacheKeyOrResolverFn) ? cacheKeyOrResolverFn : void 0;
  const fn = _5.isString(cacheKeyOrResolverFn) ? resolverFn : cacheKeyOrResolverFn;
  return createResolver({
    icon: "f7:function",
    // TODO: different fn for cached?
    label: "cached fn",
    cacheKey: explicitCacheKey || ((ctx) => ctx.resolverFullPath),
    resolve: fn
  });
}
__name(cacheFunctionResult, "cacheFunctionResult");
function createdPickedValueResolver(sourceItem, valueTransform) {
  return createResolver({
    icon: "material-symbols:content-copy-outline-sharp",
    label: "picked value",
    async resolve(ctx) {
      if (!sourceItem.isResolved) {
        return new Error("picked value has not been resolved yet");
      }
      if (valueTransform) {
        return valueTransform(sourceItem.resolvedValue);
      } else {
        return sourceItem.resolvedValue;
      }
    }
  });
}
__name(createdPickedValueResolver, "createdPickedValueResolver");
var debug2 = Debug("dmno:plugins");
var InjectPluginInputByType = Symbol("InjectPluginInputByType");
var _PluginInputTypesSymbol = Symbol("plugin-input-types");
var DmnoPluginInputItem = class {
  constructor(key, itemSchema) {
    this.key = key;
    this.itemSchema = itemSchema;
    this.dataType = new DmnoDataType(itemSchema, void 0, void 0);
  }
  static {
    __name(this, "DmnoPluginInputItem");
  }
  dataType;
  schemaError;
  /** error encountered during coercion step */
  coercionError;
  /** more details about the validation failure if applicable */
  validationErrors;
  /** resolved value _before_ coercion logic applied */
  resolvedRawValue;
  resolvedValue;
  isResolved = false;
  resolvingConfigItems;
  get resolutionMethod() {
    if (this.typeInjectionEnabled)
      return "type";
    if (this.configPath)
      return "path";
    if (this.resolvedRawValue)
      return "static";
  }
  /** flag to enable type-based injection */
  typeInjectionEnabled = false;
  /** config path to use in order to fill this input */
  configPath;
  /** used to set a static value to resolve this input */
  setStaticValue(val) {
    this.typeInjectionEnabled = false;
    this.configPath = void 0;
    this.setValue(val);
  }
  /** used to enable type-based injection to resolve this input */
  enableTypeInjection() {
    this.configPath = void 0;
    this.typeInjectionEnabled = true;
  }
  /** used to set a specific config path to resolve this input */
  setPathInjection(configPath2) {
    this.typeInjectionEnabled = false;
    this.configPath = configPath2;
  }
  /** set the value after being resolved  */
  setValue(val) {
    this.resolvedRawValue = val;
    const coerceResult = this.dataType.coerce(_5.cloneDeep(this.resolvedRawValue));
    if (coerceResult instanceof CoercionError) {
      this.coercionError = coerceResult;
    } else {
      this.resolvedValue = coerceResult;
    }
    this.isResolved = true;
    const validationResult = this.dataType?.validate(this.resolvedValue);
    this.validationErrors = validationResult === true ? [] : validationResult;
  }
  attemptResolutionUsingConfigItem(item) {
    if (this.configPath?.path === item.getPath()) {
      debug2(`PLUGIN input "${this.key}" resolved by path`, this.configPath.path);
      this.resolvingConfigItems = [item];
      this.setValue(item.resolvedValue);
    } else if (this.resolutionMethod === "type") {
      if (item.type.extendsType(this.dataType.typeFactoryFn)) {
        debug2(`PLUGIN input "${this.key}" resolved by type`, item.type.typeDef.typeLabel);
        if (this.resolvingConfigItems?.length) {
          this.resolvingConfigItems.push(item);
          const paths = _5.map(this.resolvingConfigItems, (i) => i.getPath());
          this.schemaError = new SchemaError(`Received multiple values during type-based injection - ${paths.join(", ")}`);
        } else {
          this.resolvingConfigItems = [item];
          this.setValue(item.resolvedValue);
        }
      }
    }
  }
  // meant to be called after all possible resolutions could have occurred
  // worst case this can be when the service is done, but ideally would be earlier?
  checkResolutionStatus() {
    if (this.configPath && !this.isResolved) {
      this.schemaError = new SchemaError(`Input resolution via path "${this.configPath.path}" failed`);
    } else if (this.resolutionMethod === "type" && !this.isResolved) {
      this.schemaError = new SchemaError("Input resolution by type-based injection failed");
    }
    if (this.itemSchema.required) {
      if (!this.isResolved) {
        this.schemaError = new SchemaError("Item is required but was not resolved");
      }
    }
  }
  get isValid() {
    if (this.schemaError)
      return false;
    if (this.coercionError)
      return false;
    if (this.validationErrors?.length)
      return false;
    return true;
  }
  toJSON() {
    return {
      key: this.key,
      resolutionMethod: this.resolutionMethod,
      isValid: this.isValid,
      isResolved: this.isResolved,
      // TODO: in the future we may have an array case so we may want to make this an array
      // but it will likely be a single 90+% of the time...
      mappedToItemPath: this.resolvingConfigItems?.[0]?.getFullPath(),
      resolvedValue: this.resolvedValue,
      coercionError: this.coercionError?.toJSON(),
      schemaError: this.schemaError?.toJSON(),
      validationErrors: this.validationErrors?.length ? _5.map(this.validationErrors, (err) => err.toJSON()) : void 0
    };
  }
};
var DmnoPlugin = class {
  constructor(instanceName) {
    this.instanceName = instanceName;
    if (allPlugins[instanceName]) {
      throw new SchemaError(`Plugin instance names must be unique! Duplicate name: ${instanceName}`);
    }
    allPlugins[instanceName] = this;
    initializedPluginInstanceNames.push(instanceName);
  }
  static {
    __name(this, "DmnoPlugin");
  }
  /** name of the plugin itself - which is the name of the class */
  pluginType = this.constructor.name;
  /** iconify icon name */
  icon;
  static cliPath;
  get cliPath() {
    const PluginClass = this.constructor;
    return PluginClass.cliPath;
  }
  /**
   * reference back to the service this plugin was initialized in
   * NOTE - when using injection, it will still be the original initializing service
   * */
  initByService;
  injectedByServices;
  /** schema for the inputs this plugin needs - stored on the class */
  static inputSchema;
  /** helper to get the inputSchema from within a instance of the class */
  get inputSchema() {
    const PluginClass = this.constructor;
    return PluginClass.inputSchema;
  }
  /**
   * tracks the status of each input
   * how it will be resolved, status of that resolution, and the resolvedValue
   * */
  inputItems = _5.mapValues(this.inputSchema, (itemSchema, itemKey) => new DmnoPluginInputItem(itemKey, itemSchema));
  // TODO: would be nice to remove this any
  getInputItem(key) {
    return this.inputItems[key];
  }
  _inputsAllResolved = false;
  get inputsAllResolved() {
    return this._inputsAllResolved;
  }
  setInputMap(inputMapping) {
    for (const itemKey in this.inputSchema) {
      const val = inputMapping[itemKey];
      if (val instanceof ConfigPath) {
        this.inputItems[itemKey].setPathInjection(val);
      } else if (val === InjectPluginInputByType) {
        this.inputItems[itemKey].enableTypeInjection();
      } else if (val !== void 0 && val !== null) {
        this.inputItems[itemKey].setStaticValue(val);
      }
    }
  }
  /**
   * map of input keys to their generated types
   * this will be filled in via our type auto-generation process
   * and overridden via module augmentation
   * */
  // we use a symbol here so it doesn't show up in autocomplete (it doesn't actually exist)
  // it is just used to type many other things in the class
  [_PluginInputTypesSymbol] = {};
  inputValues = new Proxy({}, {
    get: (target, inputKey) => {
      if (_5.isSymbol(inputKey))
        return;
      return this.inputItems[inputKey]?.resolvedValue;
    }
    // set(target, name, value) {
    //   return true;
    // },
  });
  // TODO: add some kind of hooks system so plugin author can run some logic
  // when each (or all?) inputs are resolved. This would let us for example
  // make an api request to validate that all the settings together are valid?
  attemptInputResolutionsUsingConfigItem(item) {
    for (const inputKey in this.inputItems) {
      this.inputItems[inputKey].attemptResolutionUsingConfigItem(item);
    }
  }
  checkItemsResolutions() {
    for (const inputKey in this.inputItems) {
      this.inputItems[inputKey].checkResolutionStatus();
    }
  }
  get isValid() {
    return _5.every(_5.values(this.inputItems), (i) => i.isValid);
  }
  resolvers = [];
  createResolver(def) {
    const r = createResolver({
      createdByPlugin: this,
      ...def
    });
    this.resolvers.push(r);
    return r;
  }
  // private hooks?: {
  //   onInitComplete?: () => Promise<void>;
  // };
  toJSON() {
    return {
      pluginType: this.pluginType,
      cliPath: this.constructor.cliPath,
      instanceName: this.instanceName,
      isValid: this.isValid,
      initializedInService: this.initByService?.serviceName || "",
      injectedIntoServices: _5.map(this.injectedByServices, (s) => s.serviceName),
      inputs: _5.mapValues(this.inputItems, (i) => i.toJSON()),
      usedByConfigItemResolverPaths: _5.map(this.resolvers, (r) => r.getFullPath())
    };
  }
  static injectInstance(instanceName) {
    const pluginToInject = allPlugins[instanceName];
    if (!pluginToInject) {
      throw new SchemaError(`Plugin injection failed - no plugin named "${instanceName}" exists`);
    }
    if (!pluginToInject.initByService || pluginToInject.initByService.serviceName !== "root") {
      throw new SchemaError(`Plugin injection failed for "${instanceName}" - you can only inject plugins from the root`);
    }
    if (!(pluginToInject instanceof this)) {
      throw new SchemaError(`Type of plugin being injected does not match. Requested = ${this.name}, Injected = ${pluginToInject.constructor.name}`);
    }
    injectedPluginInstanceNames.push(instanceName);
    return pluginToInject;
  }
};
var allPlugins = {};
var initializedPluginInstanceNames = [];
var injectedPluginInstanceNames = [];
function beginWorkspaceLoadPlugins(workspace) {
  allPlugins = workspace.plugins;
}
__name(beginWorkspaceLoadPlugins, "beginWorkspaceLoadPlugins");
function beginServiceLoadPlugins() {
  initializedPluginInstanceNames = [];
  injectedPluginInstanceNames = [];
}
__name(beginServiceLoadPlugins, "beginServiceLoadPlugins");
function finishServiceLoadPlugins(service) {
  service.injectedPlugins = _5.values(_5.pick(allPlugins, injectedPluginInstanceNames));
  service.ownedPlugins = _5.values(_5.pick(allPlugins, initializedPluginInstanceNames));
  _5.each(injectedPluginInstanceNames, (pName) => {
    allPlugins[pName].injectedByServices ||= [];
    allPlugins[pName].injectedByServices?.push(service);
  });
  _5.each(initializedPluginInstanceNames, (pName) => {
    allPlugins[pName].initByService = service;
  });
}
__name(finishServiceLoadPlugins, "finishServiceLoadPlugins");
var Defaults = class {
  static {
    __name(this, "Defaults");
  }
  constructor() {
  }
  appspace = "app.";
  socketRoot = "/tmp/";
  id = os.hostname();
  encoding = "utf8";
  rawBuffer = false;
  sync = false;
  unlink = true;
  delimiter = "\f";
  silent = false;
  logDepth = 5;
  logInColor = true;
  logger = console.log.bind(console);
  maxConnections = 100;
  retry = 500;
  maxRetries = Infinity;
  stopRetrying = false;
  IPType = getIPType();
  tls = false;
  networkHost = this.IPType == "IPv6" ? "::1" : "127.0.0.1";
  networkPort = 8e3;
  readableAll = false;
  writableAll = false;
  interface = {
    localAddress: false,
    localPort: false,
    family: false,
    hints: false,
    lookup: false
  };
};
function getIPType() {
  const networkInterfaces = os.networkInterfaces();
  let IPType = "";
  if (networkInterfaces && Array.isArray(networkInterfaces) && networkInterfaces.length > 0) {
    IPType = networkInterfaces[Object.keys(networkInterfaces)[0]][0].family;
  }
  return IPType;
}
__name(getIPType, "getIPType");

// ../../node_modules/.pnpm/@achrinza+node-ipc@10.1.10/node_modules/@achrinza/node-ipc/entities/EventParser.js
var Parser = class {
  static {
    __name(this, "Parser");
  }
  constructor(config) {
    if (!config) {
      config = new Defaults();
    }
    this.delimiter = config.delimiter;
  }
  format(message) {
    if (!message.data && message.data !== false && message.data !== 0) {
      message.data = {};
    }
    if (message.data["_maxListeners"]) {
      message.data = {};
    }
    message = message.JSON + this.delimiter;
    return message;
  }
  parse(data) {
    let events = data.split(this.delimiter);
    events.pop();
    return events;
  }
};

// ../../node_modules/.pnpm/@achrinza+node-ipc@10.1.10/node_modules/@achrinza/node-ipc/dao/client.js
var import_js_message = __toESM(require_Message(), 1);
var import_js_queue = __toESM(require_queue(), 1);

// ../../node_modules/.pnpm/@achrinza+strong-type@0.1.11/node_modules/@achrinza/strong-type/index.js
var Fake = class {
  static {
    __name(this, "Fake");
  }
  //fake class as fallback
};
var FakeCore = class {
  static {
    __name(this, "FakeCore");
  }
  //fake class as fallback
};
var Is = class {
  static {
    __name(this, "Is");
  }
  constructor(strict = true) {
    this.strict = strict;
  }
  //core
  throw(valueType, expectedType) {
    let err = new TypeError();
    err.message = `expected type of ${valueType} to be ${expectedType}`;
    if (!this.strict) {
      return false;
    }
    throw err;
  }
  typeCheck(value, type) {
    if (typeof value === type) {
      return true;
    }
    return this.throw(typeof value, type);
  }
  instanceCheck(value = new Fake(), constructor = FakeCore) {
    if (value instanceof constructor) {
      return true;
    }
    return this.throw(typeof value, constructor.name);
  }
  symbolStringCheck(value, type) {
    if (Object.prototype.toString.call(value) == `[object ${type}]`) {
      return true;
    }
    return this.throw(Object.prototype.toString.call(value), `[object ${type}]`);
  }
  compare(value, targetValue, typeName) {
    if (value == targetValue) {
      return true;
    }
    return this.throw(typeof value, typeName);
  }
  //unique checks
  finite(value) {
    if (isFinite(value)) {
      return true;
    }
    return this.throw(typeof value, "finite");
  }
  NaN(value) {
    if (!this.number(value)) {
      return this.number(value);
    }
    if (isNaN(value)) {
      return true;
    }
    return this.throw(typeof value, "NaN");
  }
  null(value) {
    return this.compare(value, null, "null");
  }
  //common sugar
  array(value) {
    return this.instanceCheck(value, Array);
  }
  boolean(value) {
    return this.typeCheck(value, "boolean");
  }
  bigint(value) {
    return this.typeCheck(value, "bigint");
  }
  date(value) {
    return this.instanceCheck(value, Date);
  }
  generator(value) {
    return this.symbolStringCheck(value, "Generator");
  }
  asyncGenerator(value) {
    return this.symbolStringCheck(value, "AsyncGenerator");
  }
  globalThis(value) {
    return this.compare(value, globalThis, "explicitly globalThis, not window, global nor self");
  }
  infinity(value) {
    return this.compare(value, Infinity, "Infinity");
  }
  map(value) {
    return this.instanceCheck(value, Map);
  }
  weakMap(value) {
    return this.instanceCheck(value, WeakMap);
  }
  number(value) {
    return this.typeCheck(value, "number");
  }
  object(value) {
    return this.typeCheck(value, "object");
  }
  promise(value) {
    return this.instanceCheck(value, Promise);
  }
  regExp(value) {
    return this.instanceCheck(value, RegExp);
  }
  undefined(value) {
    return this.typeCheck(value, "undefined");
  }
  set(value) {
    return this.instanceCheck(value, Set);
  }
  weakSet(value) {
    return this.instanceCheck(value, WeakSet);
  }
  string(value) {
    return this.typeCheck(value, "string");
  }
  symbol(value) {
    return this.typeCheck(value, "symbol");
  }
  //functions
  function(value) {
    return this.typeCheck(value, "function");
  }
  asyncFunction(value) {
    return this.symbolStringCheck(value, "AsyncFunction");
  }
  generatorFunction(value) {
    return this.symbolStringCheck(value, "GeneratorFunction");
  }
  asyncGeneratorFunction(value) {
    return this.symbolStringCheck(value, "AsyncGeneratorFunction");
  }
  //error sugar
  error(value) {
    return this.instanceCheck(value, Error);
  }
  evalError(value) {
    return this.instanceCheck(value, EvalError);
  }
  rangeError(value) {
    return this.instanceCheck(value, RangeError);
  }
  referenceError(value) {
    return this.instanceCheck(value, ReferenceError);
  }
  syntaxError(value) {
    return this.instanceCheck(value, SyntaxError);
  }
  typeError(value) {
    return this.instanceCheck(value, TypeError);
  }
  URIError(value) {
    return this.instanceCheck(value, URIError);
  }
  //typed array sugar
  bigInt64Array(value) {
    return this.instanceCheck(value, BigInt64Array);
  }
  bigUint64Array(value) {
    return this.instanceCheck(value, BigUint64Array);
  }
  float32Array(value) {
    return this.instanceCheck(value, Float32Array);
  }
  float64Array(value) {
    return this.instanceCheck(value, Float64Array);
  }
  int8Array(value) {
    return this.instanceCheck(value, Int8Array);
  }
  int16Array(value) {
    return this.instanceCheck(value, Int16Array);
  }
  int32Array(value) {
    return this.instanceCheck(value, Int32Array);
  }
  uint8Array(value) {
    return this.instanceCheck(value, Uint8Array);
  }
  uint8ClampedArray(value) {
    return this.instanceCheck(value, Uint8ClampedArray);
  }
  uint16Array(value) {
    return this.instanceCheck(value, Uint16Array);
  }
  uint32Array(value) {
    return this.instanceCheck(value, Uint32Array);
  }
  //buffers
  arrayBuffer(value) {
    return this.instanceCheck(value, ArrayBuffer);
  }
  dataView(value) {
    return this.instanceCheck(value, DataView);
  }
  sharedArrayBuffer(value) {
    return this.instanceCheck(value, function() {
      try {
        return SharedArrayBuffer;
      } catch {
        return Fake;
      }
    }());
  }
  //Intl (browser internationalization)
  intlDateTimeFormat(value) {
    return this.instanceCheck(value, Intl.DateTimeFormat);
  }
  intlCollator(value) {
    return this.instanceCheck(value, Intl.Collator);
  }
  intlDisplayNames(value) {
    return this.instanceCheck(value, Intl.DisplayNames);
  }
  intlListFormat(value) {
    return this.instanceCheck(value, Intl.ListFormat);
  }
  intlLocale(value) {
    return this.instanceCheck(value, Intl.Locale);
  }
  intlNumberFormat(value) {
    return this.instanceCheck(value, Intl.NumberFormat);
  }
  intlPluralRules(value) {
    return this.instanceCheck(value, Intl.PluralRules);
  }
  intlRelativeTimeFormat(value) {
    return this.instanceCheck(value, Intl.RelativeTimeFormat);
  }
  intlRelativeTimeFormat(value) {
    return this.instanceCheck(value, Intl.RelativeTimeFormat);
  }
  //garbage collection
  finalizationRegistry(value) {
    return this.instanceCheck(value, FinalizationRegistry);
  }
  weakRef(value) {
    return this.instanceCheck(value, WeakRef);
  }
};

// ../../node_modules/.pnpm/@achrinza+event-pubsub@5.0.9/node_modules/@achrinza/event-pubsub/index.js
var is = new Is();
var EventPubSub = class {
  static {
    __name(this, "EventPubSub");
  }
  constructor() {
  }
  on(type, handler, once = false) {
    is.string(type);
    is.function(handler);
    is.boolean(once);
    if (type == "*") {
      type = this.#all;
    }
    if (!this.#events[type]) {
      this.#events[type] = [];
    }
    handler[this.#once] = once;
    this.#events[type].push(handler);
    return this;
  }
  once(type, handler) {
    return this.on(type, handler, true);
  }
  off(type = "*", handler = "*") {
    is.string(type);
    if (type == this.#all.toString() || type == "*") {
      type = this.#all;
    }
    if (!this.#events[type]) {
      return this;
    }
    if (handler == "*") {
      delete this.#events[type];
      return this;
    }
    is.function(handler);
    const handlers = this.#events[type];
    while (handlers.includes(handler)) {
      handlers.splice(
        handlers.indexOf(handler),
        1
      );
    }
    if (handlers.length < 1) {
      delete this.#events[type];
    }
    return this;
  }
  emit(type, ...args) {
    is.string(type);
    const globalHandlers = this.#events[this.#all] || [];
    this.#handleOnce(this.#all.toString(), globalHandlers, type, ...args);
    if (!this.#events[type]) {
      return this;
    }
    const handlers = this.#events[type];
    this.#handleOnce(type, handlers, ...args);
    return this;
  }
  reset() {
    this.off(this.#all.toString());
    for (let type in this.#events) {
      this.off(type);
    }
    return this;
  }
  get list() {
    return Object.assign({}, this.#events);
  }
  #handleOnce = (type, handlers, ...args) => {
    is.string(type);
    is.array(handlers);
    const deleteOnceHandled = [];
    for (let handler of handlers) {
      handler(...args);
      if (handler[this.#once]) {
        deleteOnceHandled.push(handler);
      }
    }
    for (let handler of deleteOnceHandled) {
      this.off(type, handler);
    }
  };
  #all = Symbol.for("event-pubsub-all");
  #once = Symbol.for("event-pubsub-once");
  #events = {};
};

// ../../node_modules/.pnpm/@achrinza+node-ipc@10.1.10/node_modules/@achrinza/node-ipc/dao/client.js
var eventParser = new Parser();
var Client = class _Client extends EventPubSub {
  static {
    __name(this, "Client");
  }
  constructor(config, log2) {
    super();
    this.config = config;
    this.log = log2;
    this.publish = super.emit;
    config.maxRetries ? this.retriesRemaining = config.maxRetries : 0;
    eventParser = new Parser(this.config);
  }
  Client = _Client;
  queue = new import_js_queue.default();
  socket = false;
  connect = connect;
  emit = emit;
  retriesRemaining = 0;
  explicitlyDisconnected = false;
};
function emit(type, data) {
  this.log("dispatching event to ", this.id, this.path, " : ", type, ",", data);
  let message = new import_js_message.default();
  message.type = type;
  message.data = data;
  if (this.config.rawBuffer) {
    message = Buffer.from(type, this.config.encoding);
  } else {
    message = eventParser.format(message);
  }
  if (!this.config.sync) {
    this.socket.write(message);
    return;
  }
  this.queue.add(
    syncEmit.bind(this, message)
  );
}
__name(emit, "emit");
function syncEmit(message) {
  this.log("dispatching event to ", this.id, this.path, " : ", message);
  this.socket.write(message);
}
__name(syncEmit, "syncEmit");
function connect() {
  let client = this;
  client.log("requested connection to ", client.id, client.path);
  if (!this.path) {
    client.log("\n\n######\nerror: ", client.id, " client has not specified socket path it wishes to connect to.");
    return;
  }
  const options = {};
  if (!client.port) {
    client.log("Connecting client on Unix Socket :", client.path);
    options.path = client.path;
    if (process.platform === "win32" && !client.path.startsWith("\\\\.\\pipe\\")) {
      options.path = options.path.replace(/^\//, "");
      options.path = options.path.replace(/\//g, "-");
      options.path = `\\\\.\\pipe\\${options.path}`;
    }
    client.socket = net.connect(options);
  } else {
    options.host = client.path;
    options.port = client.port;
    if (client.config.interface.localAddress) {
      options.localAddress = client.config.interface.localAddress;
    }
    if (client.config.interface.localPort) {
      options.localPort = client.config.interface.localPort;
    }
    if (client.config.interface.family) {
      options.family = client.config.interface.family;
    }
    if (client.config.interface.hints) {
      options.hints = client.config.interface.hints;
    }
    if (client.config.interface.lookup) {
      options.lookup = client.config.interface.lookup;
    }
    if (!client.config.tls) {
      client.log("Connecting client via TCP to", options);
      client.socket = net.connect(options);
    } else {
      client.log("Connecting client via TLS to", client.path, client.port, client.config.tls);
      if (client.config.tls.private) {
        client.config.tls.key = fs2.readFileSync(client.config.tls.private);
      }
      if (client.config.tls.public) {
        client.config.tls.cert = fs2.readFileSync(client.config.tls.public);
      }
      if (client.config.tls.trustedConnections) {
        if (typeof client.config.tls.trustedConnections === "string") {
          client.config.tls.trustedConnections = [client.config.tls.trustedConnections];
        }
        client.config.tls.ca = [];
        for (let i = 0; i < client.config.tls.trustedConnections.length; i++) {
          client.config.tls.ca.push(
            fs2.readFileSync(client.config.tls.trustedConnections[i])
          );
        }
      }
      Object.assign(client.config.tls, options);
      client.socket = tls.connect(
        client.config.tls
      );
    }
  }
  client.socket.setEncoding(this.config.encoding);
  client.socket.on(
    "error",
    function(err) {
      client.log("\n\n######\nerror: ", err);
      client.publish("error", err);
    }
  );
  client.socket.on(
    "connect",
    /* @__PURE__ */ __name(function connectionMade() {
      client.publish("connect");
      client.retriesRemaining = client.config.maxRetries;
      client.log("retrying reset");
    }, "connectionMade")
  );
  client.socket.on(
    "close",
    /* @__PURE__ */ __name(function connectionClosed() {
      client.log(
        "connection closed",
        client.id,
        client.path,
        client.retriesRemaining,
        "tries remaining of",
        client.config.maxRetries
      );
      if (client.config.stopRetrying || client.retriesRemaining < 1 || client.explicitlyDisconnected) {
        client.publish("disconnect");
        client.log(
          client.config.id,
          "exceeded connection rety amount of",
          " or stopRetrying flag set."
        );
        client.socket.destroy();
        client.publish("destroy");
        client = void 0;
        return;
      }
      setTimeout(
        (/* @__PURE__ */ __name(function retryTimeout() {
          if (client.explicitlyDisconnected) {
            return;
          }
          client.retriesRemaining--;
          client.connect();
        }, "retryTimeout")).bind(null, client),
        client.config.retry
      );
      client.publish("disconnect");
    }, "connectionClosed")
  );
  client.socket.on(
    "data",
    function(data) {
      client.log("## received events ##");
      if (client.config.rawBuffer) {
        client.publish(
          "data",
          Buffer.from(data, client.config.encoding)
        );
        if (!client.config.sync) {
          return;
        }
        client.queue.next();
        return;
      }
      if (!this.ipcBuffer) {
        this.ipcBuffer = "";
      }
      data = this.ipcBuffer += data;
      if (data.slice(-1) != eventParser.delimiter || data.indexOf(eventParser.delimiter) == -1) {
        client.log("Messages are large, You may want to consider smaller messages.");
        return;
      }
      this.ipcBuffer = "";
      const events = eventParser.parse(data);
      const eCount = events.length;
      for (let i = 0; i < eCount; i++) {
        let message = new import_js_message.default();
        message.load(events[i]);
        client.log("detected event", message.type, message.data);
        client.publish(
          message.type,
          message.data
        );
      }
      if (!client.config.sync) {
        return;
      }
      client.queue.next();
    }
  );
}
__name(connect, "connect");
var import_js_message2 = __toESM(require_Message(), 1);
var eventParser2 = new Parser();
var Server = class extends EventPubSub {
  static {
    __name(this, "Server");
  }
  constructor(path3, config, log2, port) {
    super();
    this.config = config;
    this.path = path3;
    this.port = port;
    this.log = log2;
    this.publish = super.emit;
    eventParser2 = new Parser(this.config);
    this.on(
      "close",
      serverClosed.bind(this)
    );
  }
  udp4 = false;
  udp6 = false;
  server = false;
  sockets = [];
  emit = emit2;
  broadcast = broadcast;
  onStart(socket) {
    this.publish(
      "start",
      socket
    );
  }
  stop() {
    this.server.close();
  }
  start() {
    if (!this.path) {
      this.log("Socket Server Path not specified, refusing to start");
      return;
    }
    if (this.config.unlink) {
      fs2.unlink(
        this.path,
        startServer.bind(this)
      );
    } else {
      startServer.bind(this)();
    }
  }
};
function emit2(socket, type, data) {
  this.log("dispatching event to socket", " : ", type, data);
  let message = new import_js_message2.default();
  message.type = type;
  message.data = data;
  if (this.config.rawBuffer) {
    this.log(this.config.encoding);
    message = Buffer.from(type, this.config.encoding);
  } else {
    message = eventParser2.format(message);
  }
  if (this.udp4 || this.udp6) {
    if (!socket.address || !socket.port) {
      this.log("Attempting to emit to a single UDP socket without supplying socket address or port. Redispatching event as broadcast to all connected sockets");
      this.broadcast(type, data);
      return;
    }
    this.server.write(
      message,
      socket
    );
    return;
  }
  socket.write(message);
}
__name(emit2, "emit");
function broadcast(type, data) {
  this.log("broadcasting event to all known sockets listening to ", this.path, " : ", this.port ? this.port : "", type, data);
  let message = new import_js_message2.default();
  message.type = type;
  message.data = data;
  if (this.config.rawBuffer) {
    message = Buffer.from(type, this.config.encoding);
  } else {
    message = eventParser2.format(message);
  }
  if (this.udp4 || this.udp6) {
    for (let i = 1, count = this.sockets.length; i < count; i++) {
      this.server.write(message, this.sockets[i]);
    }
  } else {
    for (let i = 0, count = this.sockets.length; i < count; i++) {
      this.sockets[i].write(message);
    }
  }
}
__name(broadcast, "broadcast");
function serverClosed() {
  for (let i = 0, count = this.sockets.length; i < count; i++) {
    let socket = this.sockets[i];
    let destroyedSocketId = false;
    if (socket) {
      if (socket.readable) {
        continue;
      }
    }
    if (socket.id) {
      destroyedSocketId = socket.id;
    }
    this.log("socket disconnected", destroyedSocketId.toString());
    if (socket && socket.destroy) {
      socket.destroy();
    }
    this.sockets.splice(i, 1);
    this.publish("socket.disconnected", socket, destroyedSocketId);
    return;
  }
}
__name(serverClosed, "serverClosed");
function gotData(socket, data, UDPSocket) {
  let sock = this.udp4 || this.udp6 ? UDPSocket : socket;
  if (this.config.rawBuffer) {
    data = Buffer.from(data, this.config.encoding);
    this.publish(
      "data",
      data,
      sock
    );
    return;
  }
  if (!sock.ipcBuffer) {
    sock.ipcBuffer = "";
  }
  data = sock.ipcBuffer += data;
  if (data.slice(-1) != eventParser2.delimiter || data.indexOf(eventParser2.delimiter) == -1) {
    this.log("Messages are large, You may want to consider smaller messages.");
    return;
  }
  sock.ipcBuffer = "";
  data = eventParser2.parse(data);
  while (data.length > 0) {
    let message = new import_js_message2.default();
    message.load(data.shift());
    if (message.data && message.data.id) {
      sock.id = message.data.id;
    }
    this.log("received event of : ", message.type, message.data);
    this.publish(
      message.type,
      message.data,
      sock
    );
  }
}
__name(gotData, "gotData");
function socketClosed(socket) {
  this.publish(
    "close",
    socket
  );
}
__name(socketClosed, "socketClosed");
function serverCreated(socket) {
  this.sockets.push(socket);
  if (socket.setEncoding) {
    socket.setEncoding(this.config.encoding);
  }
  this.log("## socket connection to server detected ##");
  socket.on(
    "close",
    socketClosed.bind(this)
  );
  socket.on(
    "error",
    function(err) {
      this.log("server socket error", err);
      this.publish("error", err);
    }.bind(this)
  );
  socket.on(
    "data",
    gotData.bind(this, socket)
  );
  socket.on(
    "message",
    function(msg, rinfo) {
      if (!rinfo) {
        return;
      }
      this.log("Received UDP message from ", rinfo.address, rinfo.port);
      let data;
      if (this.config.rawSocket) {
        data = Buffer.from(msg, this.config.encoding);
      } else {
        data = msg.toString();
      }
      socket.emit("data", data, rinfo);
    }.bind(this)
  );
  this.publish(
    "connect",
    socket
  );
  if (this.config.rawBuffer) {
    return;
  }
}
__name(serverCreated, "serverCreated");
function startServer() {
  this.log(
    "starting server on ",
    this.path,
    this.port ? `:${this.port}` : ""
  );
  if (!this.udp4 && !this.udp6) {
    this.log("starting TLS server", this.config.tls);
    if (!this.config.tls) {
      this.server = net.createServer(
        serverCreated.bind(this)
      );
    } else {
      startTLSServer.bind(this)();
    }
  } else {
    this.server = dgram.createSocket(
      this.udp4 ? "udp4" : "udp6"
    );
    this.server.write = UDPWrite.bind(this);
    this.server.on(
      "listening",
      (/* @__PURE__ */ __name(function UDPServerStarted() {
        serverCreated.bind(this)(this.server);
      }, "UDPServerStarted")).bind(this)
    );
  }
  this.server.on(
    "error",
    function(err) {
      this.log("server error", err);
      this.publish(
        "error",
        err
      );
    }.bind(this)
  );
  this.server.maxConnections = this.config.maxConnections;
  if (!this.port) {
    this.log("starting server as", "Unix || Windows Socket");
    if (process.platform === "win32") {
      this.path = this.path.replace(/^\//, "");
      this.path = this.path.replace(/\//g, "-");
      this.path = `\\\\.\\pipe\\${this.path}`;
    }
    this.server.listen({
      path: this.path,
      readableAll: this.config.readableAll,
      writableAll: this.config.writableAll
    }, this.onStart.bind(this));
    return;
  }
  if (!this.udp4 && !this.udp6) {
    this.log("starting server as", this.config.tls ? "TLS" : "TCP");
    this.server.listen(
      this.port,
      this.path,
      this.onStart.bind(this)
    );
    return;
  }
  this.log("starting server as", this.udp4 ? "udp4" : "udp6");
  this.server.bind(
    this.port,
    this.path
  );
  this.onStart(
    {
      address: this.path,
      port: this.port
    }
  );
}
__name(startServer, "startServer");
function startTLSServer() {
  this.log("starting TLS server", this.config.tls);
  if (this.config.tls.private) {
    this.config.tls.key = fs2.readFileSync(this.config.tls.private);
  } else {
    this.config.tls.key = fs2.readFileSync(`${__dirname}/../local-node-ipc-certs/private/server.key`);
  }
  if (this.config.tls.public) {
    this.config.tls.cert = fs2.readFileSync(this.config.tls.public);
  } else {
    this.config.tls.cert = fs2.readFileSync(`${__dirname}/../local-node-ipc-certs/server.pub`);
  }
  if (this.config.tls.dhparam) {
    this.config.tls.dhparam = fs2.readFileSync(this.config.tls.dhparam);
  }
  if (this.config.tls.trustedConnections) {
    if (typeof this.config.tls.trustedConnections === "string") {
      this.config.tls.trustedConnections = [this.config.tls.trustedConnections];
    }
    this.config.tls.ca = [];
    for (let i = 0; i < this.config.tls.trustedConnections.length; i++) {
      this.config.tls.ca.push(
        fs2.readFileSync(this.config.tls.trustedConnections[i])
      );
    }
  }
  this.server = tls.createServer(
    this.config.tls,
    serverCreated.bind(this)
  );
}
__name(startTLSServer, "startTLSServer");
function UDPWrite(message, socket) {
  let data = Buffer.from(message, this.config.encoding);
  this.server.send(
    data,
    0,
    data.length,
    socket.port,
    socket.address,
    function(err, bytes) {
      if (err) {
        this.log("error writing data to socket", err);
        this.publish(
          "error",
          function(err2) {
            this.publish("error", err2);
          }
        );
      }
    }
  );
}
__name(UDPWrite, "UDPWrite");
var IPC = class {
  static {
    __name(this, "IPC");
  }
  constructor() {
  }
  //public members
  config = new Defaults();
  of = {};
  server = false;
  //protected methods
  get connectTo() {
    return connect2;
  }
  get connectToNet() {
    return connectNet;
  }
  get disconnect() {
    return disconnect;
  }
  get serve() {
    return serve;
  }
  get serveNet() {
    return serveNet;
  }
  get log() {
    return log;
  }
  set connectTo(value) {
    return connect2;
  }
  set connectToNet(value) {
    return connectNet;
  }
  set disconnect(value) {
    return disconnect;
  }
  set serve(value) {
    return serve;
  }
  set serveNet(value) {
    return serveNet;
  }
  set log(value) {
    return log;
  }
};
function log(...args) {
  if (this.config.silent) {
    return;
  }
  for (let i = 0, count = args.length; i < count; i++) {
    if (typeof args[i] != "object") {
      continue;
    }
    args[i] = util.inspect(
      args[i],
      {
        depth: this.config.logDepth,
        colors: this.config.logInColor
      }
    );
  }
  this.config.logger(
    args.join(" ")
  );
}
__name(log, "log");
function disconnect(id) {
  if (!this.of[id]) {
    return;
  }
  this.of[id].explicitlyDisconnected = true;
  this.of[id].off("*", "*");
  if (this.of[id].socket) {
    if (this.of[id].socket.destroy) {
      this.of[id].socket.destroy();
    }
  }
  delete this.of[id];
}
__name(disconnect, "disconnect");
function serve(path3, callback) {
  if (typeof path3 == "function") {
    callback = path3;
    path3 = false;
  }
  if (!path3) {
    this.log(
      "Server path not specified, so defaulting to",
      "ipc.config.socketRoot + ipc.config.appspace + ipc.config.id",
      this.config.socketRoot + this.config.appspace + this.config.id
    );
    path3 = this.config.socketRoot + this.config.appspace + this.config.id;
  }
  if (!callback) {
    callback = emptyCallback;
  }
  this.server = new Server(
    path3,
    this.config,
    log
  );
  this.server.on(
    "start",
    callback
  );
}
__name(serve, "serve");
function emptyCallback() {
}
__name(emptyCallback, "emptyCallback");
function serveNet(host, port, UDPType2, callback) {
  if (typeof host == "number") {
    callback = UDPType2;
    UDPType2 = port;
    port = host;
    host = false;
  }
  if (typeof host == "function") {
    callback = host;
    UDPType2 = false;
    host = false;
    port = false;
  }
  if (!host) {
    this.log(
      "Server host not specified, so defaulting to",
      "ipc.config.networkHost",
      this.config.networkHost
    );
    host = this.config.networkHost;
  }
  if (host.toLowerCase() == "udp4" || host.toLowerCase() == "udp6") {
    callback = port;
    UDPType2 = host.toLowerCase();
    port = false;
    host = this.config.networkHost;
  }
  if (typeof port == "string") {
    callback = UDPType2;
    UDPType2 = port;
    port = false;
  }
  if (typeof port == "function") {
    callback = port;
    UDPType2 = false;
    port = false;
  }
  if (!port) {
    this.log(
      "Server port not specified, so defaulting to",
      "ipc.config.networkPort",
      this.config.networkPort
    );
    port = this.config.networkPort;
  }
  if (typeof UDPType2 == "function") {
    callback = UDPType2;
    UDPType2 = false;
  }
  if (!callback) {
    callback = emptyCallback;
  }
  this.server = new Server(
    host,
    this.config,
    log,
    port
  );
  if (UDPType2) {
    this.server[UDPType2] = true;
    if (UDPType2 === "udp4" && host === "::1") {
      this.server.path = "127.0.0.1";
    }
  }
  this.server.on(
    "start",
    callback
  );
}
__name(serveNet, "serveNet");
function connect2(id, path3, callback) {
  if (typeof path3 == "function") {
    callback = path3;
    path3 = false;
  }
  if (!callback) {
    callback = emptyCallback;
  }
  if (!id) {
    this.log(
      "Service id required",
      "Requested service connection without specifying service id. Aborting connection attempt"
    );
    return;
  }
  if (!path3) {
    this.log(
      "Service path not specified, so defaulting to",
      "ipc.config.socketRoot + ipc.config.appspace + id",
      (this.config.socketRoot + this.config.appspace + id).data
    );
    path3 = this.config.socketRoot + this.config.appspace + id;
  }
  if (this.of[id]) {
    if (!this.of[id].socket.destroyed) {
      this.log(
        "Already Connected to",
        id,
        "- So executing success without connection"
      );
      callback();
      return;
    }
    this.of[id].socket.destroy();
  }
  this.of[id] = new Client(this.config, this.log);
  this.of[id].id = id;
  this.of[id].socket ? this.of[id].socket.id = id : null;
  this.of[id].path = path3;
  this.of[id].connect();
  callback(this);
}
__name(connect2, "connect");
function connectNet(id, host, port, callback) {
  if (!id) {
    this.log(
      "Service id required",
      "Requested service connection without specifying service id. Aborting connection attempt"
    );
    return;
  }
  if (typeof host == "number") {
    callback = port;
    port = host;
    host = false;
  }
  if (typeof host == "function") {
    callback = host;
    host = false;
    port = false;
  }
  if (!host) {
    this.log(
      "Server host not specified, so defaulting to",
      "ipc.config.networkHost",
      this.config.networkHost
    );
    host = this.config.networkHost;
  }
  if (typeof port == "function") {
    callback = port;
    port = false;
  }
  if (!port) {
    this.log(
      "Server port not specified, so defaulting to",
      "ipc.config.networkPort",
      this.config.networkPort
    );
    port = this.config.networkPort;
  }
  if (typeof callback == "string") {
    UDPType = callback;
    callback = false;
  }
  if (!callback) {
    callback = emptyCallback;
  }
  if (this.of[id]) {
    if (!this.of[id].socket.destroyed) {
      this.log(
        "Already Connected to",
        id,
        "- So executing success without connection"
      );
      callback();
      return;
    }
    this.of[id].socket.destroy();
  }
  this.of[id] = new Client(this.config, this.log);
  this.of[id].id = id;
  this.of[id].socket ? this.of[id].socket.id = id : null;
  this.of[id].path = host;
  this.of[id].port = port;
  this.of[id].connect();
  callback(this);
}
__name(connectNet, "connectNet");

// ../../node_modules/.pnpm/@achrinza+node-ipc@10.1.10/node_modules/@achrinza/node-ipc/node-ipc.js
var IPCModule = class extends IPC {
  static {
    __name(this, "IPCModule");
  }
  constructor() {
    super();
  }
  IPC = IPC;
};
var singleton = new IPCModule();
function createDebugTimer(debugScope = "debug") {
  let lastTimerAt;
  const debug3 = Debug(debugScope);
  return (label) => {
    if (!lastTimerAt) {
      lastTimerAt = +/* @__PURE__ */ new Date();
      debug3(`\u23F1\uFE0F ${label} - start`);
    } else {
      const now = +/* @__PURE__ */ new Date();
      const duration = now - lastTimerAt;
      debug3(`\u23F1\uFE0F ${label} - ${duration}ms`);
      lastTimerAt = now;
    }
  };
}
__name(createDebugTimer, "createDebugTimer");
function applyMods(str, mods) {
  if (!mods)
    return str;
  if (_5.isArray(mods)) {
    let modStr = str;
    _5.each(mods, (mod) => {
      modStr = kleur[mod](modStr);
    });
    return modStr;
  }
  return kleur[mods](str);
}
__name(applyMods, "applyMods");
function formattedValue(val, showType = false) {
  let strVal = "";
  let strType = "";
  let mods;
  if (_5.isBoolean(val)) {
    strVal = val.toString();
    mods = ["yellow", "italic"];
    strType = "boolean";
  } else if (_5.isNumber(val)) {
    strVal = val.toString();
    mods = "yellow";
    strType = "number";
  } else if (_5.isString(val)) {
    strVal = `"${val}"`;
    strType = "string";
  } else if (_5.isPlainObject(val)) {
    strVal = JSON.stringify(val);
    strType = "object";
  } else if (val === null) {
    strVal = "null";
    mods = "gray";
  } else if (val === void 0) {
    strVal = "undefined";
    mods = "gray";
  }
  return [
    applyMods(strVal, mods),
    showType && strType ? kleur.gray(` (${strType})`) : ""
  ].join("");
}
__name(formattedValue, "formattedValue");
function formatError(err) {
  let whenStr = "";
  if (err.type === "SchemaError") {
    whenStr += "during schema initialization";
  }
  if (err.type === "ValidationError") {
    whenStr += "during validation";
  }
  if (err.type === "CoercionError") {
    whenStr += "during coercion";
  }
  if (err.type === "ResolutionError") {
    whenStr += "during resolution";
  }
  let errStr = `${err.icon} ${err.message}`;
  if (err.isUnexpected) {
    errStr += kleur.gray().italic(`
   (unexpected error${whenStr ? ` ${whenStr}` : ""})`);
    if ("stack" in err)
      errStr += err.stack;
  }
  return errStr;
}
__name(formatError, "formatError");
function joinAndCompact(strings, joinChar = " ") {
  return strings.filter((s) => !!s).join(joinChar);
}
__name(joinAndCompact, "joinAndCompact");
function getItemSummary(item) {
  const summary = [];
  const icon = item.coercionError?.icon || item.resolutionError?.icon || item?.validationErrors?.[0]?.icon || "\u2705";
  const isSensitive = item.dataType?.sensitive;
  const isRequired = item.dataType?.required;
  summary.push(joinAndCompact([
    icon,
    kleur[item.isValid ? "cyan" : "red"](item.key) + (isRequired ? kleur.magenta("*") : ""),
    // kleur.gray(`[type = ${item.type.getDefItem('typeLabel')}]`),
    isSensitive && ` \u{1F510}${kleur.italic().gray("sensitive")}`
  ]));
  summary.push(joinAndCompact([
    kleur.gray("   \u2514"),
    isSensitive && item.resolvedValue ? `"${item.resolvedValue.toString().substring(0, 2)}${kleur.bold("\u2592".repeat(10))}"` : formattedValue(item.resolvedValue, false),
    // item.resolvedRawValue !== item.resolvedValue && kleur.gray().italic('(coerced)'),
    // TODO: redact rawValue if sensitive?
    !_5.isEqual(item.resolvedRawValue, item.resolvedValue) && kleur.gray().italic("< coerced from ") + formattedValue(item.resolvedRawValue, false)
  ]));
  const errors = _5.compact([item.coercionError, item.resolutionError, ...item.validationErrors || []]);
  errors?.forEach((err) => {
    summary.push(kleur.red(`   - ${err.message}`));
  });
  return summary.join("\n");
}
__name(getItemSummary, "getItemSummary");
async function pathExists(p) {
  try {
    await fs2.promises.access(p);
    return true;
  } catch {
    return false;
  }
}
__name(pathExists, "pathExists");
function pathExistsSync(p) {
  try {
    fs2.accessSync(p);
    return true;
  } catch {
    return false;
  }
}
__name(pathExistsSync, "pathExistsSync");
var PACKAGE_MANAGER_RELEVANT_FILES = {
  packageJson: "package.json",
  yarnLock: "yarn.lock",
  npmLock: "package-lock.json",
  pnpmLock: "pnpm-lock.yaml",
  pnpmWorkspace: "pnpm-workspace.yaml",
  bunLock: "bun.lockb",
  moonWorkspace: ".moon/workspace.yml"
};
async function detectPackageManager() {
  let cwd = process.cwd();
  const cwdParts = cwd.split("/");
  let packageManager;
  let possibleRootPackage;
  while (!packageManager) {
    const filesFound = await asyncMapValues(
      PACKAGE_MANAGER_RELEVANT_FILES,
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      async (filePath) => pathExists(path2.resolve(cwd, filePath))
    );
    if (filesFound.packageJson)
      possibleRootPackage = cwd;
    if (filesFound.pnpmLock || filesFound.pnpmWorkspace)
      packageManager = "pnpm";
    else if (filesFound.npmLock)
      packageManager = "npm";
    else if (filesFound.yarnLock)
      packageManager = "yarn";
    else if (filesFound.bunLock)
      packageManager = "bun";
    else if (filesFound.moonWorkspace)
      packageManager = "moon";
    if (!packageManager) {
      cwdParts.pop();
      cwd = cwdParts.join("/");
    }
    if (cwd === "") {
      console.log(kleur.red("Unable to find detect your package manager and workspace root!"));
      if (possibleRootPackage) {
        console.log(`But it looks like your workspace root might be ${kleur.green().italic(possibleRootPackage)}`);
      }
      console.log("We look for lock files (ex: package-lock.json) so you may just need to run a dependency install (ie `npm install`)");
      process.exit(1);
    }
  }
  return {
    packageManager,
    rootWorkspacePath: cwd
  };
}
__name(detectPackageManager, "detectPackageManager");
function detectPackageManagerSync() {
  let cwd = process.cwd();
  const cwdParts = cwd.split("/");
  let packageManager;
  let possibleRootPackage;
  while (!packageManager) {
    const filesFound = {};
    for (const fileKey of Object.keys(PACKAGE_MANAGER_RELEVANT_FILES)) {
      const key = fileKey;
      const filePath = path2.resolve(cwd, PACKAGE_MANAGER_RELEVANT_FILES[key]);
      filesFound[key] = pathExistsSync(filePath);
    }
    if (filesFound.packageJson)
      possibleRootPackage = cwd;
    if (filesFound.pnpmLock || filesFound.pnpmWorkspace)
      packageManager = "pnpm";
    else if (filesFound.npmLock)
      packageManager = "npm";
    else if (filesFound.yarnLock)
      packageManager = "yarn";
    else if (filesFound.bunLock)
      packageManager = "bun";
    else if (filesFound.moonWorkspace)
      packageManager = "moon";
    if (!packageManager) {
      cwdParts.pop();
      cwd = cwdParts.join("/");
    }
    if (cwd === "") {
      console.log(kleur.red("Unable to find detect your package manager and workspace root!"));
      if (possibleRootPackage) {
        console.log(`But it looks like your workspace root might be ${kleur.green().italic(possibleRootPackage)}`);
      }
      console.log("We look for lock files (ex: package-lock.json) so you may just need to run a dependency install (ie `npm install`)");
      process.exit(1);
    }
  }
  return {
    packageManager,
    rootWorkspacePath: cwd
  };
}
__name(detectPackageManagerSync, "detectPackageManagerSync");

export { CoercionError, ConfigLoadError, ConfigPath, ConfigValueResolver2 as ConfigValueResolver, DmnoBaseTypes, DmnoConfigItem, DmnoConfigItemBase, DmnoDataType, DmnoPickedConfigItem, DmnoPlugin, DmnoPluginInputItem, DmnoService, DmnoWorkspace, InjectPluginInputByType, NodeEnvType, OverrideSource, ResolutionError, ResolverContext, SchemaError, ValidationError, _PluginInputTypesSymbol, asyncEachLimit, beginServiceLoadPlugins, beginWorkspaceLoadPlugins, cacheFunctionResult, checkIsFileGitIgnored, configPath, createDebugTimer, createDmnoDataType, createResolver, createdPickedValueResolver, defineDmnoService, defineDmnoWorkspace, detectPackageManager, detectPackageManagerSync, finishServiceLoadPlugins, formatError, formattedValue, getItemSummary, joinAndCompact, loadDotEnvIntoObject, loadServiceDotEnvFiles, parseDotEnvContents, processInlineResolverDef, singleton };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=chunk-FI7BWWVA.mjs.map