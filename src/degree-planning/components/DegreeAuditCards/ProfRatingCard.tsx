import { ExternalLinkIcon } from "lucide-react";

import { buildRateMyProfessorUrl } from "@/utils/rateMyProfessor";

import type { MatchedRateMyProf } from "../../../types/api";
import { StarRating } from "../../../ui-system/components/shared/StarRating";

const RMP_LINK_TOOLTIP = "Open Rate My Professor page in a new tab";

export function ProfRatingCard({ data }: { data: MatchedRateMyProf }) {
  const { master_name, first_name, last_name, avgRating, school, id } = data;
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
      <h4 className="mpp-degree-card-title">RMP</h4>
      <p className="mpp-degree-card-center-text">
        {profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={RMP_LINK_TOOLTIP}
            aria-label={`${displayName} � ${RMP_LINK_TOOLTIP}`}
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
          <StarRating
            value={rating}
            starClassName="mpp-degree-star"
            className="mpp-degree-stars"
          />
          <p className="mpp-degree-card-muted">
            <strong className="mpp-degree-card-score">
              {rating.toFixed(1)}
            </strong>{" "}
            / 5
          </p>
        </div>
      ) : (
        <p className="mpp-degree-card-empty">No rating available.</p>
      )}
    </div>
  );
}
