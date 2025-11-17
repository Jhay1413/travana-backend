export const generateNextDealId = (lastId: string) => {
    const currentYear = new Date().getFullYear();

    if (!lastId) {
        return `TRQ-${currentYear}-0001`;
    }

    const [prefix, yearStr, numStr] = lastId.split("-");
    const lastNum = parseInt(numStr, 10);

    const nextNum = lastNum + 1;

    // pad with zeroes BUT keep only last 4 digits
    const padded = String(nextNum).padStart(4, "0").slice(-4);

    return `TRQ-${currentYear}-${padded}`;
}