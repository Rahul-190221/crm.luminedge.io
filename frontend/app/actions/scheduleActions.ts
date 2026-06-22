"use server";

import { API_ORIGIN } from "@/lib/api/base";

export const deleteSchedule = async (id: string) => {
  const response = await fetch(
    `${API_ORIGIN}/api/v1/admin/delete-schedule/${id}`,
    { method: "DELETE" }
  );
  return response.json();
};

export const createSchedule = async (scheduleData: any) => {
  const response = await fetch(
    `${API_ORIGIN}/api/v1/admin/create-schedule`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scheduleData)
    }
  );
  return response.json();
};
