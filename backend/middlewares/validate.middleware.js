exports.validate = (schema, source = "body") => {
  return (req, res, next) => {
    if (!schema) {
      console.error("Validation Error: No schema provided", {
        source,
        method: req.method,
        path: req.path,
      });

      return res.status(500).json({
        success: false,
        error: {
          type: "VALIDATION_CONFIG_ERROR",
          message: "Server misconfiguration: Validation schema missing",
          route: `${req.method} ${req.path}`,
        },
      });
    }

    const data = req[source];

    if (!data) {
      return res.status(400).json({
        success: false,
        error: {
          type: "MISSING_DATA",
          message: `No ${source} data provided`,
          route: `${req.method} ${req.path}`,
        },
      });
    }

    if (typeof data !== "object" || data === null) {
      console.error("Invalid data type", {
        source,
        method: req.method,
        path: req.path,
        type: typeof data,
        data,
      });

      return res.status(400).json({
        success: false,
        error: {
          type: "INVALID_DATA_TYPE",
          message: `Invalid ${source} data: Expected object, received ${typeof data}`,
          details: [
            { field: "root", message: `Expected object, received ${typeof data}` },
          ],
          route: `${req.method} ${req.path}`,
        },
      });
    }

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join(".") || "root",
        message: err.message,
        code: err.code,
      }));

      console.error("Validation Error", {
        source,
        method: req.method,
        path: req.path,
        errors,
        rawData: req[source],
      });

      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors,
          route: `${req.method} ${req.path}`,
        },
      });
    }

    // store validated data
    req[`validated${source.charAt(0).toUpperCase() + source.slice(1)}`] =
      result.data;

    next();
  };
};