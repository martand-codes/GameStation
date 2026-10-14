import type {Request, Response} from "express";
import type { AuthRequest } from "../Middlewares/bouncer.middleware.js";
import {registerUser, verifyUser, createSession, logoutSession} from "../Services/auth.service.js";
import {refreshSession} from "../Services/auth.service.js";
import { prisma } from "../prisma/db.js";
import { ConflictError, UnauthorizedError } from "../Utils/errors.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUser = await registerUser(req.body);
        const {accessToken, refreshToken} = await createSession(newUser.id, newUser.role, req.headers["user-agent"]);

        res.status(201).json({
            success: true,
            message: "User Registered Successfully!",
            tokens: {accessToken, refreshToken},
            user: newUser
        });

    } catch (error: unknown) {
        if(error instanceof ConflictError) {
            res.status(409).json({
                success: false,
                message: error.message
            });
            return;
        }

        console.error("Registration Error: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await verifyUser(req.body);
        const {accessToken, refreshToken} = await createSession(user.id, user.role, req.headers["user-agent"]);

        res.status(200).json({
            success: true,
            message: "Login successful",
            tokens: { accessToken, refreshToken },
            user: user,
        })
    } catch (error: unknown) {
        if (error instanceof UnauthorizedError) {
            res.status(401).json({ success: false, message: error.message });
            return;
        }
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
    
};

export const refreshHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;
        if(!refreshToken) {
            res.status(400).json({
                success: false,
                message: "Refresh token is Required!"
            });
            return;
        }

        const {accessToken, refreshToken: newRefreshToken} = await refreshSession(refreshToken, req.headers["user-agent"]);

        res.status(200).json ({
            success: true,
            message: "Welcome Chief!",
            tokens:{
                accessToken,
                refreshToken: newRefreshToken
            } 
        });
    } catch(error: unknown) {
        console.error("Refresh Error: ", error);

        res.status(401).json({
            success: false,
            message: "Please Login Chief"
        });

    };
};

export const testPlayerHandler = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ 
        success: true, 
        message: "You are logged in! Welcome to the main floor." 
    });
};

export const testAdminHandler = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({ 
        success: true, 
        message: "Welcome to the Manager's Office, Boss!" 
    });
};

export const testDevHandler = async (_req: Request, res: Response): Promise <void> => {
    res.status(200).json({
        success: true,
        message: "Welcome Dev, Please make optimized Games"
    });
};

export const logoutHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const {refreshToken} = req.body;

        if(!refreshToken) {
            res.status(400).json({
                success: false,
                message: "Refresh Token is required!"
            });
            return;
        }

        await logoutSession(refreshToken);
        res.status(200).json({
            success: true,
            message: "Good Bye Chief"
        });
    } catch(error: unknown) {
        console.error("Logout Error: ", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
    
};

// !! Temporary Backdoor For making Admin
export const makeMeAdminHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { identifier, newRole } = req.body;

        await prisma.user.updateMany({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
            data: {
                role: newRole
            }
        });

        res.status(200).json({
            success: true,
            message: `User ${identifier} has been promoted to ${newRole}!`
        });
    } catch (error) {
        console.error("Promotion Failed: ", error);
        res.status(500).json({
            success: false,
            message: "Not So Fast Lil Bro!"
        });
    }
};

/**
 * Get Authenticated User Profile & Statistics
 */
export const getProfileHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        library: true,
                        payments: true,
                        sessions: true,
                        games: true,
                    }
                },
                payments: {
                    where: { status: "SUCCESS" },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                    include: {
                        game: {
                            select: {
                                id: true,
                                title: true,
                                genre: true,
                                media: true,
                            }
                        },
                        pricing: {
                            select: {
                                editionName: true,
                            }
                        }
                    }
                },
                sessions: {
                    select: {
                        id: true,
                        deviceType: true,
                        deviceName: true,
                        createdAt: true,
                        expiresAt: true,
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const totalSpent = user.payments.reduce((acc, p) => acc + Number(p.amount), 0);

        res.status(200).json({
            success: true,
            data: {
                ...user,
                totalSpent,
            }
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Update Profile (Username, Email or Role)
 */
export const updateProfileHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }

        const { username, email, role } = req.body;
        const dataToUpdate: any = {};
        if (username && typeof username === "string") {
            dataToUpdate.username = username.trim();
        }
        if (email && typeof email === "string") {
            dataToUpdate.email = email.trim();
        }
        if (role && (role === "PLAYER" || role === "DEVELOPER")) {
            dataToUpdate.role = role;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                updatedAt: true,
            }
        });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error: any) {
        if (error.code === "P2002") {
            res.status(409).json({ success: false, message: "Username or email is already taken" });
            return;
        }
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Change User Password
 */
export const changePasswordHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }

        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ success: false, message: "Current and new passwords are required" });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            res.status(400).json({ success: false, message: "Current password is incorrect" });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Revoke Other Active Sessions
 */
export const revokeOtherSessionsHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }

        const { refreshToken } = req.body;
        let hashedCurrentToken = "";
        if (refreshToken && typeof refreshToken === "string") {
            hashedCurrentToken = crypto
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");
        }

        await (prisma.session as any).deleteMany({
            where: {
                userId,
                ...(hashedCurrentToken ? { refreshToken: { not: hashedCurrentToken } } : {})
            }
        });

        res.status(200).json({
            success: true,
            message: "All other sessions have been revoked"
        });
    } catch (error) {
        console.error("Revoke Sessions Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
