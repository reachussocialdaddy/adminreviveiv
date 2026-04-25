// mockData.js - Comprehensive Mock Data for Revive IV Admin Panel

const MOCK_DATA = {
    bookings: [
        {
            id: "BK-9421",
            customer_name: "Sarah Jenkins",
            email: "sarah.j@example.com",
            cart_items: [{ name: "Myers Cocktail", price: 399 }],
            date: "2026-04-26",
            timeslot: "10:00 AM",
            status: "Completed",
            amount: 399
        },
        {
            id: "BK-9422",
            customer_name: "Michael Chen",
            email: "mchen@gmail.com",
            cart_items: [{ name: "Brain Focus", price: 400 }, { name: "B12 Shot", price: 35 }],
            date: "2026-04-26",
            timeslot: "02:30 PM",
            status: "Pending",
            amount: 435
        },
        {
            id: "BK-9423",
            customer_name: "Emily Rodriguez",
            email: "emily.rod@outlook.com",
            cart_items: [{ name: "Liquid Gold", price: 259 }],
            date: "2026-04-27",
            timeslot: "09:15 AM",
            status: "Pending",
            amount: 259
        },
        {
            id: "BK-9424",
            customer_name: "David Wilson",
            email: "dwilson.88@example.com",
            cart_items: [{ name: "Beautify Drip", price: 299 }],
            date: "2026-04-27",
            timeslot: "04:00 PM",
            status: "Pending",
            amount: 299
        }
    ],
    enquiries: [
        {
            id: "INQ-101",
            name: "Jessica Miller",
            email: "jess.miller@example.com",
            subject: "Group Booking for Bridal Party",
            message: "Hi, I'm interested in booking a group session for 6 people on June 12th. Do you offer additional discounts for larger groups?",
            status: "Pending",
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: "INQ-102",
            name: "Robert Taylor",
            email: "rtaylor@techsolutions.com",
            subject: "Corporate Wellness Inquiry",
            message: "Looking to set up monthly wellness sessions for our office in Manhattan. Please provide details on corporate packages.",
            status: "Responded",
            created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: "INQ-103",
            name: "Amanda Brooks",
            email: "amanda.b@example.com",
            subject: "Service Area Question",
            message: "Do you travel to Jersey City for a single drip appointment?",
            status: "Pending",
            created_at: new Date(Date.now() - 43200000).toISOString()
        }
    ],
    products: [
        { id: "p1", name: "Custom Drips", price: 175, category: "IV Drips", status: "Active" },
        { id: "p2", name: "Myers Cocktail", price: 399, category: "IV Drips", status: "Active" },
        { id: "p3", name: "Brain Focus", price: 400, category: "IV Drips", status: "Active" },
        { id: "p4", name: "Revive Calm", price: 279, category: "IV Drips", status: "Active" },
        { id: "p5", name: "Revive Defense", price: 299, category: "IV Drips", status: "Active" },
        { id: "p6", name: "Beautify", price: 299, category: "IV Drips", status: "Active" },
        { id: "p7", name: "Liquid Gold", price: 259, category: "IV Drips", status: "Active" },
        { id: "p8", name: "Revive Recovery", price: 279, category: "IV Drips", status: "Active" }
    ]
};

window.REVIVE_MOCK_DATA = MOCK_DATA;
