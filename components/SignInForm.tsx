"use client"

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signInSchema } from "@/schemas/signInSchema";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff, Login } from "@mui/icons-material";
import Link from "next/link";

export default function SignInform() {

    const router = useRouter();
    const {signIn, isLoaded, setActive} = useSignIn();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        if(!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
            const result = await signIn.create({
                identifier: data.identifier,
                password: data.password,
            })
            if(result.status === "complete") {
                await setActive({session: result.createdSessionId});
                router.push("/dashboard");
            } else {
                setAuthError("Sign in failed. Please check your credentials and try again.");
            }
        } catch (error: any) {
            console.log("Error during sign in:", error);
            setAuthError(error.errors?.[0]?.message || "An unexpected error occurred during the sign in. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Box sx={{ 
            maxWidth: '450px', 
            margin: 'auto', 
            mt: 4,
            px: 2
        }}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardHeader 
                    title="Connexion" 
                    titleTypographyProps={{ 
                        align: 'center', 
                        fontWeight: 'bold',
                        variant: 'h5'
                    }}
                />
                <CardContent>
                    {authError && (
                        <Alert 
                            severity="error" 
                            sx={{ mb: 2 }}
                        >
                            {authError}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <TextField
                            {...register("identifier")}
                            margin="normal"
                            required
                            fullWidth
                            id="identifier"
                            label="Email ou nom d'utilisateur"
                            autoComplete="email"
                            autoFocus
                            error={!!errors.identifier}
                            helperText={errors.identifier?.message?.toString()}
                            disabled={isSubmitting}
                        />
                        <TextField
                            {...register("password")}
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Mot de passe"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            error={!!errors.password}
                            helperText={errors.password?.message?.toString()}
                            disabled={isSubmitting}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleTogglePassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={isSubmitting}
                            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Login />}
                        >
                            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                        </Button>
                    </Box>
                </CardContent>
                <CardActions sx={{ flexDirection: 'column', alignItems: 'center', pb: 3, px: 2 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                        Pas encore de compte ?{' '}
                        <Link href="/signup" style={{ textDecoration: 'none', color: 'primary.main' }}>
                            Créer un compte
                        </Link>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        <Link href="/forgot-password" style={{ textDecoration: 'none', color: 'primary.main' }}>
                            Mot de passe oublié ?
                        </Link>
                    </Typography>
                </CardActions>
            </Card>
        </Box>
    );
}