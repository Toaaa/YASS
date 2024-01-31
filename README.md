# YASS
## Yet Another ShareX Server

YASS is a ShareX server implementation written in TypeScript, providing features like in-url image resizing, authentication using a secret key, customizable file naming scheme, a (*somewhat*) strongly typed API, and server metrics.

## Features

- **In-url Image Resizing:** Perform image resizing in the URL like `https://example.com/i/image.jpg?r=300x200&a=fit`.

- **Authentication:** Secure your server with a secret key.

- **Customizable File Naming Scheme:** Tailor the file naming scheme to meet your needs.

- **Strongly Typed API:** Benefit from a type-safe API to enhance development experience.

- **Server Metrics**: Monitor CPU, RAM, CPU temperatures, disk space, count and size of all uploads, and more.

## Setup Guide

### 1. Clone the repository
```bash
git clone https://github.com/toaaa/yass.git
cd yass
npm install
```

### 2. Configure
Update the constants in `src/utils/constants.ts`:
```ts
import path from 'path';

export const secretKey = 'YourSecretKeyHere';
export const sharexDir = 'i/';
export const domainUrl = 'https://example.com';
export const stringLength = 5;
export const stringCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
export const uploadsDir = path.join(__dirname, '../../public/uploads');
export const PORT = 3000;
```

### 4. Build & Run the Server
```bash
npm run build
npm run start
```

## ShareX Configuration

1. Right-click on the ShareX tray icon.
2. Select `Destinations` > `Custom uploader settings...`.
3. Create a new custom uploader with a preferred name.
4. Set the method to `POST`.
5. In the `Request URL` field, enter `https://your-domain.com/upload`.
6. Set the body name to `secret` and provide the value as your specified `secretKey`.
7. Click on `Image uploader > Test` in the bottom left corner to verify that YASS is working.
