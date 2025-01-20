import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();
    if (error) {
      console.log(error);
      return { success: false, msg: "Could not create notification" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Could not create notification" };
  }
};

export const fetchUserNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`*, sender:senderId(id, name, image)`)
      .eq("receiverId", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Could not fetch notifications" };
  }
};
