/**
 * This script tests the correspondence of the TypeScript declaration to the actual package.
 * If the TypeScript compiles this file and it can then be successfully executed by Node,
 * we can with some degree of certainty tell that the TS declaration is correct.
 */

import * as chai from 'chai';
import chaiBytes from 'chai-bytes';
import {
  to5BitArray,
  from5BitArray,
  encode5BitArray,
  decodeTo5BitArray,
  encode,
  decode,
  BitcoinAddress,
  FiveBitArray,
} from '..';

// `assert` is easier to type-check than `expect`.
const { assert } = chai.use(chaiBytes);

function testArrayConverter() {
  const buffer = Uint8Array.from([1, 2, 3, 4, 5]);
  const fiveBitsBuffer: FiveBitArray = to5BitArray(buffer);
  assert.lengthOf(fiveBitsBuffer,8);
  const bufferCopy = from5BitArray(fiveBitsBuffer);
  assert.equalBytes(bufferCopy, buffer);
}

function testArrayEncoder() {
  const buffer = Uint8Array.from([1, 2, 3, 4, 5]);
  const fiveBitsBuffer: FiveBitArray = to5BitArray(buffer);
  const encoded: string = encode5BitArray('foo', fiveBitsBuffer);
  assert(encoded.startsWith('foo1'));
  const { prefix, data } = decodeTo5BitArray(encoded);
  assert.equal(prefix, 'foo');
  assert(data.every((byte, i) => byte === fiveBitsBuffer[i]));
}

function testEncoder() {
  const buffer = Uint8Array.from([0, 1, 2, 3, 4]);
  const encoded: string = encode('test', buffer);
  const { prefix, data: decoded } = decode(encoded);
  assert.equal(prefix, 'test');
  assert.equalBytes(decoded, buffer);
}

function testBitcoinAddress() {
  let address = new BitcoinAddress('tb', 0, new Uint8Array(20));
  assert((<string> address.encode()).startsWith('tb1'));
  assert.equal(address.data.length, 20);
  assert.equal(address.prefix, 'tb');
  assert.equal(address.scriptVersion, 0);

  address = BitcoinAddress.decode('BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4');
  assert.equal(address.data.length, 20);
  assert.equal(address.prefix, 'bc');
  assert.equal(address.scriptVersion, 0);
  assert.equal(address.type(), 'p2wpkh');
}

testArrayConverter();
testArrayEncoder();
testEncoder();
testBitcoinAddress();
