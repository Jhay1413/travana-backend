import { z } from 'zod';

export const booking_mutate_schema = z.object({
  transaction_id: z.string().optional(),
  quote_id: z.string().optional(),
  holiday_type_name: z.string().optional(),
  lead_source: z.enum(['SHOP', 'FACEBOOK', 'WHATSAPP', 'INSTAGRAM', 'PHONE_ENQUIRY']).optional(),
  travel_date: z.string(),
  main_tour_operator_id: z.string(),
  hays_ref: z.string(),
  supplier_ref: z.string(),
  sales_price: z.number().or(z.string()).pipe(z.coerce.number()).optional(),
  commission: z.number(),
  discount: z.number().or(z.string()).pipe(z.coerce.number()).optional(),
  service_charge: z.number().or(z.string()).pipe(z.coerce.number()).optional(),
  holiday_type: z.string(),
  agent_id: z.string().trim().min(1, 'Required'),
  client_id: z.string().trim().min(1, 'Required'),
  adults: z.number(),
  children: z.number(),
  infants: z.number(),
  no_of_nights: z.nullable(z.string()).optional(),
  transfer_type: z.string().optional(),
  check_in_date_time: z.string().optional(),
  title: z.nullable(z.string()).optional(),

  //package holiday
  country: z.string().optional(),
  destination: z.string().optional(),
  resort: z.string().optional(),
  accomodation_id: z.string().optional(),
  accomodation_type: z.string().optional(),
  main_board_basis_id: z.string().optional(),
  room_type: z.string().optional(),

  //hot tub
  lodge_id: z.nullable(z.string()).optional(),
  pets: z.number().optional(),
  lodge_park_name: z.string().optional(),
  lodge_type: z.nullable(z.string()).optional(),
  cottage_id: z.nullable(z.string()).optional(),
  lodge_code: z.string().optional(),

  //cruise
  booking_cruise_id: z.string().optional(),
  cruise_date: z.string().datetime().optional(),
  cabin_type: z.string().optional(),
  cruise_line: z.string().optional(),
  cruise_ship: z.string().optional(),
  cruise_name: z.string().optional(),
  pre_cruise_stay: z.string().optional(),
  post_cruise_stay: z.string().optional(),
  booking_cruise_extra: z.array(z.string()).optional(),
  deal_images: z.array(z.string()).optional(),
  passengers: z.array(
    z.object({
      id: z.string().optional(),
      type: z.string().optional(),
      age: z.number().optional(),
    })
  ),
  voyages: z
    .array(
      z.object({
        day_number: z.number(),
        description: z.string(),
      })
    )
    .optional(),
  flights: z
    .array(
      z.object({
        id: z.string().optional(),
        flight_number: z.nullable(z.string()).optional(),
        flight_ref: z.nullable(z.string()).optional(),
        departing_airport_id: z.string().trim().min(1, 'Required'),
        flight_type: z.string().trim().min(1, 'Required'),
        departure_date_time: z.string(),
        arrival_airport_id: z.string().trim().min(1, 'Required'),
        arrival_date_time: z.string(),
        is_included_in_package: z.boolean(),
        cost: z.number().optional(),
        commission: z.number().optional(),
      })
    )
    .optional(),
  hotels: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        country: z.string().trim().min(1, 'Required'),
        destination: z.string().trim().min(1, 'Required'),
        resort: z.string().trim().min(1, 'Required'),
        accomodation_id: z.string().trim().min(1, 'Required'),
        no_of_nights: z.string().trim().min(1, 'Required'),
        check_in_date_time: z.string().datetime(),
        room_type: z.string().trim().min(1, 'Required'),
        board_basis_id: z.string().trim().min(1, 'Required'),
        stay_type: z.nullable(z.string()).optional(),
        tour_operator_id: z.string().trim().min(1, 'Required'),
        cost: z.number(),
        commission: z.number(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  transfers: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        pick_up_location: z.string().trim().min(1, 'Required'),
        pick_up_location_type: z.string().optional(),
        pick_up_time: z.string().datetime(),
        tour_operator_id: z.string().trim().min(1, 'Required'),
        cost: z.number(),
        commission: z.number(),
        note: z.string().optional(),
        drop_off_location: z.string().trim().min(1, 'Required'),
        drop_off_time: z.string().datetime(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  attraction_tickets: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        ticket_type: z.string().trim().min(1, 'Required'),
        date_of_visit: z.string().datetime(),
        tour_operator_id: z.string().trim().min(1, 'Required'),
        cost: z.number(),
        commission: z.number(),
        number_of_tickets: z.number(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  car_hire: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        pick_up_location: z.string().trim().min(1, 'Required'),
        pick_up_location_type: z.string().optional(),
        pick_up_time: z.string().datetime(),
        no_of_days: z.number(),
        tour_operator_id: z.string().trim().min(1, 'Required'),
        cost: z.number(),
        commission: z.number(),
        driver_age: z.number(),
        drop_off_location: z.string().trim().min(1, 'Required'),
        drop_off_time: z.string().datetime(),
        drop_off_type: z.string().optional(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  airport_parking: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        airport_id: z.string().trim().min(1, 'Required'),
        tour_operator_id: z.string().trim().min(1, 'Required'),
        parking_type: z.string().trim().min(1, 'Required'),
        duration: z.string().trim().min(1, 'Required'),
        cost: z.number(),
        parking_date: z.string().datetime(),
        commission: z.number(),
        make: z.string().optional(),
        model: z.string().optional(),
        colour: z.string().trim().min(1, 'Required'),
        car_reg_number: z.string().trim().min(1, 'Required'),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  lounge_pass: z
    .array(
      z.object({
        id: z.string().optional(),
        booking_ref: z.nullable(z.string()).optional(),
        airport_id: z.string().trim().min(1, 'Required'),
        terminal: z.string().trim().min(1, 'Required'),
        tour_operator_id: z.string().trim().min(1, 'Required'),
        date_of_usage: z.string().datetime(),
        cost: z.number(),
        commission: z.number(),
        note: z.string().optional(),
        adults: z.number().optional(),
        children: z.number().optional(),
        infants: z.number().optional(),
        is_included_in_package: z.boolean(),
      })
    )
    .optional(),
  referralId: z.nullable(z.string()).optional(),
  referrerId: z.nullable(z.string()).optional(),
  potentialCommission: z.nullable(z.number()).optional(),
});

export const requiredHolidayFieldsBook = booking_mutate_schema.merge(
  z.object({
    main_tour_operator_id: z.string(),
    holiday_type: z.string(),
    no_of_nights: z.string(),
    transfer_type: z.string(),
    check_in_date_time: z.string(),
    accomodation_id: z.string(),
  })
);

export const requiredHotTubFieldsBook = booking_mutate_schema.merge(
  z.object({
    lodge_id: z.string().min(1, 'Required'),
    pets: z.number().min(0, 'Required'),
    lodge_park_name: z.string().min(1, 'Required'),
  })
);
export const requiredCruiseFieldsBook = booking_mutate_schema.merge(
  z.object({
    cruise_date: z.string().datetime(),
    cabin_type: z.string(),
    cruise_line: z.string(),
    cruise_ship: z.string(),
    cruise_name: z.string(),
    pre_cruise_stay: z.string(),
    post_cruise_stay: z.string(),
  })
);
