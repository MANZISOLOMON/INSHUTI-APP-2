import { RWANDA_LOCATIONS } from "./rwanda-locations";

export interface DetectedLocation {
  province: string;
  district: string;
  sector: string;
  lat: number;
  lon: number;
  isApproximate?: boolean;
  fallbackNote?: string;
}

// Known sector coordinates within Rwanda for instant offline coordinate-distance reverse-geocoding
interface SectorCoordinate {
  province: string;
  district: string;
  sector: string;
  lat: number;
  lon: number;
}

const RWANDA_SECTOR_COORDINATES: SectorCoordinate[] = [
  // Gasabo, Kigali City
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Remera", lat: -1.9583, lon: 30.1128 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Kimironko", lat: -1.9427, lon: 30.1287 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Kacyiru", lat: -1.9333, lon: 30.0833 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Kimihurura", lat: -1.9542, lon: 30.0889 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Gisozi", lat: -1.9214, lon: 30.0617 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Kinyinya", lat: -1.9125, lon: 30.0950 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Ndera", lat: -1.9450, lon: 30.1800 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Rusororo", lat: -1.9600, lon: 30.2200 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Gatsata", lat: -1.9167, lon: 30.0500 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Gasabo", sector: "Bumbogo", lat: -1.8833, lon: 30.1333 },

  // Kicukiro, Kigali City
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Kanombe", lat: -1.9700, lon: 30.1550 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Kicukiro", lat: -1.9800, lon: 30.1000 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Gikondo", lat: -1.9720, lon: 30.0750 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Niboye", lat: -1.9850, lon: 30.1150 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Kagarama", lat: -1.9890, lon: 30.1050 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Gatenga", lat: -1.9950, lon: 30.0850 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Nyarugunga", lat: -1.9750, lon: 30.1650 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Gahanga", lat: -2.0400, lon: 30.1000 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Kicukiro", sector: "Masaka", lat: -2.0000, lon: 30.2200 },

  // Nyarugenge, Kigali City
  { province: "Kigali City (Umujyi wa Kigali)", district: "Nyarugenge", sector: "Nyarugenge", lat: -1.9500, lon: 30.0583 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Nyarugenge", sector: "Nyamirambo", lat: -1.9833, lon: 30.0450 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Nyarugenge", sector: "Muhima", lat: -1.9410, lon: 30.0600 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Nyarugenge", sector: "Gitega", lat: -1.9600, lon: 30.0500 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Nyarugenge", sector: "Kimisagara", lat: -1.9550, lon: 30.0400 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Nyarugenge", sector: "Rwezamenyo", lat: -1.9680, lon: 30.0480 },
  { province: "Kigali City (Umujyi wa Kigali)", district: "Nyarugenge", sector: "Nyakabanda", lat: -1.9750, lon: 30.0400 },

  // Northern Province
  { province: "Northern Province (Amajyaruguru)", district: "Musanze", sector: "Muhoza", lat: -1.4983, lon: 29.6350 },
  { province: "Northern Province (Amajyaruguru)", district: "Musanze", sector: "Kinigi", lat: -1.4333, lon: 29.5833 },
  { province: "Northern Province (Amajyaruguru)", district: "Gicumbi", sector: "Byumba", lat: -1.5767, lon: 30.0667 },
  { province: "Northern Province (Amajyaruguru)", district: "Rulindo", sector: "Tare", lat: -1.7333, lon: 29.9833 },

  // Southern Province
  { province: "Southern Province (Amajyepfo)", district: "Huye", sector: "Ngoma", lat: -2.6000, lon: 29.7400 },
  { province: "Southern Province (Amajyepfo)", district: "Huye", sector: "Tumba", lat: -2.6100, lon: 29.7300 },
  { province: "Southern Province (Amajyepfo)", district: "Muhanga", sector: "Nyamabuye", lat: -2.0800, lon: 29.7500 },

  // Western Province
  { province: "Western Province (Iburengerazuba)", district: "Rubavu", sector: "Gisenyi", lat: -1.6833, lon: 29.2600 },
  { province: "Western Province (Iburengerazuba)", district: "Rusizi", sector: "Kamembe", lat: -2.4833, lon: 28.9000 },

  // Eastern Province
  { province: "Eastern Province (Iburasirazuba)", district: "Rwamagana", sector: "Kigabiro", lat: -1.9500, lon: 30.4333 },
  { province: "Eastern Province (Iburasirazuba)", district: "Bugesera", sector: "Nyamata", lat: -2.1450, lon: 30.0900 },
];

/**
 * Calculates great-circle distance between two coordinates in kilometers using Haversine formula
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Reverse-geocodes raw lat/lon to Rwandan Province, District, and Sector
 */
export async function reverseGeocodeRwanda(lat: number, lon: number): Promise<DetectedLocation> {
  // 1. First, attempt to match using online reverse geocoding with 2.5s timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { "Accept-Language": "en,fr" },
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      
      const subdistrict = (addr.suburb || addr.quarter || addr.neighbourhood || addr.village || "").toLowerCase();
      const county = (addr.county || addr.district || addr.city_district || addr.state_district || "").toLowerCase();

      // Find matching district and sector in RWANDA_LOCATIONS
      for (const prov of RWANDA_LOCATIONS) {
        for (const dist of prov.districts) {
          const distMatches = dist.name.toLowerCase() === county || county.includes(dist.name.toLowerCase());
          if (distMatches) {
            const matchedSector = dist.sectors.find(
              (s) => s.toLowerCase() === subdistrict || subdistrict.includes(s.toLowerCase())
            );
            return {
              province: prov.name,
              district: dist.name,
              sector: matchedSector || dist.sectors[0],
              lat,
              lon,
            };
          }
        }
      }
    }
  } catch {
    // Fall through to centroid distance matcher
  }

  // 2. High-precision nearest-coordinate match against Rwandan administrative centroids
  let nearest: SectorCoordinate = RWANDA_SECTOR_COORDINATES[0];
  let minDistance = Infinity;

  for (const item of RWANDA_SECTOR_COORDINATES) {
    const d = haversineDistance(lat, lon, item.lat, item.lon);
    if (d < minDistance) {
      minDistance = d;
      nearest = item;
    }
  }

  return {
    province: nearest.province,
    district: nearest.district,
    sector: nearest.sector,
    lat,
    lon,
    isApproximate: true,
  };
}

/**
 * Triggers browser geolocation and resolves to Rwandan administrative boundaries.
 * Gracefully falls back to Kigali / Gasabo if blocked or unsupported, never throwing raw red errors.
 */
export function detectCurrentRwandaLocation(): Promise<DetectedLocation> {
  const KIGALI_FALLBACK: DetectedLocation = {
    province: "Kigali City (Umujyi wa Kigali)",
    district: "Gasabo",
    sector: "Remera",
    lat: -1.9583,
    lon: 30.1128,
    isApproximate: true,
    fallbackNote: "Auto-selected nearest district (adjust manually if needed).",
  };

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      resolve(KIGALI_FALLBACK);
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const result = await reverseGeocodeRwanda(pos.coords.latitude, pos.coords.longitude);
            resolve(result);
          } catch {
            resolve(KIGALI_FALLBACK);
          }
        },
        async (err) => {
          // If browser, permissions policy, or user denied GPS, attempt IP lookup or resolve fallback
          console.warn("[Geolocation Notice] GPS not available or restricted, applying fallback:", err?.message);
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 1500);
            const ipRes = await fetch("https://ipapi.co/json/", { signal: controller.signal });
            clearTimeout(timeout);
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.latitude && ipData.longitude) {
                const geoMatch = await reverseGeocodeRwanda(ipData.latitude, ipData.longitude);
                resolve({
                  ...geoMatch,
                  isApproximate: true,
                  fallbackNote: "Auto-selected nearest district (adjust manually if needed).",
                });
                return;
              }
            }
          } catch {
            // Network fallback
          }

          resolve(KIGALI_FALLBACK);
        },
        {
          enableHighAccuracy: true,
          timeout: 4000,
          maximumAge: 60000,
        }
      );
    } catch (unexpectedErr) {
      console.warn("[Geolocation Exception]:", unexpectedErr);
      resolve(KIGALI_FALLBACK);
    }
  });
}
