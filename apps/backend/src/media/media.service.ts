import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { extname } from "path";
import { PrismaService } from "../prisma/prisma.service";
import { UploadMediaDto } from "./dto/upload-media.dto";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf"
]);

const maxFileSizeBytes = 10 * 1024 * 1024;

@Injectable()
export class MediaService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const serviceRoleKey = this.configService.get<string>(
      "SUPABASE_SERVICE_ROLE_KEY"
    );
    this.bucket =
      this.configService.get<string>("SUPABASE_STORAGE_BUCKET") ?? "media";

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase storage configuration");
    }

    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false
      }
    });
  }

  async upload(
    file: Express.Multer.File | undefined,
    dto: UploadMediaDto,
    uploadedBy: string
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    this.validateFile(file);

    const key = this.buildStorageKey(file, dto.folder);
    const { error: uploadError } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw new InternalServerErrorException(uploadError.message);
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(key);
    const url = data.publicUrl;

    try {
      const mediaFile = await this.prisma.mediaFile.create({
        data: {
          key,
          url,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          uploadedBy
        },
        select: {
          id: true,
          url: true,
          key: true
        }
      });

      return mediaFile;
    } catch (error) {
      await this.supabase.storage.from(this.bucket).remove([key]);
      throw error;
    }
  }

  async remove(id: string) {
    const mediaFile = await this.prisma.mediaFile.findUnique({
      where: { id },
      select: {
        id: true,
        key: true
      }
    });

    if (!mediaFile) {
      throw new NotFoundException("Media file not found");
    }

    const { error: removeError } = await this.supabase.storage
      .from(this.bucket)
      .remove([mediaFile.key]);

    if (removeError) {
      throw new InternalServerErrorException(removeError.message);
    }

    await this.prisma.mediaFile.delete({
      where: { id }
    });

    return {
      deleted: true
    };
  }

  private validateFile(file: Express.Multer.File) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Allowed: jpeg, png, webp, svg, pdf"
      );
    }

    if (file.size > maxFileSizeBytes) {
      throw new BadRequestException("File exceeds 10MB limit");
    }
  }

  private buildStorageKey(file: Express.Multer.File, folder?: string) {
    const safeFolder = folder?.replace(/^\/+|\/+$/g, "") ?? "uploads";
    const extension = extname(file.originalname).toLowerCase();
    const normalizedExtension =
      extension || this.extensionFromMimeType(file.mimetype);

    return `${safeFolder}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${normalizedExtension}`;
  }

  private extensionFromMimeType(mimeType: string) {
    const extensions: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/svg+xml": ".svg",
      "application/pdf": ".pdf"
    };

    return extensions[mimeType] ?? "";
  }
}
