"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signInAnonymously() {
  await auth.api.signInAnonymous({
    headers: await headers(),
  });

  revalidatePath("/");
  redirect("/");
}

export async function signOut() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }

  await deleteUser({ id: session.user.id });

  await auth.api.signOut({
    headers: await headers(),
  });

  revalidatePath("/");
  redirect("/");
}
