import { sendError } from "../utils/response.js";

// Zod validation middleware
export const validate =
  (schema, target = "body") =>
  (req, res, next) => {
    try {
      console.log("/n VALIDATE START /n");
      const result = schema.parse(req[target]);
      req[target] = result;
      return next();
    } catch (err) {
      if (err && err.errors) {
        const errors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return sendError(res, "Validation failed", 422, errors);
      }
      return next(err);
    }
  };
