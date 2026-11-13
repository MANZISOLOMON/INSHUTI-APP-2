import crypto from "crypto";
import { SmsNotification, SmsType, SmsStatus } from "@/types/database";
import { adminDb } from "@/lib/firebase/admin";
import fs from "fs";
import path from "path";

const LOCAL_DATA_DIR = path.join(process.cwd(), ".data");
const LOCAL_SMS_FILE = path.join(LOCAL_DATA_DIR, "sms_notifications.json");

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
}

function readLocalSms(): SmsNotification[] {
  ensureLocalDir();
  if (!fs.existsSync(LOCAL_SMS_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(LOCAL_SMS_FILE, "utf-8");
    return JSON.parse(raw) as SmsNotification[];
  } catch {
    return [];
  }
}

function writeLocalSms(notifications: SmsNotification[]) {
  ensureLocalDir();
  fs.writeFileSync(LOCAL_SMS_FILE, JSON.stringify(notifications, null, 2), "utf-8");
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

  const apiKey = process.env.SMS_API_KEY;
  const username = process.env.SMS_USERNAME;

  let simulated = true;
  let status: SmsStatus = "SENT";

  // Check if real Africa's Talking credentials exist
  if (apiKey && username && apiKey.trim().length > 0 && username.trim().length > 0) {
    try {
      const isSandbox = username.toLowerCase() === "sandbox";
      const endpoint = isSandbox
        ? "https://api.sandbox.africastalking.com/version1/messaging"
        : "https://api.africastalking.com/version1/messaging";

      const bodyParams = new URLSearchParams();
      bodyParams.append("username", username);
      bodyParams.append("to", to);
      bodyParams.append("message", message);

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
        console.warn(`[Africa's Talking SMS] Gateway returned ${response.status}. Falling back to simulation.`);
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
  try {
    await adminDb.collection("smsNotifications").doc(notificationId).set(notification);
  } catch (err) {
    // Firestore write fallback
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
  try {
    const snap = await adminDb
      .collection("smsNotifications")
      .orderBy("sentAt", "desc")
      .limit(limitCount)
      .get();
    if (!snap.empty) {
      return snap.docs.map((doc) => doc.data() as SmsNotification);
    }
  } catch (err) {
    // Fallback to local
  }
  return readLocalSms().slice(0, limitCount);
}

