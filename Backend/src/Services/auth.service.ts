import bcrypt from "bcrypt";
import { prisma } from "../prisma/db.js";
import type { LoginInput, registerInput } from "../Utils/auth.validator.js";
import jwt from "jsonwebtoken";
import crypto from "node:crypto"; // We used this to hash the tokens and bcrypt refreshes everytime so used crypto instead
import { ConflictError, UnauthorizedError } from "../Utils/errors.js";

export const registerUser = async (input: registerInput) => {
    const { email, username, password, role } = input;

    const userAlready = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username }
            ]
        }
    });

    if(userAlready) {
        throw new ConflictError("This User already Exists");
    }

    // Hashing the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Saving the user
    const newUser = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword,
            role: role as any
        }
    });

    const {password: _, ...safeUser} = newUser; // _ This means I am ignoring this variable
    return safeUser;
}; 

export const verifyUser = async(input: LoginInput) => {
    const { identifier, password } = input;

    const existedUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        }
    });

    if(!existedUser) {
        throw new UnauthorizedError("Credentials Invalid");
    }

    const passwordValid = await bcrypt.compare(password, existedUser.password);
    if(!passwordValid) {
        throw new UnauthorizedError("Credentials Invalid");
    }

    const { password: _, ...safeUser} = existedUser;

    return safeUser;
};

export const createSession = async (userId: string, role: string) => {
    
    const accessToken = jwt.sign(
        {userId, role},
        process.env.JWT_ACCESS_KEY as string,
        {expiresIn: "10m"}
    );

    const refreshToken = jwt.sign(
        {userId, role},
        process.env.JWT_REFRESH_KEY as string,
        {expiresIn: "7d"}
    );

    // Calculating Expiry
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 );

    // Hashing the token
    const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
    
    // Saving the session in the session Table
    await prisma.session.create({
        data: {
            userId,
            refreshToken: hashedRefreshToken,
            expiresAt
        }
    });

    return {accessToken, refreshToken};
};

export const refreshSession = async (incomingRefreshToken: string) => {
     jwt.verify(
        incomingRefreshToken, 
        process.env.JWT_REFRESH_KEY as string
    );
    
    const hashedToken = crypto
        .createHash("sha256")
        .update(incomingRefreshToken)
        .digest("hex");

    const session = await prisma.session.findFirst({
        where: { refreshToken: hashedToken }
    });

    if (!session) {
        throw new Error("Session not found or already used");
    }

    if (new Date(session.expiresAt) < new Date()) {
        await prisma.session.delete({ where: { id: session.id } });
        throw new Error("Session expired. Please log in again.");
    }
    const user = await prisma.user.findFirst({
        where: { id: session.userId }
    });

    if (!user) {
        throw new Error("User no longer exists");
    }
    await prisma.session.delete({ where: { id: session.id } });
    return await createSession(session.userId, user.role);
};

export const logoutSession = async (incomingRefreshToken: string) => {
    const hashedToken = crypto
    .createHash("sha256")
    .update(incomingRefreshToken)
    .digest("hex");

    await prisma.session.deleteMany({
        where: { refreshToken: hashedToken }
    });
};
