"use client";

type RouteErrorProps = {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  text?: string;
};

export default function RouteError({
  error,
  title = "Xeta bas verdi",
  text = "Səhifə yüklənərkən problem oldu.",
}: RouteErrorProps) {
  if (error) {
    console.error("Route error:", error);
  }

  return (
    <div style={{ padding: "24px" }}>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
