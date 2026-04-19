import React from "react";
import { ExternalLinkIcon, StarIcon } from "lucide-react";

import type { MatchedRateMyProf } from "../../../types/api.ts";
import { buildRateMyProfessorUrl } from "@/utils/rateMyProfessor";

const RMP_LINK_TOOLTIP = "Open Rate My Professor page in a new tab";

function StarRating({ value }: { value: number }) {
  return (
    <div
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      style={{ display: "flex", alignItems: "center", gap: 2 }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, value - i));
        return (
          <span
            key={i}
            style={{
              position: "relative",
              display: "inline-block",
              width: 12,
              height: 12,
              lineHeight: 0,
            }}
          >
            <StarIcon
              size={12}
              strokeWidth={1.6}
              style={{
                position: "absolute",
                inset: 0,
                color: "#c2c7d0",
              }}
            />
            {fill > 0 ? (
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  width: `${fill * 100}%`,
                }}
              >
                <StarIcon
                  size={12}
                  strokeWidth={0}
                  fill="#f59e0b"
                  style={{
                    position: "absolute",
                    inset: 0,
                    color: "#f59e0b",
                  }}
                />
              </span>
            ) : null}
          </span>
        );
      })}
    </div>
  );
}

export const ProfRatingCard: React.FC<MatchedRateMyProf> = ({
  master_name,
  first_name,
  last_name,
  avgRating,
  school,
  id,
}) => {
  const hasRating = avgRating != null && !Number.isNaN(Number(avgRating));
  const rating = hasRating ? parseFloat(avgRating.toString()) : null;

  const displayName =
    `${first_name ?? ""} ${last_name ?? ""}`.trim() || master_name;
  const profileUrl = buildRateMyProfessorUrl({
    first_name,
    last_name,
    master_name,
    school,
    id,
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "100%",
        margin: 0,
        padding: ".375rem .5rem .5rem",
        boxSizing: "border-box",
        background: "#fff",
        boxShadow: "0 1px 4px rgba(15, 23, 42, 0.16)",
        borderRadius: 6,
        border: "1px solid rgba(148, 163, 184, 0.28)",
        fontSize: 12,
      }}
    >
      <h4
        style={{
          margin: "0 0 .125rem",
          textAlign: "center",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".02em",
        }}
      >
        RMP
      </h4>
      <p style={{ margin: 0, textAlign: "center", lineHeight: 1.2 }}>
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={RMP_LINK_TOOLTIP}
            aria-label={`${displayName} — ${RMP_LINK_TOOLTIP}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: "#1d4ed8",
              fontWeight: 600,
              fontSize: 11,
              textDecoration: "underline",
              textUnderlineOffset: 2,
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(profileUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <span>{displayName}</span>
            <ExternalLinkIcon
              size={12}
              strokeWidth={2.25}
              aria-hidden
              style={{ color: "#1d4ed8" }}
            />
          </a>
        ) : (
          displayName
        )}
      </p>
      {rating != null ? (
        <div
          style={{
            marginTop: ".25rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <StarRating value={rating} />
          <p
            style={{
              margin: 0,
              color: "#475569",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            <strong style={{ color: "#0f172a", fontSize: 13 }}>
              {rating.toFixed(1)}
            </strong>{" "}
            / 5
          </p>
        </div>
      ) : (
        <p
          style={{
            margin: ".25rem 0 0",
            color: "#64748b",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          No rating available.
        </p>
      )}
    </div>
  );
};
