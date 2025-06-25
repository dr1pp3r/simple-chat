"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RPSMove, RPSToolResult } from "@/lib/ai/types";
import { UseChatHelpers } from "@ai-sdk/react";
import { ToolInvocation } from "ai";
import {
  AlertCircleIcon,
  CameraIcon,
  CheckIcon,
  Loader2Icon,
  PlayIcon,
} from "lucide-react";
import { useRef, useState, useEffect, startTransition } from "react";
import { toast } from "sonner";

const MoveAsEmoji: Record<RPSMove, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
  unknown: "❓",
};

export function RPSToolInvocation({
  toolInvocation,
  addToolResult,
  status,
}: {
  toolInvocation: ToolInvocation;
  addToolResult: (params: {
    toolCallId: string;
    result: Partial<RPSToolResult>;
  }) => void;
  status: UseChatHelpers["status"];
}) {
  const {
    toolCallId,
    state: toolState,
    result: toolResult = undefined,
  } = toolInvocation as ToolInvocation & {
    result?: RPSToolResult;
  };

  return (
    <Card className="w-auto max-w-lg">
      <CardHeader>
        <CardTitle>Rock Paper Scissors</CardTitle>
        <CardDescription>
          <p className="text-xs">
            <span className="font-bold">Paper</span> beats{" "}
            <span className="font-bold">Rock</span>;{" "}
            <span className="font-bold">Rock</span> beats{" "}
            <span className="font-bold">Scissors</span>;{" "}
            <span className="font-bold">Scissors</span> beats{" "}
            <span className="font-bold">Paper</span>
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {(toolState === "call" ||
          (toolState === "result" && toolResult?.status !== "success")) && (
          <UserMoveCapturer
            toolCallId={toolCallId}
            addToolResult={addToolResult}
            status={status}
          />
        )}
        {toolState === "result" && toolResult?.status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">You played</p>
                <p className="text-4xl mb-1">
                  {MoveAsEmoji[toolResult.userMove as RPSMove]}
                </p>
                <p className="font-semibold capitalize">
                  {toolResult.userMove || "unknown"}
                </p>
              </div>

              <div className="text-2xl text-muted-foreground">vs</div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">AI played</p>
                <p className="text-4xl mb-1">
                  {MoveAsEmoji[toolResult.aiMove as RPSMove]}
                </p>
                <p className="font-semibold capitalize">
                  {toolResult.aiMove || "unknown"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function UserMoveCapturer({
  toolCallId,
  addToolResult,
  status,
}: {
  toolCallId: string;
  addToolResult: (params: {
    toolCallId: string;
    result: Partial<RPSToolResult>;
  }) => void;
  status: UseChatHelpers["status"];
}) {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [countdownState, setCountdownState] = useState<
    "idle" | "counting" | "finished"
  >("idle");
  const [countdownText, setCountdownText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestCameraAccess = async () => {
    setIsLoading(true);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      setStream(mediaStream);
      streamRef.current = mediaStream;
      setHasCameraPermission(true);
    } catch {
      toast.error("Unable to access your camera. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkCameraPermissions = async () => {
      try {
        if ("permissions" in navigator && navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          if (permission.state === "granted") {
            await requestCameraAccess();
          }
        }
      } catch {
        toast.error("Unable to check camera permissions. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkCameraPermissions();
  }, []);

  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  }, [stream]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();

        const dataUrl = canvas.toDataURL("image/png");
        setSnapshot(dataUrl);
      }
    }
  };

  const startCountdown = () => {
    setSnapshot(null);
    setCountdownState("counting");

    const sequence = ["Rock...", "Paper...", "Scissors...", "SHOOT!"];

    let index = 0;
    const runSequence = () => {
      if (index < sequence.length) {
        setCountdownText(sequence[index]!);
        setTimeout(() => {
          index++;
          runSequence();
        }, 750);
      } else {
        setCountdownState("finished");
        captureSnapshot();
      }
    };

    runSequence();
  };

  const hasChatError = status === "error";

  return (
    <div className="relative w-full aspect-[4/3]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg shadow-lg bg-muted/50"
        style={{ transform: "scaleX(-1)" }}
      />
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {(() => {
        if (isLoading) {
          return (
            <div className="absolute inset-0 h-full w-full backdrop-blur-2xl flex items-end justify-center gap-2 p-4">
              <Loader2Icon className="w-4 h-4 animate-spin" />
              <span className="text-xs text-muted-foreground">Loading...</span>
            </div>
          );
        }

        if (!hasCameraPermission) {
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 p-4">
              <p className="text-sm text-muted-foreground">
                You must grant camera access to capture your move.
              </p>
              <Button size="sm" onClick={requestCameraAccess}>
                <CameraIcon className="w-4 h-4" />
                <span>Allow access</span>
              </Button>
            </div>
          );
        }

        if (snapshot) {
          return (
            <>
              <img
                src={snapshot}
                alt="Your move"
                className="w-full rounded-lg shadow-lg absolute inset-0 z-20"
              />
              <div className="absolute inset-0 flex items-end gap-4 justify-center bg-background/60 backdrop-blur-[1px] rounded-lg z-30 p-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={submitted || hasChatError}
                  onClick={() => {
                    setSnapshot(null);
                    setCountdownState("idle");
                  }}
                >
                  <CameraIcon className="w-4 h-4" />
                  <span>Retake</span>
                </Button>
                <Button
                  size="sm"
                  disabled={submitted || hasChatError}
                  onClick={() =>
                    startTransition(() => {
                      setSubmitted(true);
                      stopCamera(); // Stop webcam after confirming
                      addToolResult({
                        toolCallId,
                        result: {
                          imageDataUrl: snapshot,
                        },
                      });
                    })
                  }
                >
                  {hasChatError ? (
                    <>
                      <AlertCircleIcon className="w-4 h-4" />
                      <span>Error</span>
                    </>
                  ) : submitted ? (
                    <>
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Confirm</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          );
        }

        if (countdownState === "idle") {
          return (
            <div className="absolute inset-0 flex flex-col items-center justify-end gap-4 bg-black/40 backdrop-blur-[2px] rounded-lg p-4">
              <Button
                size="sm"
                onClick={startCountdown}
                disabled={hasChatError}
              >
                <PlayIcon className="w-4 h-4" />
                <span>Play</span>
              </Button>
            </div>
          );
        }

        if (countdownState === "counting") {
          return (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-lg">
              <p className="text-lg font-semibold">{countdownText}</p>
            </div>
          );
        }

        return null;
      })()}
    </div>
  );
}
