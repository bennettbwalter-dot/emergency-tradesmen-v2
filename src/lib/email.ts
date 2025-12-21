
import { supabase } from "@/lib/supabase";

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from_name?: string;
}

export const sendEmail = async (data: EmailData) => {
  const { data: responseData, error } = await supabase.functions.invoke("send-email", {
    body: data,
  });

  if (error) {
    console.error("Error sending email:", error);
    throw error;
  }

  return responseData;
};
