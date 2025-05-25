"use client";
import {useForm} from "react-hook-form";
import { useSignUp } from "@clerk/nextjs"
import {z} from "zod";

//zod custom schema
import {signUpSchema} from "@/schemas/signUpSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {useRouter} from "next/navigation";
import {Card, CardHeader, CardBody, CardFooter} from "@heroui/card";
import { AlertCircle } from "lucide-react";

export default function SignUpForm() {
    const router = useRouter();
    const [verifying, setVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [authErrror, setAuthError] = useState<string | null>(null);
    const [verificationError, setVerificationError] = useState<string | null>(null);
    const {signUp, isLoaded, setActive} = useSignUp()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email:"",
            password:"",
            passwordConfirmation:"",
        },
    })

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        if(!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password,
            })
            await signUp.prepareEmailAddressVerification({
                strategy: "email_code"
            })
            setVerifying(true);
        } catch (error: any) {
            console.log("Error during sign up:", error);
            setAuthError(error.errors?.[0]?.message || "An unexpected error occurred during the signup. please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(!isLoaded || !signUp) return;
        setIsSubmitting(true);
        setAuthError(null);

        try  {
            
            const result = await signUp.
            attemptEmailAddressVerification({
                code: verificationCode
            })
            //todo console this result
            if(result.status === "complete") {
                await setActive({session: result.createdSessionId})
                router.push("/dashboard")
            } else {
                console.error("Verification incomplete:", result);
                setVerificationError("Verification could not be complete.");
            }
        } catch (error: any) {
            console.error("Error during verification:", error);
            setVerificationError(
                error.errors?.[0]?.message || "An unexpected error occurred during the verification. please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if(verifying) {
        return(
            <>
                <Card className="w-full max-w-md mx-auto mt-10">
                    <CardHeader>
                        <h1 className="text-2xl font-bold">Verify Your Email</h1>
                    </CardHeader>
                    <CardBody>
                        
                        <form onSubmit={handleVerificationSubmit} className="flex flex-col gap-4">
                            <h2 className="text-lg font-semibold mb-4">Enter Verification Code</h2>
                            {verificationError && (
                                <div className="text-red-500 mb-2">{verificationError}</div>
                            )}
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter your verification code"
                                className="border p-2 rounded"
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`bg-blue-500 text-white p-2 rounded ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {isSubmitting ? "Verifying..." : "Verify Code"}
                            </button>
                        </form>
                    </CardBody>
                    <CardFooter>
                        <p className="text-sm text-gray-500">Check your email for the verification code.</p>
                    </CardFooter>
                </Card>
                <h1>this is OTP entering field</h1>
            </>
        )
    }
    return(
        <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader>
                <h1 className="text-2xl font-bold">Sign Up</h1>
            </CardHeader>
            <CardBody>
                {authErrror && (
                            <div className="bg-danger-50 text-danger-700 p-4 rounded mb-4">
                                <AlertCircle className="h-5 w-5
                                flex-shrink-0 mr-2" />
                                <p>{authErrror}</p>
                            </div>
                        )}
                        
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {authErrror && (
                        <div className="text-red-500 mb-2">{authErrror}</div>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        {...register("email")}
                        className={`border p-2 rounded ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                        <span className="text-red-500 text-sm">{errors.email.message}</span>
                    )}
                    <input
                        type="password"
                        placeholder="Password"
                        {...register("password")}
                        className={`border p-2 rounded ${errors.password ? "border-red-500" : ""}`}
                    />
                    {errors.password && (
                        <span className="text-red-500 text-sm">{errors.password.message}</span>
                    )}
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        {...register("passwordConfirmation")}
                        className={`border p-2 rounded ${errors.passwordConfirmation ? "border-red-500" : ""}`}
                    />
                    {errors.passwordConfirmation && (
                        <span className="text-red-500 text-sm">{errors.passwordConfirmation.message}</span>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-blue-500 text-white p-2 rounded ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {isSubmitting ? "Signing Up..." : "Sign Up"}
                    </button>
                </form>
            </CardBody>
        </Card>
    )
}