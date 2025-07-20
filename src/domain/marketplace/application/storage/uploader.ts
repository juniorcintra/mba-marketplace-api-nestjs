export interface UploadParams {
  fileName: string;
  fileType: string;
  body: Buffer;
}

export abstract class Uploader {
  abstract upload(params: UploadParams[]): Promise<{ paths: string[] }>;
  abstract get(filePath: string): Promise<string | null>;
}
