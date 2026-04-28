"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./page.module.css";
import { useAuthStore } from "@/common/store/auth";

interface LoginFormData {
  phone: string;
  password: string;
}

interface SignupFormData {
  name: string;
  phone: string;
  password: string;
}

type AuthTab = "login" | "signup";

const PHONE_PREFIX = "(+994) ";

const LAST_LOGIN_PHONE_KEY = "last_login_phone";
const LAST_LOGIN_PASSWORD_KEY = "last_login_password";

function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length === 0) return PHONE_PREFIX;
  if (numbers.length <= 2) return PHONE_PREFIX + numbers;
  if (numbers.length <= 5) {
    return PHONE_PREFIX + numbers.slice(0, 2) + " " + numbers.slice(2);
  }
  if (numbers.length <= 7) {
    return (
      PHONE_PREFIX +
      numbers.slice(0, 2) +
      " " +
      numbers.slice(2, 5) +
      " " +
      numbers.slice(5)
    );
  }
  if (numbers.length <= 9) {
    return (
      PHONE_PREFIX +
      numbers.slice(0, 2) +
      " " +
      numbers.slice(2, 5) +
      " " +
      numbers.slice(5, 7) +
      " " +
      numbers.slice(7)
    );
  }

  return (
    PHONE_PREFIX +
    numbers.slice(0, 2) +
    " " +
    numbers.slice(2, 5) +
    " " +
    numbers.slice(5, 7) +
    " " +
    numbers.slice(7, 9)
  );
}

function cleanPhoneNumber(phone: string): string {
  return "+994" + phone.replace("(+994)", "").replace(/\D/g, "");
}

function getLocalPhoneDigits(phone: string): string {
  return phone.replace("(+994)", "").replace(/\D/g, "");
}

function toDisplayPhone(phone: string): string {
  const normalized = phone.trim();

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("+994")) {
    return formatPhoneNumber(normalized.slice(4));
  }

  if (normalized.startsWith("994")) {
    return formatPhoneNumber(normalized.slice(3));
  }

  return formatPhoneNumber(normalized);
}

export default function Page() {
  const router = useRouter();
  const { loading, actions } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [loginPhoneEditable, setLoginPhoneEditable] = useState<boolean>(false);
  const [loginPasswordEditable, setLoginPasswordEditable] =
    useState<boolean>(false);

  const [loginData, setLoginData] = useState<LoginFormData>({
    phone: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<SignupFormData>({
    name: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedPhone = localStorage.getItem(LAST_LOGIN_PHONE_KEY) || "";
    const savedPassword = localStorage.getItem(LAST_LOGIN_PASSWORD_KEY) || "";

    if (!savedPhone && !savedPassword) {
      return;
    }

    setLoginData({
      phone: toDisplayPhone(savedPhone),
      password: savedPassword,
    });
  }, []);

  const handleTabChange = useCallback((tab: AuthTab) => {
    setActiveTab(tab);
    setShowPassword(false);
    setSubmitError("");

    if (tab === "login") {
      setLoginPhoneEditable(false);
      setLoginPasswordEditable(false);
    }
  }, []);

  const parseErrorMessage = useCallback(
    (error: unknown): string => {
      const err = error as {
        response?: { data?: { message?: string | string[]; error?: string } };
        message?: string;
      };

      const raw =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      const text = Array.isArray(raw)
        ? raw.join(", ")
        : raw || "Bilinmeyen xeta";
      const lower = text.toLowerCase();

      if (activeTab === "login") {
        if (lower.includes("password") && lower.includes("wrong")) {
          return "Parol yanlisdir";
        }
        if (lower.includes("not found") || lower.includes("user")) {
          return "Bu telefon nomresi ile hesab tapilmadi";
        }
        if (lower.includes("phone")) {
          return "Telefon nomresi formati yanlisdir";
        }
      } else {
        if (lower.includes("already") || lower.includes("exists")) {
          return "Bu telefon nomresi ile artiq qeydiyyat var";
        }
        if (lower.includes("required")) {
          return "Butun saheler doldurulmalidir";
        }
        if (lower.includes("password")) {
          return "Parol formati uygun deyil";
        }
        if (lower.includes("phone")) {
          return "Telefon nomresi formati yanlisdir";
        }
      }

      return text;
    },
    [activeTab],
  );

  const handleLoginChange = useCallback(
    (field: keyof LoginFormData, value: string) => {
      if (submitError) {
        setSubmitError("");
      }
      setLoginData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [submitError],
  );

  const handleSignupChange = useCallback(
    (field: keyof SignupFormData, value: string) => {
      if (submitError) {
        setSubmitError("");
      }
      setSignupData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [submitError],
  );

  const handlePhoneFocus = useCallback(
    (isLogin: boolean) => {
      const current = isLogin ? loginData.phone : signupData.phone;
      if (!current || current === PHONE_PREFIX) {
        if (isLogin) {
          handleLoginChange("phone", PHONE_PREFIX);
        } else {
          handleSignupChange("phone", PHONE_PREFIX);
        }
      }
    },
    [loginData.phone, signupData.phone, handleLoginChange, handleSignupChange],
  );

  const handlePhoneChange = useCallback(
    (value: string, isLogin: boolean) => {
      const clean = value.replace("(+994)", "").replace(/\D/g, "");
      const formatted = formatPhoneNumber(clean);
      if (isLogin) {
        handleLoginChange("phone", formatted);
      } else {
        handleSignupChange("phone", formatted);
      }
    },
    [handleLoginChange, handleSignupChange],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const isFormValid = useMemo(() => {
    const loginPhoneDigits = getLocalPhoneDigits(loginData.phone);
    const signupPhoneDigits = getLocalPhoneDigits(signupData.phone);

    if (activeTab === "login") {
      return Boolean(
        loginPhoneDigits.length === 9 && loginData.password.trim(),
      );
    }

    return Boolean(
      signupData.name.trim() &&
      signupPhoneDigits.length === 9 &&
      signupData.password.trim(),
    );
  }, [activeTab, loginData, signupData]);

  const handleLogin = useCallback(async () => {
    setSubmitError("");
    await actions.login(
      {
        phone: cleanPhoneNumber(loginData.phone),
        password: loginData.password,
      },
      () => router.push("/"),
      (error) => setSubmitError(parseErrorMessage(error)),
    );
  }, [actions, loginData, parseErrorMessage, router]);

  const handleSignup = useCallback(async () => {
    setSubmitError("");
    await actions.signup(
      {
        full_name: signupData.name,
        phone: cleanPhoneNumber(signupData.phone),
        password: signupData.password,
      },
      () => {
        setLoginData({
          phone: signupData.phone,
          password: "",
        });
        setLoginPhoneEditable(false);
        setLoginPasswordEditable(false);
        setSignupData({
          name: "",
          phone: "",
          password: "",
        });
        setActiveTab("login");
      },
      (error) => setSubmitError(parseErrorMessage(error)),
    );
  }, [actions, parseErrorMessage, signupData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (activeTab === "login") {
        await handleLogin();
      } else {
        await handleSignup();
      }
    },
    [activeTab, handleLogin, handleSignup],
  );

  return (
    <div className={styles.loginContainer}>
      <section className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>TIK TAK</h1>
        </div>

        <div className={styles.imageContainer}>
          <Image
            src="/tiktak-login.png"
            alt="Login Illustration"
            fill
            className={styles.loginImage}
            priority
          />
        </div>
      </section>

      <section className={styles.rightSection}>
        <div className={styles.formContainer}>
          <div className={styles.tabContainer}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "login" ? styles.activeTab : ""}`}
              onClick={() => handleTabChange("login")}
              disabled={loading}
            >
              Daxil ol
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === "signup" ? styles.activeTab : ""}`}
              onClick={() => handleTabChange("signup")}
              disabled={loading}
            >
              Qeydiyyatdan kec
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
            autoComplete="off"
          >
            <input
              type="text"
              name="fake_username"
              autoComplete="username"
              tabIndex={-1}
              aria-hidden="true"
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                height: 0,
                width: 0,
              }}
            />
            <input
              type="password"
              name="fake_password"
              autoComplete="current-password"
              tabIndex={-1}
              aria-hidden="true"
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                height: 0,
                width: 0,
              }}
            />

            {activeTab === "signup" ? (
              <div className={styles.inputGroup}>
                <label htmlFor="name" className={styles.label}>
                  Ad
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ad, Soyad"
                  value={signupData.name}
                  onChange={(e) => handleSignupChange("name", e.target.value)}
                  className={styles.input}
                  disabled={loading}
                  autoComplete="name"
                  required
                />
              </div>
            ) : null}

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                Telefon nomresi
              </label>
              <input
                id="phone"
                type="tel"
                name={activeTab === "login" ? "login_phone" : "signup_phone"}
                placeholder="(+994) __ ___ __ __"
                value={
                  activeTab === "login" ? loginData.phone : signupData.phone
                }
                onFocus={() => {
                  if (activeTab === "login") {
                    setLoginPhoneEditable(true);
                  }
                  handlePhoneFocus(activeTab === "login");
                }}
                onChange={(e) =>
                  handlePhoneChange(e.target.value, activeTab === "login")
                }
                className={styles.input}
                disabled={loading}
                readOnly={activeTab === "login" && !loginPhoneEditable}
                autoComplete={activeTab === "login" ? "off" : "tel"}
                data-lpignore="true"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Parol
              </label>
              <div className={styles.passwordContainer}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name={
                    activeTab === "login" ? "login_password" : "signup_password"
                  }
                  placeholder="Parol"
                  value={
                    activeTab === "login"
                      ? loginData.password
                      : signupData.password
                  }
                  onFocus={() => {
                    if (activeTab === "login") {
                      setLoginPasswordEditable(true);
                    }
                  }}
                  onChange={(e) =>
                    activeTab === "login"
                      ? handleLoginChange("password", e.target.value)
                      : handleSignupChange("password", e.target.value)
                  }
                  className={styles.passwordInput}
                  disabled={loading}
                  readOnly={activeTab === "login" && !loginPasswordEditable}
                  autoComplete={
                    activeTab === "login" ? "new-password" : "new-password"
                  }
                  data-lpignore="true"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? "Parolu gizlet" : "Parolu goster"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {submitError ? (
              <p className={styles.formError}>{submitError}</p>
            ) : null}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !isFormValid}
            >
              {loading
                ? "Gozleyin..."
                : activeTab === "login"
                  ? "Daxil ol"
                  : "Qeydiyyatdan kec"}
            </button>
          </form>

          <div className={styles.switchContainer}>
            <span className={styles.switchText}>
              {activeTab === "login"
                ? "Hesabiniz yoxdur?"
                : "Artıq hesabınız var?"}
            </span>
            <button
              type="button"
              className={styles.switchLink}
              onClick={() =>
                handleTabChange(activeTab === "login" ? "signup" : "login")
              }
              disabled={loading}
            >
              {activeTab === "login" ? "Qeydiyyatdan kec" : "Daxil ol"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
