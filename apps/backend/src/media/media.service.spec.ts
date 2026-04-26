import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";
import { MediaService } from "./media.service";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn()
}));

const upload = jest.fn();
const remove = jest.fn();
const getPublicUrl = jest.fn();
const from = jest.fn(() => ({
  upload,
  remove,
  getPublicUrl
}));

function file(overrides: Partial<Express.Multer.File> = {}): Express.Multer.File {
  return {
    fieldname: "file",
    originalname: "flowchart.svg",
    encoding: "7bit",
    mimetype: "image/svg+xml",
    size: 1024,
    buffer: Buffer.from("<svg />"),
    destination: "",
    filename: "",
    path: "",
    stream: undefined as never,
    ...overrides
  };
}

function createService() {
  const prisma = {
    mediaFile: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn()
    }
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === "SUPABASE_URL") return "https://supabase.test";
      if (key === "SUPABASE_SERVICE_ROLE_KEY") return "service-role";
      if (key === "SUPABASE_STORAGE_BUCKET") return "media";
      return undefined;
    })
  };

  jest.mocked(createClient).mockReturnValue({
    storage: { from }
  } as never);

  return {
    service: new MediaService(prisma as never, configService as never),
    prisma,
    configService
  };
}

describe("MediaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    upload.mockResolvedValue({ error: null });
    remove.mockResolvedValue({ error: null });
    getPublicUrl.mockReturnValue({
      data: { publicUrl: "https://cdn.test/flowchart.svg" }
    });
  });

  it("uploads a valid file to Supabase and stores MediaFile", async () => {
    const { service, prisma } = createService();
    prisma.mediaFile.create.mockResolvedValue({
      id: "media-1",
      url: "https://cdn.test/flowchart.svg",
      key: "flowcharts/key.svg"
    });

    const result = await service.upload(file(), { folder: "flowcharts" }, "user-1");

    expect(from).toHaveBeenCalledWith("media");
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^flowcharts\/\d{4}-\d{2}-\d{2}\//),
      expect.any(Buffer),
      { contentType: "image/svg+xml", upsert: false }
    );
    expect(prisma.mediaFile.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        url: "https://cdn.test/flowchart.svg",
        mimeType: "image/svg+xml",
        sizeBytes: 1024,
        uploadedBy: "user-1"
      }),
      select: { id: true, url: true, key: true }
    });
    expect(result).toEqual({
      id: "media-1",
      url: "https://cdn.test/flowchart.svg",
      key: "flowcharts/key.svg"
    });
  });

  it("rejects missing file", async () => {
    const { service } = createService();

    await expect(service.upload(undefined, {}, "user-1")).rejects.toBeInstanceOf(
      BadRequestException
    );
  });

  it("rejects invalid mime type", async () => {
    const { service } = createService();

    await expect(
      service.upload(file({ mimetype: "text/plain" }), {}, "user-1")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects files larger than 10MB", async () => {
    const { service } = createService();

    await expect(
      service.upload(file({ size: 11 * 1024 * 1024 }), {}, "user-1")
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("throws InternalServerErrorException when Supabase upload fails", async () => {
    const { service } = createService();
    upload.mockResolvedValue({ error: { message: "storage down" } });

    await expect(service.upload(file(), {}, "user-1")).rejects.toBeInstanceOf(
      InternalServerErrorException
    );
  });

  it("removes uploaded object when database create fails", async () => {
    const { service, prisma } = createService();
    prisma.mediaFile.create.mockRejectedValue(new Error("db failed"));

    await expect(service.upload(file(), {}, "user-1")).rejects.toThrow(
      "db failed"
    );
    expect(remove).toHaveBeenCalledWith([expect.any(String)]);
  });

  it("deletes Supabase object and database row", async () => {
    const { service, prisma } = createService();
    prisma.mediaFile.findUnique.mockResolvedValue({
      id: "media-1",
      key: "flowcharts/key.svg"
    });
    prisma.mediaFile.delete.mockResolvedValue({});

    await expect(service.remove("media-1")).resolves.toEqual({ deleted: true });
    expect(remove).toHaveBeenCalledWith(["flowcharts/key.svg"]);
    expect(prisma.mediaFile.delete).toHaveBeenCalledWith({
      where: { id: "media-1" }
    });
  });

  it("throws NotFoundException when deleting missing media", async () => {
    const { service, prisma } = createService();
    prisma.mediaFile.findUnique.mockResolvedValue(null);

    await expect(service.remove("missing")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });
});
