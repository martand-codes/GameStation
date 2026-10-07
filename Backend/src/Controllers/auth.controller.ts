import type {Request, Response} from "express";
import {registerUser, verifyUser, createSession, logoutSession} from "../Services/auth.service.js";
import {refreshSession} from "../Services/auth.service.js";
import { prisma } from "../prisma/db.js";
import { ConflictError, UnauthorizedError } from "../Utils/errors.js";

export const registerHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUser = await registerUser(req.body);
        const {accessToken, refreshToken} = await createSession(newUser.id, newUser.role);

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
        const {accessToken, refreshToken} = await createSession(user.id, user.role);

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

        const {accessToken, refreshToken: newRefreshToken} = await refreshSession(refreshToken);

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
