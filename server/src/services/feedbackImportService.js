import csv from "csv-parser";
import { Readable } from "node:stream";
import Feedback from "../models/Feedback.js";

const requiredColumns = ["content", "channel", "customer_label", "created_at"];
const validChannels = [
    "SUPPORT",
    "APP_REVIEW",
    "SURVEY",
    "SALES",
    "SOCIAL",
    "COMMUNITY",
    "OTHER",
];
const maximumFailureDetails = 100;

const createHttpError = (message, statusCode) => {
    const error = new Error(message);

    error.statusCode = statusCode;

    return error;
};

const normalizeChannel = (channel) =>
    channel.trim().toUpperCase().replace(/[\s-]+/g, "_");

const isEmptyRow = (row) =>
    Object.values(row).every((value) => !String(value || "").trim());

const parseCsvRows = (fileBuffer) =>
    new Promise((resolve, reject) => {
        const rows = [];
        let headers = [];

        Readable.from(fileBuffer)
            .pipe(
                csv({
                    strict: true,
                    mapHeaders: ({ header }) => header.trim().toLowerCase(),
                }),
            )
            .on("headers", (csvHeaders) => {
                headers = csvHeaders;
            })
            .on("data", (row) => {
                rows.push(row);
            })
            .on("error", () => {
                reject(createHttpError("The CSV file is malformed.", 400));
            })
            .on("end", () => {
                const missingColumns = requiredColumns.filter(
                    (column) => !headers.includes(column),
                );

                if (missingColumns.length > 0) {
                    reject(
                        createHttpError(
                            `Missing required CSV column(s): ${missingColumns.join(", ")}.`,
                            400,
                        ),
                    );

                    return;
                }

                resolve(rows);
            });
    });

export const validateCsvRow = (row) => {
    const content = String(row.content || "").trim();
    const customerLabel = String(row.customer_label || "").trim();
    const createdAtValue = String(row.created_at || "").trim();
    const normalizedChannel = normalizeChannel(String(row.channel || ""));

    if (!content) {
        return { isValid: false, reason: "Missing content." };
    }

    if (content.length > 5000) {
        return { isValid: false, reason: "Content exceeds 5000 characters." };
    }

    if (!validChannels.includes(normalizedChannel)) {
        return { isValid: false, reason: "Invalid channel." };
    }

    if (customerLabel.length > 200) {
        return { isValid: false, reason: "Customer label exceeds 200 characters." };
    }

    if (!createdAtValue) {
        return { isValid: false, reason: "Missing created_at date." };
    }

    const createdAt = new Date(createdAtValue);

    if (Number.isNaN(createdAt.getTime())) {
        return { isValid: false, reason: "Invalid created_at date." };
    }

    return {
        isValid: true,
        feedbackData: {
            content,
            channel: normalizedChannel,
            customerLabel,
            createdAt,
        },
    };
};

export const importCsvFeedback = async (workspaceId, file) => {
    if (!file) {
        throw createHttpError("A CSV file is required.", 400);
    }

    if (!file.buffer || file.buffer.length === 0) {
        throw createHttpError("The CSV file is empty.", 400);
    }

    const csvRows = await parseCsvRows(file.buffer);
    if (csvRows.every(isEmptyRow)) {
        throw createHttpError("The CSV file has no data rows.", 400);
    }
    const validRows = [];
    const failures = [];
    let failedRows = 0;
    let totalRows = 0;

    csvRows.forEach((row, index) => {
        if (isEmptyRow(row)) {
            return;
        }

        totalRows += 1;

        const result = validateCsvRow(row);

        if (!result.isValid) {
            failedRows += 1;

            if (failures.length < maximumFailureDetails) {
                failures.push({
                    row: index + 2,
                    reason: result.reason,
                });
            }

            return;
        }

        validRows.push({
            workspaceId,
            ...result.feedbackData,
            status: "NEW",
            sourceType: "CSV",
            updatedAt: result.feedbackData.createdAt,
        });
    });

    if (validRows.length > 0) {
        await Feedback.insertMany(validRows);
    }

    return {
        totalRows,
        importedRows: validRows.length,
        failedRows,
        failures,
        failureDetailsTruncated: failedRows > failures.length,
    };
};