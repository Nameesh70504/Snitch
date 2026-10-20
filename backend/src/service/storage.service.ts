import ImageKit from "imagekit";
import config from "../config/config.js";

const client = new ImageKit({
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT,
});

export interface UploadResult {
    fileId: string;
    name: string;
    url: string;
    thumbnailUrl?: string;
    height?: number;
    width?: number;
    size?: number;
    filePath?: string;
    fileType?: string;
}

export async function uploadFile(file: string, fileName: string): Promise<UploadResult> {
    const response = await client.upload({
        file,
        fileName,
        folder: "/snitch",
    });

    return response as unknown as UploadResult;
}
