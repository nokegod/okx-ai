const { ethers } = require('ethers');

function resolveUrl(u) {
  if (!u) return u;
  const s = String(u).trim();
  if (s.startsWith('ipfs://')) {
    const cid = s.replace('ipfs://', '').replace(/^ipfs\//, '');
    return `https://ipfs.io/ipfs/${cid}`;
  }
  return s; // http/https return directly
}

async function main() {
  const addr = process.argv[2];
  if (!addr) {
    console.error('Usage: node scripts/quick-inspect.js <contractAddress>');
    process.exit(1);
  }
  const provider = new ethers.JsonRpcProvider('https://rpc.xlayer.tech');
  const abi = [
    'function description() view returns (string)',
    'function image() view returns (string)',
    'function website() view returns (string)',
    'function telegram() view returns (string)',
    'function twitter() view returns (string)',
    'function uri() view returns (string)',
    'function name() view returns (string)',
    'function symbol() view returns (string)'
  ];
  const contract = new ethers.Contract(addr, abi, provider);
  const out = { address: addr };
  async function tryCall(key, fn) {
    try { const v = await fn(); if (v && typeof v === 'string') out[key] = v; } catch (_) {}
  }
  await tryCall('name', () => contract.name());
  await tryCall('symbol', () => contract.symbol());
  await tryCall('description', () => contract.description());
  await tryCall('image', () => contract.image());
  await tryCall('website', () => contract.website());
  await tryCall('telegram', () => contract.telegram());
  await tryCall('twitter', () => contract.twitter());
  await tryCall('uri', () => contract.uri());

  // Parse metadata
  if (out.uri) {
    const url = resolveUrl(out.uri);
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        out.metadata = data;
        ['name','symbol','image','website','telegram','twitter','description'].forEach(k=>{
          if (!out[k] && data && typeof data[k] === 'string') out[k] = data[k];
        });
      } else {
        out.metadataFetchStatus = res.status;
      }
    } catch (e) {
      out.metadataError = e.message;
    }
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch(e=>{ console.error(e); process.exit(1); });
