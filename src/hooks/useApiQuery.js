import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifyError, notifySuccess } from "../lib/notify";

/**
 * useApiQuery
 * ------------
 * Wrapper فوق useQuery بيتعامل مع شكل الـ actions: { success, data, error }
 * - fetch مرة واحدة، والنتيجة تتخزن في الكاش (staleTime من queryClient)
 * - مفيش refetch عند كل mount أو عند رجوع الفوكس
 * - الأخطاء بتظهر في toast تلقائياً
 *
 * بيرجع: { data, pagination, isLoading, isFetching, isError, error, refetch }
 * isLoading = أول تحميل فقط (للـ skeleton الخاص بالجزء دا)
 * isFetching = تحديث في الخلفية (للمؤشر الصغير)
 */
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
          const err = new Error(result.error || errorMessage || "فشل تحميل البيانات");
          err.handled = true;
          throw err;
        }
        return { data: result.data, pagination: result.pagination ?? null };
      }
      return { data: result, pagination: null };
    },
    ...queryOptions,
  });

  const raw = query.data?.data;
  const data = select ? select(raw) : (raw ?? fallback);

  useEffect(() => {
    if (query.isError && showErrorToast) {
      notifyError(query.error, errorMessage || "فشل تحميل البيانات");
    }
  }, [query.isError, query.error, showErrorToast, errorMessage]);

  return {
    ...query,
    data: data === undefined ? fallback : data,
    pagination: query.data?.pagination ?? null,
  };
}

/**
 * useApiList: نفس الفكرة بس بترجع Array مضمونة.
 */
export function useApiList(queryKey, action, options = {}) {
  return useApiQuery(queryKey, action, {
    fallback: [],
    select: (d) => (Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []),
    ...options,
  });
}

/**
 * useApiMutation
 * --------------
 * - loading خاص بالزرار نفسه (isPending) مش بالصفحة كلها
 * - toast نجاح/خطأ تلقائي
 * - invalidate للمفاتيح المتأثرة فقط => الداتا تتحدث لما تتغير بجد
 */
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
      if (result && typeof result === "object" && "success" in result && !result.success) {
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
      keys.map((key) => queryClient.invalidateQueries({ queryKey: key, exact: false })),
    );
}

export default useApiQuery;
