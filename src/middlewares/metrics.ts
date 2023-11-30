import { Request, Response, NextFunction } from 'express';
import { execSync } from 'child_process';

interface Metrics {
    cpu: CPUStats;
    ram: string;
    storage: string;
    cpu_temperature: string;
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
}

function getCPUUsage(): CPUStats {
    const usage = execSync("top -bn1 | awk '/^%Cpu/{print $2+$4+$6}'").toString().split(' ')[0].trim();
    const cores = execSync('nproc').toString().trim();

    return { usage: `${usage}%`, cores };
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
    let used = parseFloat(output[2]);
    let total = parseFloat(output[1]);
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;

    while (used >= 1024 || total >= 1024) {
        used /= 1024;
        total /= 1024;
        unitIndex++;
    }

    return `${used.toFixed(2)}${units[unitIndex]} of ${total.toFixed(2)}${units[unitIndex]}`;
}

function getCPUTemperature(): { celsius: string; fahrenheit: string } {
    const output = execSync('sensors').toString();
    const match = output.match(/Tctl:\s+\+(.*?) C/);
    const temperatureCelsius = match ? parseFloat(match[1]).toFixed(1) : 'N/A';
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

export async function getMetrics(_req: Request, res: Response, _next: NextFunction) {
    const includeOptionalStats = true;

    const temperatures = getCPUTemperature();
    const cpuStats = getCPUUsage();
    const data: Metrics = {
        cpu: {
            usage: cpuStats.usage,
            cores: cpuStats.cores,
        },
        ram: getRAMUsage(),
        storage: getStorageUsage(),
        cpu_temperature: temperatures.celsius,
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