"use server";

import { API_ORIGIN } from "@/lib/api/base";

export const blockUserStatus = async (userId: string, newStatus: string) => {
  const response = await fetch(
    `${API_ORIGIN}/api/v1/user/status/${userId}`,
    {
      method: "PUT",
      body: JSON.stringify({ status: newStatus }),
      headers: { "Content-Type": "application/json" }
    }
  );
  return response.json();
};

export const fetchAllUsers = async () => {
  const response = await fetch(`${API_ORIGIN}/api/v1/users`);
  return response.json();
};
