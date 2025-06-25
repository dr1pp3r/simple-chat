"use client";

import useSWR from "swr";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, memo } from "react";
import { toast } from "sonner";
import { fetcher } from "@/lib/utils";
import type { Chat } from "simple-chat/db";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHistoryItemProps {
  chat: Chat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
}

const ChatHistoryItem = memo(function ChatHistoryItem({
  chat,
  isActive,
  onDelete,
}: ChatHistoryItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link className="inline-flex" href={`/chat/${chat.id}`}>
          <span className="truncate text-ellipsis">{chat.title}</span>
          <Button
            className="shrink-0 ml-auto mr-[-0.5rem] p-0 opacity-0 group-hover/menu-item:opacity-100"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(chat.id);
            }}
          >
            <Trash2Icon />
            <span className="sr-only">Delete</span>
          </Button>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
});

export function NavChatHistory() {
  const router = useRouter();
  const { id } = useParams();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const {
    data: chats,
    isLoading,
    mutate,
  } = useSWR<Chat[]>("/api/history", fetcher, {
    revalidateIfStale: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const handleDelete = async () => {
    if (!deleteChatId) return;

    setShowDeleteDialog(false);

    // Optimistically update the UI
    const previousChats = chats;
    await mutate(
      chats?.filter((chat) => chat.id !== deleteChatId),
      false,
    );

    // If deleting current chat, navigate away immediately
    if (deleteChatId === id) {
      router.push("/");
    }

    toast.promise(
      fetch(`/api/chat/${deleteChatId}`, {
        method: "DELETE",
      }).then(async (res) => {
        if (!res.ok) {
          // Revert on error
          await mutate(previousChats, false);
          throw new Error("Failed to delete");
        }
        // Revalidate to ensure consistency
        mutate();
      }),
      {
        loading: "Deleting conversation...",
        error: "Failed to delete conversation",
        success: "Conversation deleted successfully",
      },
    );

    setDeleteChatId(null);
  };

  return (
    <>
      <SidebarGroup className="transition-opacity duration-200 transition-transform duration-400 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:translate-x-[-250%]">
        <SidebarGroupLabel>Past Conversations</SidebarGroupLabel>
        <SidebarGroupContent>
          {isLoading ? (
            <SidebarMenu>
              {Array.from({ length: 5 }).map((_, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <Skeleton className="h-8 w-full" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : chats?.length ? (
            <SidebarMenu>
              {chats.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  isActive={id === chat.id}
                  onDelete={(chatId) => {
                    setDeleteChatId(chatId);
                    setShowDeleteDialog(true);
                  }}
                />
              ))}
            </SidebarMenu>
          ) : (
            <p className="text-xs text-muted-foreground px-2">
              Once you start a conversation, it will appear here!
            </p>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
