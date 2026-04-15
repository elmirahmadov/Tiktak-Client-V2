"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./LoginPage.module.css";
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

export default function LoginPage() {
  const router = useRouter();
  const { loading, actions } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  const [loginData, setLoginData] = useState<LoginFormData>({
    phone: "",
    password: "",
  });

  const [signupData, setSignupData] = useState<SignupFormData>({
    name: "",
    phone: "",
    password: "",
  });

  const handleTabChange = useCallback((tab: AuthTab) => {
    setActiveTab(tab);
    setShowPassword(false);
    setSubmitError("");
  }, []);

  const parseErrorMessage = useCallback((error: unknown): string => {
    const err = error as {
      response?: { data?: { message?: string | string[]; error?: string } };
      message?: string;
    };

    const raw =
      err?.response?.data?.message || err?.response?.data?.error || err?.message;

    const text = Array.isArray(raw) ? raw.join(", ") : raw || "Bilinmeyen xeta";
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
  }, [activeTab]);

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
    [submitError]
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
    [submitError]
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
    [loginData.phone, signupData.phone, handleLoginChange, handleSignupChange]
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
    [handleLoginChange, handleSignupChange]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const isFormValid = useMemo(() => {
    if (activeTab === "login") {
      return Boolean(loginData.phone.trim() && loginData.password.trim());
    }

    return Boolean(
      signupData.name.trim() && signupData.phone.trim() && signupData.password.trim()
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
      (error) => setSubmitError(parseErrorMessage(error))
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
        setSignupData({
          name: "",
          phone: "",
          password: "",
        });
        setActiveTab("login");
      },
      (error) => setSubmitError(parseErrorMessage(error))
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
    [activeTab, handleLogin, handleSignup]
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

          <form onSubmit={handleSubmit} className={styles.form}>
            {activeTab === "signup" && (
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
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                Telefon nomresi
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="(+994) __ ___ __ __"
                value={activeTab === "login" ? loginData.phone : signupData.phone}
                onFocus={() => handlePhoneFocus(activeTab === "login")}
                onChange={(e) => handlePhoneChange(e.target.value, activeTab === "login")}
                className={styles.input}
                disabled={loading}
                autoComplete="tel"
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
                  placeholder="••••••••"
                  value={activeTab === "login" ? loginData.password : signupData.password}
                  onChange={(e) =>
                    activeTab === "login"
                      ? handleLoginChange("password", e.target.value)
                      : handleSignupChange("password", e.target.value)
                  }
                  className={styles.passwordInput}
                  disabled={loading}
                  autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                  disabled={loading}
                  aria-label={showPassword ? "Parolu gizlet" : "Parolu goster"}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading || !isFormValid}>
              {loading
                ? activeTab === "login"
                  ? "Daxil olunur..."
                  : "Qeydiyyat..."
                : activeTab === "login"
                ? "Daxil ol"
                : "Tamamla"}
            </button>

            {submitError ? <p className={styles.formError}>{submitError}</p> : null}

            <div className={styles.switchContainer}>
              {activeTab === "login" ? (
                <span className={styles.switchText}>
                  Hesabin yoxdursa
                  <button
                    type="button"
                    className={styles.switchLink}
                    onClick={() => handleTabChange("signup")}
                    disabled={loading}
                  >
                    Qeydiyyatdan kec
                  </button>
                </span>
              ) : (
                <span className={styles.switchText}>
                  Hesabin varsa
                  <button
                    type="button"
                    className={styles.switchLink}
                    onClick={() => handleTabChange("login")}
                    disabled={loading}
                  >
                    Daxil ol
                  </button>
                </span>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}