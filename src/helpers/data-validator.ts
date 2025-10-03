import { AppError } from '../middleware/errorHandler';
import { airport_parking_type, attraction_ticket_type, car_hire_type, hotels_type, lounge_pass_type, transfers_type } from '../types/modules/shared';
import { z } from 'zod';

export const dataValidator = <T extends z.ZodSchema>(
  schema: T,
  payload: any
): z.infer<T> & { financials: Array<{ tour_name: string; total_commission: number }> } => {
  const validated_data = schema.safeParse(payload);
  if (!validated_data.success) {
    console.log(validated_data.error);
    throw new AppError('Something went wrong fetching quote', true, 500);
  }

  const primary_qoute = validated_data.data as typeof validated_data.data & {
    main_tour_operator: string;
    package_commission: number;
    discount: number;
    service_charge: number;
    supplier_ref: string;
    hays_ref: string;
    hotels: Array<hotels_type>;
    transfers: Array<transfers_type>;
    car_hire: Array<car_hire_type>;
    attraction_tickets: Array<attraction_ticket_type>;
    airport_parking: Array<airport_parking_type>;
    lounge_pass: Array<lounge_pass_type>;
  };
  const combined_accom = [
    primary_qoute.hotels?.filter((hotel: hotels_type) => !hotel.is_primary),
    primary_qoute.transfers,
    primary_qoute.car_hire,
    primary_qoute.attraction_tickets,
    primary_qoute.airport_parking,
    primary_qoute.lounge_pass,
    [
      {
        tour_operator: primary_qoute.main_tour_operator,
        commission: primary_qoute.package_commission + primary_qoute.discount - primary_qoute.service_charge,
        booking_ref: primary_qoute.supplier_ref,
      },
    ].filter(Boolean), // Fixed key
  ]
    .filter(Boolean) // Remove any undefined or null entries
    .flatMap((category) =>
      Array.isArray(category) // Ensure it's an array before calling `.map()`
        ? category.map((data) => ({
            tour_name: data.tour_operator,
            booking_ref: data.booking_ref as string, // Ensure key exists
            commission: data.commission,
          }))
        : []
    );
  const accom_booking_refs = combined_accom.map((accom) => ({ tour_name: accom.tour_name, booking_ref: accom.booking_ref }));
  const aggregated_accom = Object.values(
    combined_accom.reduce((acc, { tour_name, commission }) => {
      if (!acc[tour_name]) {
        acc[tour_name] = { tour_name, total_commission: 0 };
      }
      acc[tour_name].total_commission += commission;
      return acc;
    }, {} as Record<string, { tour_name: string; total_commission: number }>)
  );

  return {
    ...(validated_data.data as typeof validated_data.data & { financials: Array<{ tour_name: string; total_commission: number }> }),
    financials: aggregated_accom,
    booking_ref_info: [{ tour_name: 'HAYS', booking_ref: primary_qoute.hays_ref }, ...accom_booking_refs],
  };
};
