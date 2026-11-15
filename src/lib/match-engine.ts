import { Item } from "@/types/database";
import { getItemById, getAllItemsRaw } from "@/lib/items-store";
import { sendSmsAlert } from "@/lib/sms";
import fs from "fs";
import path from "path";
import os from "os";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "lost-it-found-it-data")
  : path.join(process.cwd(), ".data");
const LOCAL_MATCHES_FILE = path.join(LOCAL_DATA_DIR, "matches.json");

export interface MatchCandidate {
  item: Item;
  confidenceScore: number; // 0 to 100
  matchReasons: string[];
}

/**
 * Calculates matching score between two opposing items (FOUND vs LOST).
 */
export function calculateMatchScore(
  target: Item,
  candidate: Item
): { score: number; reasons: string[] } {
  const reasons: string[] = [];

  // Opposing types required
  if (target.type === candidate.type) {
    return { score: 0, reasons: [] };
  }

  // 1. Category must match (Primary gate)
  if (target.category !== candidate.category) {
    return { score: 0, reasons: [] };
  }
  let score = 35;
  reasons.push(`Category match (${target.category})`);

  // 2. Masked Document Number match
  if (target.maskedDocNumber && candidate.maskedDocNumber) {
    const tClean = target.maskedDocNumber.replace(/[^a-zA-Z0-9*]/g, "").toLowerCase();
    const cClean = candidate.maskedDocNumber.replace(/[^a-zA-Z0-9*]/g, "").toLowerCase();

    if (tClean === cClean) {
      score += 45;
      reasons.push(`Identical masked document pattern (${target.maskedDocNumber})`);
    } else {
      // Check prefix or suffix
      const tSuffix = tClean.slice(-3);
      const cSuffix = cClean.slice(-3);
      if (tSuffix === cSuffix && tSuffix.length >= 2 && !tSuffix.includes("*")) {
        score += 30;
        reasons.push(`Document serial ending matches (...${tSuffix})`);
      }
    }
  }

  // 3. District Match
  if (target.district && candidate.district) {
    if (target.district.toLowerCase() === candidate.district.toLowerCase()) {
      score += 15;
      reasons.push(`Same District (${target.district})`);

      // 4. Sector Match
      if (target.sector && candidate.sector) {
        if (target.sector.toLowerCase() === candidate.sector.toLowerCase()) {
          score += 15;
          reasons.push(`Same Sector (${target.sector})`);
        }
      }
    }
  }

  // 5. Keyword Overlap
  const tKeywords = new Set(target.searchKeywords || []);
  const cKeywords = candidate.searchKeywords || [];
  const overlap = cKeywords.filter((k) => tKeywords.has(k) && k.length > 2);
  if (overlap.length >= 2) {
    score += 10;
    reasons.push(`Keyword correlation: ${overlap.slice(0, 3).join(", ")}`);
  }

  const finalScore = Math.min(score, 100);
  return { score: finalScore, reasons };
}

/**
 * Executes cross-matching for a given item against all opposing items.
 */
export async function runAutoMatch(targetItem: Item): Promise<MatchCandidate[]> {
  const allItems = await getAllItemsRaw();
  const opposingItems = allItems.filter(
    (item) => item.id !== targetItem.id && item.type !== targetItem.type && item.status === "ACTIVE"
  );

  const candidates: MatchCandidate[] = [];

  for (const candidate of opposingItems) {
    const { score, reasons } = calculateMatchScore(targetItem, candidate);
    if (score >= 50) {
      candidates.push({
        item: candidate,
        confidenceScore: score,
        matchReasons: reasons,
      });
    }
  }

  // Sort descending by confidence score
  candidates.sort((a, b) => b.confidenceScore - a.confidenceScore);

  // For high-confidence matches (>= 75%), trigger automatic SMS alert
  const highConfidenceMatches = candidates.filter((c) => c.confidenceScore >= 75);

  for (const match of highConfidenceMatches) {
    // If target has a contact phone (held in contactPhone or finderId)
    const rawTarget = targetItem as unknown as { contactPhone?: string };
    const rawCandidate = match.item as unknown as { contactPhone?: string };

    const recipientPhone = rawTarget.contactPhone || rawCandidate.contactPhone;

    if (recipientPhone) {
      const msg = `Inshuti Match Alert: A ${match.confidenceScore}% match for your ${targetItem.category.replace(
        "_",
        " "
      )} was reported in ${match.item.sector}, ${match.item.district}. Ref: ${
        match.item.maskedDocNumber || "Item"
      }. Open Lost & Found Registry to verify.`;

      await sendSmsAlert({
        to: recipientPhone,
        message: msg,
        type: "MATCH_ALERT",
        userId: targetItem.id,
      });
    }
  }

  // Persist match log
  if (candidates.length > 0) {
    try {
      if (!fs.existsSync(LOCAL_DATA_DIR)) {
        fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
      }
      const matchLog = {
        targetItemId: targetItem.id,
        timestamp: new Date().toISOString(),
        matches: candidates.map((c) => ({
          candidateId: c.item.id,
          score: c.confidenceScore,
          reasons: c.matchReasons,
        })),
      };

      const existing: unknown[] = fs.existsSync(LOCAL_MATCHES_FILE)
        ? JSON.parse(fs.readFileSync(LOCAL_MATCHES_FILE, "utf-8"))
        : [];
      existing.unshift(matchLog);
      fs.writeFileSync(LOCAL_MATCHES_FILE, JSON.stringify(existing.slice(0, 50), null, 2), "utf-8");
    } catch {
      // Ignore
    }
  }

  return candidates;
}

