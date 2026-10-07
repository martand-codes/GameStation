import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./bouncer.middleware"; // Import your custom Request type!

export const requireRole = (allowedRoles: string[]) => {

    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Unauthorized: Please log in first." });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ 
                success: false, 
                message: "Forbidden: You do not have the required clearance, Chief!" 
            });
            return;
        }

        next();
    };
};