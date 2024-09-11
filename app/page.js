"use client";
import styles from "./page.module.css";
import { Box, Stack, Typography, Button, TextField, Divider } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { doSignInWithEmailAndPassword, doSignInWithGoogle, doCreateUserWithEmailAndPassword } from './firebase/auth';
import { useAuth } from './contexts/authContext';
import GoogleIcon from '@mui/icons-material/Google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { currentUser, userLoggedIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await doSignInWithEmailAndPassword(email, password);
      router.push('/home');
    } catch (error) {
      console.error("Error logging in with email and password", error);
      alert(error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await doCreateUserWithEmailAndPassword(email, password);
      router.push('/home');
    } catch (error) {
      console.error("Error registering with email and password", error);
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await doSignInWithGoogle();
      router.push('/home');
    } catch (error) {
      console.error("Error logging in with Google", error);
      alert(error.message);
    }
  };

  if (userLoggedIn) {
    router.push('/home');
    return null;
  }

  return (
    <Box className={styles.pageContainer}>
      <Box className={styles.leftContainer}>
        <Box className={styles.myForm}>
          <Typography variant="h5" textAlign={"center"} className={styles.welcomeMessage}>
            {isRegistering ? "Join us today" : "Welcome back!"}
          </Typography>
          <Typography variant="body1" textAlign={"center"} className={styles.subMessage}>
            Enter to get access to PantryProAI.
          </Typography>

          <Stack spacing={2} className={styles.textField}>
            <TextField
              id="email"
              label="Email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              id="password"
              label="Password"
              variant="outlined"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Stack>

          <Box className={styles.options}>
            <Button
              variant="contained"
              fullWidth
              className={styles.myFormButton}
              onClick={isRegistering ? handleRegister : handleLogin}
            >
              {isRegistering ? "Sign Up" : "Log In"}
            </Button>
          </Box>

          <Divider className={styles.divider}>Or Login with</Divider>

          <Box className={styles.socialsRow}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              className={styles.socialButton}
            >
              Sign in with Google
            </Button>
          </Box>

          <Box className={styles.myFormActions}>
            <Typography>
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <Button
                color="primary"
                onClick={() => setIsRegistering(!isRegistering)}
                className={styles.toggleButton}
              >
                {isRegistering ? "Login" : "Register here"}
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box className={styles.rightContainer}>
        <Typography variant="h1" className={styles.companyName}>
          PantryProAI
        </Typography>
        {/* <img src="/PantryLogo.png" alt="PantryProAI" className={styles.logo} /> */}
      </Box>
    </Box>
  );
}
