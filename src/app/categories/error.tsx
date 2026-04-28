"use client";

import RouteError from "@/common/components/RouteFeedback/RouteError";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Kateqoriyalar bolmesinde xeta"
      text="Mehsul ve kateqoriya datalari yuklenmedi."
    />
  );
}
