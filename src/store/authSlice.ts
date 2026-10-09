import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";
type AuthForm = "login" | "register";

interface AuthState {
  status: AuthStatus;
  activeForm: AuthForm;
  login: {
    error: string;
    loading: boolean;
  };
  registration: {
    error: string;
    message: string;
    loading: boolean;
  };
}

const initialState: AuthState = {
  status: "loading",
  activeForm: "register",
  login: { error: "", loading: false },
  registration: { error: "", message: "", loading: false },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthStatus(state, action: PayloadAction<AuthStatus>) {
      state.status = action.payload;
    },
    setActiveAuthForm(state, action: PayloadAction<AuthForm>) {
      state.activeForm = action.payload;
      state.login = { error: "", loading: false };
      state.registration = { error: "", message: "", loading: false };
    },
    loginStarted(state) {
      state.login.loading = true;
      state.login.error = "";
    },
    loginFailed(state, action: PayloadAction<string>) {
      state.login.loading = false;
      state.login.error = action.payload;
    },
    loginSucceeded(state) {
      state.login.loading = false;
      state.login.error = "";
    },
    registrationStarted(state) {
      state.registration.loading = true;
      state.registration.error = "";
      state.registration.message = "";
    },
    registrationFailed(state, action: PayloadAction<string>) {
      state.registration.loading = false;
      state.registration.error = action.payload;
    },
    registrationNeedsConfirmation(state, action: PayloadAction<string>) {
      state.registration.loading = false;
      state.registration.message = action.payload;
    },
    registrationSucceeded(state) {
      state.registration.loading = false;
      state.registration.error = "";
      state.registration.message = "";
    },
  },
});

export const {
  loginFailed,
  loginStarted,
  loginSucceeded,
  registrationFailed,
  registrationNeedsConfirmation,
  registrationStarted,
  registrationSucceeded,
  setActiveAuthForm,
  setAuthStatus,
} = authSlice.actions;
export default authSlice.reducer;
