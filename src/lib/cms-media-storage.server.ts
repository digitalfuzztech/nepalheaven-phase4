import {
    randomUUID,
} from "node:crypto";

import {
    createReadStream,
} from "node:fs";

import {
    mkdir,
    stat,
    unlink,
    writeFile,
} from "node:fs/promises";

import {
    dirname,
    extname,
    isAbsolute,
    relative,
    resolve,
} from "node:path";

import {
    Readable,
} from "node:stream";

const DEFAULT_MAX_IMAGE_BYTES =
    20 * 1024 * 1024;

const DEFAULT_MAX_VIDEO_BYTES =
    100 * 1024 * 1024;

type CmsMediaKind =
    | "image"
    | "video";

type DetectedMedia = {
    type: CmsMediaKind;
    mimeType: string;
    extension: string;
};

function envPositiveInteger(
    name: string,
    fallback: number,
) {
    const raw =
        process.env[name]?.trim();

    if (!raw) {
        return fallback;
    }

    const value =
        Number(raw);

    if (
        !Number.isSafeInteger(
            value,
        ) ||
        value <= 0
    ) {
        throw new Error(
            `${name} must be a positive integer.`,
        );
    }

    return value;
}

export function getCmsMediaRoot() {
    const configured =
        process.env.CMS_MEDIA_ROOT?.trim();

    if (configured) {
        if (
            process.env.NODE_ENV ===
            "production" &&
            !isAbsolute(configured)
        ) {
            throw new Error(
                "CMS_MEDIA_ROOT must be an absolute path in production.",
            );
        }

        return resolve(
            configured,
        );
    }

    if (
        process.env.NODE_ENV ===
        "production"
    ) {
        throw new Error(
            "CMS_MEDIA_ROOT is required in production.",
        );
    }

    return resolve(
        process.cwd(),
        "storage",
        "cms-media",
    );
}

function startsWithBytes(
    buffer: Buffer,
    expected: number[],
    offset = 0,
) {
    if (
        buffer.length <
        offset +
        expected.length
    ) {
        return false;
    }

    return expected.every(
        (
            byte,
            index,
        ) =>
            buffer[
            offset +
            index
                ] === byte,
    );
}

function detectMedia(
    buffer: Buffer,
): DetectedMedia | null {
    /*
     * JPEG
     */
    if (
        startsWithBytes(
            buffer,
            [
                0xff,
                0xd8,
                0xff,
            ],
        )
    ) {
        return {
            type: "image",
            mimeType:
                "image/jpeg",
            extension:
                ".jpg",
        };
    }

    /*
     * PNG
     */
    if (
        startsWithBytes(
            buffer,
            [
                0x89,
                0x50,
                0x4e,
                0x47,
                0x0d,
                0x0a,
                0x1a,
                0x0a,
            ],
        )
    ) {
        return {
            type: "image",
            mimeType:
                "image/png",
            extension:
                ".png",
        };
    }

    /*
     * GIF
     */
    const gifHeader =
        buffer
            .subarray(0, 6)
            .toString(
                "ascii",
            );

    if (
        gifHeader ===
        "GIF87a" ||
        gifHeader ===
        "GIF89a"
    ) {
        return {
            type: "image",
            mimeType:
                "image/gif",
            extension:
                ".gif",
        };
    }

    /*
     * WebP:
     * RIFF....WEBP
     */
    if (
        buffer.length >=
        12 &&
        buffer
            .subarray(0, 4)
            .toString(
                "ascii",
            ) === "RIFF" &&
        buffer
            .subarray(8, 12)
            .toString(
                "ascii",
            ) === "WEBP"
    ) {
        return {
            type: "image",
            mimeType:
                "image/webp",
            extension:
                ".webp",
        };
    }

    /*
     * MP4 family:
     * bytes 4–7 = ftyp
     */
    if (
        buffer.length >=
        12 &&
        buffer
            .subarray(4, 8)
            .toString(
                "ascii",
            ) === "ftyp"
    ) {
        return {
            type: "video",
            mimeType:
                "video/mp4",
            extension:
                ".mp4",
        };
    }

    /*
     * WebM / EBML
     */
    if (
        startsWithBytes(
            buffer,
            [
                0x1a,
                0x45,
                0xdf,
                0xa3,
            ],
        )
    ) {
        return {
            type: "video",
            mimeType:
                "video/webm",
            extension:
                ".webm",
        };
    }

    return null;
}

const declaredMimeAliases:
    Record<
        string,
        string[]
    > = {
    "image/jpeg": [
        "image/jpeg",
        "image/jpg",
    ],

    "image/png": [
        "image/png",
    ],

    "image/gif": [
        "image/gif",
    ],

    "image/webp": [
        "image/webp",
    ],

    "video/mp4": [
        "video/mp4",
    ],

    "video/webm": [
        "video/webm",
    ],
};

function validateDeclaredMime(
    declaredMime:
    string,
    detected:
    DetectedMedia,
) {
    const normalized =
        declaredMime
            .trim()
            .toLowerCase();

    /*
     * Some browsers or upload clients
     * supply no MIME or generic binary
     * MIME. The signature check above
     * remains authoritative.
     */
    if (
        !normalized ||
        normalized ===
        "application/octet-stream"
    ) {
        return;
    }

    const allowed =
        declaredMimeAliases[
            detected.mimeType
            ] ?? [];

    if (
        !allowed.includes(
            normalized,
        )
    ) {
        throw new Error(
            "The file content does not match its declared file type.",
        );
    }
}

function safeOriginalFilename(
    filename: string,
    fallbackExtension:
    string,
) {
    const clean =
        filename
            .replace(
                /[\u0000-\u001F\u007F]/g,
                "",
            )
            .replace(
                /[\\/]/g,
                "_",
            )
            .trim()
            .slice(
                0,
                255,
            );

    if (clean) {
        return clean;
    }

    return (
        "upload" +
        fallbackExtension
    );
}

function storagePathFromKey(
    root: string,
    storageKey: string,
) {
    if (
        !storageKey ||
        storageKey.includes(
            "\0",
        )
    ) {
        return null;
    }

    const normalized =
        storageKey.replace(
            /\\/g,
            "/",
        );

    if (
        normalized.startsWith(
            "/",
        )
    ) {
        return null;
    }

    const segments =
        normalized.split(
            "/",
        );

    if (
        segments.some(
            (segment) =>
                !segment ||
                segment ===
                "." ||
                segment ===
                "..",
        )
    ) {
        return null;
    }

    const fullPath =
        resolve(
            root,
            ...segments,
        );

    const relativePath =
        relative(
            root,
            fullPath,
        );

    if (
        !relativePath ||
        relativePath.startsWith(
            "..",
        ) ||
        isAbsolute(
            relativePath,
        )
    ) {
        return null;
    }

    return fullPath;
}

export async function storeCmsMediaUpload(
    file: File,
) {
    const maxImageBytes =
        envPositiveInteger(
            "CMS_MEDIA_MAX_IMAGE_BYTES",
            DEFAULT_MAX_IMAGE_BYTES,
        );

    const maxVideoBytes =
        envPositiveInteger(
            "CMS_MEDIA_MAX_VIDEO_BYTES",
            DEFAULT_MAX_VIDEO_BYTES,
        );

    const absoluteMaximum =
        Math.max(
            maxImageBytes,
            maxVideoBytes,
        );

    if (
        file.size <= 0
    ) {
        throw new Error(
            "The selected file is empty.",
        );
    }

    /*
     * Reject before buffering a file
     * that exceeds every configured
     * upload limit.
     */
    if (
        file.size >
        absoluteMaximum
    ) {
        throw new Error(
            "The selected file is too large.",
        );
    }

    const buffer =
        Buffer.from(
            await file.arrayBuffer(),
        );

    const detected =
        detectMedia(
            buffer,
        );

    if (!detected) {
        throw new Error(
            "Unsupported or invalid media file. Use JPEG, PNG, WebP, GIF, MP4 or WebM.",
        );
    }

    validateDeclaredMime(
        file.type,
        detected,
    );

    const specificLimit =
        detected.type ===
        "image"
            ? maxImageBytes
            : maxVideoBytes;

    if (
        buffer.length >
        specificLimit
    ) {
        throw new Error(
            detected.type ===
            "image"
                ? "The image exceeds the configured upload size limit."
                : "The video exceeds the configured upload size limit.",
        );
    }

    const now =
        new Date();

    const year =
        String(
            now.getUTCFullYear(),
        );

    const month =
        String(
            now.getUTCMonth() +
            1,
        ).padStart(
            2,
            "0",
        );

    const storageKey =
        `${year}/${month}/${randomUUID()}${detected.extension}`;

    const root =
        getCmsMediaRoot();

    const fullPath =
        storagePathFromKey(
            root,
            storageKey,
        );

    if (!fullPath) {
        throw new Error(
            "Could not create a safe media storage path.",
        );
    }

    await mkdir(
        dirname(
            fullPath,
        ),
        {
            recursive:
                true,
        },
    );

    /*
     * wx prevents accidental overwrite.
     */
    await writeFile(
        fullPath,
        buffer,
        {
            flag: "wx",
        },
    );

    return {
        type:
        detected.type,

        mimeType:
        detected.mimeType,

        fileSizeBytes:
        buffer.length,

        storageProvider:
            "local-filesystem",

        storageKey,

        url:
            `/media/${storageKey}`,

        originalFilename:
            safeOriginalFilename(
                file.name,
                detected.extension,
            ),
    };
}

export async function removeCmsMediaStoredFile(
    storageKey: string,
) {
    const root =
        getCmsMediaRoot();

    const fullPath =
        storagePathFromKey(
            root,
            storageKey,
        );

    if (!fullPath) {
        return;
    }

    try {
        await unlink(
            fullPath,
        );
    } catch (
        error
        ) {
        if (
            error &&
            typeof error ===
            "object" &&
            "code" in error &&
            (
                error as {
                    code?: string;
                }
            ).code ===
            "ENOENT"
        ) {
            return;
        }

        throw error;
    }
}

function mimeTypeForPath(
    filePath: string,
) {
    switch (
        extname(
            filePath,
        ).toLowerCase()
        ) {
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";

        case ".png":
            return "image/png";

        case ".webp":
            return "image/webp";

        case ".gif":
            return "image/gif";

        case ".mp4":
            return "video/mp4";

        case ".webm":
            return "video/webm";

        default:
            return "application/octet-stream";
    }
}

type ByteRange = {
    start: number;
    end: number;
};

function parseByteRange(
    header: string | null,
    size: number,
):
    | ByteRange
    | null
    | "invalid" {
    if (!header) {
        return null;
    }

    const match =
        /^bytes=(\d*)-(\d*)$/.exec(
            header.trim(),
        );

    if (!match) {
        return "invalid";
    }

    const startText =
        match[1] ?? "";

    const endText =
        match[2] ?? "";

    if (
        !startText &&
        !endText
    ) {
        return "invalid";
    }

    let start: number;
    let end: number;

    /*
     * Suffix range:
     * bytes=-500
     */
    if (!startText) {
        const suffixLength =
            Number(
                endText,
            );

        if (
            !Number.isSafeInteger(
                suffixLength,
            ) ||
            suffixLength <= 0
        ) {
            return "invalid";
        }

        start =
            Math.max(
                size -
                suffixLength,
                0,
            );

        end =
            size - 1;
    } else {
        start =
            Number(
                startText,
            );

        if (
            !Number.isSafeInteger(
                start,
            ) ||
            start < 0 ||
            start >= size
        ) {
            return "invalid";
        }

        if (endText) {
            end =
                Number(
                    endText,
                );

            if (
                !Number.isSafeInteger(
                    end,
                ) ||
                end < start
            ) {
                return "invalid";
            }

            end =
                Math.min(
                    end,
                    size - 1,
                );
        } else {
            end =
                size - 1;
        }
    }

    return {
        start,
        end,
    };
}

export async function serveCmsMediaFile(
    storageKey: string,
    request: Request,
    headOnly = false,
) {
    const root =
        getCmsMediaRoot();

    const fullPath =
        storagePathFromKey(
            root,
            storageKey,
        );

    if (!fullPath) {
        return new Response(
            "Not found",
            {
                status: 404,
            },
        );
    }

    let fileStat;

    try {
        fileStat =
            await stat(
                fullPath,
            );
    } catch (
        error
        ) {
        if (
            error &&
            typeof error ===
            "object" &&
            "code" in error &&
            (
                error as {
                    code?: string;
                }
            ).code ===
            "ENOENT"
        ) {
            return new Response(
                "Not found",
                {
                    status:
                        404,
                },
            );
        }

        throw error;
    }

    if (
        !fileStat.isFile()
    ) {
        return new Response(
            "Not found",
            {
                status: 404,
            },
        );
    }

    const range =
        parseByteRange(
            request.headers.get(
                "range",
            ),
            fileStat.size,
        );

    const contentType =
        mimeTypeForPath(
            fullPath,
        );

    if (
        range ===
        "invalid"
    ) {
        return new Response(
            null,
            {
                status:
                    416,

                headers: {
                    "Content-Range":
                        `bytes */${fileStat.size}`,

                    "Accept-Ranges":
                        "bytes",
                },
            },
        );
    }

    if (range) {
        const length =
            range.end -
            range.start +
            1;

        const headers =
            new Headers({
                "Content-Type":
                contentType,

                "Content-Length":
                    String(
                        length,
                    ),

                "Content-Range":
                    `bytes ${range.start}-${range.end}/${fileStat.size}`,

                "Accept-Ranges":
                    "bytes",

                "Cache-Control":
                    "public, max-age=31536000, immutable",
            });

        if (headOnly) {
            return new Response(
                null,
                {
                    status: 206,
                    headers,
                },
            );
        }

        const stream =
            createReadStream(
                fullPath,
                {
                    start:
                    range.start,

                    end:
                    range.end,
                },
            );

        return new Response(
            Readable.toWeb(
                stream,
            ) as ReadableStream<Uint8Array>,
            {
                status: 206,
                headers,
            },
        );
    }

    const headers =
        new Headers({
            "Content-Type":
            contentType,

            "Content-Length":
                String(
                    fileStat.size,
                ),

            "Accept-Ranges":
                "bytes",

            "Cache-Control":
                "public, max-age=31536000, immutable",
        });

    if (headOnly) {
        return new Response(
            null,
            {
                status: 200,
                headers,
            },
        );
    }

    const stream =
        createReadStream(
            fullPath,
        );

    return new Response(
        Readable.toWeb(
            stream,
        ) as ReadableStream<Uint8Array>,
        {
            status: 200,
            headers,
        },
    );
}