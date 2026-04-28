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
      title="Sevimliler bolmesinde xeta"
      text="Sevilmis mehsullari yuklemek mumkun olmadi."
    />
  );
}
