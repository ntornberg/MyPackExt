export type GradientDataRequest = {
    type: "get_gradient_data";
    data: {
        subject: string;
        course: string;
        instructor: string[];
    };
}