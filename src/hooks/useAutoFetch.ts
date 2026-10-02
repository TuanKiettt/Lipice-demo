import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
const apiLogin = import.meta.env.VITE_API_LOGIN;
const apiGetUser = import.meta.env.VITE_API_GETUSER;

interface UseAutoFetchOptions {
  interval?: number;
}

export function useAutoFetch({ interval = 20 * 60 * 1000 }: UseAutoFetchOptions) {
  const [data, setData] = useState<string>("");

  const fetchLogin = useCallback(async () => {
    try {
      const requestData = {
        CustomerEmail: "test1666@gmail.com",
        CustomerPassword: "123",
        CustomerFacebookId: "",
        CustomerGoogleId: "",
      };

      const response = await fetch(apiLogin, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error("Login failed");

      const token = await response.text();
      if (!token) throw new Error("Token missing");

      Cookies.set("bearer", token, { expires: 30 });
      setData(token);

      const formDetail = new FormData();
      formDetail.append("Procedure", "Gamer_Select_Detail");
      formDetail.append("Parameters", JSON.stringify({}));

      const responseGetUser = await fetch(apiGetUser, {
        method: "POST",
        body: formDetail,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!responseGetUser.ok) {
        throw new Error("Failed to login");
      }

      const resultUser = await responseGetUser.json();

      const gamerCode = JSON.parse(resultUser.Objects[0].Data)[0].GamerCode;

      Cookies.set("user_code", gamerCode, { expires: 30 });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!isMounted) return;
      await fetchLogin();
    };

    run();

    const id = setInterval(run, interval);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [fetchLogin, interval]);

  return { data, refetch: fetchLogin };
}