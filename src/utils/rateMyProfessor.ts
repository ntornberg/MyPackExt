import type { MatchedRateMyProf } from "../types/api";

const RMP_PROFILE_BASE = "https://www.ratemyprofessors.com/professor/";
const RMP_SEARCH_BASE = "https://www.ratemyprofessors.com/search/professors/";

function decodeBase64(value: string): string | null {
  try {
    if (typeof atob === "function") {
      return atob(value);
    }
  } catch {
    return null;
  }

  try {
    if (typeof Buffer !== "undefined") {
      return Buffer.from(value, "base64").toString("utf-8");
    }
  } catch {
    return null;
  }

  return null;
}

function normalizeProfessorId(id: string | null | undefined): string | null {
  if (!id) {
    return null;
  }
  const trimmed = id.trim();
  if (!trimmed) {
    return null;
  }
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const fromUrl = trimmed.match(/\/professor\/(\d+)/)?.[1];
    return fromUrl ?? null;
  }

  const decoded = decodeBase64(trimmed);
  if (!decoded) {
    return null;
  }
  const fromDecoded = decoded.match(/^[A-Za-z]+-(\d+)$/)?.[1];
  return fromDecoded ?? null;
}

export function buildRateMyProfessorUrl(
  rating: Pick<
    MatchedRateMyProf,
    "id" | "master_name" | "first_name" | "last_name" | "school"
  >,
): string | null {
  const professorId = normalizeProfessorId(rating.id);
  if (professorId) {
    return `${RMP_PROFILE_BASE}${professorId}`;
  }

  const fullName =
    `${rating.first_name ?? ""} ${rating.last_name ?? ""}`.trim() ||
    rating.master_name?.trim();

  if (!fullName) {
    return null;
  }

  const params = new URLSearchParams({
    q: rating.school ? `${fullName} ${rating.school}` : fullName,
  });
  return `${RMP_SEARCH_BASE}?${params.toString()}`;
}
