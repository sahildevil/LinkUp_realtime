// import { supabase } from "../lib/supabase";

// export const getUserData = async (userId) => {
//   try {
//     const { data, error } = await supabase.from
//       .apply("users")
//       .select()
//       .eq("id", userId)
//       .single();
//     if (error) {
//       return { success: false, msg: error.message };
//     }
//     return { success: true, data: data };
//   } catch (error) {
//     console.error(error);
//     return { success: false, msg: error.message };
//   }
// };
import { supabase } from "../lib/supabase";

export const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users") // Correctly calls the "from" method
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, msg: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error(error);
    return { success: false, msg: error.message };
  }
};
export const updateUserData = async (userId, data) => {
  try {
    const { error } = await supabase
      .from("users") // Correctly calls the "from" method
      .update(data)
      .eq("id", userId);

    if (error) {
      return { success: false, msg: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error(error);
    return { success: false, msg: error.message };
  }
};
