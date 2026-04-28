"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/common/components/AppHeader";
import { AccountForm } from "./components/AccountForm";
import OrderDetails from "./components/OrderDetails";
import OrdersTable from "./components/OrdersTable";
import Sidebar from "./components/Sidebar";
import type { IProfileUpdateRequest } from "@/common/types/api.types";
import { getProfile, updateProfile } from "@/services/api/profile.api";
import styles from "./page.module.css";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    password: "",
    confirmPassword: "",
  });
  const [initialProfileData, setInitialProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [section, setSection] = useState<"account" | "orders" | "details">(
    "account",
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const urlSection = searchParams.get("section");
    const urlOrderId = searchParams.get("orderId");

    if (urlSection === "details" && urlOrderId) {
      setSection("details");
      setSelectedOrderId(urlOrderId);
      return;
    }

    if (urlSection === "orders") {
      setSection("orders");
      setSelectedOrderId(null);
      return;
    }

    setSection("account");
    setSelectedOrderId(null);
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const profile = await getProfile();

        if (!isMounted || !profile) {
          return;
        }

        setFormData((prev) => ({
          ...prev,
          name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          position: profile.address || "",
        }));

        setInitialProfileData({
          name: profile.full_name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          position: profile.address || "",
        });
      } catch {
        if (!isMounted) {
          return;
        }
        setStatusType("error");
        setStatusMessage("Profil məlumatları yüklənmədi.");
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStatusMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (Boolean(password) !== Boolean(confirmPassword)) {
      setStatusType("error");
      setStatusMessage("Şifrəni hər iki xanaya daxil edin.");
      return;
    }

    if (password && password !== confirmPassword) {
      setStatusType("error");
      setStatusMessage("Yeni şifrə təkrarı uyğun deyil.");
      return;
    }

    const nextName = formData.name.trim();
    const nextPhone = formData.phone.trim();
    const nextAddress = formData.position.trim();
    const nextEmail = formData.email.trim();

    if (!nextName) {
      setStatusType("error");
      setStatusMessage("Ad sahəsi boş ola bilməz.");
      return;
    }

    if (!nextAddress) {
      setStatusType("error");
      setStatusMessage("Ünvan sahəsi boş ola bilməz.");
      return;
    }

    if (!nextPhone) {
      setStatusType("error");
      setStatusMessage("Telefon nömrəsi boş ola bilməz.");
      return;
    }

    const hasProfileChanges =
      nextName !== initialProfileData.name.trim() ||
      nextPhone !== initialProfileData.phone.trim() ||
      nextAddress !== initialProfileData.position.trim() ||
      nextEmail !== initialProfileData.email.trim();

    const hasPasswordChange = Boolean(password && confirmPassword);

    if (!hasProfileChanges && !hasPasswordChange) {
      setStatusType("success");
      setStatusMessage("Dəyişiklik edilməyib.");
      return;
    }

    const payload: IProfileUpdateRequest = {
      full_name: nextName,
      phone: nextPhone,
      address: nextAddress,
    };

    if (nextEmail && nextEmail !== initialProfileData.email.trim()) {
      payload.email = nextEmail;
    }

    if (password && confirmPassword) {
      payload.password = password;
      payload.password_repeat = confirmPassword;
    }

    setIsSubmitting(true);
    try {
      const updatedProfile = await updateProfile(payload);

      setFormData((prev) => ({
        ...prev,
        name: updatedProfile?.full_name || prev.name,
        email: updatedProfile?.email || prev.email,
        phone: updatedProfile?.phone || prev.phone,
        position: updatedProfile?.address || prev.position,
        password: "",
        confirmPassword: "",
      }));

      setInitialProfileData((prev) => ({
        name: updatedProfile?.full_name || formData.name.trim() || prev.name,
        email: updatedProfile?.email || formData.email.trim() || prev.email,
        phone: updatedProfile?.phone || formData.phone.trim() || prev.phone,
        position:
          updatedProfile?.address || formData.position.trim() || prev.position,
      }));

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tiktak:profile-updated", {
            detail: {
              address: updatedProfile?.address || formData.position.trim(),
            },
          }),
        );
      }

      setStatusType("success");
      setStatusMessage("Məlumatlarınız uğurla yeniləndi.");
    } catch (error) {
      const rawMessage =
        typeof error === "object" && error !== null && "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    message?: string | string[];
                    error?: string;
                  };
                };
              }
            )?.response?.data?.message ||
            (
              error as {
                response?: {
                  data?: {
                    message?: string | string[];
                    error?: string;
                  };
                };
              }
            )?.response?.data?.error
          : undefined;

      const normalizedMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage || "Məlumatlar yenilənmədi. Yenidən cəhd edin.";

      setStatusType("error");
      setStatusMessage(normalizedMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSidebarSelect = (nextSection: "account" | "orders") => {
    setSection(nextSection);
    setSelectedOrderId(null);
    router.push(
      nextSection === "account" ? "/account" : "/account?section=orders",
    );
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
    setSection("details");
    router.push(
      `/account?section=details&orderId=${encodeURIComponent(orderId)}`,
    );
  };

  const effectiveSection = section === "details" ? "orders" : section;

  return (
    <div className={styles.accountPage}>
      <AppHeader
        activeHref="/account"
        ariaLabel="Account page navigation"
        searchPlaceholder="Axtarış"
      />

      <div className={styles.pageBody}>
        <Sidebar onSelect={handleSidebarSelect} selected={effectiveSection} />

        <main className={styles.contentArea}>
          {section === "account" ? (
            <AccountForm
              formData={formData}
              isLoadingProfile={isLoadingProfile}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
              statusMessage={statusMessage}
              statusType={statusType}
            />
          ) : null}

          {section === "orders" ? (
            <OrdersTable onViewDetails={handleViewDetails} />
          ) : null}

          {section === "details" && selectedOrderId ? (
            <OrderDetails orderId={selectedOrderId} />
          ) : null}
        </main>
      </div>
    </div>
  );
}
