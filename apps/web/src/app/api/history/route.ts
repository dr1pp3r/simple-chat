import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getChatsByUserId } from "@/lib/queries";
import {
  ErrorWithResponse,
  InternalServerError,
  UnauthorizedError,
} from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedError();
    }

    const chats = await getChatsByUserId({ userId: session.user.id });

    return NextResponse.json(chats);
  } catch (e) {
    if (e instanceof ErrorWithResponse) {
      return e.toResponse();
    }
    return new InternalServerError().toResponse();
  }
}
