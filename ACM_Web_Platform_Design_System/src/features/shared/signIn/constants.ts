/**
 * Constants and static data for SignIn feature
 */


export const INITIAL_FORM_STATE = {
    email: "",
    password: "",
    keepLoggedIn: false,
};

export const FORM_CONFIG = {
    emailPlaceholder: "farmer@gmail.com",
    passwordPlaceholder: "Min. 8 characters",
    minPasswordLength: 8,
} as const;

export const MESSAGES = {
    invalidCredentials: {
        title: "Invalid credentials",
        description: "Please check your email and password",
    },
    googleSignIn: {
        title: "Google Sign-In",
        description: "Google authentication is not configured in demo mode",
    },
} as const;
