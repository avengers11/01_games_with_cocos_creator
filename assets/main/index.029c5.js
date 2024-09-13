window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
        o = b;
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  1: [ function(require, module, exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = "undefined" !== typeof Uint8Array ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len = b64.length;
      if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
      var validLen = b64.indexOf("=");
      -1 === validLen && (validLen = len);
      var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
      return [ validLen, placeHoldersLen ];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return 3 * (validLen + placeHoldersLen) / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i;
      for (i = 0; i < len; i += 4) {
        tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      if (2 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
        arr[curByte++] = 255 & tmp;
      }
      if (1 === placeHoldersLen) {
        tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = 255 & tmp;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[63 & num];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (255 & uint8[i + 2]);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len = uint8.length;
      var extraBytes = len % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
      if (1 === extraBytes) {
        tmp = uint8[len - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (2 === extraBytes) {
        tmp = (uint8[len - 2] << 8) + uint8[len - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }, {} ],
  2: [ function(require, module, exports) {
    (function(global) {
      "use strict";
      var base64 = require("base64-js");
      var ieee754 = require("ieee754");
      var isArray = require("isarray");
      exports.Buffer = Buffer;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.TYPED_ARRAY_SUPPORT = void 0 !== global.TYPED_ARRAY_SUPPORT ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();
      exports.kMaxLength = kMaxLength();
      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1);
          arr.__proto__ = {
            __proto__: Uint8Array.prototype,
            foo: function() {
              return 42;
            }
          };
          return 42 === arr.foo() && "function" === typeof arr.subarray && 0 === arr.subarray(1, 1).byteLength;
        } catch (e) {
          return false;
        }
      }
      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
      }
      function createBuffer(that, length) {
        if (kMaxLength() < length) throw new RangeError("Invalid typed array length");
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = new Uint8Array(length);
          that.__proto__ = Buffer.prototype;
        } else {
          null === that && (that = new Buffer(length));
          that.length = length;
        }
        return that;
      }
      function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) return new Buffer(arg, encodingOrOffset, length);
        if ("number" === typeof arg) {
          if ("string" === typeof encodingOrOffset) throw new Error("If encoding is specified then the first argument must be a string");
          return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
      }
      Buffer.poolSize = 8192;
      Buffer._augment = function(arr) {
        arr.__proto__ = Buffer.prototype;
        return arr;
      };
      function from(that, value, encodingOrOffset, length) {
        if ("number" === typeof value) throw new TypeError('"value" argument must not be a number');
        if ("undefined" !== typeof ArrayBuffer && value instanceof ArrayBuffer) return fromArrayBuffer(that, value, encodingOrOffset, length);
        if ("string" === typeof value) return fromString(that, value, encodingOrOffset);
        return fromObject(that, value);
      }
      Buffer.from = function(value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
      };
      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype;
        Buffer.__proto__ = Uint8Array;
        "undefined" !== typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, {
          value: null,
          configurable: true
        });
      }
      function assertSize(size) {
        if ("number" !== typeof size) throw new TypeError('"size" argument must be a number');
        if (size < 0) throw new RangeError('"size" argument must not be negative');
      }
      function alloc(that, size, fill, encoding) {
        assertSize(size);
        if (size <= 0) return createBuffer(that, size);
        if (void 0 !== fill) return "string" === typeof encoding ? createBuffer(that, size).fill(fill, encoding) : createBuffer(that, size).fill(fill);
        return createBuffer(that, size);
      }
      Buffer.alloc = function(size, fill, encoding) {
        return alloc(null, size, fill, encoding);
      };
      function allocUnsafe(that, size) {
        assertSize(size);
        that = createBuffer(that, size < 0 ? 0 : 0 | checked(size));
        if (!Buffer.TYPED_ARRAY_SUPPORT) for (var i = 0; i < size; ++i) that[i] = 0;
        return that;
      }
      Buffer.allocUnsafe = function(size) {
        return allocUnsafe(null, size);
      };
      Buffer.allocUnsafeSlow = function(size) {
        return allocUnsafe(null, size);
      };
      function fromString(that, string, encoding) {
        "string" === typeof encoding && "" !== encoding || (encoding = "utf8");
        if (!Buffer.isEncoding(encoding)) throw new TypeError('"encoding" must be a valid string encoding');
        var length = 0 | byteLength(string, encoding);
        that = createBuffer(that, length);
        var actual = that.write(string, encoding);
        actual !== length && (that = that.slice(0, actual));
        return that;
      }
      function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : 0 | checked(array.length);
        that = createBuffer(that, length);
        for (var i = 0; i < length; i += 1) that[i] = 255 & array[i];
        return that;
      }
      function fromArrayBuffer(that, array, byteOffset, length) {
        array.byteLength;
        if (byteOffset < 0 || array.byteLength < byteOffset) throw new RangeError("'offset' is out of bounds");
        if (array.byteLength < byteOffset + (length || 0)) throw new RangeError("'length' is out of bounds");
        array = void 0 === byteOffset && void 0 === length ? new Uint8Array(array) : void 0 === length ? new Uint8Array(array, byteOffset) : new Uint8Array(array, byteOffset, length);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          that = array;
          that.__proto__ = Buffer.prototype;
        } else that = fromArrayLike(that, array);
        return that;
      }
      function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
          var len = 0 | checked(obj.length);
          that = createBuffer(that, len);
          if (0 === that.length) return that;
          obj.copy(that, 0, 0, len);
          return that;
        }
        if (obj) {
          if ("undefined" !== typeof ArrayBuffer && obj.buffer instanceof ArrayBuffer || "length" in obj) {
            if ("number" !== typeof obj.length || isnan(obj.length)) return createBuffer(that, 0);
            return fromArrayLike(that, obj);
          }
          if ("Buffer" === obj.type && isArray(obj.data)) return fromArrayLike(that, obj.data);
        }
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
      }
      function checked(length) {
        if (length >= kMaxLength()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + kMaxLength().toString(16) + " bytes");
        return 0 | length;
      }
      function SlowBuffer(length) {
        +length != length && (length = 0);
        return Buffer.alloc(+length);
      }
      Buffer.isBuffer = function isBuffer(b) {
        return !!(null != b && b._isBuffer);
      };
      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) throw new TypeError("Arguments must be Buffers");
        if (a === b) return 0;
        var x = a.length;
        var y = b.length;
        for (var i = 0, len = Math.min(x, y); i < len; ++i) if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
         case "hex":
         case "utf8":
         case "utf-8":
         case "ascii":
         case "latin1":
         case "binary":
         case "base64":
         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return true;

         default:
          return false;
        }
      };
      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) throw new TypeError('"list" argument must be an Array of Buffers');
        if (0 === list.length) return Buffer.alloc(0);
        var i;
        if (void 0 === length) {
          length = 0;
          for (i = 0; i < list.length; ++i) length += list[i].length;
        }
        var buffer = Buffer.allocUnsafe(length);
        var pos = 0;
        for (i = 0; i < list.length; ++i) {
          var buf = list[i];
          if (!Buffer.isBuffer(buf)) throw new TypeError('"list" argument must be an Array of Buffers');
          buf.copy(buffer, pos);
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer.isBuffer(string)) return string.length;
        if ("undefined" !== typeof ArrayBuffer && "function" === typeof ArrayBuffer.isView && (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) return string.byteLength;
        "string" !== typeof string && (string = "" + string);
        var len = string.length;
        if (0 === len) return 0;
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "ascii":
         case "latin1":
         case "binary":
          return len;

         case "utf8":
         case "utf-8":
         case void 0:
          return utf8ToBytes(string).length;

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return 2 * len;

         case "hex":
          return len >>> 1;

         case "base64":
          return base64ToBytes(string).length;

         default:
          if (loweredCase) return utf8ToBytes(string).length;
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        var loweredCase = false;
        (void 0 === start || start < 0) && (start = 0);
        if (start > this.length) return "";
        (void 0 === end || end > this.length) && (end = this.length);
        if (end <= 0) return "";
        end >>>= 0;
        start >>>= 0;
        if (end <= start) return "";
        encoding || (encoding = "utf8");
        while (true) switch (encoding) {
         case "hex":
          return hexSlice(this, start, end);

         case "utf8":
         case "utf-8":
          return utf8Slice(this, start, end);

         case "ascii":
          return asciiSlice(this, start, end);

         case "latin1":
         case "binary":
          return latin1Slice(this, start, end);

         case "base64":
          return base64Slice(this, start, end);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return utf16leSlice(this, start, end);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
        }
      }
      Buffer.prototype._isBuffer = true;
      function swap(b, n, m) {
        var i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer.prototype.swap16 = function swap16() {
        var len = this.length;
        if (len % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
        for (var i = 0; i < len; i += 2) swap(this, i, i + 1);
        return this;
      };
      Buffer.prototype.swap32 = function swap32() {
        var len = this.length;
        if (len % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
        for (var i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer.prototype.swap64 = function swap64() {
        var len = this.length;
        if (len % 8 !== 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
        for (var i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer.prototype.toString = function toString() {
        var length = 0 | this.length;
        if (0 === length) return "";
        if (0 === arguments.length) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return 0 === Buffer.compare(this, b);
      };
      Buffer.prototype.inspect = function inspect() {
        var str = "";
        var max = exports.INSPECT_MAX_BYTES;
        if (this.length > 0) {
          str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
          this.length > max && (str += " ... ");
        }
        return "<Buffer " + str + ">";
      };
      Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (!Buffer.isBuffer(target)) throw new TypeError("Argument must be a Buffer");
        void 0 === start && (start = 0);
        void 0 === end && (end = target ? target.length : 0);
        void 0 === thisStart && (thisStart = 0);
        void 0 === thisEnd && (thisEnd = this.length);
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) throw new RangeError("out of range index");
        if (thisStart >= thisEnd && start >= end) return 0;
        if (thisStart >= thisEnd) return -1;
        if (start >= end) return 1;
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        var x = thisEnd - thisStart;
        var y = end - start;
        var len = Math.min(x, y);
        var thisCopy = this.slice(thisStart, thisEnd);
        var targetCopy = target.slice(start, end);
        for (var i = 0; i < len; ++i) if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (0 === buffer.length) return -1;
        if ("string" === typeof byteOffset) {
          encoding = byteOffset;
          byteOffset = 0;
        } else byteOffset > 2147483647 ? byteOffset = 2147483647 : byteOffset < -2147483648 && (byteOffset = -2147483648);
        byteOffset = +byteOffset;
        isNaN(byteOffset) && (byteOffset = dir ? 0 : buffer.length - 1);
        byteOffset < 0 && (byteOffset = buffer.length + byteOffset);
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (!dir) return -1;
          byteOffset = 0;
        }
        "string" === typeof val && (val = Buffer.from(val, encoding));
        if (Buffer.isBuffer(val)) {
          if (0 === val.length) return -1;
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        }
        if ("number" === typeof val) {
          val &= 255;
          if (Buffer.TYPED_ARRAY_SUPPORT && "function" === typeof Uint8Array.prototype.indexOf) return dir ? Uint8Array.prototype.indexOf.call(buffer, val, byteOffset) : Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        var indexSize = 1;
        var arrLength = arr.length;
        var valLength = val.length;
        if (void 0 !== encoding) {
          encoding = String(encoding).toLowerCase();
          if ("ucs2" === encoding || "ucs-2" === encoding || "utf16le" === encoding || "utf-16le" === encoding) {
            if (arr.length < 2 || val.length < 2) return -1;
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i) {
          return 1 === indexSize ? buf[i] : buf.readUInt16BE(i * indexSize);
        }
        var i;
        if (dir) {
          var foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) if (read(arr, i) === read(val, -1 === foundIndex ? 0 : i - foundIndex)) {
            -1 === foundIndex && (foundIndex = i);
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            -1 !== foundIndex && (i -= i - foundIndex);
            foundIndex = -1;
          }
        } else {
          byteOffset + valLength > arrLength && (byteOffset = arrLength - valLength);
          for (i = byteOffset; i >= 0; i--) {
            var found = true;
            for (var j = 0; j < valLength; j++) if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
        return -1 !== this.indexOf(val, byteOffset, encoding);
      };
      Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (length) {
          length = Number(length);
          length > remaining && (length = remaining);
        } else length = remaining;
        var strLen = string.length;
        if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");
        length > strLen / 2 && (length = strLen / 2);
        for (var i = 0; i < length; ++i) {
          var parsed = parseInt(string.substr(2 * i, 2), 16);
          if (isNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function latin1Write(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer.prototype.write = function write(string, offset, length, encoding) {
        if (void 0 === offset) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (void 0 === length && "string" === typeof offset) {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else {
          if (!isFinite(offset)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
          offset |= 0;
          if (isFinite(length)) {
            length |= 0;
            void 0 === encoding && (encoding = "utf8");
          } else {
            encoding = length;
            length = void 0;
          }
        }
        var remaining = this.length - offset;
        (void 0 === length || length > remaining) && (length = remaining);
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) throw new RangeError("Attempt to write outside buffer bounds");
        encoding || (encoding = "utf8");
        var loweredCase = false;
        for (;;) switch (encoding) {
         case "hex":
          return hexWrite(this, string, offset, length);

         case "utf8":
         case "utf-8":
          return utf8Write(this, string, offset, length);

         case "ascii":
          return asciiWrite(this, string, offset, length);

         case "latin1":
         case "binary":
          return latin1Write(this, string, offset, length);

         case "base64":
          return base64Write(this, string, offset, length);

         case "ucs2":
         case "ucs-2":
         case "utf16le":
         case "utf-16le":
          return ucs2Write(this, string, offset, length);

         default:
          if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
        }
      };
      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        return 0 === start && end === buf.length ? base64.fromByteArray(buf) : base64.fromByteArray(buf.slice(start, end));
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        var res = [];
        var i = start;
        while (i < end) {
          var firstByte = buf[i];
          var codePoint = null;
          var bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
             case 1:
              firstByte < 128 && (codePoint = firstByte);
              break;

             case 2:
              secondByte = buf[i + 1];
              if (128 === (192 & secondByte)) {
                tempCodePoint = (31 & firstByte) << 6 | 63 & secondByte;
                tempCodePoint > 127 && (codePoint = tempCodePoint);
              }
              break;

             case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte)) {
                tempCodePoint = (15 & firstByte) << 12 | (63 & secondByte) << 6 | 63 & thirdByte;
                tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343) && (codePoint = tempCodePoint);
              }
              break;

             case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if (128 === (192 & secondByte) && 128 === (192 & thirdByte) && 128 === (192 & fourthByte)) {
                tempCodePoint = (15 & firstByte) << 18 | (63 & secondByte) << 12 | (63 & thirdByte) << 6 | 63 & fourthByte;
                tempCodePoint > 65535 && tempCodePoint < 1114112 && (codePoint = tempCodePoint);
              }
            }
          }
          if (null === codePoint) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | 1023 & codePoint;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) return String.fromCharCode.apply(String, codePoints);
        var res = "";
        var i = 0;
        while (i < len) res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
        return res;
      }
      function asciiSlice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(127 & buf[i]);
        return ret;
      }
      function latin1Slice(buf, start, end) {
        var ret = "";
        end = Math.min(buf.length, end);
        for (var i = start; i < end; ++i) ret += String.fromCharCode(buf[i]);
        return ret;
      }
      function hexSlice(buf, start, end) {
        var len = buf.length;
        (!start || start < 0) && (start = 0);
        (!end || end < 0 || end > len) && (end = len);
        var out = "";
        for (var i = start; i < end; ++i) out += toHex(buf[i]);
        return out;
      }
      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = "";
        for (var i = 0; i < bytes.length; i += 2) res += String.fromCharCode(bytes[i] + 256 * bytes[i + 1]);
        return res;
      }
      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length;
        start = ~~start;
        end = void 0 === end ? len : ~~end;
        if (start < 0) {
          start += len;
          start < 0 && (start = 0);
        } else start > len && (start = len);
        if (end < 0) {
          end += len;
          end < 0 && (end = 0);
        } else end > len && (end = len);
        end < start && (end = start);
        var newBuf;
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end);
          newBuf.__proto__ = Buffer.prototype;
        } else {
          var sliceLen = end - start;
          newBuf = new Buffer(sliceLen, void 0);
          for (var i = 0; i < sliceLen; ++i) newBuf[i] = this[i + start];
        }
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        return val;
      };
      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset + --byteLength];
        var mul = 1;
        while (byteLength > 0 && (mul *= 256)) val += this[offset + --byteLength] * mul;
        return val;
      };
      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + 16777216 * this[offset + 3];
      };
      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return 16777216 * this[offset] + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var val = this[offset];
        var mul = 1;
        var i = 0;
        while (++i < byteLength && (mul *= 256)) val += this[offset + i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset |= 0;
        byteLength |= 0;
        noAssert || checkOffset(offset, byteLength, this.length);
        var i = byteLength;
        var mul = 1;
        var val = this[offset + --i];
        while (i > 0 && (mul *= 256)) val += this[offset + --i] * mul;
        mul *= 128;
        val >= mul && (val -= Math.pow(2, 8 * byteLength));
        return val;
      };
      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        noAssert || checkOffset(offset, 1, this.length);
        if (!(128 & this[offset])) return this[offset];
        return -1 * (255 - this[offset] + 1);
      };
      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset] | this[offset + 1] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        noAssert || checkOffset(offset, 2, this.length);
        var val = this[offset + 1] | this[offset] << 8;
        return 32768 & val ? 4294901760 | val : val;
      };
      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        noAssert || checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        noAssert || checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var mul = 1;
        var i = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        byteLength |= 0;
        if (!noAssert) {
          var maxBytes = Math.pow(2, 8 * byteLength) - 1;
          checkInt(this, value, offset, byteLength, maxBytes, 0);
        }
        var i = byteLength - 1;
        var mul = 1;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) this[offset + i] = value / mul & 255;
        return offset + byteLength;
      };
      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 255, 0);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        this[offset] = 255 & value;
        return offset + 1;
      };
      function objectWriteUInt16(buf, value, offset, littleEndian) {
        value < 0 && (value = 65535 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) buf[offset + i] = (value & 255 << 8 * (littleEndian ? i : 1 - i)) >>> 8 * (littleEndian ? i : 1 - i);
      }
      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 65535, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      function objectWriteUInt32(buf, value, offset, littleEndian) {
        value < 0 && (value = 4294967295 + value + 1);
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) buf[offset + i] = value >>> 8 * (littleEndian ? i : 3 - i) & 255;
      }
      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = value >>> 24;
          this[offset + 2] = value >>> 16;
          this[offset + 1] = value >>> 8;
          this[offset] = 255 & value;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 4294967295, 0);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = 0;
        var mul = 1;
        var sub = 0;
        this[offset] = 255 & value;
        while (++i < byteLength && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i - 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value;
        offset |= 0;
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1);
          checkInt(this, value, offset, byteLength, limit - 1, -limit);
        }
        var i = byteLength - 1;
        var mul = 1;
        var sub = 0;
        this[offset + i] = 255 & value;
        while (--i >= 0 && (mul *= 256)) {
          value < 0 && 0 === sub && 0 !== this[offset + i + 1] && (sub = 1);
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength;
      };
      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 1, 127, -128);
        Buffer.TYPED_ARRAY_SUPPORT || (value = Math.floor(value));
        value < 0 && (value = 255 + value + 1);
        this[offset] = 255 & value;
        return offset + 1;
      };
      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
        } else objectWriteUInt16(this, value, offset, true);
        return offset + 2;
      };
      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 2, 32767, -32768);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 8;
          this[offset + 1] = 255 & value;
        } else objectWriteUInt16(this, value, offset, false);
        return offset + 2;
      };
      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = 255 & value;
          this[offset + 1] = value >>> 8;
          this[offset + 2] = value >>> 16;
          this[offset + 3] = value >>> 24;
        } else objectWriteUInt32(this, value, offset, true);
        return offset + 4;
      };
      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset |= 0;
        noAssert || checkInt(this, value, offset, 4, 2147483647, -2147483648);
        value < 0 && (value = 4294967295 + value + 1);
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = value >>> 24;
          this[offset + 1] = value >>> 16;
          this[offset + 2] = value >>> 8;
          this[offset + 3] = 255 & value;
        } else objectWriteUInt32(this, value, offset, false);
        return offset + 4;
      };
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        noAssert || checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        start || (start = 0);
        end || 0 === end || (end = this.length);
        targetStart >= target.length && (targetStart = target.length);
        targetStart || (targetStart = 0);
        end > 0 && end < start && (end = start);
        if (end === start) return 0;
        if (0 === target.length || 0 === this.length) return 0;
        if (targetStart < 0) throw new RangeError("targetStart out of bounds");
        if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        end > this.length && (end = this.length);
        target.length - targetStart < end - start && (end = target.length - targetStart + start);
        var len = end - start;
        var i;
        if (this === target && start < targetStart && targetStart < end) for (i = len - 1; i >= 0; --i) target[i + targetStart] = this[i + start]; else if (len < 1e3 || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; i < len; ++i) target[i + targetStart] = this[i + start]; else Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
        return len;
      };
      Buffer.prototype.fill = function fill(val, start, end, encoding) {
        if ("string" === typeof val) {
          if ("string" === typeof start) {
            encoding = start;
            start = 0;
            end = this.length;
          } else if ("string" === typeof end) {
            encoding = end;
            end = this.length;
          }
          if (1 === val.length) {
            var code = val.charCodeAt(0);
            code < 256 && (val = code);
          }
          if (void 0 !== encoding && "string" !== typeof encoding) throw new TypeError("encoding must be a string");
          if ("string" === typeof encoding && !Buffer.isEncoding(encoding)) throw new TypeError("Unknown encoding: " + encoding);
        } else "number" === typeof val && (val &= 255);
        if (start < 0 || this.length < start || this.length < end) throw new RangeError("Out of range index");
        if (end <= start) return this;
        start >>>= 0;
        end = void 0 === end ? this.length : end >>> 0;
        val || (val = 0);
        var i;
        if ("number" === typeof val) for (i = start; i < end; ++i) this[i] = val; else {
          var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
          var len = bytes.length;
          for (i = 0; i < end - start; ++i) this[i + start] = bytes[i % len];
        }
        return this;
      };
      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = stringtrim(str).replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) str += "=";
        return str;
      }
      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, "");
      }
      function toHex(n) {
        if (n < 16) return "0" + n.toString(16);
        return n.toString(16);
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        var codePoint;
        var length = string.length;
        var leadSurrogate = null;
        var bytes = [];
        for (var i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              if (i + 1 === length) {
                (units -= 3) > -1 && bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              (units -= 3) > -1 && bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = 65536 + (leadSurrogate - 55296 << 10 | codePoint - 56320);
          } else leadSurrogate && (units -= 3) > -1 && bytes.push(239, 191, 189);
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(codePoint >> 6 | 192, 63 & codePoint | 128);
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          } else {
            if (!(codePoint < 1114112)) throw new Error("Invalid code point");
            if ((units -= 4) < 0) break;
            bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, 63 & codePoint | 128);
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) byteArray.push(255 & str.charCodeAt(i));
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isnan(val) {
        return val !== val;
      }
    }).call(this, "undefined" !== typeof global ? global : "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : {});
  }, {
    "base64-js": 1,
    ieee754: 4,
    isarray: 3
  } ],
  3: [ function(require, module, exports) {
    var toString = {}.toString;
    module.exports = Array.isArray || function(arr) {
      return "[object Array]" == toString.call(arr);
    };
  }, {} ],
  4: [ function(require, module, exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (;nBits > 0; e = 256 * e + buffer[offset + i], i += d, nBits -= 8) ;
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (;nBits > 0; m = 256 * m + buffer[offset + i], i += d, nBits -= 8) ;
      if (0 === e) e = 1 - eBias; else {
        if (e === eMax) return m ? NaN : Infinity * (s ? -1 : 1);
        m += Math.pow(2, mLen);
        e -= eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = 8 * nBytes - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = 23 === mLen ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || 0 === value && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || Infinity === value) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        value += e + eBias >= 1 ? rt / c : rt * Math.pow(2, 1 - eBias);
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e += eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (;mLen >= 8; buffer[offset + i] = 255 & m, i += d, m /= 256, mLen -= 8) ;
      e = e << mLen | m;
      eLen += mLen;
      for (;eLen > 0; buffer[offset + i] = 255 & e, i += d, e /= 256, eLen -= 8) ;
      buffer[offset + i - d] |= 128 * s;
    };
  }, {} ],
  5: [ function(require, module, exports) {
    var process = module.exports = {};
    var cachedSetTimeout;
    var cachedClearTimeout;
    function defaultSetTimout() {
      throw new Error("setTimeout has not been defined");
    }
    function defaultClearTimeout() {
      throw new Error("clearTimeout has not been defined");
    }
    (function() {
      try {
        cachedSetTimeout = "function" === typeof setTimeout ? setTimeout : defaultSetTimout;
      } catch (e) {
        cachedSetTimeout = defaultSetTimout;
      }
      try {
        cachedClearTimeout = "function" === typeof clearTimeout ? clearTimeout : defaultClearTimeout;
      } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
      }
    })();
    function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) return setTimeout(fun, 0);
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
      }
      try {
        return cachedSetTimeout(fun, 0);
      } catch (e) {
        try {
          return cachedSetTimeout.call(null, fun, 0);
        } catch (e) {
          return cachedSetTimeout.call(this, fun, 0);
        }
      }
    }
    function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) return clearTimeout(marker);
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
      }
      try {
        return cachedClearTimeout(marker);
      } catch (e) {
        try {
          return cachedClearTimeout.call(null, marker);
        } catch (e) {
          return cachedClearTimeout.call(this, marker);
        }
      }
    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;
    function cleanUpNextTick() {
      if (!draining || !currentQueue) return;
      draining = false;
      currentQueue.length ? queue = currentQueue.concat(queue) : queueIndex = -1;
      queue.length && drainQueue();
    }
    function drainQueue() {
      if (draining) return;
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;
      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) currentQueue && currentQueue[queueIndex].run();
        queueIndex = -1;
        len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
    }
    process.nextTick = function(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
      queue.push(new Item(fun, args));
      1 !== queue.length || draining || runTimeout(drainQueue);
    };
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }
    Item.prototype.run = function() {
      this.fun.apply(null, this.array);
    };
    process.title = "browser";
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = "";
    process.versions = {};
    function noop() {}
    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;
    process.listeners = function(name) {
      return [];
    };
    process.binding = function(name) {
      throw new Error("process.binding is not supported");
    };
    process.cwd = function() {
      return "/";
    };
    process.chdir = function(dir) {
      throw new Error("process.chdir is not supported");
    };
    process.umask = function() {
      return 0;
    };
  }, {} ],
  6: [ function(require, module, exports) {
    exports.Emitter = Emitter;
    function Emitter(obj) {
      if (obj) return mixin(obj);
    }
    function mixin(obj) {
      for (var key in Emitter.prototype) obj[key] = Emitter.prototype[key];
      return obj;
    }
    Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};
      (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
      return this;
    };
    Emitter.prototype.once = function(event, fn) {
      function on() {
        this.off(event, on);
        fn.apply(this, arguments);
      }
      on.fn = fn;
      this.on(event, on);
      return this;
    };
    Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }
      var callbacks = this._callbacks["$" + event];
      if (!callbacks) return this;
      if (1 == arguments.length) {
        delete this._callbacks["$" + event];
        return this;
      }
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      0 === callbacks.length && delete this._callbacks["$" + event];
      return this;
    };
    Emitter.prototype.emit = function(event) {
      this._callbacks = this._callbacks || {};
      var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
      for (var i = 1; i < arguments.length; i++) args[i - 1] = arguments[i];
      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) callbacks[i].apply(this, args);
      }
      return this;
    };
    Emitter.prototype.emitReserved = Emitter.prototype.emit;
    Emitter.prototype.listeners = function(event) {
      this._callbacks = this._callbacks || {};
      return this._callbacks["$" + event] || [];
    };
    Emitter.prototype.hasListeners = function(event) {
      return !!this.listeners(event).length;
    };
  }, {} ],
  7: [ function(require, module, exports) {
    (function(process) {
      exports.formatArgs = formatArgs;
      exports.save = save;
      exports.load = load;
      exports.useColors = useColors;
      exports.storage = localstorage();
      exports.destroy = (() => {
        let warned = false;
        return () => {
          if (!warned) {
            warned = true;
            console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
          }
        };
      })();
      exports.colors = [ "#0000CC", "#0000FF", "#0033CC", "#0033FF", "#0066CC", "#0066FF", "#0099CC", "#0099FF", "#00CC00", "#00CC33", "#00CC66", "#00CC99", "#00CCCC", "#00CCFF", "#3300CC", "#3300FF", "#3333CC", "#3333FF", "#3366CC", "#3366FF", "#3399CC", "#3399FF", "#33CC00", "#33CC33", "#33CC66", "#33CC99", "#33CCCC", "#33CCFF", "#6600CC", "#6600FF", "#6633CC", "#6633FF", "#66CC00", "#66CC33", "#9900CC", "#9900FF", "#9933CC", "#9933FF", "#99CC00", "#99CC33", "#CC0000", "#CC0033", "#CC0066", "#CC0099", "#CC00CC", "#CC00FF", "#CC3300", "#CC3333", "#CC3366", "#CC3399", "#CC33CC", "#CC33FF", "#CC6600", "#CC6633", "#CC9900", "#CC9933", "#CCCC00", "#CCCC33", "#FF0000", "#FF0033", "#FF0066", "#FF0099", "#FF00CC", "#FF00FF", "#FF3300", "#FF3333", "#FF3366", "#FF3399", "#FF33CC", "#FF33FF", "#FF6600", "#FF6633", "#FF9900", "#FF9933", "#FFCC00", "#FFCC33" ];
      function useColors() {
        if ("undefined" !== typeof window && window.process && ("renderer" === window.process.type || window.process.__nwjs)) return true;
        if ("undefined" !== typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) return false;
        let m;
        return "undefined" !== typeof document && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || "undefined" !== typeof window && window.console && (window.console.firebug || window.console.exception && window.console.table) || "undefined" !== typeof navigator && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || "undefined" !== typeof navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
      }
      function formatArgs(args) {
        args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
        if (!this.useColors) return;
        const c = "color: " + this.color;
        args.splice(1, 0, c, "color: inherit");
        let index = 0;
        let lastC = 0;
        args[0].replace(/%[a-zA-Z%]/g, match => {
          if ("%%" === match) return;
          index++;
          "%c" === match && (lastC = index);
        });
        args.splice(lastC, 0, c);
      }
      exports.log = console.debug || console.log || (() => {});
      function save(namespaces) {
        try {
          namespaces ? exports.storage.setItem("debug", namespaces) : exports.storage.removeItem("debug");
        } catch (error) {}
      }
      function load() {
        let r;
        try {
          r = exports.storage.getItem("debug");
        } catch (error) {}
        !r && "undefined" !== typeof process && "env" in process && (r = process.env.DEBUG);
        return r;
      }
      function localstorage() {
        try {
          return localStorage;
        } catch (error) {}
      }
      module.exports = require("./common")(exports);
      const {formatters: formatters} = module.exports;
      formatters.j = function(v) {
        try {
          return JSON.stringify(v);
        } catch (error) {
          return "[UnexpectedJSONParseError]: " + error.message;
        }
      };
    }).call(this, require("_process"));
  }, {
    "./common": 8,
    _process: 5
  } ],
  8: [ function(require, module, exports) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require("ms");
      createDebug.destroy = destroy;
      Object.keys(env).forEach(key => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) return;
          const self = debug;
          const curr = Number(new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          "string" !== typeof args[0] && args.unshift("%O");
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if ("%%" === match) return "%";
            index++;
            const formatter = createDebug.formatters[format];
            if ("function" === typeof formatter) {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (null !== enableOverride) return enableOverride;
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: v => {
            enableOverride = v;
          }
        });
        "function" === typeof createDebug.init && createDebug.init(debug);
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + ("undefined" === typeof delimiter ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = ("string" === typeof namespaces ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) continue;
          namespaces = split[i].replace(/\*/g, ".*?");
          "-" === namespaces[0] ? createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$")) : createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
      function disable() {
        const namespaces = [ ...createDebug.names.map(toNamespace), ...createDebug.skips.map(toNamespace).map(namespace => "-" + namespace) ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if ("*" === name[name.length - 1]) return true;
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) if (createDebug.skips[i].test(name)) return false;
        for (i = 0, len = createDebug.names.length; i < len; i++) if (createDebug.names[i].test(name)) return true;
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) return val.stack || val.message;
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }, {
    ms: 29
  } ],
  9: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.hasCORS = void 0;
    let value = false;
    try {
      value = "undefined" !== typeof XMLHttpRequest && "withCredentials" in new XMLHttpRequest();
    } catch (err) {}
    exports.hasCORS = value;
  }, {} ],
  10: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.decode = exports.encode = void 0;
    function encode(obj) {
      let str = "";
      for (let i in obj) if (obj.hasOwnProperty(i)) {
        str.length && (str += "&");
        str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
      }
      return str;
    }
    exports.encode = encode;
    function decode(qs) {
      let qry = {};
      let pairs = qs.split("&");
      for (let i = 0, l = pairs.length; i < l; i++) {
        let pair = pairs[i].split("=");
        qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
      return qry;
    }
    exports.decode = decode;
  }, {} ],
  11: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.parse = void 0;
    const re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
    const parts = [ "source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor" ];
    function parse(str) {
      if (str.length > 2e3) throw "URI too long";
      const src = str, b = str.indexOf("["), e = str.indexOf("]");
      -1 != b && -1 != e && (str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length));
      let m = re.exec(str || ""), uri = {}, i = 14;
      while (i--) uri[parts[i]] = m[i] || "";
      if (-1 != b && -1 != e) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
        uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
        uri.ipv6uri = true;
      }
      uri.pathNames = pathNames(uri, uri["path"]);
      uri.queryKey = queryKey(uri, uri["query"]);
      return uri;
    }
    exports.parse = parse;
    function pathNames(obj, path) {
      const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
      "/" != path.slice(0, 1) && 0 !== path.length || names.splice(0, 1);
      "/" == path.slice(-1) && names.splice(names.length - 1, 1);
      return names;
    }
    function queryKey(uri, query) {
      const data = {};
      query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
        $1 && (data[$1] = $2);
      });
      return data;
    }
  }, {} ],
  12: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.yeast = exports.decode = exports.encode = void 0;
    const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""), length = 64, map = {};
    let seed = 0, i = 0, prev;
    function encode(num) {
      let encoded = "";
      do {
        encoded = alphabet[num % length] + encoded;
        num = Math.floor(num / length);
      } while (num > 0);
      return encoded;
    }
    exports.encode = encode;
    function decode(str) {
      let decoded = 0;
      for (i = 0; i < str.length; i++) decoded = decoded * length + map[str.charAt(i)];
      return decoded;
    }
    exports.decode = decode;
    function yeast() {
      const now = encode(+new Date());
      if (now !== prev) return seed = 0, prev = now;
      return now + "." + encode(seed++);
    }
    exports.yeast = yeast;
    for (;i < length; i++) map[alphabet[i]] = i;
  }, {} ],
  13: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.globalThisShim = void 0;
    exports.globalThisShim = (() => "undefined" !== typeof self ? self : "undefined" !== typeof window ? window : Function("return this")())();
  }, {} ],
  14: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.nextTick = exports.parse = exports.installTimerFunctions = exports.transports = exports.TransportError = exports.Transport = exports.protocol = exports.Socket = void 0;
    const socket_js_1 = require("./socket.js");
    Object.defineProperty(exports, "Socket", {
      enumerable: true,
      get: function() {
        return socket_js_1.Socket;
      }
    });
    exports.protocol = socket_js_1.Socket.protocol;
    var transport_js_1 = require("./transport.js");
    Object.defineProperty(exports, "Transport", {
      enumerable: true,
      get: function() {
        return transport_js_1.Transport;
      }
    });
    Object.defineProperty(exports, "TransportError", {
      enumerable: true,
      get: function() {
        return transport_js_1.TransportError;
      }
    });
    var index_js_1 = require("./transports/index.js");
    Object.defineProperty(exports, "transports", {
      enumerable: true,
      get: function() {
        return index_js_1.transports;
      }
    });
    var util_js_1 = require("./util.js");
    Object.defineProperty(exports, "installTimerFunctions", {
      enumerable: true,
      get: function() {
        return util_js_1.installTimerFunctions;
      }
    });
    var parseuri_js_1 = require("./contrib/parseuri.js");
    Object.defineProperty(exports, "parse", {
      enumerable: true,
      get: function() {
        return parseuri_js_1.parse;
      }
    });
    var websocket_constructor_js_1 = require("./transports/websocket-constructor.js");
    Object.defineProperty(exports, "nextTick", {
      enumerable: true,
      get: function() {
        return websocket_constructor_js_1.nextTick;
      }
    });
  }, {
    "./contrib/parseuri.js": 11,
    "./socket.js": 15,
    "./transport.js": 16,
    "./transports/index.js": 17,
    "./transports/websocket-constructor.js": 19,
    "./util.js": 23
  } ],
  15: [ function(require, module, exports) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Socket = void 0;
    const index_js_1 = require("./transports/index.js");
    const util_js_1 = require("./util.js");
    const parseqs_js_1 = require("./contrib/parseqs.js");
    const parseuri_js_1 = require("./contrib/parseuri.js");
    const debug_1 = __importDefault(require("debug"));
    const component_emitter_1 = require("@socket.io/component-emitter");
    const engine_io_parser_1 = require("engine.io-parser");
    const websocket_constructor_js_1 = require("./transports/websocket-constructor.js");
    const debug = (0, debug_1.default)("engine.io-client:socket");
    class Socket extends component_emitter_1.Emitter {
      constructor(uri, opts = {}) {
        super();
        this.binaryType = websocket_constructor_js_1.defaultBinaryType;
        this.writeBuffer = [];
        if (uri && "object" === typeof uri) {
          opts = uri;
          uri = null;
        }
        if (uri) {
          uri = (0, parseuri_js_1.parse)(uri);
          opts.hostname = uri.host;
          opts.secure = "https" === uri.protocol || "wss" === uri.protocol;
          opts.port = uri.port;
          uri.query && (opts.query = uri.query);
        } else opts.host && (opts.hostname = (0, parseuri_js_1.parse)(opts.host).host);
        (0, util_js_1.installTimerFunctions)(this, opts);
        this.secure = null != opts.secure ? opts.secure : "undefined" !== typeof location && "https:" === location.protocol;
        opts.hostname && !opts.port && (opts.port = this.secure ? "443" : "80");
        this.hostname = opts.hostname || ("undefined" !== typeof location ? location.hostname : "localhost");
        this.port = opts.port || ("undefined" !== typeof location && location.port ? location.port : this.secure ? "443" : "80");
        this.transports = opts.transports || [ "polling", "websocket", "webtransport" ];
        this.writeBuffer = [];
        this.prevBufferLen = 0;
        this.opts = Object.assign({
          path: "/engine.io",
          agent: false,
          withCredentials: false,
          upgrade: true,
          timestampParam: "t",
          rememberUpgrade: false,
          addTrailingSlash: true,
          rejectUnauthorized: true,
          perMessageDeflate: {
            threshold: 1024
          },
          transportOptions: {},
          closeOnBeforeunload: false
        }, opts);
        this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
        "string" === typeof this.opts.query && (this.opts.query = (0, parseqs_js_1.decode)(this.opts.query));
        this.id = null;
        this.upgrades = null;
        this.pingInterval = null;
        this.pingTimeout = null;
        this.pingTimeoutTimer = null;
        if ("function" === typeof addEventListener) {
          if (this.opts.closeOnBeforeunload) {
            this.beforeunloadEventListener = () => {
              if (this.transport) {
                this.transport.removeAllListeners();
                this.transport.close();
              }
            };
            addEventListener("beforeunload", this.beforeunloadEventListener, false);
          }
          if ("localhost" !== this.hostname) {
            this.offlineEventListener = () => {
              this.onClose("transport close", {
                description: "network connection lost"
              });
            };
            addEventListener("offline", this.offlineEventListener, false);
          }
        }
        this.open();
      }
      createTransport(name) {
        debug('creating transport "%s"', name);
        const query = Object.assign({}, this.opts.query);
        query.EIO = engine_io_parser_1.protocol;
        query.transport = name;
        this.id && (query.sid = this.id);
        const opts = Object.assign({}, this.opts, {
          query: query,
          socket: this,
          hostname: this.hostname,
          secure: this.secure,
          port: this.port
        }, this.opts.transportOptions[name]);
        debug("options: %j", opts);
        return new index_js_1.transports[name](opts);
      }
      open() {
        let transport;
        if (this.opts.rememberUpgrade && Socket.priorWebsocketSuccess && -1 !== this.transports.indexOf("websocket")) transport = "websocket"; else {
          if (0 === this.transports.length) {
            this.setTimeoutFn(() => {
              this.emitReserved("error", "No transports available");
            }, 0);
            return;
          }
          transport = this.transports[0];
        }
        this.readyState = "opening";
        try {
          transport = this.createTransport(transport);
        } catch (e) {
          debug("error while creating transport: %s", e);
          this.transports.shift();
          this.open();
          return;
        }
        transport.open();
        this.setTransport(transport);
      }
      setTransport(transport) {
        debug("setting transport %s", transport.name);
        if (this.transport) {
          debug("clearing existing transport %s", this.transport.name);
          this.transport.removeAllListeners();
        }
        this.transport = transport;
        transport.on("drain", this.onDrain.bind(this)).on("packet", this.onPacket.bind(this)).on("error", this.onError.bind(this)).on("close", reason => this.onClose("transport close", reason));
      }
      probe(name) {
        debug('probing transport "%s"', name);
        let transport = this.createTransport(name);
        let failed = false;
        Socket.priorWebsocketSuccess = false;
        const onTransportOpen = () => {
          if (failed) return;
          debug('probe transport "%s" opened', name);
          transport.send([ {
            type: "ping",
            data: "probe"
          } ]);
          transport.once("packet", msg => {
            if (failed) return;
            if ("pong" === msg.type && "probe" === msg.data) {
              debug('probe transport "%s" pong', name);
              this.upgrading = true;
              this.emitReserved("upgrading", transport);
              if (!transport) return;
              Socket.priorWebsocketSuccess = "websocket" === transport.name;
              debug('pausing current transport "%s"', this.transport.name);
              this.transport.pause(() => {
                if (failed) return;
                if ("closed" === this.readyState) return;
                debug("changing transport and sending upgrade packet");
                cleanup();
                this.setTransport(transport);
                transport.send([ {
                  type: "upgrade"
                } ]);
                this.emitReserved("upgrade", transport);
                transport = null;
                this.upgrading = false;
                this.flush();
              });
            } else {
              debug('probe transport "%s" failed', name);
              const err = new Error("probe error");
              err.transport = transport.name;
              this.emitReserved("upgradeError", err);
            }
          });
        };
        function freezeTransport() {
          if (failed) return;
          failed = true;
          cleanup();
          transport.close();
          transport = null;
        }
        const onerror = err => {
          const error = new Error("probe error: " + err);
          error.transport = transport.name;
          freezeTransport();
          debug('probe transport "%s" failed because of error: %s', name, err);
          this.emitReserved("upgradeError", error);
        };
        function onTransportClose() {
          onerror("transport closed");
        }
        function onclose() {
          onerror("socket closed");
        }
        function onupgrade(to) {
          if (transport && to.name !== transport.name) {
            debug('"%s" works - aborting "%s"', to.name, transport.name);
            freezeTransport();
          }
        }
        const cleanup = () => {
          transport.removeListener("open", onTransportOpen);
          transport.removeListener("error", onerror);
          transport.removeListener("close", onTransportClose);
          this.off("close", onclose);
          this.off("upgrading", onupgrade);
        };
        transport.once("open", onTransportOpen);
        transport.once("error", onerror);
        transport.once("close", onTransportClose);
        this.once("close", onclose);
        this.once("upgrading", onupgrade);
        -1 !== this.upgrades.indexOf("webtransport") && "webtransport" !== name ? this.setTimeoutFn(() => {
          failed || transport.open();
        }, 200) : transport.open();
      }
      onOpen() {
        debug("socket open");
        this.readyState = "open";
        Socket.priorWebsocketSuccess = "websocket" === this.transport.name;
        this.emitReserved("open");
        this.flush();
        if ("open" === this.readyState && this.opts.upgrade) {
          debug("starting upgrade probes");
          let i = 0;
          const l = this.upgrades.length;
          for (;i < l; i++) this.probe(this.upgrades[i]);
        }
      }
      onPacket(packet) {
        if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
          debug('socket receive: type "%s", data "%s"', packet.type, packet.data);
          this.emitReserved("packet", packet);
          this.emitReserved("heartbeat");
          this.resetPingTimeout();
          switch (packet.type) {
           case "open":
            this.onHandshake(JSON.parse(packet.data));
            break;

           case "ping":
            this.sendPacket("pong");
            this.emitReserved("ping");
            this.emitReserved("pong");
            break;

           case "error":
            const err = new Error("server error");
            err.code = packet.data;
            this.onError(err);
            break;

           case "message":
            this.emitReserved("data", packet.data);
            this.emitReserved("message", packet.data);
          }
        } else debug('packet received with socket readyState "%s"', this.readyState);
      }
      onHandshake(data) {
        this.emitReserved("handshake", data);
        this.id = data.sid;
        this.transport.query.sid = data.sid;
        this.upgrades = this.filterUpgrades(data.upgrades);
        this.pingInterval = data.pingInterval;
        this.pingTimeout = data.pingTimeout;
        this.maxPayload = data.maxPayload;
        this.onOpen();
        if ("closed" === this.readyState) return;
        this.resetPingTimeout();
      }
      resetPingTimeout() {
        this.clearTimeoutFn(this.pingTimeoutTimer);
        this.pingTimeoutTimer = this.setTimeoutFn(() => {
          this.onClose("ping timeout");
        }, this.pingInterval + this.pingTimeout);
        this.opts.autoUnref && this.pingTimeoutTimer.unref();
      }
      onDrain() {
        this.writeBuffer.splice(0, this.prevBufferLen);
        this.prevBufferLen = 0;
        0 === this.writeBuffer.length ? this.emitReserved("drain") : this.flush();
      }
      flush() {
        if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
          const packets = this.getWritablePackets();
          debug("flushing %d packets in socket", packets.length);
          this.transport.send(packets);
          this.prevBufferLen = packets.length;
          this.emitReserved("flush");
        }
      }
      getWritablePackets() {
        const shouldCheckPayloadSize = this.maxPayload && "polling" === this.transport.name && this.writeBuffer.length > 1;
        if (!shouldCheckPayloadSize) return this.writeBuffer;
        let payloadSize = 1;
        for (let i = 0; i < this.writeBuffer.length; i++) {
          const data = this.writeBuffer[i].data;
          data && (payloadSize += (0, util_js_1.byteLength)(data));
          if (i > 0 && payloadSize > this.maxPayload) {
            debug("only send %d out of %d packets", i, this.writeBuffer.length);
            return this.writeBuffer.slice(0, i);
          }
          payloadSize += 2;
        }
        debug("payload size is %d (max: %d)", payloadSize, this.maxPayload);
        return this.writeBuffer;
      }
      write(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
      }
      send(msg, options, fn) {
        this.sendPacket("message", msg, options, fn);
        return this;
      }
      sendPacket(type, data, options, fn) {
        if ("function" === typeof data) {
          fn = data;
          data = void 0;
        }
        if ("function" === typeof options) {
          fn = options;
          options = null;
        }
        if ("closing" === this.readyState || "closed" === this.readyState) return;
        options = options || {};
        options.compress = false !== options.compress;
        const packet = {
          type: type,
          data: data,
          options: options
        };
        this.emitReserved("packetCreate", packet);
        this.writeBuffer.push(packet);
        fn && this.once("flush", fn);
        this.flush();
      }
      close() {
        const close = () => {
          this.onClose("forced close");
          debug("socket closing - telling transport to close");
          this.transport.close();
        };
        const cleanupAndClose = () => {
          this.off("upgrade", cleanupAndClose);
          this.off("upgradeError", cleanupAndClose);
          close();
        };
        const waitForUpgrade = () => {
          this.once("upgrade", cleanupAndClose);
          this.once("upgradeError", cleanupAndClose);
        };
        if ("opening" === this.readyState || "open" === this.readyState) {
          this.readyState = "closing";
          this.writeBuffer.length ? this.once("drain", () => {
            this.upgrading ? waitForUpgrade() : close();
          }) : this.upgrading ? waitForUpgrade() : close();
        }
        return this;
      }
      onError(err) {
        debug("socket error %j", err);
        Socket.priorWebsocketSuccess = false;
        this.emitReserved("error", err);
        this.onClose("transport error", err);
      }
      onClose(reason, description) {
        if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
          debug('socket close with reason: "%s"', reason);
          this.clearTimeoutFn(this.pingTimeoutTimer);
          this.transport.removeAllListeners("close");
          this.transport.close();
          this.transport.removeAllListeners();
          if ("function" === typeof removeEventListener) {
            removeEventListener("beforeunload", this.beforeunloadEventListener, false);
            removeEventListener("offline", this.offlineEventListener, false);
          }
          this.readyState = "closed";
          this.id = null;
          this.emitReserved("close", reason, description);
          this.writeBuffer = [];
          this.prevBufferLen = 0;
        }
      }
      filterUpgrades(upgrades) {
        const filteredUpgrades = [];
        let i = 0;
        const j = upgrades.length;
        for (;i < j; i++) ~this.transports.indexOf(upgrades[i]) && filteredUpgrades.push(upgrades[i]);
        return filteredUpgrades;
      }
    }
    exports.Socket = Socket;
    Socket.protocol = engine_io_parser_1.protocol;
  }, {
    "./contrib/parseqs.js": 10,
    "./contrib/parseuri.js": 11,
    "./transports/index.js": 17,
    "./transports/websocket-constructor.js": 19,
    "./util.js": 23,
    "@socket.io/component-emitter": 6,
    debug: 7,
    "engine.io-parser": 28
  } ],
  16: [ function(require, module, exports) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Transport = exports.TransportError = void 0;
    const engine_io_parser_1 = require("engine.io-parser");
    const component_emitter_1 = require("@socket.io/component-emitter");
    const util_js_1 = require("./util.js");
    const debug_1 = __importDefault(require("debug"));
    const parseqs_js_1 = require("./contrib/parseqs.js");
    const debug = (0, debug_1.default)("engine.io-client:transport");
    class TransportError extends Error {
      constructor(reason, description, context) {
        super(reason);
        this.description = description;
        this.context = context;
        this.type = "TransportError";
      }
    }
    exports.TransportError = TransportError;
    class Transport extends component_emitter_1.Emitter {
      constructor(opts) {
        super();
        this.writable = false;
        (0, util_js_1.installTimerFunctions)(this, opts);
        this.opts = opts;
        this.query = opts.query;
        this.socket = opts.socket;
      }
      onError(reason, description, context) {
        super.emitReserved("error", new TransportError(reason, description, context));
        return this;
      }
      open() {
        this.readyState = "opening";
        this.doOpen();
        return this;
      }
      close() {
        if ("opening" === this.readyState || "open" === this.readyState) {
          this.doClose();
          this.onClose();
        }
        return this;
      }
      send(packets) {
        "open" === this.readyState ? this.write(packets) : debug("transport is not open, discarding packets");
      }
      onOpen() {
        this.readyState = "open";
        this.writable = true;
        super.emitReserved("open");
      }
      onData(data) {
        const packet = (0, engine_io_parser_1.decodePacket)(data, this.socket.binaryType);
        this.onPacket(packet);
      }
      onPacket(packet) {
        super.emitReserved("packet", packet);
      }
      onClose(details) {
        this.readyState = "closed";
        super.emitReserved("close", details);
      }
      pause(onPause) {}
      createUri(schema, query = {}) {
        return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
      }
      _hostname() {
        const hostname = this.opts.hostname;
        return -1 === hostname.indexOf(":") ? hostname : "[" + hostname + "]";
      }
      _port() {
        return this.opts.port && (this.opts.secure && Number(443 !== this.opts.port) || !this.opts.secure && 80 !== Number(this.opts.port)) ? ":" + this.opts.port : "";
      }
      _query(query) {
        const encodedQuery = (0, parseqs_js_1.encode)(query);
        return encodedQuery.length ? "?" + encodedQuery : "";
      }
    }
    exports.Transport = Transport;
  }, {
    "./contrib/parseqs.js": 10,
    "./util.js": 23,
    "@socket.io/component-emitter": 6,
    debug: 7,
    "engine.io-parser": 28
  } ],
  17: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.transports = void 0;
    const polling_js_1 = require("./polling.js");
    const websocket_js_1 = require("./websocket.js");
    const webtransport_js_1 = require("./webtransport.js");
    exports.transports = {
      websocket: websocket_js_1.WS,
      webtransport: webtransport_js_1.WT,
      polling: polling_js_1.Polling
    };
  }, {
    "./polling.js": 18,
    "./websocket.js": 20,
    "./webtransport.js": 21
  } ],
  18: [ function(require, module, exports) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Request = exports.Polling = void 0;
    const transport_js_1 = require("../transport.js");
    const debug_1 = __importDefault(require("debug"));
    const yeast_js_1 = require("../contrib/yeast.js");
    const engine_io_parser_1 = require("engine.io-parser");
    const xmlhttprequest_js_1 = require("./xmlhttprequest.js");
    const component_emitter_1 = require("@socket.io/component-emitter");
    const util_js_1 = require("../util.js");
    const globalThis_js_1 = require("../globalThis.js");
    const debug = (0, debug_1.default)("engine.io-client:polling");
    function empty() {}
    const hasXHR2 = function() {
      const xhr = new xmlhttprequest_js_1.XHR({
        xdomain: false
      });
      return null != xhr.responseType;
    }();
    class Polling extends transport_js_1.Transport {
      constructor(opts) {
        super(opts);
        this.polling = false;
        if ("undefined" !== typeof location) {
          const isSSL = "https:" === location.protocol;
          let port = location.port;
          port || (port = isSSL ? "443" : "80");
          this.xd = "undefined" !== typeof location && opts.hostname !== location.hostname || port !== opts.port;
        }
        const forceBase64 = opts && opts.forceBase64;
        this.supportsBinary = hasXHR2 && !forceBase64;
        this.opts.withCredentials && (this.cookieJar = (0, xmlhttprequest_js_1.createCookieJar)());
      }
      get name() {
        return "polling";
      }
      doOpen() {
        this.poll();
      }
      pause(onPause) {
        this.readyState = "pausing";
        const pause = () => {
          debug("paused");
          this.readyState = "paused";
          onPause();
        };
        if (this.polling || !this.writable) {
          let total = 0;
          if (this.polling) {
            debug("we are currently polling - waiting to pause");
            total++;
            this.once("pollComplete", function() {
              debug("pre-pause polling complete");
              --total || pause();
            });
          }
          if (!this.writable) {
            debug("we are currently writing - waiting to pause");
            total++;
            this.once("drain", function() {
              debug("pre-pause writing complete");
              --total || pause();
            });
          }
        } else pause();
      }
      poll() {
        debug("polling");
        this.polling = true;
        this.doPoll();
        this.emitReserved("poll");
      }
      onData(data) {
        debug("polling got data %s", data);
        const callback = packet => {
          "opening" === this.readyState && "open" === packet.type && this.onOpen();
          if ("close" === packet.type) {
            this.onClose({
              description: "transport closed by the server"
            });
            return false;
          }
          this.onPacket(packet);
        };
        (0, engine_io_parser_1.decodePayload)(data, this.socket.binaryType).forEach(callback);
        if ("closed" !== this.readyState) {
          this.polling = false;
          this.emitReserved("pollComplete");
          "open" === this.readyState ? this.poll() : debug('ignoring poll - transport state "%s"', this.readyState);
        }
      }
      doClose() {
        const close = () => {
          debug("writing close packet");
          this.write([ {
            type: "close"
          } ]);
        };
        if ("open" === this.readyState) {
          debug("transport open - closing");
          close();
        } else {
          debug("transport not open - deferring close");
          this.once("open", close);
        }
      }
      write(packets) {
        this.writable = false;
        (0, engine_io_parser_1.encodePayload)(packets, data => {
          this.doWrite(data, () => {
            this.writable = true;
            this.emitReserved("drain");
          });
        });
      }
      uri() {
        const schema = this.opts.secure ? "https" : "http";
        const query = this.query || {};
        false !== this.opts.timestampRequests && (query[this.opts.timestampParam] = (0, 
        yeast_js_1.yeast)());
        this.supportsBinary || query.sid || (query.b64 = 1);
        return this.createUri(schema, query);
      }
      request(opts = {}) {
        Object.assign(opts, {
          xd: this.xd,
          cookieJar: this.cookieJar
        }, this.opts);
        return new Request(this.uri(), opts);
      }
      doWrite(data, fn) {
        const req = this.request({
          method: "POST",
          data: data
        });
        req.on("success", fn);
        req.on("error", (xhrStatus, context) => {
          this.onError("xhr post error", xhrStatus, context);
        });
      }
      doPoll() {
        debug("xhr poll");
        const req = this.request();
        req.on("data", this.onData.bind(this));
        req.on("error", (xhrStatus, context) => {
          this.onError("xhr poll error", xhrStatus, context);
        });
        this.pollXhr = req;
      }
    }
    exports.Polling = Polling;
    class Request extends component_emitter_1.Emitter {
      constructor(uri, opts) {
        super();
        (0, util_js_1.installTimerFunctions)(this, opts);
        this.opts = opts;
        this.method = opts.method || "GET";
        this.uri = uri;
        this.data = void 0 !== opts.data ? opts.data : null;
        this.create();
      }
      create() {
        var _a;
        const opts = (0, util_js_1.pick)(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
        opts.xdomain = !!this.opts.xd;
        const xhr = this.xhr = new xmlhttprequest_js_1.XHR(opts);
        try {
          debug("xhr open %s: %s", this.method, this.uri);
          xhr.open(this.method, this.uri, true);
          try {
            if (this.opts.extraHeaders) {
              xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
              for (let i in this.opts.extraHeaders) this.opts.extraHeaders.hasOwnProperty(i) && xhr.setRequestHeader(i, this.opts.extraHeaders[i]);
            }
          } catch (e) {}
          if ("POST" === this.method) try {
            xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
          } catch (e) {}
          try {
            xhr.setRequestHeader("Accept", "*/*");
          } catch (e) {}
          null === (_a = this.opts.cookieJar) || void 0 === _a ? void 0 : _a.addCookies(xhr);
          "withCredentials" in xhr && (xhr.withCredentials = this.opts.withCredentials);
          this.opts.requestTimeout && (xhr.timeout = this.opts.requestTimeout);
          xhr.onreadystatechange = () => {
            var _a;
            3 === xhr.readyState && (null === (_a = this.opts.cookieJar) || void 0 === _a ? void 0 : _a.parseCookies(xhr));
            if (4 !== xhr.readyState) return;
            200 === xhr.status || 1223 === xhr.status ? this.onLoad() : this.setTimeoutFn(() => {
              this.onError("number" === typeof xhr.status ? xhr.status : 0);
            }, 0);
          };
          debug("xhr data %s", this.data);
          xhr.send(this.data);
        } catch (e) {
          this.setTimeoutFn(() => {
            this.onError(e);
          }, 0);
          return;
        }
        if ("undefined" !== typeof document) {
          this.index = Request.requestsCount++;
          Request.requests[this.index] = this;
        }
      }
      onError(err) {
        this.emitReserved("error", err, this.xhr);
        this.cleanup(true);
      }
      cleanup(fromError) {
        if ("undefined" === typeof this.xhr || null === this.xhr) return;
        this.xhr.onreadystatechange = empty;
        if (fromError) try {
          this.xhr.abort();
        } catch (e) {}
        "undefined" !== typeof document && delete Request.requests[this.index];
        this.xhr = null;
      }
      onLoad() {
        const data = this.xhr.responseText;
        if (null !== data) {
          this.emitReserved("data", data);
          this.emitReserved("success");
          this.cleanup();
        }
      }
      abort() {
        this.cleanup();
      }
    }
    exports.Request = Request;
    Request.requestsCount = 0;
    Request.requests = {};
    if ("undefined" !== typeof document) if ("function" === typeof attachEvent) attachEvent("onunload", unloadHandler); else if ("function" === typeof addEventListener) {
      const terminationEvent = "onpagehide" in globalThis_js_1.globalThisShim ? "pagehide" : "unload";
      addEventListener(terminationEvent, unloadHandler, false);
    }
    function unloadHandler() {
      for (let i in Request.requests) Request.requests.hasOwnProperty(i) && Request.requests[i].abort();
    }
  }, {
    "../contrib/yeast.js": 12,
    "../globalThis.js": 13,
    "../transport.js": 16,
    "../util.js": 23,
    "./xmlhttprequest.js": 22,
    "@socket.io/component-emitter": 6,
    debug: 7,
    "engine.io-parser": 28
  } ],
  19: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.defaultBinaryType = exports.usingBrowserWebSocket = exports.WebSocket = exports.nextTick = void 0;
    const globalThis_js_1 = require("../globalThis.js");
    exports.nextTick = (() => {
      const isPromiseAvailable = "function" === typeof Promise && "function" === typeof Promise.resolve;
      return isPromiseAvailable ? cb => Promise.resolve().then(cb) : (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
    })();
    exports.WebSocket = globalThis_js_1.globalThisShim.WebSocket || globalThis_js_1.globalThisShim.MozWebSocket;
    exports.usingBrowserWebSocket = true;
    exports.defaultBinaryType = "arraybuffer";
  }, {
    "../globalThis.js": 13
  } ],
  20: [ function(require, module, exports) {
    (function(Buffer) {
      "use strict";
      var __importDefault = this && this.__importDefault || function(mod) {
        return mod && mod.__esModule ? mod : {
          default: mod
        };
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.WS = void 0;
      const transport_js_1 = require("../transport.js");
      const yeast_js_1 = require("../contrib/yeast.js");
      const util_js_1 = require("../util.js");
      const websocket_constructor_js_1 = require("./websocket-constructor.js");
      const debug_1 = __importDefault(require("debug"));
      const engine_io_parser_1 = require("engine.io-parser");
      const debug = (0, debug_1.default)("engine.io-client:websocket");
      const isReactNative = "undefined" !== typeof navigator && "string" === typeof navigator.product && "reactnative" === navigator.product.toLowerCase();
      class WS extends transport_js_1.Transport {
        constructor(opts) {
          super(opts);
          this.supportsBinary = !opts.forceBase64;
        }
        get name() {
          return "websocket";
        }
        doOpen() {
          if (!this.check()) return;
          const uri = this.uri();
          const protocols = this.opts.protocols;
          const opts = isReactNative ? {} : (0, util_js_1.pick)(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
          this.opts.extraHeaders && (opts.headers = this.opts.extraHeaders);
          try {
            this.ws = websocket_constructor_js_1.usingBrowserWebSocket && !isReactNative ? protocols ? new websocket_constructor_js_1.WebSocket(uri, protocols) : new websocket_constructor_js_1.WebSocket(uri) : new websocket_constructor_js_1.WebSocket(uri, protocols, opts);
          } catch (err) {
            return this.emitReserved("error", err);
          }
          this.ws.binaryType = this.socket.binaryType;
          this.addEventListeners();
        }
        addEventListeners() {
          this.ws.onopen = () => {
            this.opts.autoUnref && this.ws._socket.unref();
            this.onOpen();
          };
          this.ws.onclose = closeEvent => this.onClose({
            description: "websocket connection closed",
            context: closeEvent
          });
          this.ws.onmessage = ev => this.onData(ev.data);
          this.ws.onerror = e => this.onError("websocket error", e);
        }
        write(packets) {
          this.writable = false;
          for (let i = 0; i < packets.length; i++) {
            const packet = packets[i];
            const lastPacket = i === packets.length - 1;
            (0, engine_io_parser_1.encodePacket)(packet, this.supportsBinary, data => {
              const opts = {};
              if (!websocket_constructor_js_1.usingBrowserWebSocket) {
                packet.options && (opts.compress = packet.options.compress);
                if (this.opts.perMessageDeflate) {
                  const len = "string" === typeof data ? Buffer.byteLength(data) : data.length;
                  len < this.opts.perMessageDeflate.threshold && (opts.compress = false);
                }
              }
              try {
                websocket_constructor_js_1.usingBrowserWebSocket ? this.ws.send(data) : this.ws.send(data, opts);
              } catch (e) {
                debug("websocket closed before onclose event");
              }
              lastPacket && (0, websocket_constructor_js_1.nextTick)(() => {
                this.writable = true;
                this.emitReserved("drain");
              }, this.setTimeoutFn);
            });
          }
        }
        doClose() {
          if ("undefined" !== typeof this.ws) {
            this.ws.close();
            this.ws = null;
          }
        }
        uri() {
          const schema = this.opts.secure ? "wss" : "ws";
          const query = this.query || {};
          this.opts.timestampRequests && (query[this.opts.timestampParam] = (0, yeast_js_1.yeast)());
          this.supportsBinary || (query.b64 = 1);
          return this.createUri(schema, query);
        }
        check() {
          return !!websocket_constructor_js_1.WebSocket;
        }
      }
      exports.WS = WS;
    }).call(this, require("buffer").Buffer);
  }, {
    "../contrib/yeast.js": 12,
    "../transport.js": 16,
    "../util.js": 23,
    "./websocket-constructor.js": 19,
    buffer: 2,
    debug: 7,
    "engine.io-parser": 28
  } ],
  21: [ function(require, module, exports) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.WT = void 0;
    const transport_js_1 = require("../transport.js");
    const websocket_constructor_js_1 = require("./websocket-constructor.js");
    const engine_io_parser_1 = require("engine.io-parser");
    const debug_1 = __importDefault(require("debug"));
    const debug = (0, debug_1.default)("engine.io-client:webtransport");
    class WT extends transport_js_1.Transport {
      get name() {
        return "webtransport";
      }
      doOpen() {
        if ("function" !== typeof WebTransport) return;
        this.transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
        this.transport.closed.then(() => {
          debug("transport closed gracefully");
          this.onClose();
        }).catch(err => {
          debug("transport closed due to %s", err);
          this.onError("webtransport error", err);
        });
        this.transport.ready.then(() => {
          this.transport.createBidirectionalStream().then(stream => {
            const decoderStream = (0, engine_io_parser_1.createPacketDecoderStream)(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
            const reader = stream.readable.pipeThrough(decoderStream).getReader();
            const encoderStream = (0, engine_io_parser_1.createPacketEncoderStream)();
            encoderStream.readable.pipeTo(stream.writable);
            this.writer = encoderStream.writable.getWriter();
            const read = () => {
              reader.read().then(({done: done, value: value}) => {
                if (done) {
                  debug("session is closed");
                  return;
                }
                debug("received chunk: %o", value);
                this.onPacket(value);
                read();
              }).catch(err => {
                debug("an error occurred while reading: %s", err);
              });
            };
            read();
            const packet = {
              type: "open"
            };
            this.query.sid && (packet.data = `{"sid":"${this.query.sid}"}`);
            this.writer.write(packet).then(() => this.onOpen());
          });
        });
      }
      write(packets) {
        this.writable = false;
        for (let i = 0; i < packets.length; i++) {
          const packet = packets[i];
          const lastPacket = i === packets.length - 1;
          this.writer.write(packet).then(() => {
            lastPacket && (0, websocket_constructor_js_1.nextTick)(() => {
              this.writable = true;
              this.emitReserved("drain");
            }, this.setTimeoutFn);
          });
        }
      }
      doClose() {
        var _a;
        null === (_a = this.transport) || void 0 === _a ? void 0 : _a.close();
      }
    }
    exports.WT = WT;
  }, {
    "../transport.js": 16,
    "./websocket-constructor.js": 19,
    debug: 7,
    "engine.io-parser": 28
  } ],
  22: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.createCookieJar = exports.XHR = void 0;
    const has_cors_js_1 = require("../contrib/has-cors.js");
    const globalThis_js_1 = require("../globalThis.js");
    function XHR(opts) {
      const xdomain = opts.xdomain;
      try {
        if ("undefined" !== typeof XMLHttpRequest && (!xdomain || has_cors_js_1.hasCORS)) return new XMLHttpRequest();
      } catch (e) {}
      if (!xdomain) try {
        return new (globalThis_js_1.globalThisShim[[ "Active" ].concat("Object").join("X")])("Microsoft.XMLHTTP");
      } catch (e) {}
    }
    exports.XHR = XHR;
    function createCookieJar() {}
    exports.createCookieJar = createCookieJar;
  }, {
    "../contrib/has-cors.js": 9,
    "../globalThis.js": 13
  } ],
  23: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.byteLength = exports.installTimerFunctions = exports.pick = void 0;
    const globalThis_js_1 = require("./globalThis.js");
    function pick(obj, ...attr) {
      return attr.reduce((acc, k) => {
        obj.hasOwnProperty(k) && (acc[k] = obj[k]);
        return acc;
      }, {});
    }
    exports.pick = pick;
    const NATIVE_SET_TIMEOUT = globalThis_js_1.globalThisShim.setTimeout;
    const NATIVE_CLEAR_TIMEOUT = globalThis_js_1.globalThisShim.clearTimeout;
    function installTimerFunctions(obj, opts) {
      if (opts.useNativeTimers) {
        obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThis_js_1.globalThisShim);
        obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThis_js_1.globalThisShim);
      } else {
        obj.setTimeoutFn = globalThis_js_1.globalThisShim.setTimeout.bind(globalThis_js_1.globalThisShim);
        obj.clearTimeoutFn = globalThis_js_1.globalThisShim.clearTimeout.bind(globalThis_js_1.globalThisShim);
      }
    }
    exports.installTimerFunctions = installTimerFunctions;
    const BASE64_OVERHEAD = 1.33;
    function byteLength(obj) {
      if ("string" === typeof obj) return utf8Length(obj);
      return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
    }
    exports.byteLength = byteLength;
    function utf8Length(str) {
      let c = 0, length = 0;
      for (let i = 0, l = str.length; i < l; i++) {
        c = str.charCodeAt(i);
        if (c < 128) length += 1; else if (c < 2048) length += 2; else if (c < 55296 || c >= 57344) length += 3; else {
          i++;
          length += 4;
        }
      }
      return length;
    }
  }, {
    "./globalThis.js": 13
  } ],
  24: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ERROR_PACKET = exports.PACKET_TYPES_REVERSE = exports.PACKET_TYPES = void 0;
    const PACKET_TYPES = Object.create(null);
    exports.PACKET_TYPES = PACKET_TYPES;
    PACKET_TYPES["open"] = "0";
    PACKET_TYPES["close"] = "1";
    PACKET_TYPES["ping"] = "2";
    PACKET_TYPES["pong"] = "3";
    PACKET_TYPES["message"] = "4";
    PACKET_TYPES["upgrade"] = "5";
    PACKET_TYPES["noop"] = "6";
    const PACKET_TYPES_REVERSE = Object.create(null);
    exports.PACKET_TYPES_REVERSE = PACKET_TYPES_REVERSE;
    Object.keys(PACKET_TYPES).forEach(key => {
      PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
    });
    const ERROR_PACKET = {
      type: "error",
      data: "parser error"
    };
    exports.ERROR_PACKET = ERROR_PACKET;
  }, {} ],
  25: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.decode = exports.encode = void 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup = "undefined" === typeof Uint8Array ? [] : new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
    const encode = arraybuffer => {
      let bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = "";
      for (i = 0; i < len; i += 3) {
        base64 += chars[bytes[i] >> 2];
        base64 += chars[(3 & bytes[i]) << 4 | bytes[i + 1] >> 4];
        base64 += chars[(15 & bytes[i + 1]) << 2 | bytes[i + 2] >> 6];
        base64 += chars[63 & bytes[i + 2]];
      }
      len % 3 === 2 ? base64 = base64.substring(0, base64.length - 1) + "=" : len % 3 === 1 && (base64 = base64.substring(0, base64.length - 2) + "==");
      return base64;
    };
    exports.encode = encode;
    const decode = base64 => {
      let bufferLength = .75 * base64.length, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
      if ("=" === base64[base64.length - 1]) {
        bufferLength--;
        "=" === base64[base64.length - 2] && bufferLength--;
      }
      const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
      for (i = 0; i < len; i += 4) {
        encoded1 = lookup[base64.charCodeAt(i)];
        encoded2 = lookup[base64.charCodeAt(i + 1)];
        encoded3 = lookup[base64.charCodeAt(i + 2)];
        encoded4 = lookup[base64.charCodeAt(i + 3)];
        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
        bytes[p++] = (15 & encoded2) << 4 | encoded3 >> 2;
        bytes[p++] = (3 & encoded3) << 6 | 63 & encoded4;
      }
      return arraybuffer;
    };
    exports.decode = decode;
  }, {} ],
  26: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.decodePacket = void 0;
    const commons_js_1 = require("./commons.js");
    const base64_arraybuffer_js_1 = require("./contrib/base64-arraybuffer.js");
    const withNativeArrayBuffer = "function" === typeof ArrayBuffer;
    const decodePacket = (encodedPacket, binaryType) => {
      if ("string" !== typeof encodedPacket) return {
        type: "message",
        data: mapBinary(encodedPacket, binaryType)
      };
      const type = encodedPacket.charAt(0);
      if ("b" === type) return {
        type: "message",
        data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
      };
      const packetType = commons_js_1.PACKET_TYPES_REVERSE[type];
      if (!packetType) return commons_js_1.ERROR_PACKET;
      return encodedPacket.length > 1 ? {
        type: commons_js_1.PACKET_TYPES_REVERSE[type],
        data: encodedPacket.substring(1)
      } : {
        type: commons_js_1.PACKET_TYPES_REVERSE[type]
      };
    };
    exports.decodePacket = decodePacket;
    const decodeBase64Packet = (data, binaryType) => {
      if (withNativeArrayBuffer) {
        const decoded = (0, base64_arraybuffer_js_1.decode)(data);
        return mapBinary(decoded, binaryType);
      }
      return {
        base64: true,
        data: data
      };
    };
    const mapBinary = (data, binaryType) => {
      switch (binaryType) {
       case "blob":
        return data instanceof Blob ? data : new Blob([ data ]);

       case "arraybuffer":
       default:
        return data instanceof ArrayBuffer ? data : data.buffer;
      }
    };
  }, {
    "./commons.js": 24,
    "./contrib/base64-arraybuffer.js": 25
  } ],
  27: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.encodePacket = void 0;
    exports.encodePacketToBinary = encodePacketToBinary;
    const commons_js_1 = require("./commons.js");
    const withNativeBlob = "function" === typeof Blob || "undefined" !== typeof Blob && "[object BlobConstructor]" === Object.prototype.toString.call(Blob);
    const withNativeArrayBuffer = "function" === typeof ArrayBuffer;
    const isView = obj => "function" === typeof ArrayBuffer.isView ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
    const encodePacket = ({type: type, data: data}, supportsBinary, callback) => {
      if (withNativeBlob && data instanceof Blob) return supportsBinary ? callback(data) : encodeBlobAsBase64(data, callback);
      if (withNativeArrayBuffer && (data instanceof ArrayBuffer || isView(data))) return supportsBinary ? callback(data) : encodeBlobAsBase64(new Blob([ data ]), callback);
      return callback(commons_js_1.PACKET_TYPES[type] + (data || ""));
    };
    exports.encodePacket = encodePacket;
    const encodeBlobAsBase64 = (data, callback) => {
      const fileReader = new FileReader();
      fileReader.onload = function() {
        const content = fileReader.result.split(",")[1];
        callback("b" + (content || ""));
      };
      return fileReader.readAsDataURL(data);
    };
    function toArray(data) {
      return data instanceof Uint8Array ? data : data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    let TEXT_ENCODER;
    function encodePacketToBinary(packet, callback) {
      if (withNativeBlob && packet.data instanceof Blob) return packet.data.arrayBuffer().then(toArray).then(callback);
      if (withNativeArrayBuffer && (packet.data instanceof ArrayBuffer || isView(packet.data))) return callback(toArray(packet.data));
      encodePacket(packet, false, encoded => {
        TEXT_ENCODER || (TEXT_ENCODER = new TextEncoder());
        callback(TEXT_ENCODER.encode(encoded));
      });
    }
  }, {
    "./commons.js": 24
  } ],
  28: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.decodePayload = exports.decodePacket = exports.encodePayload = exports.encodePacket = exports.protocol = void 0;
    exports.createPacketEncoderStream = createPacketEncoderStream;
    exports.createPacketDecoderStream = createPacketDecoderStream;
    const encodePacket_js_1 = require("./encodePacket.js");
    Object.defineProperty(exports, "encodePacket", {
      enumerable: true,
      get: function() {
        return encodePacket_js_1.encodePacket;
      }
    });
    const decodePacket_js_1 = require("./decodePacket.js");
    Object.defineProperty(exports, "decodePacket", {
      enumerable: true,
      get: function() {
        return decodePacket_js_1.decodePacket;
      }
    });
    const commons_js_1 = require("./commons.js");
    const SEPARATOR = String.fromCharCode(30);
    const encodePayload = (packets, callback) => {
      const length = packets.length;
      const encodedPackets = new Array(length);
      let count = 0;
      packets.forEach((packet, i) => {
        (0, encodePacket_js_1.encodePacket)(packet, false, encodedPacket => {
          encodedPackets[i] = encodedPacket;
          ++count === length && callback(encodedPackets.join(SEPARATOR));
        });
      });
    };
    exports.encodePayload = encodePayload;
    const decodePayload = (encodedPayload, binaryType) => {
      const encodedPackets = encodedPayload.split(SEPARATOR);
      const packets = [];
      for (let i = 0; i < encodedPackets.length; i++) {
        const decodedPacket = (0, decodePacket_js_1.decodePacket)(encodedPackets[i], binaryType);
        packets.push(decodedPacket);
        if ("error" === decodedPacket.type) break;
      }
      return packets;
    };
    exports.decodePayload = decodePayload;
    function createPacketEncoderStream() {
      return new TransformStream({
        transform(packet, controller) {
          (0, encodePacket_js_1.encodePacketToBinary)(packet, encodedPacket => {
            const payloadLength = encodedPacket.length;
            let header;
            if (payloadLength < 126) {
              header = new Uint8Array(1);
              new DataView(header.buffer).setUint8(0, payloadLength);
            } else if (payloadLength < 65536) {
              header = new Uint8Array(3);
              const view = new DataView(header.buffer);
              view.setUint8(0, 126);
              view.setUint16(1, payloadLength);
            } else {
              header = new Uint8Array(9);
              const view = new DataView(header.buffer);
              view.setUint8(0, 127);
              view.setBigUint64(1, BigInt(payloadLength));
            }
            packet.data && "string" !== typeof packet.data && (header[0] |= 128);
            controller.enqueue(header);
            controller.enqueue(encodedPacket);
          });
        }
      });
    }
    let TEXT_DECODER;
    function totalLength(chunks) {
      return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    }
    function concatChunks(chunks, size) {
      if (chunks[0].length === size) return chunks.shift();
      const buffer = new Uint8Array(size);
      let j = 0;
      for (let i = 0; i < size; i++) {
        buffer[i] = chunks[0][j++];
        if (j === chunks[0].length) {
          chunks.shift();
          j = 0;
        }
      }
      chunks.length && j < chunks[0].length && (chunks[0] = chunks[0].slice(j));
      return buffer;
    }
    function createPacketDecoderStream(maxPayload, binaryType) {
      TEXT_DECODER || (TEXT_DECODER = new TextDecoder());
      const chunks = [];
      let state = 0;
      let expectedLength = -1;
      let isBinary = false;
      return new TransformStream({
        transform(chunk, controller) {
          chunks.push(chunk);
          while (true) {
            if (0 === state) {
              if (totalLength(chunks) < 1) break;
              const header = concatChunks(chunks, 1);
              isBinary = 128 === (128 & header[0]);
              expectedLength = 127 & header[0];
              state = expectedLength < 126 ? 3 : 126 === expectedLength ? 1 : 2;
            } else if (1 === state) {
              if (totalLength(chunks) < 2) break;
              const headerArray = concatChunks(chunks, 2);
              expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
              state = 3;
            } else if (2 === state) {
              if (totalLength(chunks) < 8) break;
              const headerArray = concatChunks(chunks, 8);
              const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
              const n = view.getUint32(0);
              if (n > Math.pow(2, 21) - 1) {
                controller.enqueue(commons_js_1.ERROR_PACKET);
                break;
              }
              expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
              state = 3;
            } else {
              if (totalLength(chunks) < expectedLength) break;
              const data = concatChunks(chunks, expectedLength);
              controller.enqueue((0, decodePacket_js_1.decodePacket)(isBinary ? data : TEXT_DECODER.decode(data), binaryType));
              state = 0;
            }
            if (0 === expectedLength || expectedLength > maxPayload) {
              controller.enqueue(commons_js_1.ERROR_PACKET);
              break;
            }
          }
        }
      });
    }
    exports.protocol = 4;
  }, {
    "./commons.js": 24,
    "./decodePacket.js": 26,
    "./encodePacket.js": 27
  } ],
  29: [ function(require, module, exports) {
    var s = 1e3;
    var m = 60 * s;
    var h = 60 * m;
    var d = 24 * h;
    var w = 7 * d;
    var y = 365.25 * d;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if ("string" === type && val.length > 0) return parse(val);
      if ("number" === type && isFinite(val)) return options.long ? fmtLong(val) : fmtShort(val);
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) return;
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
      if (!match) return;
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
       case "years":
       case "year":
       case "yrs":
       case "yr":
       case "y":
        return n * y;

       case "weeks":
       case "week":
       case "w":
        return n * w;

       case "days":
       case "day":
       case "d":
        return n * d;

       case "hours":
       case "hour":
       case "hrs":
       case "hr":
       case "h":
        return n * h;

       case "minutes":
       case "minute":
       case "mins":
       case "min":
       case "m":
        return n * m;

       case "seconds":
       case "second":
       case "secs":
       case "sec":
       case "s":
        return n * s;

       case "milliseconds":
       case "millisecond":
       case "msecs":
       case "msec":
       case "ms":
        return n;

       default:
        return;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) return Math.round(ms / d) + "d";
      if (msAbs >= h) return Math.round(ms / h) + "h";
      if (msAbs >= m) return Math.round(ms / m) + "m";
      if (msAbs >= s) return Math.round(ms / s) + "s";
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) return plural(ms, msAbs, d, "day");
      if (msAbs >= h) return plural(ms, msAbs, h, "hour");
      if (msAbs >= m) return plural(ms, msAbs, m, "minute");
      if (msAbs >= s) return plural(ms, msAbs, s, "second");
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= 1.5 * n;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }, {} ],
  30: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Backoff = void 0;
    function Backoff(opts) {
      opts = opts || {};
      this.ms = opts.min || 100;
      this.max = opts.max || 1e4;
      this.factor = opts.factor || 2;
      this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
      this.attempts = 0;
    }
    exports.Backoff = Backoff;
    Backoff.prototype.duration = function() {
      var ms = this.ms * Math.pow(this.factor, this.attempts++);
      if (this.jitter) {
        var rand = Math.random();
        var deviation = Math.floor(rand * this.jitter * ms);
        ms = 0 == (1 & Math.floor(10 * rand)) ? ms - deviation : ms + deviation;
      }
      return 0 | Math.min(ms, this.max);
    };
    Backoff.prototype.reset = function() {
      this.attempts = 0;
    };
    Backoff.prototype.setMin = function(min) {
      this.ms = min;
    };
    Backoff.prototype.setMax = function(max) {
      this.max = max;
    };
    Backoff.prototype.setJitter = function(jitter) {
      this.jitter = jitter;
    };
  }, {} ],
  31: [ function(require, module, exports) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = exports.connect = exports.io = exports.Socket = exports.Manager = exports.protocol = void 0;
    const url_js_1 = require("./url.js");
    const manager_js_1 = require("./manager.js");
    Object.defineProperty(exports, "Manager", {
      enumerable: true,
      get: function() {
        return manager_js_1.Manager;
      }
    });
    const socket_js_1 = require("./socket.js");
    Object.defineProperty(exports, "Socket", {
      enumerable: true,
      get: function() {
        return socket_js_1.Socket;
      }
    });
    const debug_1 = __importDefault(require("debug"));
    const debug = debug_1.default("socket.io-client");
    const cache = {};
    function lookup(uri, opts) {
      if ("object" === typeof uri) {
        opts = uri;
        uri = void 0;
      }
      opts = opts || {};
      const parsed = url_js_1.url(uri, opts.path || "/socket.io");
      const source = parsed.source;
      const id = parsed.id;
      const path = parsed.path;
      const sameNamespace = cache[id] && path in cache[id]["nsps"];
      const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
      let io;
      if (newConnection) {
        debug("ignoring socket cache for %s", source);
        io = new manager_js_1.Manager(source, opts);
      } else {
        if (!cache[id]) {
          debug("new io instance for %s", source);
          cache[id] = new manager_js_1.Manager(source, opts);
        }
        io = cache[id];
      }
      parsed.query && !opts.query && (opts.query = parsed.queryKey);
      return io.socket(parsed.path, opts);
    }
    exports.io = lookup;
    exports.connect = lookup;
    exports.default = lookup;
    Object.assign(lookup, {
      Manager: manager_js_1.Manager,
      Socket: socket_js_1.Socket,
      io: lookup,
      connect: lookup
    });
    var socket_io_parser_1 = require("socket.io-parser");
    Object.defineProperty(exports, "protocol", {
      enumerable: true,
      get: function() {
        return socket_io_parser_1.protocol;
      }
    });
    module.exports = lookup;
  }, {
    "./manager.js": 32,
    "./socket.js": 34,
    "./url.js": 35,
    debug: 7,
    "socket.io-parser": 37
  } ],
  32: [ function(require, module, exports) {
    "use strict";
    var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
      void 0 === k2 && (k2 = k);
      Object.defineProperty(o, k2, {
        enumerable: true,
        get: function() {
          return m[k];
        }
      });
    } : function(o, m, k, k2) {
      void 0 === k2 && (k2 = k);
      o[k2] = m[k];
    });
    var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
      });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = this && this.__importStar || function(mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (null != mod) for (var k in mod) "default" !== k && Object.prototype.hasOwnProperty.call(mod, k) && __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
    };
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Manager = void 0;
    const engine_io_client_1 = require("engine.io-client");
    const socket_js_1 = require("./socket.js");
    const parser = __importStar(require("socket.io-parser"));
    const on_js_1 = require("./on.js");
    const backo2_js_1 = require("./contrib/backo2.js");
    const component_emitter_1 = require("@socket.io/component-emitter");
    const debug_1 = __importDefault(require("debug"));
    const debug = debug_1.default("socket.io-client:manager");
    class Manager extends component_emitter_1.Emitter {
      constructor(uri, opts) {
        var _a;
        super();
        this.nsps = {};
        this.subs = [];
        if (uri && "object" === typeof uri) {
          opts = uri;
          uri = void 0;
        }
        opts = opts || {};
        opts.path = opts.path || "/socket.io";
        this.opts = opts;
        engine_io_client_1.installTimerFunctions(this, opts);
        this.reconnection(false !== opts.reconnection);
        this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
        this.reconnectionDelay(opts.reconnectionDelay || 1e3);
        this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
        this.randomizationFactor(null !== (_a = opts.randomizationFactor) && void 0 !== _a ? _a : .5);
        this.backoff = new backo2_js_1.Backoff({
          min: this.reconnectionDelay(),
          max: this.reconnectionDelayMax(),
          jitter: this.randomizationFactor()
        });
        this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
        this._readyState = "closed";
        this.uri = uri;
        const _parser = opts.parser || parser;
        this.encoder = new _parser.Encoder();
        this.decoder = new _parser.Decoder();
        this._autoConnect = false !== opts.autoConnect;
        this._autoConnect && this.open();
      }
      reconnection(v) {
        if (!arguments.length) return this._reconnection;
        this._reconnection = !!v;
        return this;
      }
      reconnectionAttempts(v) {
        if (void 0 === v) return this._reconnectionAttempts;
        this._reconnectionAttempts = v;
        return this;
      }
      reconnectionDelay(v) {
        var _a;
        if (void 0 === v) return this._reconnectionDelay;
        this._reconnectionDelay = v;
        null === (_a = this.backoff) || void 0 === _a ? void 0 : _a.setMin(v);
        return this;
      }
      randomizationFactor(v) {
        var _a;
        if (void 0 === v) return this._randomizationFactor;
        this._randomizationFactor = v;
        null === (_a = this.backoff) || void 0 === _a ? void 0 : _a.setJitter(v);
        return this;
      }
      reconnectionDelayMax(v) {
        var _a;
        if (void 0 === v) return this._reconnectionDelayMax;
        this._reconnectionDelayMax = v;
        null === (_a = this.backoff) || void 0 === _a ? void 0 : _a.setMax(v);
        return this;
      }
      timeout(v) {
        if (!arguments.length) return this._timeout;
        this._timeout = v;
        return this;
      }
      maybeReconnectOnOpen() {
        !this._reconnecting && this._reconnection && 0 === this.backoff.attempts && this.reconnect();
      }
      open(fn) {
        debug("readyState %s", this._readyState);
        if (~this._readyState.indexOf("open")) return this;
        debug("opening %s", this.uri);
        this.engine = new engine_io_client_1.Socket(this.uri, this.opts);
        const socket = this.engine;
        const self = this;
        this._readyState = "opening";
        this.skipReconnect = false;
        const openSubDestroy = on_js_1.on(socket, "open", function() {
          self.onopen();
          fn && fn();
        });
        const onError = err => {
          debug("error");
          this.cleanup();
          this._readyState = "closed";
          this.emitReserved("error", err);
          fn ? fn(err) : this.maybeReconnectOnOpen();
        };
        const errorSub = on_js_1.on(socket, "error", onError);
        if (false !== this._timeout) {
          const timeout = this._timeout;
          debug("connect attempt will timeout after %d", timeout);
          const timer = this.setTimeoutFn(() => {
            debug("connect attempt timed out after %d", timeout);
            openSubDestroy();
            onError(new Error("timeout"));
            socket.close();
          }, timeout);
          this.opts.autoUnref && timer.unref();
          this.subs.push(() => {
            this.clearTimeoutFn(timer);
          });
        }
        this.subs.push(openSubDestroy);
        this.subs.push(errorSub);
        return this;
      }
      connect(fn) {
        return this.open(fn);
      }
      onopen() {
        debug("open");
        this.cleanup();
        this._readyState = "open";
        this.emitReserved("open");
        const socket = this.engine;
        this.subs.push(on_js_1.on(socket, "ping", this.onping.bind(this)), on_js_1.on(socket, "data", this.ondata.bind(this)), on_js_1.on(socket, "error", this.onerror.bind(this)), on_js_1.on(socket, "close", this.onclose.bind(this)), on_js_1.on(this.decoder, "decoded", this.ondecoded.bind(this)));
      }
      onping() {
        this.emitReserved("ping");
      }
      ondata(data) {
        try {
          this.decoder.add(data);
        } catch (e) {
          this.onclose("parse error", e);
        }
      }
      ondecoded(packet) {
        engine_io_client_1.nextTick(() => {
          this.emitReserved("packet", packet);
        }, this.setTimeoutFn);
      }
      onerror(err) {
        debug("error", err);
        this.emitReserved("error", err);
      }
      socket(nsp, opts) {
        let socket = this.nsps[nsp];
        if (socket) this._autoConnect && !socket.active && socket.connect(); else {
          socket = new socket_js_1.Socket(this, nsp, opts);
          this.nsps[nsp] = socket;
        }
        return socket;
      }
      _destroy(socket) {
        const nsps = Object.keys(this.nsps);
        for (const nsp of nsps) {
          const socket = this.nsps[nsp];
          if (socket.active) {
            debug("socket %s is still active, skipping close", nsp);
            return;
          }
        }
        this._close();
      }
      _packet(packet) {
        debug("writing packet %j", packet);
        const encodedPackets = this.encoder.encode(packet);
        for (let i = 0; i < encodedPackets.length; i++) this.engine.write(encodedPackets[i], packet.options);
      }
      cleanup() {
        debug("cleanup");
        this.subs.forEach(subDestroy => subDestroy());
        this.subs.length = 0;
        this.decoder.destroy();
      }
      _close() {
        debug("disconnect");
        this.skipReconnect = true;
        this._reconnecting = false;
        this.onclose("forced close");
        this.engine && this.engine.close();
      }
      disconnect() {
        return this._close();
      }
      onclose(reason, description) {
        debug("closed due to %s", reason);
        this.cleanup();
        this.backoff.reset();
        this._readyState = "closed";
        this.emitReserved("close", reason, description);
        this._reconnection && !this.skipReconnect && this.reconnect();
      }
      reconnect() {
        if (this._reconnecting || this.skipReconnect) return this;
        const self = this;
        if (this.backoff.attempts >= this._reconnectionAttempts) {
          debug("reconnect failed");
          this.backoff.reset();
          this.emitReserved("reconnect_failed");
          this._reconnecting = false;
        } else {
          const delay = this.backoff.duration();
          debug("will wait %dms before reconnect attempt", delay);
          this._reconnecting = true;
          const timer = this.setTimeoutFn(() => {
            if (self.skipReconnect) return;
            debug("attempting reconnect");
            this.emitReserved("reconnect_attempt", self.backoff.attempts);
            if (self.skipReconnect) return;
            self.open(err => {
              if (err) {
                debug("reconnect attempt error");
                self._reconnecting = false;
                self.reconnect();
                this.emitReserved("reconnect_error", err);
              } else {
                debug("reconnect success");
                self.onreconnect();
              }
            });
          }, delay);
          this.opts.autoUnref && timer.unref();
          this.subs.push(() => {
            this.clearTimeoutFn(timer);
          });
        }
      }
      onreconnect() {
        const attempt = this.backoff.attempts;
        this._reconnecting = false;
        this.backoff.reset();
        this.emitReserved("reconnect", attempt);
      }
    }
    exports.Manager = Manager;
  }, {
    "./contrib/backo2.js": 30,
    "./on.js": 33,
    "./socket.js": 34,
    "@socket.io/component-emitter": 6,
    debug: 7,
    "engine.io-client": 14,
    "socket.io-parser": 37
  } ],
  33: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.on = void 0;
    function on(obj, ev, fn) {
      obj.on(ev, fn);
      return function subDestroy() {
        obj.off(ev, fn);
      };
    }
    exports.on = on;
  }, {} ],
  34: [ function(require, module, exports) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Socket = void 0;
    const socket_io_parser_1 = require("socket.io-parser");
    const on_js_1 = require("./on.js");
    const component_emitter_1 = require("@socket.io/component-emitter");
    const debug_1 = __importDefault(require("debug"));
    const debug = debug_1.default("socket.io-client:socket");
    const RESERVED_EVENTS = Object.freeze({
      connect: 1,
      connect_error: 1,
      disconnect: 1,
      disconnecting: 1,
      newListener: 1,
      removeListener: 1
    });
    class Socket extends component_emitter_1.Emitter {
      constructor(io, nsp, opts) {
        super();
        this.connected = false;
        this.recovered = false;
        this.receiveBuffer = [];
        this.sendBuffer = [];
        this._queue = [];
        this._queueSeq = 0;
        this.ids = 0;
        this.acks = {};
        this.flags = {};
        this.io = io;
        this.nsp = nsp;
        opts && opts.auth && (this.auth = opts.auth);
        this._opts = Object.assign({}, opts);
        this.io._autoConnect && this.open();
      }
      get disconnected() {
        return !this.connected;
      }
      subEvents() {
        if (this.subs) return;
        const io = this.io;
        this.subs = [ on_js_1.on(io, "open", this.onopen.bind(this)), on_js_1.on(io, "packet", this.onpacket.bind(this)), on_js_1.on(io, "error", this.onerror.bind(this)), on_js_1.on(io, "close", this.onclose.bind(this)) ];
      }
      get active() {
        return !!this.subs;
      }
      connect() {
        if (this.connected) return this;
        this.subEvents();
        this.io["_reconnecting"] || this.io.open();
        "open" === this.io._readyState && this.onopen();
        return this;
      }
      open() {
        return this.connect();
      }
      send(...args) {
        args.unshift("message");
        this.emit.apply(this, args);
        return this;
      }
      emit(ev, ...args) {
        if (RESERVED_EVENTS.hasOwnProperty(ev)) throw new Error('"' + ev.toString() + '" is a reserved event name');
        args.unshift(ev);
        if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
          this._addToQueue(args);
          return this;
        }
        const packet = {
          type: socket_io_parser_1.PacketType.EVENT,
          data: args
        };
        packet.options = {};
        packet.options.compress = false !== this.flags.compress;
        if ("function" === typeof args[args.length - 1]) {
          const id = this.ids++;
          debug("emitting packet with ack id %d", id);
          const ack = args.pop();
          this._registerAckCallback(id, ack);
          packet.id = id;
        }
        const isTransportWritable = this.io.engine && this.io.engine.transport && this.io.engine.transport.writable;
        const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
        if (discardPacket) debug("discard packet as the transport is not currently writable"); else if (this.connected) {
          this.notifyOutgoingListeners(packet);
          this.packet(packet);
        } else this.sendBuffer.push(packet);
        this.flags = {};
        return this;
      }
      _registerAckCallback(id, ack) {
        var _a;
        const timeout = null !== (_a = this.flags.timeout) && void 0 !== _a ? _a : this._opts.ackTimeout;
        if (void 0 === timeout) {
          this.acks[id] = ack;
          return;
        }
        const timer = this.io.setTimeoutFn(() => {
          delete this.acks[id];
          for (let i = 0; i < this.sendBuffer.length; i++) if (this.sendBuffer[i].id === id) {
            debug("removing packet with ack id %d from the buffer", id);
            this.sendBuffer.splice(i, 1);
          }
          debug("event with ack id %d has timed out after %d ms", id, timeout);
          ack.call(this, new Error("operation has timed out"));
        }, timeout);
        const fn = (...args) => {
          this.io.clearTimeoutFn(timer);
          ack.apply(this, args);
        };
        fn.withError = true;
        this.acks[id] = fn;
      }
      emitWithAck(ev, ...args) {
        return new Promise((resolve, reject) => {
          const fn = (arg1, arg2) => arg1 ? reject(arg1) : resolve(arg2);
          fn.withError = true;
          args.push(fn);
          this.emit(ev, ...args);
        });
      }
      _addToQueue(args) {
        let ack;
        "function" === typeof args[args.length - 1] && (ack = args.pop());
        const packet = {
          id: this._queueSeq++,
          tryCount: 0,
          pending: false,
          args: args,
          flags: Object.assign({
            fromQueue: true
          }, this.flags)
        };
        args.push((err, ...responseArgs) => {
          if (packet !== this._queue[0]) return;
          const hasError = null !== err;
          if (hasError) {
            if (packet.tryCount > this._opts.retries) {
              debug("packet [%d] is discarded after %d tries", packet.id, packet.tryCount);
              this._queue.shift();
              ack && ack(err);
            }
          } else {
            debug("packet [%d] was successfully sent", packet.id);
            this._queue.shift();
            ack && ack(null, ...responseArgs);
          }
          packet.pending = false;
          return this._drainQueue();
        });
        this._queue.push(packet);
        this._drainQueue();
      }
      _drainQueue(force = false) {
        debug("draining queue");
        if (!this.connected || 0 === this._queue.length) return;
        const packet = this._queue[0];
        if (packet.pending && !force) {
          debug("packet [%d] has already been sent and is waiting for an ack", packet.id);
          return;
        }
        packet.pending = true;
        packet.tryCount++;
        debug("sending packet [%d] (try n\xb0%d)", packet.id, packet.tryCount);
        this.flags = packet.flags;
        this.emit.apply(this, packet.args);
      }
      packet(packet) {
        packet.nsp = this.nsp;
        this.io._packet(packet);
      }
      onopen() {
        debug("transport is open - connecting");
        "function" == typeof this.auth ? this.auth(data => {
          this._sendConnectPacket(data);
        }) : this._sendConnectPacket(this.auth);
      }
      _sendConnectPacket(data) {
        this.packet({
          type: socket_io_parser_1.PacketType.CONNECT,
          data: this._pid ? Object.assign({
            pid: this._pid,
            offset: this._lastOffset
          }, data) : data
        });
      }
      onerror(err) {
        this.connected || this.emitReserved("connect_error", err);
      }
      onclose(reason, description) {
        debug("close (%s)", reason);
        this.connected = false;
        delete this.id;
        this.emitReserved("disconnect", reason, description);
        this._clearAcks();
      }
      _clearAcks() {
        Object.keys(this.acks).forEach(id => {
          const isBuffered = this.sendBuffer.some(packet => String(packet.id) === id);
          if (!isBuffered) {
            const ack = this.acks[id];
            delete this.acks[id];
            ack.withError && ack.call(this, new Error("socket has been disconnected"));
          }
        });
      }
      onpacket(packet) {
        const sameNamespace = packet.nsp === this.nsp;
        if (!sameNamespace) return;
        switch (packet.type) {
         case socket_io_parser_1.PacketType.CONNECT:
          packet.data && packet.data.sid ? this.onconnect(packet.data.sid, packet.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;

         case socket_io_parser_1.PacketType.EVENT:
         case socket_io_parser_1.PacketType.BINARY_EVENT:
          this.onevent(packet);
          break;

         case socket_io_parser_1.PacketType.ACK:
         case socket_io_parser_1.PacketType.BINARY_ACK:
          this.onack(packet);
          break;

         case socket_io_parser_1.PacketType.DISCONNECT:
          this.ondisconnect();
          break;

         case socket_io_parser_1.PacketType.CONNECT_ERROR:
          this.destroy();
          const err = new Error(packet.data.message);
          err.data = packet.data.data;
          this.emitReserved("connect_error", err);
        }
      }
      onevent(packet) {
        const args = packet.data || [];
        debug("emitting event %j", args);
        if (null != packet.id) {
          debug("attaching ack callback to event");
          args.push(this.ack(packet.id));
        }
        this.connected ? this.emitEvent(args) : this.receiveBuffer.push(Object.freeze(args));
      }
      emitEvent(args) {
        if (this._anyListeners && this._anyListeners.length) {
          const listeners = this._anyListeners.slice();
          for (const listener of listeners) listener.apply(this, args);
        }
        super.emit.apply(this, args);
        this._pid && args.length && "string" === typeof args[args.length - 1] && (this._lastOffset = args[args.length - 1]);
      }
      ack(id) {
        const self = this;
        let sent = false;
        return function(...args) {
          if (sent) return;
          sent = true;
          debug("sending ack %j", args);
          self.packet({
            type: socket_io_parser_1.PacketType.ACK,
            id: id,
            data: args
          });
        };
      }
      onack(packet) {
        const ack = this.acks[packet.id];
        if ("function" !== typeof ack) {
          debug("bad ack %s", packet.id);
          return;
        }
        delete this.acks[packet.id];
        debug("calling ack %s with %j", packet.id, packet.data);
        ack.withError && packet.data.unshift(null);
        ack.apply(this, packet.data);
      }
      onconnect(id, pid) {
        debug("socket connected with id %s", id);
        this.id = id;
        this.recovered = pid && this._pid === pid;
        this._pid = pid;
        this.connected = true;
        this.emitBuffered();
        this.emitReserved("connect");
        this._drainQueue(true);
      }
      emitBuffered() {
        this.receiveBuffer.forEach(args => this.emitEvent(args));
        this.receiveBuffer = [];
        this.sendBuffer.forEach(packet => {
          this.notifyOutgoingListeners(packet);
          this.packet(packet);
        });
        this.sendBuffer = [];
      }
      ondisconnect() {
        debug("server disconnect (%s)", this.nsp);
        this.destroy();
        this.onclose("io server disconnect");
      }
      destroy() {
        if (this.subs) {
          this.subs.forEach(subDestroy => subDestroy());
          this.subs = void 0;
        }
        this.io["_destroy"](this);
      }
      disconnect() {
        if (this.connected) {
          debug("performing disconnect (%s)", this.nsp);
          this.packet({
            type: socket_io_parser_1.PacketType.DISCONNECT
          });
        }
        this.destroy();
        this.connected && this.onclose("io client disconnect");
        return this;
      }
      close() {
        return this.disconnect();
      }
      compress(compress) {
        this.flags.compress = compress;
        return this;
      }
      get volatile() {
        this.flags.volatile = true;
        return this;
      }
      timeout(timeout) {
        this.flags.timeout = timeout;
        return this;
      }
      onAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.push(listener);
        return this;
      }
      prependAny(listener) {
        this._anyListeners = this._anyListeners || [];
        this._anyListeners.unshift(listener);
        return this;
      }
      offAny(listener) {
        if (!this._anyListeners) return this;
        if (listener) {
          const listeners = this._anyListeners;
          for (let i = 0; i < listeners.length; i++) if (listener === listeners[i]) {
            listeners.splice(i, 1);
            return this;
          }
        } else this._anyListeners = [];
        return this;
      }
      listenersAny() {
        return this._anyListeners || [];
      }
      onAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.push(listener);
        return this;
      }
      prependAnyOutgoing(listener) {
        this._anyOutgoingListeners = this._anyOutgoingListeners || [];
        this._anyOutgoingListeners.unshift(listener);
        return this;
      }
      offAnyOutgoing(listener) {
        if (!this._anyOutgoingListeners) return this;
        if (listener) {
          const listeners = this._anyOutgoingListeners;
          for (let i = 0; i < listeners.length; i++) if (listener === listeners[i]) {
            listeners.splice(i, 1);
            return this;
          }
        } else this._anyOutgoingListeners = [];
        return this;
      }
      listenersAnyOutgoing() {
        return this._anyOutgoingListeners || [];
      }
      notifyOutgoingListeners(packet) {
        if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
          const listeners = this._anyOutgoingListeners.slice();
          for (const listener of listeners) listener.apply(this, packet.data);
        }
      }
    }
    exports.Socket = Socket;
  }, {
    "./on.js": 33,
    "@socket.io/component-emitter": 6,
    debug: 7,
    "socket.io-parser": 37
  } ],
  35: [ function(require, module, exports) {
    "use strict";
    var __importDefault = this && this.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : {
        default: mod
      };
    };
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.url = void 0;
    const engine_io_client_1 = require("engine.io-client");
    const debug_1 = __importDefault(require("debug"));
    const debug = debug_1.default("socket.io-client:url");
    function url(uri, path = "", loc) {
      let obj = uri;
      loc = loc || "undefined" !== typeof location && location;
      null == uri && (uri = loc.protocol + "//" + loc.host);
      if ("string" === typeof uri) {
        "/" === uri.charAt(0) && (uri = "/" === uri.charAt(1) ? loc.protocol + uri : loc.host + uri);
        if (!/^(https?|wss?):\/\//.test(uri)) {
          debug("protocol-less url %s", uri);
          uri = "undefined" !== typeof loc ? loc.protocol + "//" + uri : "https://" + uri;
        }
        debug("parse %s", uri);
        obj = engine_io_client_1.parse(uri);
      }
      obj.port || (/^(http|ws)$/.test(obj.protocol) ? obj.port = "80" : /^(http|ws)s$/.test(obj.protocol) && (obj.port = "443"));
      obj.path = obj.path || "/";
      const ipv6 = -1 !== obj.host.indexOf(":");
      const host = ipv6 ? "[" + obj.host + "]" : obj.host;
      obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
      obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
      return obj;
    }
    exports.url = url;
  }, {
    debug: 7,
    "engine.io-client": 14
  } ],
  36: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.reconstructPacket = exports.deconstructPacket = void 0;
    const is_binary_js_1 = require("./is-binary.js");
    function deconstructPacket(packet) {
      const buffers = [];
      const packetData = packet.data;
      const pack = packet;
      pack.data = _deconstructPacket(packetData, buffers);
      pack.attachments = buffers.length;
      return {
        packet: pack,
        buffers: buffers
      };
    }
    exports.deconstructPacket = deconstructPacket;
    function _deconstructPacket(data, buffers) {
      if (!data) return data;
      if ((0, is_binary_js_1.isBinary)(data)) {
        const placeholder = {
          _placeholder: true,
          num: buffers.length
        };
        buffers.push(data);
        return placeholder;
      }
      if (Array.isArray(data)) {
        const newData = new Array(data.length);
        for (let i = 0; i < data.length; i++) newData[i] = _deconstructPacket(data[i], buffers);
        return newData;
      }
      if ("object" === typeof data && !(data instanceof Date)) {
        const newData = {};
        for (const key in data) Object.prototype.hasOwnProperty.call(data, key) && (newData[key] = _deconstructPacket(data[key], buffers));
        return newData;
      }
      return data;
    }
    function reconstructPacket(packet, buffers) {
      packet.data = _reconstructPacket(packet.data, buffers);
      delete packet.attachments;
      return packet;
    }
    exports.reconstructPacket = reconstructPacket;
    function _reconstructPacket(data, buffers) {
      if (!data) return data;
      if (data && true === data._placeholder) {
        const isIndexValid = "number" === typeof data.num && data.num >= 0 && data.num < buffers.length;
        if (isIndexValid) return buffers[data.num];
        throw new Error("illegal attachments");
      }
      if (Array.isArray(data)) for (let i = 0; i < data.length; i++) data[i] = _reconstructPacket(data[i], buffers); else if ("object" === typeof data) for (const key in data) Object.prototype.hasOwnProperty.call(data, key) && (data[key] = _reconstructPacket(data[key], buffers));
      return data;
    }
  }, {
    "./is-binary.js": 38
  } ],
  37: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.Decoder = exports.Encoder = exports.PacketType = exports.protocol = void 0;
    const component_emitter_1 = require("@socket.io/component-emitter");
    const binary_js_1 = require("./binary.js");
    const is_binary_js_1 = require("./is-binary.js");
    const debug_1 = require("debug");
    const debug = (0, debug_1.default)("socket.io-parser");
    const RESERVED_EVENTS = [ "connect", "connect_error", "disconnect", "disconnecting", "newListener", "removeListener" ];
    exports.protocol = 5;
    var PacketType;
    (function(PacketType) {
      PacketType[PacketType["CONNECT"] = 0] = "CONNECT";
      PacketType[PacketType["DISCONNECT"] = 1] = "DISCONNECT";
      PacketType[PacketType["EVENT"] = 2] = "EVENT";
      PacketType[PacketType["ACK"] = 3] = "ACK";
      PacketType[PacketType["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
      PacketType[PacketType["BINARY_EVENT"] = 5] = "BINARY_EVENT";
      PacketType[PacketType["BINARY_ACK"] = 6] = "BINARY_ACK";
    })(PacketType = exports.PacketType || (exports.PacketType = {}));
    class Encoder {
      constructor(replacer) {
        this.replacer = replacer;
      }
      encode(obj) {
        debug("encoding packet %j", obj);
        if ((obj.type === PacketType.EVENT || obj.type === PacketType.ACK) && (0, is_binary_js_1.hasBinary)(obj)) return this.encodeAsBinary({
          type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
          nsp: obj.nsp,
          data: obj.data,
          id: obj.id
        });
        return [ this.encodeAsString(obj) ];
      }
      encodeAsString(obj) {
        let str = "" + obj.type;
        obj.type !== PacketType.BINARY_EVENT && obj.type !== PacketType.BINARY_ACK || (str += obj.attachments + "-");
        obj.nsp && "/" !== obj.nsp && (str += obj.nsp + ",");
        null != obj.id && (str += obj.id);
        null != obj.data && (str += JSON.stringify(obj.data, this.replacer));
        debug("encoded %j as %s", obj, str);
        return str;
      }
      encodeAsBinary(obj) {
        const deconstruction = (0, binary_js_1.deconstructPacket)(obj);
        const pack = this.encodeAsString(deconstruction.packet);
        const buffers = deconstruction.buffers;
        buffers.unshift(pack);
        return buffers;
      }
    }
    exports.Encoder = Encoder;
    function isObject(value) {
      return "[object Object]" === Object.prototype.toString.call(value);
    }
    class Decoder extends component_emitter_1.Emitter {
      constructor(reviver) {
        super();
        this.reviver = reviver;
      }
      add(obj) {
        let packet;
        if ("string" === typeof obj) {
          if (this.reconstructor) throw new Error("got plaintext data when reconstructing a packet");
          packet = this.decodeString(obj);
          const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
          if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
            packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
            this.reconstructor = new BinaryReconstructor(packet);
            0 === packet.attachments && super.emitReserved("decoded", packet);
          } else super.emitReserved("decoded", packet);
        } else {
          if (!(0, is_binary_js_1.isBinary)(obj) && !obj.base64) throw new Error("Unknown type: " + obj);
          if (!this.reconstructor) throw new Error("got binary data when not reconstructing a packet");
          packet = this.reconstructor.takeBinaryData(obj);
          if (packet) {
            this.reconstructor = null;
            super.emitReserved("decoded", packet);
          }
        }
      }
      decodeString(str) {
        let i = 0;
        const p = {
          type: Number(str.charAt(0))
        };
        if (void 0 === PacketType[p.type]) throw new Error("unknown packet type " + p.type);
        if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
          const start = i + 1;
          while ("-" !== str.charAt(++i) && i != str.length) ;
          const buf = str.substring(start, i);
          if (buf != Number(buf) || "-" !== str.charAt(i)) throw new Error("Illegal attachments");
          p.attachments = Number(buf);
        }
        if ("/" === str.charAt(i + 1)) {
          const start = i + 1;
          while (++i) {
            const c = str.charAt(i);
            if ("," === c) break;
            if (i === str.length) break;
          }
          p.nsp = str.substring(start, i);
        } else p.nsp = "/";
        const next = str.charAt(i + 1);
        if ("" !== next && Number(next) == next) {
          const start = i + 1;
          while (++i) {
            const c = str.charAt(i);
            if (null == c || Number(c) != c) {
              --i;
              break;
            }
            if (i === str.length) break;
          }
          p.id = Number(str.substring(start, i + 1));
        }
        if (str.charAt(++i)) {
          const payload = this.tryParse(str.substr(i));
          if (!Decoder.isPayloadValid(p.type, payload)) throw new Error("invalid payload");
          p.data = payload;
        }
        debug("decoded %s as %j", str, p);
        return p;
      }
      tryParse(str) {
        try {
          return JSON.parse(str, this.reviver);
        } catch (e) {
          return false;
        }
      }
      static isPayloadValid(type, payload) {
        switch (type) {
         case PacketType.CONNECT:
          return isObject(payload);

         case PacketType.DISCONNECT:
          return void 0 === payload;

         case PacketType.CONNECT_ERROR:
          return "string" === typeof payload || isObject(payload);

         case PacketType.EVENT:
         case PacketType.BINARY_EVENT:
          return Array.isArray(payload) && ("number" === typeof payload[0] || "string" === typeof payload[0] && -1 === RESERVED_EVENTS.indexOf(payload[0]));

         case PacketType.ACK:
         case PacketType.BINARY_ACK:
          return Array.isArray(payload);
        }
      }
      destroy() {
        if (this.reconstructor) {
          this.reconstructor.finishedReconstruction();
          this.reconstructor = null;
        }
      }
    }
    exports.Decoder = Decoder;
    class BinaryReconstructor {
      constructor(packet) {
        this.packet = packet;
        this.buffers = [];
        this.reconPack = packet;
      }
      takeBinaryData(binData) {
        this.buffers.push(binData);
        if (this.buffers.length === this.reconPack.attachments) {
          const packet = (0, binary_js_1.reconstructPacket)(this.reconPack, this.buffers);
          this.finishedReconstruction();
          return packet;
        }
        return null;
      }
      finishedReconstruction() {
        this.reconPack = null;
        this.buffers = [];
      }
    }
  }, {
    "./binary.js": 36,
    "./is-binary.js": 38,
    "@socket.io/component-emitter": 6,
    debug: 7
  } ],
  38: [ function(require, module, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.hasBinary = exports.isBinary = void 0;
    const withNativeArrayBuffer = "function" === typeof ArrayBuffer;
    const isView = obj => "function" === typeof ArrayBuffer.isView ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
    const toString = Object.prototype.toString;
    const withNativeBlob = "function" === typeof Blob || "undefined" !== typeof Blob && "[object BlobConstructor]" === toString.call(Blob);
    const withNativeFile = "function" === typeof File || "undefined" !== typeof File && "[object FileConstructor]" === toString.call(File);
    function isBinary(obj) {
      return withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)) || withNativeBlob && obj instanceof Blob || withNativeFile && obj instanceof File;
    }
    exports.isBinary = isBinary;
    function hasBinary(obj, toJSON) {
      if (!obj || "object" !== typeof obj) return false;
      if (Array.isArray(obj)) {
        for (let i = 0, l = obj.length; i < l; i++) if (hasBinary(obj[i])) return true;
        return false;
      }
      if (isBinary(obj)) return true;
      if (obj.toJSON && "function" === typeof obj.toJSON && 1 === arguments.length) return hasBinary(obj.toJSON(), true);
      for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) return true;
      return false;
    }
    exports.hasBinary = hasBinary;
  }, {} ],
  main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2e6bd1ggFFI8bqeZ3TZ9K56", "main");
    "use strict";
    var io = require("socket.io-client");
    var localhost = "https://game-backend.sfinvco.com";
    var socketUrl = localhost + "/gready";
    var coin = 1;
    var coinAmount = 500;
    var userAmount = 0;
    var userId = 1;
    var tokens = 1;
    var gameScale = 1;
    var userName = "";
    var userImg = "";
    var winningBoard = 1;
    var gameScene = "gready_games";
    cc.Class({
      extends: cc.Component,
      properties: {
        MainGameController: {
          type: cc.Node,
          default: null
        },
        updateTime: cc.Label,
        boardAnimation: {
          default: null,
          type: cc.Animation
        },
        coinsInsertPlayer: {
          default: null,
          type: cc.Animation
        },
        coinPrefab1: {
          default: null,
          type: cc.Prefab
        },
        coinPrefab2: {
          default: null,
          type: cc.Prefab
        },
        coinPrefab3: {
          default: null,
          type: cc.Prefab
        },
        coinPrefab4: {
          default: null,
          type: cc.Prefab
        },
        usersAmount: {
          default: null,
          type: cc.Label
        },
        urlImageItemPrefab: cc.Prefab,
        activeUserContentNode: cc.Node,
        winnerUserPrefab: cc.Prefab,
        winnerUserContentNode: cc.Node,
        winnerUserNoOneWin: cc.Label,
        resultsFruitsContentNode: cc.Node,
        resultsFruits1: {
          default: null,
          type: cc.Prefab
        },
        resultsFruits2: {
          default: null,
          type: cc.Prefab
        },
        resultsFruits3: {
          default: null,
          type: cc.Prefab
        },
        resultsFruits4: {
          default: null,
          type: cc.Prefab
        },
        resultsFruits5: {
          default: null,
          type: cc.Prefab
        },
        resultsFruits6: {
          default: null,
          type: cc.Prefab
        },
        resultsFruits7: {
          default: null,
          type: cc.Prefab
        },
        resultsFruits8: {
          default: null,
          type: cc.Prefab
        }
      },
      onLoad: function onLoad() {
        if (window.innerHeight > 500) {
          var widget = this.MainGameController.getComponent(cc.Widget);
          widget || (widget = this.MainGameController.addComponent(cc.Widget));
          widget.isAlignBottom = true;
          widget.bottom = 400;
          widget.isAlignTop = false;
          widget.isAlignVerticalCenter = false;
          this.MainGameController.setAnchorPoint(.5, 0);
          widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
          var canvas = this.node.getComponent(cc.Canvas);
        }
        return false;
        var queryString;
        var urlParams;
        var sceneToLoad;
      },
      startGame: function startGame() {
        var _this = this;
        this.socket = io(socketUrl);
        var clickAllowed = false;
        var handsParentNode = this.node.getChildByName("stand_others");
        var handsGrippersNode = handsParentNode.getChildByName("hands-grippers");
        var handsChildren = handsGrippersNode.children;
        var actionOptions = this.node.getChildByName("action");
        var actionOptionsPlayers = actionOptions.getChildByName("players");
        var actionOptionsPlayersCoins = actionOptionsPlayers.getChildByName("all_coins");
        function handleClick(event) {
          if (clickAllowed) {
            var clickedNode = event.target;
            var name = clickedNode.name;
            var board = name.split("-")[1];
            var _this$getRandomPositi = this.getRandomPositionForBoard(board), randomX = _this$getRandomPositi.randomX, randomY = _this$getRandomPositi.randomY;
            var inserData = {
              bets: {
                coinAmount: coinAmount,
                board: board,
                userId: userId,
                userName: userName,
                userImg: userImg
              },
              coin: {
                coin: coin,
                randomX: randomX,
                randomY: randomY
              }
            };
            this.socket.emit("greadyInsertBets", inserData);
          } else console.log("Click is not allowed.");
        }
        handsChildren.forEach(function(child) {
          child.on("touchend", handleClick, _this);
        });
        var coinsGrippersNode = this.node.getChildByName("coins_wrapper").getChildByName("amount_coins_wrapper").getChildByName("coins_wrapper");
        var childrenCoins = coinsGrippersNode.children;
        var handleClickCoins = function handleClickCoins(event) {
          var clickedNode = event.target;
          var name = event.target.name;
          childrenCoins.forEach(function(child) {
            child.getChildByName("coins_bg").active = true;
            child.getChildByName("active_coin_wrapper").active = false;
          });
          clickedNode.getChildByName("coins_bg").active = false;
          clickedNode.getChildByName("active_coin_wrapper").active = true;
          coin = Number(name.split("_")[1]);
          coinAmount = Number(name.split("_")[2]);
        };
        childrenCoins.forEach(function(child) {
          child.on("touchend", handleClickCoins, _this);
        });
        this.instantiatedPrefabs = [];
        this.socket.on("greadyTimerUpdate", function(data) {
          var time = data.timer;
          console.log(data);
          if (time > 0 && time < 11) {
            _this.updateTime.string = time + "s";
            clickAllowed = true;
          } else {
            _this.updateTime.string = "Result Time";
            clickAllowed = false;
          }
          if (13 == time) {
            handsChildren.forEach(function(child) {
              child.getChildByName("back-shadow-circle").active = false;
            });
            _this.instantiatedPrefabs.forEach(function(prefab) {
              prefab.removeFromParent();
              prefab.destroy();
            });
            _this.instantiatedPrefabs = [];
            var resultsParentNode = _this.node.getChildByName("all_popup");
            resultsParentNode.getChildByName("result").active = true;
            var resultsGrippersNodeActive = _this.node.getChildByName("result_fruits");
            var resultsGrippersNodeActiveChildren = _this.node.getChildByName("result_fruits").children;
            resultsGrippersNodeActiveChildren.forEach(function(child) {
              child.active = false;
            });
            resultsGrippersNodeActive.getChildByName("fruit-meats-" + winningBoard).active = true;
            _this.scheduleOnce(function() {
              resultsParentNode.getChildByName("result").active = false;
              resultsGrippersNodeActive.getChildByName("fruit-meats-" + winningBoard).active = false;
            }, 3);
          }
        });
        this.socket.on("greadyWinnersData", function(data) {
          winningBoard = data.winners.board;
          console.log(data);
          var animState = _this.boardAnimation.play("main");
          animState.speed = 3;
          _this.scheduleOnce(function() {
            animState.speed = Number(data.winners.frame);
          }, 3);
          _this.scheduleOnce(function() {
            animState.stop();
            var handsGrippersNodeActive = handsGrippersNode.getChildByName("griper-" + winningBoard);
            cc.tween(handsGrippersNodeActive).to(.5, {
              scale: .812
            }).to(.5, {
              scale: .7
            }).union().repeatForever().start();
            _this.getUserInfo(userId);
            _this.scheduleOnce(function() {
              _this.resultForFruits(data.winnersFruits);
              _this.winnerUsers(data.rewardUsers);
              handsGrippersNodeActive.stopAllActions();
            }, 2);
          }, 5);
        });
        this.socket.on("greadyShowBets", function(data) {
          _this.usersAmount.string = _this.usersAmount.string - data.amountInt;
          _this.coinsInsertPlayer.play("coinsInsertPlayers");
          var newNode = _this.getCoinPrefab(data.coinData.coin);
          newNode.setPosition(cc.v2(-10, -50));
          actionOptionsPlayersCoins.addChild(newNode);
          _this.instantiatedPrefabs.push(newNode);
          cc.tween(newNode).to(.4, {
            position: cc.v2(data.coinData.randomX, data.coinData.randomY)
          }).start();
        });
        this.socket.emit("greadyActiveUsersConnect", {
          userAmount: userAmount,
          userId: userId,
          userName: userName,
          userImg: userImg
        });
        this.socket.on("greadyActiveUsersShow", function(data) {
          _this.resultForFruits(data.winnersFruits);
          _this.activeUserContentNode.removeAllChildren();
          data.allActiveUsers.forEach(function(curE, index) {
            if (index >= 5) return;
            var newUserItem = cc.instantiate(_this.urlImageItemPrefab);
            var sprite = newUserItem.getComponent(cc.Sprite);
            cc.assetManager.loadRemote(curE.userImage, function(err, texture) {
              if (err) {
                console.error("Error loading image:", err);
                return;
              }
              sprite.spriteFrame = new cc.SpriteFrame(texture);
              newUserItem.setPosition(newUserItem.x, newUserItem.y - 57 * index);
              _this.activeUserContentNode.addChild(newUserItem);
            });
          });
        });
      },
      resultForFruits: function resultForFruits(data) {
        this.resultsFruitsContentNode.removeAllChildren();
        for (var index = 0; index < data.length; index++) {
          var curE = data[index];
          var newNode = this.getResultFruitsPrefab(curE);
          newNode.setPosition(0, 2 - 50 * index);
          this.resultsFruitsContentNode.addChild(newNode);
          if (5 === index) break;
        }
      },
      winnerUsers: function winnerUsers(data) {
        var _this2 = this;
        this.winnerUserContentNode.removeAllChildren();
        if (data.length > 0) {
          this.winnerUserNoOneWin.string = "";
          data.forEach(function(curE, index) {
            var newNode = cc.instantiate(_this2.winnerUserPrefab);
            0 == index ? newNode.setPosition(-145, -80) : 1 == index ? newNode.setPosition(5, -80) : 2 == index && newNode.setPosition(160, -80);
            var amount = newNode.getChildByName("amount");
            var labelComponent = amount.getComponent(cc.Label);
            labelComponent.string = curE.win;
            var userImage = newNode.getChildByName("user_img").getChildByName("img");
            var userImageComponent = userImage.getComponent(cc.Sprite);
            cc.assetManager.loadRemote(curE.image, function(err, texture) {
              userImageComponent.spriteFrame = new cc.SpriteFrame(texture);
            });
            _this2.winnerUserContentNode.addChild(newNode);
          });
        } else this.winnerUserNoOneWin.string = "No one win this round ):";
      },
      sendDataToBackend: function sendDataToBackend(data) {
        var _this3 = this;
        var xhr = new XMLHttpRequest();
        var url = localhost + "/gready/game-data";
        var queryString = Object.keys(data).map(function(key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
        }).join("&");
        var fullUrl = url + "?" + queryString;
        xhr.open("GET", fullUrl, true);
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            var responseData = JSON.parse(xhr.responseText);
            userId = responseData.receivedData.userId;
            userName = responseData.receivedData.name;
            userImg = responseData.receivedData.image;
            userAmount = responseData.receivedData.amount;
            _this3.usersAmount.string = userAmount;
            responseData.receivedData.status || _this3.loadGameScene("error");
            console.log(responseData.receivedData);
            _this3.startGame();
          }
        };
        xhr.onerror = function(e) {
          console.log(e);
        };
        xhr.send();
      },
      getUserInfo: function getUserInfo(data) {
        var _this4 = this;
        var xhr = new XMLHttpRequest();
        var url = localhost + "/gready/user-info";
        var queryString = Object.keys(data).map(function(key) {
          return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
        }).join("&");
        var fullUrl = url + "?" + queryString;
        xhr.open("GET", fullUrl, true);
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            var amount = JSON.parse(xhr.responseText);
            _this4.usersAmount.string = amount;
          }
        };
        xhr.onerror = function() {
          console.error("Request failed");
        };
        xhr.send();
      },
      parseQueryString: function parseQueryString(queryString) {
        var params = {};
        var queries = queryString.split("&");
        queries.forEach(function(query) {
          var _query$split = query.split("="), key = _query$split[0], value = _query$split[1];
          params[key] = decodeURIComponent(value);
        });
        return params;
      },
      getResultFruitsPrefab: function getResultFruitsPrefab(fruits) {
        switch (fruits) {
         case 1:
          return cc.instantiate(this.resultsFruits1);

         case 2:
          return cc.instantiate(this.resultsFruits2);

         case 3:
          return cc.instantiate(this.resultsFruits3);

         case 4:
          return cc.instantiate(this.resultsFruits4);

         case 5:
          return cc.instantiate(this.resultsFruits5);

         case 6:
          return cc.instantiate(this.resultsFruits6);

         case 7:
          return cc.instantiate(this.resultsFruits7);

         default:
          return cc.instantiate(this.resultsFruits8);
        }
      },
      getCoinPrefab: function getCoinPrefab(coin) {
        switch (coin) {
         case 1:
          return cc.instantiate(this.coinPrefab1);

         case 2:
          return cc.instantiate(this.coinPrefab2);

         case 3:
          return cc.instantiate(this.coinPrefab3);

         default:
          return cc.instantiate(this.coinPrefab4);
        }
      },
      loadGameScene: function loadGameScene(sceneName) {
        cc.director.loadScene(sceneName);
      },
      getRandomPositionForBoard: function getRandomPositionForBoard(board) {
        var positions = {
          1: {
            minX: 265.765,
            maxX: 322.306,
            minY: -20.451,
            maxY: -6.015
          },
          2: {
            minX: 407.722,
            maxX: 470.402,
            minY: 68.98,
            maxY: 46.415
          },
          3: {
            minX: 554.963,
            maxX: 618.555,
            minY: 6.071,
            maxY: -14.898
          },
          4: {
            minX: 621.745,
            maxX: 685.565,
            minY: -132.28,
            maxY: -150.058
          },
          5: {
            minX: 580.035,
            maxX: 638.612,
            minY: -273.823,
            maxY: -296.16
          },
          6: {
            minX: 408.405,
            maxX: 469.49,
            minY: -329.665,
            maxY: -355.649
          },
          7: {
            minX: 260.708,
            maxX: 324.3,
            minY: -262.426,
            maxY: -285.219
          },
          8: {
            minX: 244.069,
            maxX: 305.154,
            minY: -127.721,
            maxY: -148.234
          }
        };
        var position = positions[board] || positions["8"];
        var randomX = this.getRandomInRange(position.minX, position.maxX);
        var randomY = this.getRandomInRange(position.minY, position.maxY);
        return {
          randomX: randomX,
          randomY: randomY
        };
      },
      getRandomInRange: function getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }
    });
    cc._RF.pop();
  }, {
    "socket.io-client": 31
  } ],
  "popup-winners": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "5ad96QR+l1GC5+zstjrtmoS", "popup-winners");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      winnersPopupShow: function winnersPopupShow() {
        this.node.opacity = 0;
        this.node.scale = .2;
        cc.tween(this.node).to(.5, {
          scale: 1,
          opacity: 255
        }, {
          easing: "quartInOut"
        }).start();
      },
      winnersPopupHide: function winnersPopupHide() {
        cc.tween(this.node).to(.5, {
          scale: .2,
          opacity: 0
        }, {
          easing: "quartInOut"
        }).start();
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "main", "popup-winners" ]);