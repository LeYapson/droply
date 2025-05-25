import * as z from 'zod';

export const signUpSchema = z.object({
    email: z
    .string()
    .min(1, {message: "Email is required"})
    .email({message: "Please enter a valid email address"}),
    password: z
    .string()
    .min(1, {message: "Password is required"})
    .min(8, {message: "password should be minimum of 8 characters"}),
    passwordConfirmation: z
    .string()
    .min(1, {message: "Please cofnirm your password"}),
})
.refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
})