export const calculateCostByAge = (age: number | undefined | null): number => {
    if (age === undefined || age === null) return 0;
    if (age >= 12) return 200;
    if (age >= 5) return 100;
    return 0;
};

export const normalizePlusOne = (plusOne: any) => ({
    id: plusOne.id,
    full_name: plusOne.full_name?.trim() || null,
    age:
        plusOne.age === undefined || plusOne.age === null || Number.isNaN(Number(plusOne.age))
            ? null
            : Number(plusOne.age),
    gender: plusOne.gender?.trim() || null,
    is_first_time: !!plusOne.is_first_time,
    remarks: plusOne.remarks?.trim() || null,
    is_attended: !!plusOne.is_attended,
});

export const normalizeFamilyColor = (color: string): string => {
    return (color || 'none').toLowerCase();
};

export const validatePaymentAmount = (amount: string): { valid: boolean; error?: string } => {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
        return { valid: false, error: 'Please enter a valid amount in pesos.' };
    }
    return { valid: true };
};
