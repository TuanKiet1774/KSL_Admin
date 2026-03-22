import { URI_API } from "../config/api";

export const login = async (emailOrUsername, password) => {
    const res = await fetch(`${URI_API}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
    }

    return data;
};