// experienceLog.ts
import { GeminiLLM } from "./gemini-llm";

export interface Log {
  logId: string;
  userId: string;
  placeId: string;
  timestamp: Date;
  rating: number;
  sweetness: number;
  strength: number;
  notes?: string;
  photo?: string;
}

export class ExperienceLog {
  private logs: Map<string, Log> = new Map();
  private nextId = 1;

  createLog(
    userId: string,
    placeId: string,
    rating: number,
    sweetness: number,
    strength: number,
    notes?: string,
    photo?: string
  ): Log {
    if (rating < 1 || rating > 5) throw new Error("Rating must be 1–5");
    if (sweetness < 1 || sweetness > 5) throw new Error("Sweetness must be 1–5");
    if (strength < 1 || strength > 5) throw new Error("Strength must be 1–5");

    const log: Log = {
      logId: `log-${this.nextId++}`,
      userId,
      placeId,
      timestamp: new Date(),
      rating,
      sweetness,
      strength,
      notes,
      photo,
    };

    this.logs.set(log.logId, log);
    return log;
  }

  updateLog(logId: string, updates: Partial<Log>): Log {
    const log = this.logs.get(logId);
    if (!log) throw new Error("Log not found");

    const updated: Log = { ...log, ...updates };
    this.logs.set(logId, updated);
    return updated;
  }

  deleteLog(logId: string): void {
    this.logs.delete(logId);
  }

  getUserLogs(userId: string): Log[] {
    return [...this.logs.values()].filter((l) => l.userId === userId);
  }

  getPlaceLogs(userId: string, placeId: string): Log[] {
    return this.getUserLogs(userId).filter((l) => l.placeId === placeId);
  }

  getAverageRating(userId: string, placeId: string): number {
    const logs = this.getPlaceLogs(userId, placeId);
    if (logs.length === 0) return 0;
    return logs.reduce((sum, l) => sum + l.rating, 0) / logs.length;
  }

  // AI-Augmented Action
  async generateProfileSummary(userId: string, llm: GeminiLLM): Promise<string> {
    const logs = this.getUserLogs(userId);
    if (logs.length === 0) {
      throw new Error("No logs for this user");
    }

    const avgRating =
      logs.reduce((sum, l) => sum + l.rating, 0) / logs.length;
    const avgSweetness =
      logs.reduce((sum, l) => sum + l.sweetness, 0) / logs.length;
    const avgStrength =
      logs.reduce((sum, l) => sum + l.strength, 0) / logs.length;
    const places = [...new Set(logs.map((l) => l.placeId))];

    const last3 = logs.slice(-3);

    const prompt = `
        You are an assistant that summarizes a user's matcha tasting history.
        Generate a concise profile (2–3 sentences).

        User ID: ${userId}
        Average rating: ${avgRating.toFixed(1)}
        Average sweetness: ${avgSweetness.toFixed(1)}
        Average strength: ${avgStrength.toFixed(1)}
        Places tried: ${places.join(", ")}
        Recent logs:
        ${last3
        .map(
            (l) =>
            `- ${l.placeId}, rating ${l.rating}, sweetness ${l.sweetness}, strength ${l.strength}, notes: "${l.notes ?? ""}"`
        )
        .join("\n")}

        Guidelines:
        - Mention only places in the logs (no new ones).
        - Highlight consistent preferences (sweetness/strength).
        - Keep <= 3 sentences.
        `;

    const response = await llm.executeLLM(prompt);
    return response.trim();
  }
}
