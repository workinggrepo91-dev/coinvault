const dns = require('node:dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const origLookup = dns.lookup.bind(dns);

dns.lookup = function (hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (typeof options === 'number') {
    options = { family: options };
  } else if (!options) {
    options = {};
  }

  origLookup(hostname, options, (err, address, family) => {
    if (!err) {
      return callback(null, address, family);
    }

    // Fallback using public DNS
    const resolve4 = dns.resolve4.bind(dns);
    const resolve6 = dns.resolve6.bind(dns);

    if (options.family === 6) {
      resolve6(hostname, (resErr, addrs) => {
        if (resErr) return callback(err);
        if (options.all) {
          return callback(null, addrs.map((a) => ({ address: a, family: 6 })));
        }
        return callback(null, addrs[0], 6);
      });
      return;
    }

    resolve4(hostname, (resErr, addrs) => {
      if (!resErr && addrs && addrs.length > 0) {
        if (options.all) {
          return callback(null, addrs.map((a) => ({ address: a, family: 4 })));
        }
        return callback(null, addrs[0], 4);
      }

      // Try IPv6 as backup
      resolve6(hostname, (res6Err, addrs6) => {
        if (!res6Err && addrs6 && addrs6.length > 0) {
          if (options.all) {
            return callback(null, addrs6.map((a) => ({ address: a, family: 6 })));
          }
          return callback(null, addrs6[0], 6);
        }
        return callback(err);
      });
    });
  });
};
