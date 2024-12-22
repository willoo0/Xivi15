// This file configures Ultraviolet's proxy settings
self.__uv$config = {
  prefix: '/service/',
  bare: '/bare/',
  encodeUrl: Ultraviolet.codec.xor.encode,
  decodeUrl: Ultraviolet.codec.xor.decode,
  handler: '/uv/uv.handler.js',
  bundle: '/uv/uv.bundle.js',
  config: '/uv/uv.config.js',
  sw: '/uv/uv.sw.js'
};

// Log when config is loaded for debugging
console.log('UV config loaded:', self.__uv$config);
