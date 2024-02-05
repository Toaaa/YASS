export function formatBytes(bytes: number): string {
    const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let unitIndex = 0;

    while (bytes >= 1024) {
        bytes /= 1024;
        unitIndex++;
    }

    return `${bytes.toFixed(2)}${units[unitIndex]}`;
}

export default formatBytes;