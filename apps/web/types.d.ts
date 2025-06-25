declare module "inferencejs" {
  export class InferenceEngine {
    constructor();
    startWorker(
      modelName: string,
      modelVersion: string,
      publishableKey: string,
    ): Promise<string>;
    stopWorker(workerId: string): void;
    infer(
      workerId: string,
      imageBitmap: ImageBitmap,
    ): Promise<InferenceResult[]>;
  }

  export interface InferenceResult {
    class: string;
    confidence: number;
    bbox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }
}
