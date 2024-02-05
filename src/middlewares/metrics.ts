import { Request, Response, NextFunction } from 'express';
import { execSync } from 'child_process';
import formatBytes from '../utils/formatBytes';
import path from 'path';

interface Metrics {
    cpu: CPUStats;
    ram: string;
    cpu_temperature: string;
    disk_space: string;
    uploads_count: string;
    uploads_size: any;
    os?: string;
    virtualization?: string;
    ipv4_address?: string;
    timezone?: string;
    timestamp?: string;
    timestamp_unix?: number;
}

interface CPUStats {
    usage: string;
    cores: string;
    model: string;
}

function getCPUModelName(): string {
    return execSync(`lscpu | grep "Model name:" | sed -r 's/Model name:\\s+//g'`).toString().trim();
}

function getCPUUsage(): CPUStats {
    const usage = execSync("top -bn1 | awk '/^%Cpu/{print $2+$4+$6}'").toString().split(' ')[0].trim();
    const cores = execSync('nproc').toString().trim();
    const model = getCPUModelName();

    return { usage: `${usage}%`, cores, model };
}

function getRAMUsage(): string {
    const memInfo = execSync('cat /proc/meminfo').toString();
    const total = parseFloat(memInfo.match(/^MemTotal:\s+(\d+) kB$/m)![1]) / 1024; // Total RAM in MB
    const available = parseFloat(memInfo.match(/^MemAvailable:\s+(\d+) kB$/m)![1]) / 1024; // Available RAM in MB
    const usage = (((total - available) / total) * 100).toFixed(1);
    return `${usage}%`;
}

function getStorageUsage(filesystemPath: string = '/'): string {
    const output = execSync(`df -B1 ${filesystemPath} | tail -n 1`).toString().split(/\s+/);
    const usedBytes = parseFloat(output[2]);
    const totalBytes = parseFloat(output[1]);

    const usedFormatted = formatBytes(usedBytes);
    const totalFormatted = formatBytes(totalBytes);

    return `${usedFormatted} of ${totalFormatted}`;
}

function getCPUTemperature(): { celsius: string; fahrenheit: string } {
    const output = execSync('sensors').toString();
    const match = output.match(/Composite:\s+\+(.*?)°C/);
    const temperatureCelsius = match ? match[1] : 'N/A';
    const temperatureFahrenheit = match ? (((parseFloat(match[1]) * 9) / 5) + 32).toFixed(1) : 'N/A';
    return { celsius: `${temperatureCelsius}°C`, fahrenheit: `${temperatureFahrenheit}°F` };
}

function getOperatingSystem(): string {
    return execSync('lsb_release -ds').toString().trim();
}

function getVirtualization(): string {
    return execSync('systemd-detect-virt').toString().trim();
}
async function getIPv4Address(): Promise<string> {
    try {
        const response = await fetch('https://ipinfo.io/json');
        if (response.ok) {
            const data = await response.json();
            return data.ip || 'N/A';
        } else {
            throw new Error('Failed to fetch IPv4 address');
        }
    } catch (err) {
        console.error(`Error fetching IPv4 address: ${err}`);
        return 'N/A';
    }
}

function getTimezone(): string {
    return execSync("timedatectl | grep 'Time zone' | awk '{print $3}'").toString().trim();
}

function getFileCount(): number {
    try {
        const command = `find "public/uploads" -type f -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" | wc -l`;
        const fileCount = execSync(command).toString().trim();
        return parseInt(fileCount);
    } catch (error) {
        console.error(`Error counting files: ${error}`);
        return -1;
    }
}

function getFileSizes(): string {
    try {
        const command = `du -sb public/uploads/i | cut -f1`;
        let fileSizeBytes = parseInt(execSync(command).toString().trim());

        const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        let unitIndex = 0;

        while (fileSizeBytes >= 1024 && unitIndex < units.length - 1) {
            fileSizeBytes /= 1024;
            unitIndex++;
        }

        return `${fileSizeBytes.toFixed(2)} ${units[unitIndex]}`;
    } catch (error) {
        console.error(`Error getting file sizes: ${error}`);
        return 'N/A';
    }
}

export async function getMetrics(_req: Request, res: Response, _next: NextFunction) {
    const includeOptionalStats = true;

    const temperatures = getCPUTemperature();
    const cpuStats = getCPUUsage();
    const data: Metrics = {
        cpu: {
            usage: cpuStats.usage,
            cores: cpuStats.cores,
            model: cpuStats.model,
        },
        ram: getRAMUsage(),
        cpu_temperature: temperatures.celsius,
        disk_space: getStorageUsage(),
        uploads_count: `${getFileCount()} files uploaded`,
        uploads_size: getFileSizes(),
    };

    if (includeOptionalStats) {
        data.os = getOperatingSystem();
        data.virtualization = getVirtualization();
        data.ipv4_address = await getIPv4Address();
        data.timezone = getTimezone();
    }

    data.timestamp = new Date().toISOString();
    data.timestamp_unix = Math.floor(Date.now() / 1000);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(data, null, 2));
}