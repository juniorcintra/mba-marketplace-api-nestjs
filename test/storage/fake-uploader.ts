import {
  UploadParams,
  Uploader,
} from "@/domain/marketplace/application/storage/uploader";
import { randomUUID } from "crypto";

interface Upload {
  fileName: string;
  path: string;
}

export class FakeUploader implements Uploader {
  private fakeUploadDir = "C:/test";
  public uploads: Upload[] = [];

  async upload(params: UploadParams[]): Promise<{ paths: string[] }> {
    const paths = params.map((file) => {
      const path = `${randomUUID()}-${file.fileName}`;

      this.uploads.push({
        fileName: file.fileName,
        path,
      });

      return path;
    });

    return { paths };
  }

  async get(filePath: string): Promise<string | null> {
    const file = this.uploads.find((file) => file.path === filePath);

    if (!file) {
      return null;
    }

    return `${this.fakeUploadDir}/${file.path}`;
  }
}
