
export function getEnvVar(key: string): string {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set.`);
    }
    return value;
}

export function getEnvVarNumber(key: string): number {
    const value = getEnvVar(key);
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
        throw new Error(`Environment variable ${key} is not a valid number.`);
    }
    return numberValue;
}
