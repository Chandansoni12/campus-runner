// Reusable OpenStreetMap functionality using Leaflet.js
// Used across order tracking pages (order-tracking, order-placed, order-delivery, order-delivered)

const DelivoMap = {
    map: null,
    initialized: false,
    routeCoordinates: [
        [34.0522, -118.2437],
        [34.0530, -118.2440],
        [34.0540, -118.2450],
        [34.0550, -118.2460],
        [34.0560, -118.2470],
        [34.0570, -118.2480]
    ],

    // Initialize map for any order page
    init: function (mapId, recenterBtnId) {
        if (this.initialized || !document.getElementById(mapId)) return;

        try {
            const endPoint = this.routeCoordinates[this.routeCoordinates.length - 1];

            this.map = L.map(mapId, {
                center: endPoint,
                zoom: 15,
                zoomControl: false
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Draw route
            L.polyline(this.routeCoordinates, {
                color: '#FF6B35',
                weight: 6,
                opacity: 1
            }).addTo(this.map);

            // Add markers
            this.addMarkers();

            this.initialized = true;

            // Setup recenter button if provided
            if (recenterBtnId) {
                this.setupRecenterButton(recenterBtnId);
            }
        } catch (e) {
            console.error('Map initialization failed:', e);
        }
    },

    addMarkers: function () {
        const startIcon = L.divIcon({
            html: '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#000" stroke="#FF6B35" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="#FF6B35"/></svg>',
            className: 'custom-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const endIcon = L.divIcon({
            html: '<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="22" fill="#FF6B35" stroke="white" stroke-width="2"/><circle cx="24" cy="18" r="8" fill="white"/><path d="M12 38C12 32 18 28 24 28C30 28 36 32 36 38" fill="white"/></svg>',
            className: 'custom-marker',
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        });

        L.marker(this.routeCoordinates[0], { icon: startIcon }).addTo(this.map);
        L.marker(this.routeCoordinates[this.routeCoordinates.length - 1], { icon: endIcon }).addTo(this.map);
    },

    setupRecenterButton: function (btnId) {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => this.recenter());
        }
    },

    recenter: function () {
        if (this.map) {
            const endPoint = this.routeCoordinates[this.routeCoordinates.length - 1];
            this.map.setView(endPoint, 15);
        }
    },

    updateOrderInfo: function (orderNumId, orderTimeId) {
        const orderNum = localStorage.getItem('orderNumber') || '012345';
        const orderNumEl = document.getElementById(orderNumId);
        if (orderNumEl) {
            orderNumEl.textContent = 'Order Number - ' + orderNum;
        }

        const now = new Date();
        const orderTimeEl = document.getElementById(orderTimeId);
        if (orderTimeEl) {
            orderTimeEl.textContent = 'Today, ' + now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    }
};

// Auto-initialize if on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // Check which page we're on and initialize accordingly
    if (document.querySelector('.order-tracking-page')) {
        setTimeout(() => {
            DelivoMap.init('tracking-map', 'recenter-tracking-btn');
            DelivoMap.updateOrderInfo('tracking-order-number', 'tracking-order-time');
        }, 100);
    } else if (document.querySelector('.order-delivered-page')) {
        setTimeout(() => {
            DelivoMap.init('delivered-map', 'recenter-delivered-btn');
            DelivoMap.updateOrderInfo('tracking-order-number', 'tracking-order-time');
        }, 100);
    } else if (document.querySelector('.order-placed-page')) {
        setTimeout(() => {
            DelivoMap.init('order-map', 'recenter-btn');
            DelivoMap.updateOrderInfo('order-number', 'order-time');
        }, 100);
    }
    // Add more page types as needed
});
