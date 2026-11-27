import { requireAdminSession } from "@/lib/admin-auth";
import PostEditorClient from "../components/PostEditorClient";

export default async function NewBlogPostPage() {
  await requireAdminSession("/dashboard/posts/new");

  return <PostEditorClient />;
}
