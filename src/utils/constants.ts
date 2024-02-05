import path from 'path';

// Secret key for authentication
// You can generate a random secret key using this command:
// node -e "console.log(require('crypto').randomBytes(16).toString('hex'));"
export const secretKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// The directory where the uploads will be store
// Must be in the uploadsDir directory and end with a trailing slash.
// Example: i/
export const sharexDir = 'i/';

// Your domain url
// Example: https://example.com/
// Must start with https:// and end with a trailing slash
export const domainUrl = 'https://example.com/';

// The length of the random file name (example: 5 -> a5g3b.png)
export const stringLength = 5;

// The characters that will be used in the random file name
export const stringCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
export const uploadsDir = path.join(__dirname, '../../public/uploads');
export const PORT = 3000;