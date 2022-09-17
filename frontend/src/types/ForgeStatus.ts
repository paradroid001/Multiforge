export interface ForgeStats {
    cpu: {load1: number, load5: number, load15: number},
    mem: {total: number, used: number, free: number}
}
export interface ForgeStatus {
    status: number,
    details: ForgeStats,
    url: string,
    description: string
}
