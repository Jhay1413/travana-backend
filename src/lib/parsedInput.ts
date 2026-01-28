

export const parsedInput = (text: string) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const data: any = {};


  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();


    // More precise matching to avoid conflicts
    if (key === 'title') {
      data.title = value;
    } else if (key === 'subtitle') {
      data.subtitle = value;
    } else if (key === 'travel date' || key === 'date') {
      data.travelDate = value;
    } else if (key === 'nights' || key === 'night') {
      data.nights = value;
    } else if (key === 'board basis' || key === 'board') {
      data.boardBasis = value;
    } else if (key === 'departure airport' || key === 'airport') {
      data.departureAirport = value;
    } else if (key === 'luggage & transfers' || key === 'luggage and transfers' || key === 'transfers') {
      data.luggageTransfers = value;
    } else if (key === 'price') {
      data.price = value;
    }
    else if( key === 'destination'){
      data.destination = value;
    }
  }

  return data;
}