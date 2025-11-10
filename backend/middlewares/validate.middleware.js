exports.validate = (schema, source = "body") => {
  return (req, res, next) => {
    if (!schema) {
      console.error("Validation Error: No schema provided", {
        source,
        method: req.method,
        path: req.path,
      });

      return res.status(500).json({
        status: 'error',
        message: "Server misconfiguration: Validation schema missing",
        code: "VALIDATION_CONFIG_ERROR",
        details: {
          route: `${req.method} ${req.path}`,
        },
      });
    }

    const data = req[source];

    if (!data) {
      return res.status(400).json({
        status: 'error',
        message: `No ${source} data provided`,
        code: "MISSING_DATA",
        details: {
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
        status: 'error',
        message: `Invalid ${source} data: Expected object, received ${typeof data}`,
        code: "INVALID_DATA_TYPE",
        details: {
          field: "root",
          expected: "object",
          received: typeof data,
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
        status: 'error',
        message: errors.map(e => `${e.field}: ${e.message}`).join(', ') || "Validation failed",
        code: "VALIDATION_ERROR",
        details: {
          fields: errors,
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