import crypto from "crypto";
import { SmsNotification, SmsType, SmsStatus } from "@/types/database";
import { adminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { withTimeout } from "@/lib/timeout-helper";
import fs from "fs";
import path from "path";
import os from "os";

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "lost-it-found-it-data")
  : path.join(process.cwd(), ".data");
const LOCAL_SMS_FILE = path.join(LOCAL_DATA_DIR, "sms_notifications.json");

function ensureLocalDir() {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[Local SMS Store] Directory creation skipped:", (err as Error).message);
  }
}

function readLocalSms(): SmsNotification[] {
  try {
    if (fs.existsSync(LOCAL_SMS_FILE)) {
      const raw = fs.readFileSync(LOCAL_SMS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as SmsNotification[];
      }
    }
  } catch {
    // Fallback
  }
  return [];
}

function writeLocalSms(notifications: SmsNotification[]) {
  try {
    ensureLocalDir();
    fs.writeFileSync(LOCAL_SMS_FILE, JSON.stringify(notifications, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Local SMS Store] Write SMS notifications skipped:", (err as Error).message);
  }
}

export interface SendSmsParams {
  to: string; // Recipient phone number (e.g. "+250788123456")
  message: string;
  type: SmsType;
  userId?: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId: string;
  simulated: boolean;
  error?: string;
}

/**
 * Dispatches an SMS alert with fallback for Africa's Talking Gateway.
 * Persists log to Firestore 'smsNotifications' collection and local dev cache.
 */
export async function sendSmsAlert({
  to,
  message,
  type,
  userId = "system",
}: SendSmsParams): Promise<SendSmsResult> {
  const notificationId = `sms_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const now = new Date().toISOString();

  const apiKey = (process.env.AFRICASTALKING_API_KEY || process.env.SMS_API_KEY || "").trim();
  const username = (process.env.AFRICASTALKING_USERNAME || process.env.SMS_USERNAME || "").trim();
  const senderId = (process.env.AFRICASTALKING_SENDER_ID || process.env.SMS_SENDER_ID || "").trim();

  let simulated = true;
  let status: SmsStatus = "SENT";

  // Check if real Africa's Talking credentials exist
  if (apiKey.length > 0 && username.length > 0) {
    try {
      const isSandbox = username.toLowerCase() === "sandbox";
      const endpoint = isSandbox
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging";

      const bodyParams = new URLSearchParams();
      bodyParams.append("username", username);
      bodyParams.append("to", to);
      bodyParams.append("message", message);
      if (senderId.length > 0 && !isSandbox) {
        bodyParams.append("from", senderId);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apiKey: apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: bodyParams.toString(),
      });

      if (response.ok) {
        simulated = false;
        status = "SENT";
        console.log(`[Africa's Talking SMS] Successfully dispatched SMS to ${to}`);
      } else {
        const errorText = await response.text().catch(() => "");
        console.warn(`[Africa's Talking SMS] Gateway returned ${response.status}: ${errorText}. Falling back to simulation.`);
        status = "FAILED";
      }
    } catch (err) {
      console.warn(`[Africa's Talking SMS] Network error, simulating alert: ${(err as Error).message}`);
    }
  } else {
    // Simulated Local Gateway
    console.log(`\n==================================================`);
    console.log(`📱 [SMS GATEWAY DISPATCH: ${type}]`);
    console.log(`To:        ${to}`);
    console.log(`Message:   ${message}`);
    console.log(`Timestamp: ${now}`);
    console.log(`==================================================\n`);
  }

  const notification: SmsNotification = {
    id: notificationId,
    userId,
    phoneNumber: to,
    message,
    type,
    status,
    sentAt: now,
  };

  // 1. Try persisting to Cloud Firestore
  if (isFirebaseAdminConfigured()) {
    try {
      await withTimeout(adminDb.collection("smsNotifications").doc(notificationId).set(notification), 1500, null);
    } catch {
      // Firestore write fallback
    }
  }

  // 2. Persist to local JSON file for inspection
  const localList = readLocalSms();
  localList.unshift(notification);
  writeLocalSms(localList);

  return {
    success: true,
    messageId: notificationId,
    simulated,
  };
}

/**
 * Returns recent SMS notifications from the log.
 */
export async function getRecentSmsNotifications(limitCount: number = 20): Promise<SmsNotification[]> {
  if (isFirebaseAdminConfigured()) {
    try {
      const snap = await withTimeout(
        adminDb
          .collection("smsNotifications")
          .orderBy("sentAt", "desc")
          .limit(limitCount)
          .get(),
        1000,
        null
      );
      if (snap && !snap.empty) {
        return snap.docs.map((doc) => doc.data() as SmsNotification);
      }
    } catch {
      // Fallback to local
    }
  }
  return readLocalSms().slice(0, limitCount);
}
