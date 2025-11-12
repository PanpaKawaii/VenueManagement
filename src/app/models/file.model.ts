export const DEFAULT_FILE = "*.pdf";

export const DEFAULT_FILE_SIZE = 300 * 1000 * 1000;

export type TFile = {
    size: number;
    name: string;
    encode: string;
    gzip?: string;
};