export interface FileMetadata {
    filename: string;
    'content-type': string;
    checksum: string;
    uploadedSize: number;
    totalSize: number;
}