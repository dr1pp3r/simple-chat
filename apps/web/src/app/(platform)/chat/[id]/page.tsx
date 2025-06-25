import { getChatById, getChatMessages } from "@/lib/queries";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { Chat } from "@/components/chat/chat";
import { convertToUIMessages } from "@/lib/utils";
import { headers } from "next/headers";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chat = await getChatById({ id });

  if (!chat) {
    return notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user?.id !== chat.userId) {
    return notFound();
  }

  const messages = await getChatMessages({ chatId: id });

  return (
    <div className="h-full">
      <Chat id={id} initialMessages={convertToUIMessages(messages)} />
    </div>
  );
}
