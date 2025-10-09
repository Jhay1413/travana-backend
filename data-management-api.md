# Data Management API Frontend Functions

## Headlines

```typescript
export const insertHeadline = async (data: z.infer<typeof headlinesMutationSchema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/headlines`, data);
    return response;
}

export const updateHeadline = async (id: string, data: z.infer<typeof headlinesMutationSchema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/headlines/${id}`, data);
    return response;
}

export const fetchAllHeadlines = async () => {
    const response = await http.get<z.infer<typeof headlinesSchema>[]>(`/transactions/data-management/headlines`);
    return response;
}

export const fetchHeadlineById = async (id: string) => {
    const response = await http.get<z.infer<typeof headlinesSchema>>(`/transactions/data-management/headlines/${id}`);
    return response;
}

export const deleteHeadline = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/headlines/${id}`);
    return response;
}
```

## Tour Operators

```typescript
export const fetchTourOperators = async (search?: string) => {
    const response = await http.get<z.infer<typeof tour_operator_query_schema>[]>(`/transactions/data-management/tour-operators`, {
        params: { search }
    });
    return response;
}

export const fetchTourOperatorById = async (id: string) => {
    const response = await http.get<z.infer<typeof tour_operator_mutate_schema>>(`/transactions/data-management/tour-operators/${id}`);
    return response;
}

export const insertTourOperator = async (data: z.infer<typeof tour_operator_mutate_schema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/tour-operators`, data);
    return response;
}

export const updateTourOperator = async (id: string, data: z.infer<typeof tour_operator_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/tour-operators/${id}`, data);
    return response;
}
```

## Accommodations

```typescript
export const fetchAccomodationById = async (id: string) => {
    const response = await http.get<z.infer<typeof accomodation_mutate_schema>>(`/transactions/data-management/accommodations/${id}`);
    return response;
}

export const updateAccomodation = async (id: string, data: z.infer<typeof accomodation_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/accommodations/${id}`, data);
    return response;
}
```

## Cruise Itineraries

```typescript
export const insertCruiseItinerary = async (data: z.infer<typeof cruise_itinerary_mutate_schema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/cruise-itineraries`, data);
    return response;
}

export const updateCruiseItinerary = async (id: string, data: z.infer<typeof cruise_itinerary_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/cruise-itineraries/${id}`, data);
    return response;
}

export const fetchAllCruiseItineraries = async (search?: string, ship_id?: string, page?: number, limit?: number) => {
    const response = await http.get<{
        data: z.infer<typeof cruise_itinerary_query_schema>[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/data-management/cruise-itineraries`, {
        params: { search, ship_id, page, limit }
    });
    return response;
}

export const fetchCruiseItineraryById = async (id: string) => {
    const response = await http.get<z.infer<typeof cruise_itinerary_mutate_schema>>(`/transactions/data-management/cruise-itineraries/${id}`);
    return response;
}

export const deleteCruiseItinerary = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/cruise-itineraries/${id}`);
    return response;
}
```

## Cruise Voyages

```typescript
export const insertCruiseVoyage = async (data: z.infer<typeof cruise_voyage_mutate_schema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/cruise-voyages`, data);
    return response;
}

export const updateCruiseVoyage = async (id: string, data: z.infer<typeof cruise_voyage_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/cruise-voyages/${id}`, data);
    return response;
}

export const fetchAllCruiseVoyages = async (search?: string, itinerary_id?: string, page?: number, limit?: number) => {
    const response = await http.get<{
        data: z.infer<typeof cruise_voyage_query_schema>[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/data-management/cruise-voyages`, {
        params: { search, itinerary_id, page, limit }
    });
    return response;
}

export const fetchCruiseVoyageById = async (id: string) => {
    const response = await http.get<z.infer<typeof cruise_voyage_mutate_schema>>(`/transactions/data-management/cruise-voyages/${id}`);
    return response;
}

export const deleteCruiseVoyage = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/cruise-voyages/${id}`);
    return response;
}
```

## Room Types

```typescript
export const fetchAllRoomTypes = async () => {
    const response = await http.get<{ id: string; name: string }[]>(`/transactions/data-management/room-types`);
    return response;
}

export const insertRoomType = async (data: { name: string }) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/room-types`, data);
    return response;
}

export const updateRoomType = async (id: string, data: { name: string }) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/room-types/${id}`, data);
    return response;
}

export const deleteRoomType = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/room-types/${id}`);
    return response;
}
```

## Airports

```typescript
export const fetchAllAirports = async (search?: string, page?: number, limit?: number) => {
    const response = await http.get<{
        data: z.infer<typeof airportQuerySchema>[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/data-management/airports`, {
        params: { search, page, limit }
    });
    return response;
}

export const insertAirport = async (data: z.infer<typeof airportMutationSchema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/airports`, data);
    return response;
}

export const updateAirport = async (id: string, data: z.infer<typeof airportMutationSchema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/airports/${id}`, data);
    return response;
}

export const fetchAirportById = async (id: string) => {
    const response = await http.get<z.infer<typeof airportQuerySchema>>(`/transactions/data-management/airports/${id}`);
    return response;
}

export const deleteAirport = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/airports/${id}`);
    return response;
}
```

## Countries

```typescript
export const fetchCountryById = async (id: string) => {
    const response = await http.get<z.infer<typeof countryQuerySchema>>(`/transactions/data-management/countries/${id}`);
    return response;
}

export const updateCountry = async (id: string, data: z.infer<typeof countryMutateSchema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/countries/${id}`, data);
    return response;
}

export const deleteCountry = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/countries/${id}`);
    return response;
}
```

## Lodges

```typescript
export const fetchAllLodges = async () => {
    const response = await http.get<z.infer<typeof lodgeQuerySchema>[]>(`/transactions/data-management/lodges`);
    return response;
}

export const fetchLodgeById = async (id: string) => {
    const response = await http.get<z.infer<typeof lodgeMutateSchema>>(`/transactions/data-management/lodges/${id}`);
    return response;
}
```

## Parks

```typescript
export const fetchAllParks = async () => {
    const response = await http.get<{ id: string; name: string }[]>(`/transactions/data-management/parks`);
    return response;
}
```

## Deletion Codes

```typescript
export const generateDeletionCodes = async (data: { numberOfCodes: number }) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/deletion-codes/generate`, data);
    return response;
}

export const insertDeletionCode = async (data: { code: string }) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/deletion-codes`, data);
    return response;
}

export const updateDeletionCode = async (id: string, data: { code: string; isUsed: boolean }) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/deletion-codes/${id}`, data);
    return response;
}

export const deleteDeletionCode = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/deletion-codes/${id}`);
    return response;
}

export const fetchAllDeletionCodes = async () => {
    const response = await http.get<{
        id: string;
        code: string;
        isUsed: boolean;
        createdAt: string;
    }[]>(`/transactions/data-management/deletion-codes`);
    return response;
}

export const fetchDeletionCodeById = async (id: string) => {
    const response = await http.get<{
        id: string;
        code: string;
        isUsed: boolean;
        createdAt: string;
    }>(`/transactions/data-management/deletion-codes/${id}`);
    return response;
}
```

## Cruise Lines

```typescript
export const insertCruiseLine = async (data: z.infer<typeof cruise_line_mutate_schema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/cruise-lines`, data);
    return response;
}

export const updateCruiseLine = async (id: string, data: z.infer<typeof cruise_line_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/cruise-lines/${id}`, data);
    return response;
}

export const fetchAllCruiseLines = async (search?: string, page?: number, limit?: number) => {
    const response = await http.get<{
        data: z.infer<typeof cruise_line_query_schema>[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/data-management/cruise-lines`, {
        params: { search, page, limit }
    });
    return response;
}

export const fetchCruiseLineById = async (id: string) => {
    const response = await http.get<z.infer<typeof cruise_line_mutate_schema>>(`/transactions/data-management/cruise-lines/${id}`);
    return response;
}

export const deleteCruiseLine = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/cruise-lines/${id}`);
    return response;
}
```

## Cruise Ships

```typescript
export const insertCruiseShip = async (data: z.infer<typeof cruise_ship_mutate_schema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/cruise-ships`, data);
    return response;
}

export const updateCruiseShip = async (id: string, data: z.infer<typeof cruise_ship_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/cruise-ships/${id}`, data);
    return response;
}

export const fetchAllCruiseShips = async (search?: string, cruise_line_id?: string, page?: number, limit?: number) => {
    const response = await http.get<{
        data: z.infer<typeof cruise_ship_query_schema>[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/data-management/cruise-ships`, {
        params: { search, cruise_line_id, page, limit }
    });
    return response;
}

export const fetchCruiseShipById = async (id: string) => {
    const response = await http.get<z.infer<typeof cruise_ship_mutate_schema>>(`/transactions/data-management/cruise-ships/${id}`);
    return response;
}

export const deleteCruiseShip = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/cruise-ships/${id}`);
    return response;
}
```

## Cruise Destinations

```typescript
export const insertCruiseDestination = async (data: z.infer<typeof cruise_destination_mutate_schema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/cruise-destinations`, data);
    return response;
}

export const updateCruiseDestination = async (id: string, data: z.infer<typeof cruise_destination_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/cruise-destinations/${id}`, data);
    return response;
}

export const fetchAllCruiseDestinations = async (search?: string, page?: number, limit?: number) => {
    const response = await http.get<{
        data: z.infer<typeof cruise_destination_query_schema>[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/data-management/cruise-destinations`, {
        params: { search, page, limit }
    });
    return response;
}

export const fetchCruiseDestinationById = async (id: string) => {
    const response = await http.get<z.infer<typeof cruise_destination_mutate_schema>>(`/transactions/data-management/cruise-destinations/${id}`);
    return response;
}

export const deleteCruiseDestination = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/cruise-destinations/${id}`);
    return response;
}
```

## Ports

```typescript
export const insertPort = async (data: z.infer<typeof port_mutate_schema>) => {
    const response = await http.post<{ message: string }>(`/transactions/data-management/ports`, data);
    return response;
}

export const updatePort = async (id: string, data: z.infer<typeof port_mutate_schema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/ports/${id}`, data);
    return response;
}

export const fetchAllPorts = async (search?: string, cruise_destination_id?: string, page?: number, limit?: number) => {
    const response = await http.get<{
        data: z.infer<typeof port_query_schema>[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions/data-management/ports`, {
        params: { search, cruise_destination_id, page, limit }
    });
    return response;
}

export const fetchPortById = async (id: string) => {
    const response = await http.get<z.infer<typeof port_mutate_schema>>(`/transactions/data-management/ports/${id}`);
    return response;
}

export const deletePort = async (id: string) => {
    const response = await http.delete<{ message: string }>(`/transactions/data-management/ports/${id}`);
    return response;
}
```

## Destinations

```typescript
export const updateDestination = async (id: string, data: z.infer<typeof destinationMutateSchema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/destinations/${id}`, data);
    return response;
}

export const fetchDestinationById = async (id: string) => {
    const response = await http.get<z.infer<typeof destinationMutateSchema>>(`/transactions/data-management/destinations/${id}`);
    return response;
}
```

## Resorts

```typescript
export const updateResort = async (id: string, data: z.infer<typeof resortMutateSchema>) => {
    const response = await http.put<{ message: string }>(`/transactions/data-management/resorts/${id}`, data);
    return response;
}

export const fetchResortById = async (id: string) => {
    const response = await http.get<z.infer<typeof resortMutateSchema>>(`/transactions/data-management/resorts/${id}`);
    return response;
}
```
