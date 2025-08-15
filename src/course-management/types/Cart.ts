export interface ToCartPayload {
  [key: string]: string;
  course_career: string;
  session_code: string;
  crse_id: string;
  class_nbr: string;
  catalog_nbr: string;
  unt_taken: string;
  grading_basis: string;
  rqmnt_designtn: string;
  wait_list_okay: string;
}

export type FullToCartPayload = ToCartPayload & { relate_class_nbr_1: string };

