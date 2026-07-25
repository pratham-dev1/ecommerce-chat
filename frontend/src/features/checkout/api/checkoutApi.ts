import { httpClient } from "@/services/api/httpClient";

export async function createCheckoutSession() {
  const { data } = await httpClient.post("/checkout/sessions");
  return data;
}
