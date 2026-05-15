import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";
import { useSession } from "../hooks/useSession";
import { useLocale } from "../localization";
import { getValidationErrors, loginSchema, registerSchema } from "../utils/validation";

const defaultLoginState = {
  email: "aarohi@brdemo.com",
  password: "demo123",
};

const defaultRegisterState = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
};

export function AuthModal() {
  const { t } = useLocale();
  const [loginForm, setLoginForm] = useState(defaultLoginState);
  const [registerForm, setRegisterForm] = useState(defaultRegisterState);
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});
  const {
    authModalMode,
    authModalOpen,
    closeAuthModal,
    openAuthModal,
    login,
    register,
    loginWithGoogle,
    isBusy,
  } = useSession();

  const isLogin = authModalMode === "login";
  const clearLoginError = (field) =>
    setLoginErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  const clearRegisterError = (field) =>
    setRegisterErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  return (
    <Modal open={authModalOpen} onClose={closeAuthModal} title={t("auth.title")}>
      <div className="mb-5 flex rounded-full bg-[#f5ebd6] p-1">
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
          className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${!isLogin ? "bg-[linear-gradient(135deg,#e2bf6c_0%,#f6e4b8_100%)] text-[#1a120e] shadow-[0_10px_24px_rgba(142,103,34,0.18)]" : "text-[#221711]"}`}
        >
          {t("common.register")}
        </button>
      </div>

      <p className="mb-5 text-sm leading-6 text-stone-600">
        {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
      </p>

      {isLogin ? (
        <form
          className="space-y-4"
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
          <Button type="submit" className="w-full" loading={isBusy}>
            {t("common.login")}
          </Button>
          <Button type="button" tone="secondary" className="w-full" onClick={() => loginWithGoogle()}>
            {t("auth.google")}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
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
            label={t("auth.phone")}
            type="tel"
            value={registerForm.phone}
            required
            error={registerErrors.phone}
            onChange={(event) => {
              clearRegisterError("phone");
              setRegisterForm((current) => ({ ...current, phone: event.target.value }));
            }}
          />
          <Input
            label={t("auth.address")}
            value={registerForm.address}
            required
            error={registerErrors.address}
            onChange={(event) => {
              clearRegisterError("address");
              setRegisterForm((current) => ({ ...current, address: event.target.value }));
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

      <p className="mt-5 text-xs leading-6 text-stone-500">{t("auth.demo")}</p>
    </Modal>
  );
}
