/** @namespace utils */

const assert = require('assert');
const { Long } = require('bytebuffer');

module.exports = {
  ULong,
  isName,
  encodeName, // encode human readable name to uint64 (number string)
  decodeName, // decode from uint64 to human readable
  encodeNameEx,// encode human readable name_ex to uint64 (number string)
  decodeNameEx,// encode human readable name_ex to uint64 (number string)
  encodeNameHex: name => Long.fromString(encodeName(name), true).toString(16),
  decodeNameHex: (hex, littleEndian = true) =>
    decodeName(Long.fromString(hex, true, 16).toString(), littleEndian),
  UDecimalString,
  UDecimalPad,
  UDecimalImply,
  UDecimalUnimply,

  DecimalString,
  DecimalPad,
  DecimalImply,
  DecimalUnimply,
  printAsset,
  parseAsset,

  parseExtendedAsset
};

/**
 * @function
 * @memberOf utils
 * @param value
 * @param unsigned
 * @param radix
 * @returns {*}
 */
function ULong(value, unsigned = true, radix = 10) {
  if (typeof value === 'number') {
    // Some JSON libs use numbers for values under 53 bits or strings for larger.
    // Accomidate but double-check it..
    if (value > Number.MAX_SAFE_INTEGER)
      throw new TypeError('value parameter overflow');

    value = Long.fromString(String(value), unsigned, radix);
  } else if (typeof value === 'string') {
    value = Long.fromString(value, unsigned, radix);
  } else if (!Long.isLong(value)) {
    throw new TypeError('value parameter is a requied Long, Number or String');
  }
  return value;
}

/**
 * @memberOf utils
 * @param str
 * @param err
 * @returns {boolean}
 */
function isName(str, err) {
  try {
    encodeName(str);
    return true;
  } catch (error) {
    if (err) {
      err(error);
    }
    return false;
  }
}

const charmap = '.12345abcdefghijklmnopqrstuvwxyz';
const charidx = ch => {
  const idx = charmap.indexOf(ch);
  if (idx === -1)
    throw new TypeError(`Invalid character: '${ch}'`);

  return idx;
};

/**
 * @memberOf utils
 * @param name
 * @param littleEndian
 * @returns {string}
 */
function encodeName(name, littleEndian = true) {
  if (typeof name !== 'string')
    throw new TypeError('name parameter is a required string');

  if (name.length > 12)
    throw new TypeError('A name can be up to 12 characters long');

  let bitstr = '';
  for (let i = 0; i <= 12; i++) { // process all 64 bits (even if name is short)
    const c = i < name.length ? charidx(name[i]) : 0;
    const bitlen = i < 12 ? 5 : 4;
    let bits = Number(c).toString(2);
    if (bits.length > bitlen) {
      throw new TypeError('Invalid name ' + name);
    }
    bits = '0'.repeat(bitlen - bits.length) + bits;
    bitstr += bits;
  }

  const value = Long.fromString(bitstr, true, 2);

  // convert to LITTLE_ENDIAN
  let leHex = '';
  const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
  for (const b of bytes) {
    const n = Number(b).toString(16);
    leHex += (n.length === 1 ? '0' : '') + n;
  }

  const ulName = Long.fromString(leHex, true, 16).toString();

  // console.log('encodeName', name, value.toString(), ulName.toString(), JSON.stringify(bitstr.split(/(.....)/).slice(1)))

  return ulName.toString();
}

/**
 * @memberOf utils
 * @param value
 * @param littleEndian
 * @returns {string | string}
 */
function decodeName(value, littleEndian = true) {
  value = ULong(value);

  // convert from LITTLE_ENDIAN
  let beHex = '';
  const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
  for (const b of bytes) {
    const n = Number(b).toString(16);
    beHex += (n.length === 1 ? '0' : '') + n;
  }
  beHex += '0'.repeat(16 - beHex.length);

  const fiveBits = Long.fromNumber(0x1f, true);
  const fourBits = Long.fromNumber(0x0f, true);
  const beValue = Long.fromString(beHex, true, 16);

  let str = '';
  let tmp = beValue;

  for (let i = 0; i <= 12; i++) {
    const c = charmap[tmp.and(i === 0 ? fourBits : fiveBits)];
    str = c + str;
    tmp = tmp.shiftRight(i === 0 ? 4 : 5);
  }
  str = str.replace(/\.+$/, ''); // remove trailing dots (all of them)

  return str;
}

const NameExMapStr = '._0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NameExIndex = ch => {
  const idx = NameExMapStr.indexOf(ch);
  if (idx === -1)
    throw new TypeError(`Invalid character for NameEx: '${ch}'`);

  return idx;
};

/**
 * @memberOf utils
 * @param name
 * @param littleEndian
 */
function encodeNameEx(name, littleEndian = true) {
  if (typeof name !== 'string')
    throw new TypeError('name parameter is a required string');

  if (name.length > 21)
    throw new TypeError('A name_ex can be up to 21 characters long');

  let convert = str => {
    const value = Long.fromString(str, true, 2);

    // convert to LITTLE_ENDIAN
    let leHex = '';
    const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    for (const b of bytes) {
      const n = Number(b).toString(16);
      leHex += (n.length === 1 ? '0' : '') + n;
    }

    const ulName = Long.fromString(leHex, true, 16).toString();

    // console.log('encodeName', name, value.toString(), ulName.toString(), JSON.stringify(bitstr.split(/(.....)/).slice(1)))

    return ulName.toString();
  };

  let bitstr = '';
  let result = {};

  for (let i = 0; i <= 20; i++) { // process all 64 bits (even if name is short)
    const c = i < name.length ? NameExIndex(name[i]) : 0;
    const bitlen = 6;
    let bits = Number(c).toString(2);
    if (bits.length > bitlen) {
      throw new TypeError('Invalid name_ex ' + name);
    }
    bits = '0'.repeat(bitlen - bits.length) + bits;

    if (i <= 9) {
      bitstr = bits + bitstr;

    } else if (i == 10) {
      let lowFourBits = bits.substring(2); // low four bits
      bitstr = lowFourBits + bitstr;
      result.valL = convert(bitstr);

      bitstr = bits.substring(0, 2); // up two bits
    } else {
      bitstr = bits + bitstr;
    }
  }

  result.valH = convert(bitstr);
  return result;
}

/**
 * @memberOf utils
 * @param valueH
 * @param valueL
 * @param littleEndian
 * @returns {string | string}
 */
function decodeNameEx(valueH, valueL, littleEndian = true) {
  let convert = value => {
    value = ULong(value);

    // convert from LITTLE_ENDIAN
    let beHex = '';
    const bytes = littleEndian ? value.toBytesLE() : value.toBytesBE();
    for (const b of bytes) {
      const n = Number(b).toString(16);
      beHex += (n.length === 1 ? '0' : '') + n;
    }
    beHex += '0'.repeat(16 - beHex.length);

    const beValue = Long.fromString(beHex, true, 16);

    return beValue;
  };

  const sixBits = Long.fromNumber(0x3f, true);
  const twoBits = Long.fromNumber(0x3, true);

  let str = '';
  let tmpH = convert(valueH);
  let tmpL = convert(valueL);

  for (let i = 0; i <= 20; i++) {
    let c = '';
    if (i <= 9) {
      c = NameExMapStr[tmpL.and(sixBits)];
      tmpL = tmpL.shiftRight(6);
    } else if (i == 10) {
      let htb = tmpH.and(twoBits);
      htb = htb.shiftLeft(4);
      htb = htb.and(tmpL);

      c = NameExMapStr[htb];
      tmpH = tmpH.shiftRight(2);
    } else {
      c = NameExMapStr[tmpH.and(sixBits)];
      tmpH = tmpH.shiftRight(6);
    }
    str = str + c;
  }
  str = str.replace(/\.+$/, ''); // remove trailing dots (all of them)

  return str;
}

/**
 * @function
 * @memberOf utils
 * @param value
 * @returns {string}
 */
function UDecimalString(value) {
  assert(value != null, 'value is required');
  value = value === 'object' && value.toString ? value.toString() : String(value);

  if (value[0] === '.') {
    value = `0${value}`;
  }

  const part = value.split('.');
  assert(part.length <= 2, `invalid decimal ${value}`);
  assert(/^\d+(,?\d)*\d*$/.test(part[0]), `invalid decimal ${value}`);

  if (part.length === 2) {
    assert(/^\d*$/.test(part[1]), `invalid decimal ${value}`);
    part[1] = part[1].replace(/0+$/, '');// remove suffixing zeros
    if (part[1] === '') {
      part.pop();
    }
  }

  part[0] = part[0].replace(/^0*/, '');// remove leading zeros
  if (part[0] === '') {
    part[0] = '0';
  }
  return part.join('.');
}

/**
 * @function
 * @memberOf utils
 * @param num
 * @param precision
 * @returns {*}
 */
function UDecimalPad(num, precision) {
  const value = UDecimalString(num);
  if (precision == null) {
    return num;
  }

  assert(precision >= 0 && precision <= 18, `Precision should be 18 characters or less`);

  const part = value.split('.');

  if (precision === 0 && part.length === 1) {
    return part[0];
  }

  if (part.length === 1) {
    return `${part[0]}.${'0'.repeat(precision)}`;
  } else {
    const pad = precision - part[1].length;
    assert(pad >= 0, `decimal '${value}' exceeds precision ${precision}`);
    return `${part[0]}.${part[1]}${'0'.repeat(pad)}`;
  }
}

/**
 * @function
 * Ensures proper trailing zeros then removes decimal place
 * @memberOf utils
 * @param value
 * @param precision
 * @returns {*}
 */
function UDecimalImply(value, precision) {
  return UDecimalPad(value, precision).replace('.', '');
}

/**
 * @function
 * @memberOf utils
 * @param value
 * @param precision
 * @returns {*}
 */
function UDecimalUnimply(value, precision) {
  assert(value != null, 'value is required');
  value = value === 'object' && value.toString ? value.toString() : String(value);
  assert(/^\d+$/.test(value), `invalid whole number ${value}`);
  assert(precision != null, 'precision required');
  assert(precision >= 0 && precision <= 18, `Precision should be 18 characters or less`);

  // Ensure minimum length
  const pad = precision - value.length;
  if (pad > 0) {
    value = `${'0'.repeat(pad)}${value}`;
  }

  const dotIdx = value.length - precision;
  value = `${value.slice(0, dotIdx)}.${value.slice(dotIdx)}`;
  return UDecimalPad(value, precision); // Normalize
}

/**
 * @memberOf utils
 * @param str
 * @returns {{amount: null, precision: any, symbol: null, contract: null}}
 */
function parseExtendedAsset(str) {
  const [amountRaw] = str.split(' ');
  const amountMatch = amountRaw.match(/^([0-9]+(\.[0-9]+)?)( |$)/);
  const amount = amountMatch ? amountMatch[1] : null;

  const precisionMatch = str.match(/(^| )([0-9]+),([A-Z]+)(@|$)/);
  const precision = precisionMatch ? Number(precisionMatch[2]) : null;

  const symbolMatch = str.match(/(^| |,)([A-Z]+)(@|$)/);
  const symbol = symbolMatch ? symbolMatch[2] : null;

  const [, contractRaw] = str.split('@');
  const contract = /^[a-z0-5]+(\.[a-z0-5]+)*$/.test(contractRaw) ? contractRaw : null;

  const join = (e1, e2) => e1 == null ? '' : e2 == null ? '' : e1 + e2;
  const asset = join(precision, ',') + symbol;
  const check = join(amount, ' ') + asset + join('@', contract);
  assert.equal(str, check, `Invalid extended asset string: ${str} !== ${check}`);

  if (precision != null) {
    assert(precision >= 0 && precision <= 18, `Precision should be 18 characters or less`);
  }
  if (symbol != null) {
    assert(symbol.length <= 7, `Asset symbol is 7 characters or less`);
  }
  if (contract != null) {
    assert(contract.length <= 12, `Contract is 12 characters or less`);
  }

  const extendedAsset = join(symbol, '') + join('@', contract);
  return { amount, precision, symbol, contract };
}


/**
 Normalize and validate decimal string (potentially large values).  Should
 avoid internationalization issues if possible but will be safe and
 throw an error for an invalid number.
 Normalization removes extra zeros or decimal.
 @return {string} value
 @function
 @memberOf utils
 */
function DecimalString(value) {
  assert(value != null, 'value is required');
  value = value === 'object' && value.toString ? value.toString() : String(value);

  const neg = /^-/.test(value);
  if (neg) {
    value = value.substring(1);
  }

  if (value[0] === '.') {
    value = `0${value}`;
  }

  const part = value.split('.');
  assert(part.length <= 2, `invalid decimal ${value}`);
  assert(/^\d+(,?\d)*\d*$/.test(part[0]), `invalid decimal ${value}`);

  if (part.length === 2) {
    assert(/^\d*$/.test(part[1]), `invalid decimal ${value}`);
    part[1] = part[1].replace(/0+$/, '');// remove suffixing zeros
    if (part[1] === '') {
      part.pop();
    }
  }

  part[0] = part[0].replace(/^0*/, '');// remove leading zeros
  if (part[0] === '') {
    part[0] = '0';
  }
  return (neg ? '-' : '') + part.join('.');
}

/**
 Ensure a fixed number of decimal places.  Safe for large numbers.
 @see ./format.test.js
 @example DecimalPad(10.2, 3) === '10.200'
 @arg {number|string|object.toString} num
 @arg {number} [precision = null] - number of decimal places.  Null skips
 padding suffix but still applies number format normalization.
 @return {string} decimal part is added and zero padded to match precision
 @function
 @memberOf utils
 */
function DecimalPad(num, precision) {
  const value = DecimalString(num);
  if (precision == null) {
    return value;
  }

  assert(precision >= 0 && precision <= 18, `Precision should be 18 characters or less`);

  const part = value.split('.');

  if (precision === 0 && part.length === 1) {
    return part[0];
  }

  if (part.length === 1) {
    return `${part[0]}.${'0'.repeat(precision)}`;
  } else {
    const pad = precision - part[1].length;
    assert(pad >= 0, `decimal '${value}' exceeds precision ${precision}`);
    return `${part[0]}.${part[1]}${'0'.repeat(pad)}`;
  }
}

/**
 * Ensures proper trailing zeros then removes decimal place.
 * @function
 * @memberOf utils
 * @param value
 * @param precision
 * @returns {string}
 */
function DecimalImply(value, precision) {
  return DecimalPad(value, precision).replace('.', '');
}

/**
 Put the decimal place back in its position and return the normalized number
 string (with any unnecessary zeros or an unnecessary decimal removed).
 * @arg {string|number|value.toString} value 10000
 * @arg {number} precision 4
 * @return {number} 1.0000
 * @function
 * @memberOf utils
 */
function DecimalUnimply(value, precision) {
  assert(value != null, 'value is required');
  value = value === 'object' && value.toString ? value.toString() : String(value);
  const neg = /^-/.test(value);
  if (neg) {
    value = value.substring(1);
  }
  assert(/^\d+$/.test(value), `invalid whole number ${value}`);
  assert(precision != null, 'precision required');
  assert(precision >= 0 && precision <= 18, `Precision should be 18 characters or less`);

  // Ensure minimum length
  const pad = precision - value.length;
  if (pad > 0) {
    value = `${'0'.repeat(pad)}${value}`;
  }

  const dotIdx = value.length - precision;
  value = `${value.slice(0, dotIdx)}.${value.slice(dotIdx)}`;
  return (neg ? '-' : '') + DecimalPad(value, precision); // Normalize
}

/** @private for now, support for asset strings is limited
 */
function printAsset({ amount, precision, symbol, contract }) {
  assert.equal(typeof symbol, 'string', 'symbol is a required string');

  if (amount != null && precision != null) {
    amount = DecimalPad(amount, precision);
  }

  const join = (e1, e2) => e1 == null ? '' : e2 == null ? '' : e1 + e2;

  if (amount != null) {
    // the amount contains the precision
    return join(amount, ' ') + symbol + join('@', contract);
  }

  return join(precision, ',') + symbol + join('@', contract);
}

/**
 Attempts to parse all forms of the asset strings (symbol, asset, or extended
 versions).  If the provided string contains any additional or appears to have
 invalid information an error is thrown.
 @return {object} {amount, precision, symbol, contract}
 @throws AssertionError
 @memberOf utils
 */
function parseAsset(str) {
  const [amountRaw] = str.split(' ');
  const amountMatch = amountRaw.match(/^(-?[0-9]+(\.[0-9]+)?)( |$)/);
  const amount = amountMatch ? amountMatch[1] : null;

  const precisionMatch = str.match(/(^| )([0-9]+),([A-Z]+)(@|$)/);
  const precisionSymbol = precisionMatch ? Number(precisionMatch[2]) : null;
  const precisionAmount = amount ? (amount.split('.')[1] || '').length : null;
  const precision = precisionSymbol != null ? precisionSymbol : precisionAmount;

  const symbolMatch = str.match(/(^| |,)([A-Z]+)(@|$)/);
  const symbol = symbolMatch ? symbolMatch[2] : null;

  const [, contractRaw = ''] = str.split('@');
  const contract = /^[a-z0-5]+(\.[a-z0-5]+)*$/.test(contractRaw) ? contractRaw : null;

  const check = printAsset({ amount, precision, symbol, contract });

  assert.equal(str, check, `Invalid asset string: ${str} !== ${check}`);

  if (precision != null) {
    assert(precision >= 0 && precision <= 18, `Precision should be 18 characters or less`);
  }
  if (symbol != null) {
    assert(symbol.length <= 7, `Asset symbol is 7 characters or less`);
  }
  if (contract != null) {
    assert(contract.length <= 12, `Contract is 12 characters or less`);
  }

  return { amount, precision, symbol, contract };
}