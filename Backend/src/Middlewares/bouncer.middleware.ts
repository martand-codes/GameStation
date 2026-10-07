import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: { 
        userId: string;
        role: string 
    };
}

export const requireToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({
            success: false,
            message: "Unauthorized Access"
        });
        return;
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        res.status(401).json({
            success: false,
            message: "Unauthorized Access"
        });
        return;
    }

    try {
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_ACCESS_KEY as string
        );

        if (
            typeof decodedToken !== "object" ||
            decodedToken === null ||
            !("userId" in decodedToken) ||
            !("role" in decodedToken)
        ) {
            res.status(401).json({
                success: false,
                message: "Invalid Token"
            });
            return;
        }

        req.user = {
            userId: String(decodedToken.userId),
            role: String(decodedToken.role)
        };

        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
};