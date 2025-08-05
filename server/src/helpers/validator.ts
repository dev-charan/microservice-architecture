import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { BadRequestError } from "../core/CustomError";

export enum ValidationSource {
  BODY = "body",
  QUERY = "query",
  HEADER = "headers",
  PARAM = "params",
}

const validateRequest = (schema: ZodType<any>, source: ValidationSource) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues.map((err) => err.message).join(", ");
      return next(new BadRequestError(message));
    }

    // Replace the original data with the validated one
    Object.assign(req[source], result.data);
    next();
  };
};

export default validateRequest;
