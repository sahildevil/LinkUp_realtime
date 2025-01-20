import { supabase } from "../lib/supabase";
import { uploadFile } from "./ImageService";

export const createorupdatepost = async (post) => {
  try {
    //upload
    if (post.file && typeof post.file == "object") {
      let isImage = post?.file?.type == "image";
      let folderName = isImage ? "postImages" : "postVideos";
      let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
      if (fileResult.success) post.file = fileResult.data;
      else {
        return fileResult;
      }
    }
    const { data, error } = await supabase
      .from("posts")
      .upsert(post, { onConflict: ["id"] })
      .select()
      .single();
    if (error) {
      console.log("create or update post error", error);
      return { success: false, msg: "could not create or update post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "could not create or update post" };
  }
};

export const fetchPosts = async (limit = 4, userId) => {
  try {
    if (userId) {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `*,
        user:users(id,name,image),
        postLikes(userId),
        comments(*)`
        )
        .order("created_at", { ascending: false })
        .eq("userId", userId)
        .limit(limit);

      if (error) {
        console.log(error);
        return { success: false, msg: "Could not fetch posts" };
      }
      return { success: true, data: data };
    } else {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `*,
        user:users(id,name,image),
        postLikes(userId),
        comments(*)`
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.log(error);
        return { success: false, msg: "Could not fetch posts" };
      }
      return { success: true, data: data };
    }
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Could not fetch posts" };
  }
};

export const fetchPostDetails = async (postId) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `*,
        user:users(id,name,image),
        postLikes(userId),
        comments(*,user: users(id,name,image))`
      )
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
      .single();

    if (error) {
      console.log(error);
      return { success: false, msg: "Could not fetch post details" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Could not fetch post details" };
  }
};

export const createpostlike = async (postlike) => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postlike)
      .select()
      .single();
    if (error) {
      console.log(error);
      return { success: false, msg: "could not like post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "could not  like post" };
  }
};

export const createpostcomment = async (comment) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();
    if (error) {
      console.log(error);
      return { success: false, msg: "could not comment post" };
    }
    return { success: true, data: data };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "could not comment post" };
  }
};

export const removepostlike = async (postId, userId) => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);
    if (error) {
      console.log(error);
      return { success: false, msg: "could not remove post like" };
    }
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "could not remove post likee" };
  }
};
export const removepostcomment = async (commentId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) {
      console.log(error);
      return { success: false, msg: "could not remove post comment" };
    }
    return { success: true, data: { commentId } };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "could not remove post comment" };
  }
};

export const removepost = async (postId) => {
  try {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      console.log(error);
      return { success: false, msg: "could not delete post" };
    }
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "could not delete post" };
  }
};
