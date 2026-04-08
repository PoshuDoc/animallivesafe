import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { getToken } from "../lib/auth";

export function useAuth() {
  const token = getToken();
  
  const { data: user, isLoading, error, refetch } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  return {
    user: token ? user : null,
    isAuthenticated: !!token && !!user,
    isLoading: !!token && isLoading,
    error,
    refetch
  };
}
