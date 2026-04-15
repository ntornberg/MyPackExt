import type { FullToCartPayload, ToCartPayload } from "../types/Cart";
import type { ModifiedSection } from "../types/Section";

import { generateScriptContentUrl } from "./ToCartService";

export type SubmitAddToCartResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

/**
 * POSTs MyPack’s add-to-shop-cart script. With `parent` (lecture), sends
 * `class_nbr` = lecture class # and `relate_class_nbr_1` = selected lab/recitation class #.
 */
export async function submitAddSectionToCart(
  selectedSection: ModifiedSection,
  parent?: ModifiedSection,
): Promise<SubmitAddToCartResult> {
  const {
    course_id,
    classNumber,
    catalog_nbr,
    course_career = "UGRD",
    session_code = "1",
    grading_basis = "GRD",
    rqmnt_designtn = "",
    wait_list_okay = "N",
    courseData,
  } = selectedSection;

  const unt_taken = courseData?.units || "3";

  if (!course_id || !classNumber || !catalog_nbr || !courseData) {
    return {
      ok: false,
      message: "Missing required data to add this section to the cart.",
    };
  }

  const url = generateScriptContentUrl({
    record: "WEBLIB_ENROLL",
    field: "ISCRIPT1",
    event: "FieldFormula",
    script: "IScript_addClassToShopCart",
  });

  const payload: ToCartPayload = {
    course_career,
    session_code,
    crse_id: course_id,
    class_nbr: classNumber,
    catalog_nbr,
    unt_taken,
    grading_basis,
    rqmnt_designtn,
    wait_list_okay,
  };

  if (parent) {
    (payload as FullToCartPayload).class_nbr = parent.classNumber;
    (payload as FullToCartPayload).relate_class_nbr_1 = selectedSection.classNumber;
  }

  const fullURL = `${url}?${new URLSearchParams(payload)}`;
  const res = await fetch(fullURL, { credentials: "include" });
  const data = (await res.json()) as {
    status?: string;
    title?: string;
    message?: string;
  };

  if (data.status === "success") {
    return { ok: true, message: data.message || "Added to cart." };
  }
  if (data.title && data.message) {
    return { ok: false, message: data.message };
  }
  if (data.message) {
    return { ok: false, message: data.message };
  }
  return { ok: false, message: "Error adding course to cart." };
}
