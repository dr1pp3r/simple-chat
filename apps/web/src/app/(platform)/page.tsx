import { Chat } from "@/components/chat/chat";

export default function Page() {
  const id = crypto.randomUUID();
  return <Chat id={id} initialMessages={[]} />;
}
