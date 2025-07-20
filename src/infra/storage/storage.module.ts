import { Uploader } from "@/domain/marketplace/application/storage/uploader";
import { Module } from "@nestjs/common";
import { DiskStorage } from "./disk-storage";
import { EnvModule } from "../env/env.module";

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Uploader,
      useClass: DiskStorage,
    },
  ],
  exports: [Uploader],
})
export class StorageModule {}
