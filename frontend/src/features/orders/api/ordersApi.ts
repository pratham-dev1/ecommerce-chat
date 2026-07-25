import { httpClient } from "@/services/api/httpClient";

export async function getOrders() {
  const { data } = await httpClient.get("/orders");
  return data;
}
