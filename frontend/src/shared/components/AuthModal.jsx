import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { useSession } from "../hooks/useSession";
import { useLocale } from "../localization";
import { authService } from "../services/authService";
import { getValidationErrors, loginSchema, registerSchema } from "../utils/validation";
import { notify } from "../utils/notify";

const defaultLoginState = {
  email: "",
  password: "",
};

const defaultRegisterState = {
  name: "",
  email: "",
  password: "",
};

export function AuthModal() {
  const { t } = useLocale();
  const [loginForm, setLoginForm] = useState(defaultLoginState);
  const [registerForm, setRegisterForm] = useState(defaultRegisterState);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const {
    authModalMode,
    authModalOpen,
    closeAuthModal,
    openAuthModal,
    login,
    googleLogin,
    register,
    isBusy,
  } = useSession();

  const isLogin = authModalMode === "login";
  const isRegister = authModalMode === "register";
  const isForgot = authModalMode === "forgot";

  useEffect(() => {
    if (!authModalOpen) {
      setLoginForm(defaultLoginState);
      setRegisterForm(defaultRegisterState);
      setForgotEmail("");
      setLoginErrors({});
      setRegisterErrors({});
      setForgotError("");
      setTemporaryPassword("");
    }
  }, [authModalOpen]);

  useEffect(() => {
    if (authModalOpen && (isLogin || isRegister)) {
      const GSI_SRC = "https://accounts.google.com/gsi/client";

      // Dynamically inject the GSI script only once
      const loadGsi = () => {
        return new Promise((resolve) => {
          if (window.google?.accounts?.id) {
            resolve();
            return;
          }
          const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
          if (existing) {
            // Script tag exists but hasn't loaded yet — wait for it
            existing.addEventListener("load", resolve, { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = GSI_SRC;
          script.async = true;
          script.defer = true;
          script.addEventListener("load", resolve, { once: true });
          document.head.appendChild(script);
        });
      };

      let cancelled = false;

      const timer = setTimeout(async () => {
        try {
          await loadGsi();
        } catch {
          // GSI failed to load — Google button won't render, that's OK
          return;
        }

        if (cancelled) return;

        const btnContainer = document.getElementById("google-signin-button");
        if (btnContainer && window.google?.accounts?.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "430154217113-dcf7t5l7rskr1s1625f3c5f212351235.apps.googleusercontent.com",
              callback: async (response) => {
                try {
                  await googleLogin({ idToken: response.credential });
                } catch (err) {
                  notify.error(err.message || "Google Login failed");
                }
              },
            });

            const getSafeWidth = () => {
              const clientWidth = btnContainer.clientWidth;
              if (clientWidth > 0) {
                return Math.min(380, clientWidth);
              }
              return Math.min(380, window.innerWidth - 64);
            };

            window.google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              shape: "pill",
              width: getSafeWidth(),
            });
          } catch (e) {
            // Silently handle — Google button is optional
          }
        }
      }, 200);

      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }
  }, [authModalOpen, isLogin, isRegister, googleLogin]);


  const clearLoginError = (field) =>
    setLoginErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  const clearRegisterError = (field) =>
    setRegisterErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const handleForgotSubmit = async (event) => {
    event.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError("Email is required");
      return;
    }
    setForgotError("");
    setForgotLoading(true);
    setTemporaryPassword("");

    try {
      const res = await authService.forgotPassword({ email: forgotEmail });
      notify.success("Password reset request successful!", {
        title: "Reset Success",
      });
      if (res?.temporaryPassword) {
        setTemporaryPassword(res.temporaryPassword);
      } else {
        notify.info("If the email exists, a reset link/password has been issued.");
        openAuthModal("login");
      }
    } catch (err) {
      setForgotError(err.message || "Something went wrong.");
      notify.error(err.message || "Failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Modal open={authModalOpen} onClose={closeAuthModal} title={t("auth.title")}>
      <div className="pr-1 pb-2">
        {!isForgot ? (
          <div className="mb-3 flex rounded-full bg-[#f5ebd6] p-1">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${isLogin ? "bg-[linear-gradient(135deg,#e2bf6c_0%,#f6e4b8_100%)] text-[#1a120e] shadow-[0_10px_24px_rgba(142,103,34,0.18)]" : "text-[#221711]"}`}
            >
              {t("common.login")}
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("register")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${isRegister ? "bg-[linear-gradient(135deg,#e2bf6c_0%,#f6e4b8_100%)] text-[#1a120e] shadow-[0_10px_24px_rgba(142,103,34,0.18)]" : "text-[#221711]"}`}
            >
              {t("common.register")}
            </button>
          </div>
        ) : null}

        <p className="mb-3 text-xs leading-5 text-stone-500">
          {isLogin
            ? t("auth.loginSubtitle")
            : isRegister
              ? t("auth.registerSubtitle")
              : "Enter your email address to receive a temporary password reset code."}
        </p>

        {isLogin && (
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const parsed = loginSchema.safeParse(loginForm);

              if (!parsed.success) {
                setLoginErrors(getValidationErrors(parsed.error));
                return;
              }

              setLoginErrors({});
              await login(parsed.data);
            }}
          >
            <Input
              label={t("auth.email")}
              type="email"
              value={loginForm.email}
              required
              error={loginErrors.email}
              onChange={(event) => {
                clearLoginError("email");
                setLoginForm((current) => ({ ...current, email: event.target.value }));
              }}
            />
            <Input
              label={t("auth.password")}
              type="password"
              value={loginForm.password}
              required
              error={loginErrors.password}
              onChange={(event) => {
                clearLoginError("password");
                setLoginForm((current) => ({ ...current, password: event.target.value }));
              }}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openAuthModal("forgot")}
                className="text-xs font-semibold text-[#8a5d18] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <Button type="submit" className="w-full" loading={isBusy}>
              {t("common.login")}
            </Button>
          </form>
        )}

        {isRegister && (
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const parsed = registerSchema.safeParse(registerForm);

              if (!parsed.success) {
                setRegisterErrors(getValidationErrors(parsed.error));
                return;
              }

              setRegisterErrors({});
              await register(parsed.data);
            }}
          >
            <Input
              label={t("auth.name")}
              value={registerForm.name}
              required
              error={registerErrors.name}
              onChange={(event) => {
                clearRegisterError("name");
                setRegisterForm((current) => ({ ...current, name: event.target.value }));
              }}
            />
            <Input
              label={t("auth.email")}
              type="email"
              value={registerForm.email}
              required
              error={registerErrors.email}
              onChange={(event) => {
                clearRegisterError("email");
                setRegisterForm((current) => ({ ...current, email: event.target.value }));
              }}
            />
            <Input
              label={t("auth.password")}
              type="password"
              value={registerForm.password}
              required
              error={registerErrors.password}
              onChange={(event) => {
                clearRegisterError("password");
                setRegisterForm((current) => ({ ...current, password: event.target.value }));
              }}
            />
            <Button type="submit" className="w-full" loading={isBusy}>
              {t("common.register")}
            </Button>
          </form>
        )}

        {isForgot && (
          <form className="space-y-3" onSubmit={handleForgotSubmit}>
            <Input
              label={t("auth.email")}
              type="email"
              value={forgotEmail}
              required
              error={forgotError}
              onChange={(event) => {
                setForgotError("");
                setForgotEmail(event.target.value);
              }}
            />

            {temporaryPassword && (
              <div className="rounded-2xl bg-[#fff7ea] border border-[#f3e1bf] p-4 space-y-2">
                <p className="text-xs font-semibold text-[#8a5d18] uppercase tracking-wider">
                  Temporary Password Generated (Dev Only):
                </p>
                <code className="block rounded-lg bg-stone-900 px-3 py-2 text-center text-lg font-mono font-bold text-amber-400 select-all">
                  {temporaryPassword}
                </code>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Use this temporary password to log in, then change it in your Profile workspace.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" loading={forgotLoading}>
              Reset Password
            </Button>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="text-sm font-semibold text-stone-600 hover:text-[#1a120e] transition"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {!isForgot && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2d0ae]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#fffaf2] px-3 text-stone-500 font-semibold tracking-wider">Or continue with</span>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <div id="google-signin-button" className="flex justify-center w-full min-h-[40px]" />
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
