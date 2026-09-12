import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "../lib/notify";

export function useApiQuery(queryKey, action, options = {}) {
  const {
    select,
    fallback,
    errorMessage,
    showErrorToast = true,
    ...queryOptions
  } = options;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const result = await action();

      if (result && typeof result === "object" && "success" in result) {
        if (!result.success) {
          const err = new Error(
            result.error || errorMessage || "فشل تحميل البيانات",
          );
          err.handled = true;
          throw err;
        }
        return {
          data: result.data,
          pagination: result.pagination ?? null,
        };
      }

      return { data: result, pagination: null };
    },
    ...queryOptions,
  });

  const rawData = query.data?.data;
  const finalData = select ? select(rawData) : rawData;

  useEffect(() => {
    if (query.isError && showErrorToast) {
      notifyError(query.error, errorMessage || "فشل تحميل البيانات");
    }
  }, [query.isError, query.error, showErrorToast, errorMessage]);

  return {
    ...query,
    data: finalData === undefined ? fallback : finalData,
    pagination: query.data?.pagination ?? null,
  };
}


export function useApiList(queryKey, action, options = {}) {
  return useApiQuery(queryKey, action, {
    fallback: [],
    select: (d) => {
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.data)) return d.data;
      return [];
    },
    ...options,
  });
}


export function useApiMutation(action, options = {}) {
  const {
    successMessage,
    errorMessage,
    invalidateKeys = [],
    onSuccess,
    onError,
    ...rest
  } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables) => {
      const result = await action(variables);

      if (
        result &&
        typeof result === "object" &&
        "success" in result &&
        !result.success
      ) {
        const err = new Error(result.error || errorMessage || "فشلت العملية");
        err.handled = true;
        throw err;
      }

      return result && typeof result === "object" && "success" in result
        ? result.data
        : result;
    },
    onSuccess: async (data, variables, context) => {
      if (successMessage) {
        notifySuccess(
          typeof successMessage === "function"
            ? successMessage(data, variables)
            : successMessage,
        );
      }

      await Promise.all(
        invalidateKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: key, exact: false }),
        ),
      );

      await onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      notifyError(error, errorMessage);
      onError?.(error, variables, context);
    },
    ...rest,
  });
}

export function useInvalidate() {
  const queryClient = useQueryClient();
  return (...keys) =>
    Promise.all(
      keys.map((key) =>
        queryClient.invalidateQueries({ queryKey: key, exact: false }),
      ),
    );
}

export default useApiQuery;
