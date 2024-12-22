self.__uv$config = {
  prefix: '/service/',
  bare: '/bare/',
  encodeUrl: self.Ultraviolet.codec.xor.encode,
  decodeUrl: self.Ultraviolet.codec.xor.decode,
  handler: '/uv/uv.handler.js',
  bundle: '/uv/uv.bundle.js',
  config: '/uv/uv.config.js',
  sw: '/uv/uv.sw.js',
};
