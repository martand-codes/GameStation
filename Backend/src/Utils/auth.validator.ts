import {z} from "zod";

export const registerValidator = z.object({
    body: z.object ({
        email: z
        .string({ message: "Email is required!"})
        .trim()
        .toLowerCase()
        .email("Email not Valid!"),

        username: z
        .string({ message: "Username is required!"})
        .min(3, "Username must be minimum of 3 characters")
        .max(20, "Username should not exceed 20 chars"),

    password: z
    .string({ message: "Password Required"})
    .min(8, "Password must be atleast 8 chars"),
    
    role: z.enum(["PLAYER", "DEVELOPER"]).optional().default("PLAYER")
    }),
});

export const loginValidator = z.object({
    body: z.object ({
        identifier: z
        .string({message: "Email or Username Required"})
        .trim()
        .toLowerCase()
        .min(1, "Email or Username not Valid!"),
        password: z
        .string({message: "Password Required"})
        .min(1, "Password is required"),
    }),
});

export type LoginInput = z.infer<typeof loginValidator>["body"];
export type registerInput = z.infer<typeof registerValidator>["body"];

