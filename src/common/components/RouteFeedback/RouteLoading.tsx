"use client";

type RouteLoadingProps = {
  title?: string;
};

export default function RouteLoading({
  title = "Yuklenir...",
}: RouteLoadingProps) {
  return (
    <div style={{ padding: "24px" }}>
      <p>{title}</p>
    </div>
  );
}
