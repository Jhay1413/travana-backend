import { enquiry_mutate_schema } from "../types/modules/transaction/mutation";
import z from "zod";

export const pre_process_data = (data: z.infer<typeof enquiry_mutate_schema>, type: string) => {
    const payload = {
      title: data.title,
      transaction_id: data.transaction_id,
      travel_date: data.travel_date,
      holiday_type_id: data.holiday_type_id,
      holiday_type_name: data.holiday_type_name,
      client_id: data.client_id,
      agent_id: data.agent_id,
      adults: data.adults,
      children: data.children,
      infants: data.infants,
      main_tour_operator_id: undefined,
      no_of_nights: data.no_of_nights ?? '0',
      budget: data.budget,
      is_future_deal: data.is_future_deal,
      future_deal_date: data.future_deal_date,
    };
  
    if (type === 'Package Holiday') {
      return {
        ...payload,
        country: data.country_id ? data.country_id[0] : undefined,
        destinations: data.destination ? data.destination[0] : undefined,
        resort: data.resorts ? data.resorts[0] : undefined,
        accomodation_id: data.accomodation ? data.accomodation[0] : undefined,
        main_board_basis_id: data.board_basis ? data.board_basis[0] : undefined,
      };
    } else if (type === 'Cruise Package') {
      return {
        ...payload,
        cabin_type: data.cabin_type ? data.cabin_type[0] : undefined,
        pre_cruise_stay: data.pre_cruise_stay,
        post_cruise_stay: data.post_cruise_stay,
      };
    } else {
      return payload;
    }
  };
  