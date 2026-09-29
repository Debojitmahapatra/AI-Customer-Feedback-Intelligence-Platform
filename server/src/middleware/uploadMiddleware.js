import multer from "multer";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit for uploaded CSV
    files: 1,
  },
  fileFilter: (_request, file, callback) => {
    const hasCsvExtension = file.originalname.toLowerCase().endsWith(".csv");
    const allowedMimeTypes = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
    ];
    const hasAllowedMimeType = allowedMimeTypes.includes(file.mimetype);

    if (!hasCsvExtension || !hasAllowedMimeType) {
      return callback(createHttpError("Only CSV files are allowed.", 400));
    }

    return callback(null, true);
  },
});

export const uploadCsv = (request, response, next) => {
  upload.single("file")(request, response, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(createHttpError("CSV files must not exceed 5 MB.", 400));
    }

    return next(error);
  });
};