import { add } from '../src/index.js';
if (add(2, 3) !== 5) { console.error('Expected 5'); process.exit(1); }
console.log('A1 smoke test passed');
