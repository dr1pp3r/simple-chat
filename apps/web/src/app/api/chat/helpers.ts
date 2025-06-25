import "server-only";

import { RPSMove, RPSOutcome, RPSToolResult } from "@/lib/ai/types";
import { DataStreamWriter, formatDataStreamPart, ToolInvocation } from "ai";

/**
 * Given an image data URL, calls the Roboflow API "rock-paper-scissors-sxsw" (v14)
 * model to detect the move demonstrated in the image.
 * @param param - image data URL
 * @returns
 */
export async function detectRpsMove({
  imageDataUrl,
}: {
  imageDataUrl: string;
}) {
  const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");

  const roboflowApiKey = process.env.ROBOFLOW_API_KEY;
  if (!roboflowApiKey) {
    throw new Error("Roboflow API key not configured");
  }

  const response = await fetch(
    `https://detect.roboflow.com/rock-paper-scissors-sxsw/14?api_key=${roboflowApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: base64,
    },
  );

  if (!response.ok) {
    throw new Error(`Roboflow API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Generates a random move for the AI in an RPS game.
 * @returns - a random move
 */
function getRandomRpsMove(): RPSMove {
  const moves = ["rock", "paper", "scissors"] as const;
  return moves[Math.floor(Math.random() * moves.length)]!;
}

/**
 * Determines the winner of a RPS game.
 * @param userMove - the user's move
 * @param aiMove - the AI's move
 * @returns - the winner of the game
 */
function determineWinner(userMove: string, aiMove: string): RPSOutcome {
  if (userMove === "unknown") return "no_move";
  if (userMove === aiMove) return "tie";
  if (
    (userMove === "rock" && aiMove === "scissors") ||
    (userMove === "paper" && aiMove === "rock") ||
    (userMove === "scissors" && aiMove === "paper")
  ) {
    return "win";
  }
  return "lose";
}

/**
 * Cleans message parts; currently serves a singular purpose of removing the user-submitted image data URL
 * for a RPS tool invocation such that it doesn't get sent to the LLM nor persisted in the database.
 * @param parts - message parts
 * @returns - cleaned message parts
 */
export function cleanMessageParts(parts: any[]): any[] {
  return parts.map((part) => {
    if (
      part.type === "tool-invocation" &&
      part.toolInvocation?.result?.imageDataUrl
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { imageDataUrl, ...cleanResult } = part.toolInvocation.result;
      return {
        ...part,
        toolInvocation: {
          ...part.toolInvocation,
          result: cleanResult,
        },
      };
    }
    return part;
  });
}

/**
 * Processes the RPS tool invocation and returns the updated part.
 * @param part - message part (tool invocation)
 * @param dataStream - data stream to write to
 * @returns - processed RPS tool invocation message part
 */
export async function processRpsToolInvocation({
  part,
  dataStream,
}: {
  part: any;
  dataStream: DataStreamWriter;
}): Promise<any> {
  const toolInvocation = part.toolInvocation as ToolInvocation & {
    result?: Partial<RPSToolResult>;
  };
  const { imageDataUrl } = toolInvocation.result;

  if (!imageDataUrl) {
    return part;
  }

  dataStream.write(
    formatDataStreamPart("tool_result", {
      toolCallId: toolInvocation.toolCallId,
      result: {
        status: "processing",
      },
    }),
  );

  try {
    const rpsObjectDetectionResult = await detectRpsMove({ imageDataUrl });

    let userMove = "unknown";
    let confidence = 0;

    if (
      rpsObjectDetectionResult.predictions &&
      rpsObjectDetectionResult.predictions.length > 0
    ) {
      const prediction = rpsObjectDetectionResult.predictions.reduce(
        (prev: any, current: any) =>
          prev.confidence > current.confidence ? prev : current,
      );
      userMove = prediction.class.toLowerCase();
      confidence = prediction.confidence;
    }

    const aiMove = getRandomRpsMove();
    const outcome = determineWinner(userMove, aiMove);

    const gameResult = {
      userMove,
      aiMove,
      outcome,
      confidence,
      status: "success",
    };

    dataStream.write(
      formatDataStreamPart("tool_result", {
        toolCallId: toolInvocation.toolCallId,
        result: gameResult,
      }),
    );

    return {
      ...part,
      toolInvocation: {
        ...toolInvocation,
        result: gameResult,
      },
    };
  } catch {
    dataStream.write(
      formatDataStreamPart("tool_result", {
        toolCallId: toolInvocation.toolCallId,
        result: {
          status: "error",
        },
      }),
    );

    return {
      ...part,
      toolInvocation: {
        ...toolInvocation,
        result: {
          status: "error",
        },
      },
    };
  }
}
