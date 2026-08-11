const zlib = require('zlib');

// Built-in high performance response compression middleware using Node.js zlib
const responseCompression = (req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Only compress GET and HEAD requests that client accepts compression for
  if (!acceptEncoding || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const originalSend = res.send;

  res.send = function (body) {
    // If response already committed or already encoded, pass through
    if (res.headersSent || res.getHeader('Content-Encoding')) {
      return originalSend.call(this, body);
    }

    let buffer;
    if (typeof body === 'string') {
      buffer = Buffer.from(body, 'utf-8');
    } else if (Buffer.isBuffer(body)) {
      buffer = body;
    } else if (body !== null && typeof body === 'object') {
      try {
        buffer = Buffer.from(JSON.stringify(body), 'utf-8');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } catch {
        return originalSend.call(this, body);
      }
    } else {
      return originalSend.call(this, body);
    }

    // Only compress payloads larger than 1KB (1024 bytes)
    if (buffer.length < 1024) {
      return originalSend.call(this, buffer);
    }

    res.setHeader('Vary', 'Accept-Encoding');

    // Prefer Brotli if supported, otherwise Gzip
    if (acceptEncoding.includes('br') && zlib.brotliCompress) {
      zlib.brotliCompress(buffer, (err, compressed) => {
        if (err || !compressed) {
          return originalSend.call(this, buffer);
        }
        res.setHeader('Content-Encoding', 'br');
        res.setHeader('Content-Length', compressed.length);
        originalSend.call(this, compressed);
      });
    } else if (acceptEncoding.includes('gzip')) {
      zlib.gzip(buffer, (err, compressed) => {
        if (err || !compressed) {
          return originalSend.call(this, buffer);
        }
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        originalSend.call(this, compressed);
      });
    } else if (acceptEncoding.includes('deflate')) {
      zlib.deflate(buffer, (err, compressed) => {
        if (err || !compressed) {
          return originalSend.call(this, buffer);
        }
        res.setHeader('Content-Encoding', 'deflate');
        res.setHeader('Content-Length', compressed.length);
        originalSend.call(this, compressed);
      });
    } else {
      originalSend.call(this, buffer);
    }
  };

  next();
};

module.exports = responseCompression;
