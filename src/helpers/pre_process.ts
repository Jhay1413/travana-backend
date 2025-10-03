import { db } from "../db/db";
import { booking_accomodation, booking_airport_parking, booking_attraction_ticket, booking_car_hire, booking_flights, booking_lounge_pass, booking_transfers } from "../schema/booking-schema";
import { passengers, quote_accomodation, quote_airport_parking, quote_attraction_ticket, quote_car_hire, quote_flights, quote_lounge_pass, quote_transfers } from "../schema/quote-schema";
import { sharedMutateSchema } from "../types/modules/shared";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const preProcessUpdate = async (quote_id: string, data: z.infer<typeof sharedMutateSchema>, type?: 'QUOTE' | 'BOOKING') => {
    const hotels = data.hotels ?? [];
    const flights = data.flights ?? [];
    const transfers = data.transfers ?? [];
    const attraction_tickets = data.attraction_tickets ?? [];
    const car_hire = data.car_hire ?? [];
    const airport_parking = data.airport_parking ?? [];
    const lounge_pass = data.lounge_pass ?? [];
    const passenger = data.passengers ?? [];
  
    console.log(data);
  
  
    let oldPassengers, oldHotels, oldFlights, oldTransfers, oldAttractionTickets, oldCarHire, oldAirportParking, oldLoungePass;
  
    if (type === 'BOOKING') {
      [oldPassengers, oldHotels, oldFlights, oldTransfers, oldAttractionTickets, oldCarHire, oldAirportParking, oldLoungePass] = await Promise.all([
        db.query.passengers.findMany({
          where: eq(passengers.booking_id, quote_id),
          columns: { id: true },
        }),
        db.query.booking_accomodation.findMany({
          where: and(eq(booking_accomodation.booking_id, quote_id), eq(booking_accomodation.is_primary, false)),
          columns: { id: true },
        }),
        db.query.booking_flights.findMany({
          where: eq(booking_flights.booking_id, quote_id),
        }),
        db.query.booking_transfers.findMany({
          where: eq(booking_transfers.booking_id, quote_id),
        }),
        db.query.booking_attraction_ticket.findMany({
          where: eq(booking_attraction_ticket.booking_id, quote_id),
        }),
        db.query.booking_car_hire.findMany({
          where: eq(booking_car_hire.booking_id, quote_id),
        }),
        db.query.booking_airport_parking.findMany({
          where: eq(booking_airport_parking.booking_id, quote_id),
        }),
        db.query.booking_lounge_pass.findMany({
          where: eq(booking_lounge_pass.booking_id, quote_id),
        }),
      ]);
    } else {
      [oldPassengers, oldHotels, oldFlights, oldTransfers, oldAttractionTickets, oldCarHire, oldAirportParking, oldLoungePass] = await Promise.all([
        db.query.passengers.findMany({
          where: eq(passengers.quote_id, quote_id),
          columns: { id: true },
        }),
        db.query.quote_accomodation.findMany({
          where: and(eq(quote_accomodation.quote_id, quote_id), eq(quote_accomodation.is_primary, false)),
          columns: { id: true },
        }),
        db.query.quote_flights.findMany({
          where: eq(quote_flights.quote_id, quote_id),
        }),
        db.query.quote_transfers.findMany({
          where: eq(quote_transfers.quote_id, quote_id),
        }),
        db.query.quote_attraction_ticket.findMany({
          where: eq(quote_attraction_ticket.quote_id, quote_id),
        }),
        db.query.quote_car_hire.findMany({
          where: eq(quote_car_hire.quote_id, quote_id),
        }),
        db.query.quote_airport_parking.findMany({
          where: eq(quote_airport_parking.quote_id, quote_id),
        }),
        db.query.quote_lounge_pass.findMany({
          where: eq(quote_lounge_pass.quote_id, quote_id),
        }),
      ]);
    }
  
    const removedPassengers = findRemoved(oldPassengers, passenger);
    const removedHotels = findRemoved(oldHotels, hotels);
    const removedFlights = findRemoved(oldFlights, flights);
    const removedTransfers = findRemoved(oldTransfers, transfers);
    const removedAttractionTickets = findRemoved(oldAttractionTickets, attraction_tickets);
    const removedCarHire = findRemoved(oldCarHire, car_hire);
    const removedAirportParking = findRemoved(oldAirportParking, airport_parking);
    const removedLoungePass = findRemoved(oldLoungePass, lounge_pass);
  
    const passengersToAdd = passenger.filter((passenger) => !passenger.id).map((data) => ({ ...data, age: data.age ? data.age : 0 }));
    const passengersToUpdate = passenger.filter((passenger) => passenger.id).map((data) => ({ ...data, age: data.age ? data.age : 0 }));
    const hotelsToAdd = hotels
      .filter((hotel) => !hotel.id)
      .map((hotel) => ({
        ...hotel,
        cost: hotel.cost ? hotel.cost : 0,
        commission: hotel.commission ? hotel.commission : 0,
        is_primary: false,
        check_in_date_time: new Date(hotel.check_in_date_time),
        tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
      }));
    const hotelsToUpdate = hotels
      .filter((hotel) => hotel.id)
      .map((hotel) => ({
        ...hotel,
        check_in_date_time: data.is_primary && hotel.is_primary ? new Date(data.check_in_date_time!) : new Date(hotel.check_in_date_time!),
        cost: hotel.cost ? hotel.cost : 0,
        commission: hotel.commission ? hotel.commission : 0,
        tour_operator_id: hotel.is_included_in_package ? data.main_tour_operator_id : hotel.tour_operator_id,
      }));
  
    const flightsToAdd = flights
      .filter((flight) => !flight.id)
      .map((flight) => ({
        ...flight,
        cost: flight.cost ? flight.cost : 0,
        commission: flight.commission ? flight.commission : 0,
        arrival_date_time: new Date(flight.arrival_date_time),
        departure_date_time: new Date(flight.departure_date_time),
        tour_operator_id: data.main_tour_operator_id,
      }));
    const flightsToUpdate = flights
      .filter((flight) => flight.id)
      .map((data) => ({
        ...data,
        cost: data.cost ? data.cost : 0,
        commission: data.commission ? data.commission : 0,
        arrival_date_time: new Date(data.arrival_date_time),
        departure_date_time: new Date(data.departure_date_time),
      }));
  
    const transfersToAdd = transfers
      .filter((transfer) => !transfer.id)
      .map((transfer) => ({
        ...transfer,
        cost: transfer.cost ? transfer.cost : 0,
        commission: transfer.commission ? transfer.commission : 0,
        drop_off_time: new Date(transfer.drop_off_time),
        pick_up_time: new Date(transfer.pick_up_time),
        tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
      }));
    const transfersToUpdate = transfers
      .filter((transfer) => transfer.id)
      .map((transfer) => ({
        ...transfer,
        cost: transfer.cost ? transfer.cost : 0,
        commission: transfer.commission ? transfer.commission : 0,
        drop_off_time: new Date(transfer.drop_off_time),
        pick_up_time: new Date(transfer.pick_up_time),
        tour_operator_id: transfer.is_included_in_package ? data.main_tour_operator_id : transfer.tour_operator_id,
      }));
  
    const attractionTicketsToAdd = attraction_tickets
      .filter((ticket) => !ticket.id)
      .map((ticket) => ({
        ...ticket,
        cost: ticket.cost ? ticket.cost : 0,
        commission: ticket.commission ? ticket.commission : 0,
        date_of_visit: new Date(ticket.date_of_visit),
        tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
      }));
    const attractionTicketsToUpdate = attraction_tickets
      .filter((ticket) => ticket.id)
      .map((ticket) => ({
        ...ticket,
        cost: ticket.cost ? ticket.cost : 0,
        commission: ticket.commission ? ticket.commission : 0,
        date_of_visit: new Date(ticket.date_of_visit),
        tour_operator_id: ticket.is_included_in_package ? data.main_tour_operator_id : ticket.tour_operator_id,
      }));
  
    const carHireToAdd = car_hire
      .filter((hire) => !hire.id)
      .map((car) => ({
        ...car,
        cost: car.cost ? car.cost : 0,
        commission: car.commission ? car.commission : 0,
        pick_up_time: new Date(car.pick_up_time),
        drop_off_time: new Date(car.drop_off_time),
        tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
      }));
    const carHireToUpdate = car_hire
      .filter((hire) => hire.id)
      .map((car) => ({
        ...car,
        cost: car.cost ? car.cost : 0,
        commission: car.commission ? car.commission : 0,
        pick_up_time: new Date(car.pick_up_time),
        drop_off_time: new Date(car.drop_off_time),
        tour_operator_id: car.is_included_in_package ? data.main_tour_operator_id : car.tour_operator_id,
      }));
  
    const airportParkingToAdd = airport_parking
      .filter((parking) => !parking.id)
      .map((parking) => ({
        ...parking,
        car_make: parking.make,
        car_model: parking.model,
        cost: parking.cost ? parking.cost : 0,
        commission: parking.commission ? parking.commission : 0,
        parking_date: new Date(parking.parking_date),
        tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
      }));
    const airportParkingToUpdate = airport_parking
      .filter((parking) => parking.id)
      .map((parking) => ({
        ...parking,
        car_make: parking.make,
        car_model: parking.model,
        cost: parking.cost ? parking.cost : 0,
        commission: parking.commission ? parking.commission : 0,
        parking_date: new Date(parking.parking_date),
        tour_operator_id: parking.is_included_in_package ? data.main_tour_operator_id : parking.tour_operator_id,
      }));
  
    const loungePassToAdd = lounge_pass.filter((pass) => !pass.id).map((data) => ({ ...data, date_of_usage: new Date(data.date_of_usage) }));
    const loungePassToUpdate = lounge_pass.filter((pass) => pass.id).map((data) => ({ ...data, date_of_usage: new Date(data.date_of_usage) }));
  
    return {
      hotelsToAdd,
      hotelsToUpdate,
      removedHotels,
      flightsToAdd,
      flightsToUpdate,
      removedFlights,
      transfersToAdd,
      transfersToUpdate,
      removedTransfers,
      attractionTicketsToAdd,
      attractionTicketsToUpdate,
      removedAttractionTickets,
      carHireToAdd,
      carHireToUpdate,
      removedCarHire,
      airportParkingToAdd,
      airportParkingToUpdate,
      removedAirportParking,
      loungePassToAdd,
      loungePassToUpdate,
      removedLoungePass,
      passengersToAdd,
      passengersToUpdate,
      removedPassengers,
    };
  };
  
  const findRemoved = (existing: { id: string }[], updated: { id?: string }[]) => {
    const existingIds = new Set(existing.map((e) => e.id));
    const updatedIds = new Set(updated.map((e) => e.id).filter(Boolean));
    return [...existingIds].filter((id) => !updatedIds.has(id));
  };
  