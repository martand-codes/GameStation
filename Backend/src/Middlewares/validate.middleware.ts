import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod";
import { ZodError } from "zod";

export const validate = (Schema: AnyZodObject) => 
(req: Request, res: Response, next: NextFunction): void => {
    try {
        Schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });
        next();
    } catch(error) {
        if(error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: "Validation Failed",
                errors: error.issues
            });
            return;
        }
        next(error);
    }
}