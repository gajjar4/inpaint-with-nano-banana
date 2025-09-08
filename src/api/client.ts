import type {
  APIConfig,
  GenerationRequest,
  GenerationResponse,
  PollStatusRequest,
  PollStatusResponse,
} from "./types";

/**
 * Nano Banana API Client for AI Image Generation
 *
 * This client is specifically designed for the Nano Banana API backend.
 * It handles image annotation processing, mask-based editing, and AI generation.
 */
export class APIClient {
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
  }

  /**
   * Generate image with Nano Banana API
   *
   * Sends image generation request to the Nano Banana backend.
   * Supports both annotation-based editing and mask-based editing.
   */
  async generateImage(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      // Nano Banana API endpoint
      const response = await fetch(
        `${this.config.baseUrl}/api/image-editing/v1/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.config.apiKey || "",
            ...this.config.headers,
          },
          body: JSON.stringify({
            data: {
              prompt: request.prompt,
              inputImage: [request.imageData],
              numOfImages: 1,
              model: "NANO BANANA",
              ...(request.maskData && {
                maskStrokes: request.maskData,
                maskMode: true,
              }),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle Nano Banana API response format
      if (data.success && data.requestId) {
        return {
          success: true,
          result: {
            output: data.result?.output,
            requestId: data.requestId,
            metadata: {
              model: "NANO BANANA",
              processingTime: data.result?.processingTime,
            },
          },
        };
      } else {
        throw new Error(data.error?.message || "Generation failed");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      return {
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      };
    }
  }

  /**
   * Poll for generation status from Nano Banana API
   *
   * The Nano Banana API returns a request ID immediately and requires polling
   * to get the final generated result.
   */
  async pollStatus(request: PollStatusRequest): Promise<PollStatusResponse> {
    try {
      // Nano Banana API polling endpoint
      const response = await fetch(
        `${this.config.baseUrl}/api/image-editing/v1/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: this.config.apiKey || "",
            ...this.config.headers,
          },
          body: JSON.stringify({
            data: {
              requestId: request.requestId,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Polling failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle Nano Banana API polling response
      if (data.success) {
        if (data.result.status === "COMPLETED") {
          return {
            status: "completed",
            result: {
              output: data.result.output,
              requestId: request.requestId,
              metadata: {
                model: "NANO BANANA",
                processingTime: data.result.processingTime,
              },
            },
          };
        } else if (data.result.status === "FAILED") {
          return {
            status: "failed",
            error: {
              code: "GENERATION_FAILED",
              message: data.result.errorMessage || "Generation failed",
            },
          };
        } else {
          return {
            status: "processing",
            progress: data.result.progress,
          };
        }
      } else {
        throw new Error(data.error?.message || "Polling failed");
      }
    } catch (error) {
      console.error("Polling failed:", error);
      return {
        status: "failed",
        error: {
          code: "POLLING_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
      };
    }
  }
}

/**
 * Create Nano Banana API Client
 *
 * Factory function to create a properly configured Nano Banana API client.
 *
 * @param baseUrl - The base URL of your Nano Banana backend server
 * @param apiKey - Your Firebase ID token or API key for authentication
 * @returns Configured APIClient instance
 */
export const createNanoBananaClient = (
  baseUrl: string,
  apiKey?: string
): APIClient => {
  return new APIClient({
    baseUrl: baseUrl.replace(/\/$/, ""), // Remove trailing slash
    apiKey,
    timeout: 300000, // 5 minutes timeout for image generation
    headers: {
      "Content-Type": "application/json",
    },
  });
};
