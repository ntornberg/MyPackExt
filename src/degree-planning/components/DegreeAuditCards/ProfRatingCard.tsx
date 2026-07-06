import React from "react";
import { ExternalLinkIcon, StarIcon } from "lucide-react";

import type { MatchedRateMyProf } from "../../../types/api.ts";
import { buildRateMyProfessorUrl } from "@/utils/rateMyProfessor";

const RMP_LINK_TOOLTIP = "Open Rate My Professor page in a new tab";

function StarRating({ value }: { value: number }) {
  return (
    <div
      aria-label={`${value.toFixed(1)} out of 5 stars`}
      className="mpp-degree-stars"
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, value - i));
        return (
          <span key={i} className="mpp-degree-star">
            <StarIcon
              size={12}
              strokeWidth={1.6}
              className="mpp-degree-star-base"
            />
            {fill > 0 ? (
              <span
                className="mpp-degree-star-fill"
                style={{ width: `${fill * 100}%` }}
              >
                <StarIcon
                  size={12}
                  strokeWidth={0}
                  fill="#f59e0b"
                  className="mpp-degree-star-fill-icon"
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
    <div className="mpp-degree-card">
      <h4 className="mpp-degree-card-title">
        RMP
      </h4>
      <p className="mpp-degree-card-center-text">
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={RMP_LINK_TOOLTIP}
            aria-label={`${displayName} — ${RMP_LINK_TOOLTIP}`}
            className="mpp-degree-card-link"
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
              className="mpp-degree-card-link-icon"
            />
          </a>
        ) : (
          displayName
        )}
      </p>
      {rating != null ? (
        <div className="mpp-degree-card-stack">
          <StarRating value={rating} />
          <p className="mpp-degree-card-muted">
            <strong className="mpp-degree-card-score">
              {rating.toFixed(1)}
            </strong>{" "}
            / 5
          </p>
        </div>
      ) : (
        <p className="mpp-degree-card-empty">
          No rating available.
        </p>
      )}
    </div>
  );
};
