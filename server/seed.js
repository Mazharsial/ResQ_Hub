import fs from 'node:fs';try{fs.unlinkSync(new URL('./data.json',import.meta.url))}catch{}console.log('Data reset. Restart the server to reseed.');
