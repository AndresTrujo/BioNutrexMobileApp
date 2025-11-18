export const PRICE_LOW = 'lt500';
export const PRICE_MEDIUM = '500to800';
export const PRICE_HIGH = 'gt800';

export const PRICE_RANGES = [
    { id: 'all', label: 'Todos' },
    { id: PRICE_LOW, label: '< $500' },
    { id: PRICE_MEDIUM, label: '$500-$800' },
    { id: PRICE_HIGH, label: '> $800' },
];

export default PRICE_RANGES;
