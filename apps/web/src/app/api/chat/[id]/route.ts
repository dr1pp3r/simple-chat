import { NextRequest } from "next/server";
import { deleteChat } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  ErrorWithResponse,
  InternalServerError,
  UnauthorizedError,
} from "@/lib/errors";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new UnauthorizedError();
    }

    await deleteChat({ id, userId: session.user.id });
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof ErrorWithResponse) {
      return e.toResponse();
    }
    return new InternalServerError().toResponse();
  }
}
