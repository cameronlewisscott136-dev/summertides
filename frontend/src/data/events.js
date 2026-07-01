// src/data/events.js
export const events = [
    {
        id: 'event_1',
        title: 'SUMMERTIDES 2026',
        description: "Summertides is Africa's Biggest Annual Beach Festival that cuts across diverse music experiences with DJs all over the world",
        date: 'Thu, Jul 02 - 6:00 PM',
        endDate: 'Sun, Jul 05 - 7:00 AM',
        location: 'Malindi, Kenya',
        price: '3,000.00',
        image: 'https://firebasestorage.googleapis.com/v0/b/hustle-build.appspot.com/o/23625%2Fproduct%2Fc7f37190-35e2-4568-8738-0fcf2b494cd6.jpg?alt=media&token=249f6a8b-b611-4bb7-9227-683e09c3e1c3',
        tickets: [
            { id: 'ticket_1', name: 'TIER 3', price: 5000, description: 'This ticket admits you to 3 days of the festival', available: true },
            { id: 'ticket_2', name: 'PRE-SALE TICKETS', price: 3000, description: 'This ticket admits you to 3 days of the festival', available: false, soldOut: true },
            { id: 'ticket_3', name: 'TIER 1', price: 3000, description: 'This ticket admits you to 3 days of the festival', available: true},
            { id: 'ticket_4', name: 'TIER 2', price: 4000, description: 'This ticket admits you to 3 days of the festival', available: true },
        ]
    }
];

export const categories = ['All', 'Tickets'];
export const sortOptions = ['All', 'Newest', 'Oldest', 'Price - Low to High', 'Price - High to Low'];
