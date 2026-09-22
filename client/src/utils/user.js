export function getOrCreateUserId() {
  try {
    let userId = localStorage.getItem("zuna_user_id");
    if (!userId || userId.trim() === "") {
      userId = "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8);
      localStorage.setItem("zuna_user_id", userId);
    }
    return userId;
  } catch (e) {
    return "usr_guest_" + Date.now().toString(36);
  }
}
