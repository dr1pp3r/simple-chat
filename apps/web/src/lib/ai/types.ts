export type RPSMove = "rock" | "paper" | "scissors" | "unknown";
export type RPSOutcome = "win" | "lose" | "tie" | "no_move";

export type RPSToolResult = {
  userMove?: RPSMove;
  aiMove?: RPSMove;
  confidence: number;
  outcome: RPSOutcome;
  status: "processing" | "error" | "success";
  imageDataUrl?: string;
};
