(() => {
    const notificationBadge = document.querySelector('[data-live-notifications]');
    const locationLabel = document.querySelector('[data-live-location]');
    const orderStatus = document.querySelector('[data-order-status]');
    const cartBadges = document.querySelectorAll('[data-cart-count]');
    const cartButtons = document.querySelectorAll('[data-cart-action]');
    const searchInputs = document.querySelectorAll('[data-live-search-input]');
    const liveResults = document.querySelector('[data-live-results]');
    const recentClearBtn = document.querySelector('[data-clear-recent]');
    const chipsContainer = document.querySelector('[data-live-chips]');

    let cartCount = 0;
    let notificationCount = notificationBadge ? Number(notificationBadge.textContent || 0) : 0;
    const orderStatuses = ['Preparing', 'Cooking', 'Out for delivery', 'Arriving soon'];
    const locations = ['44 Street Town', 'Market Avenue', 'Sunset Boulevard', 'Union Square'];

    const setCartCount = (count) => {
        cartCount = Math.max(0, count);
        cartBadges.forEach((badge) => {
            badge.textContent = String(cartCount);
            badge.style.display = cartCount > 0 ? 'inline-flex' : 'none';
        });
    };

    const setNotificationCount = (count) => {
        notificationCount = Math.max(0, count);
        if (notificationBadge) {
            notificationBadge.textContent = String(notificationCount);
        }
    };

    cartButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            setCartCount(cartCount + 1);

            // If it's a "Buy Now" or "Add" button, redirect to checkout
            if (btn.classList.contains('buy-now-btn') || btn.classList.contains('hot-deal-add')) {
                let itemName, itemPrice, itemCategory;

                // Get item details from the card
                if (btn.classList.contains('buy-now-btn')) {
                    const card = btn.closest('.food-card');
                    itemName = card?.querySelector('.food-name')?.textContent || 'Food Item';
                    itemPrice = parseFloat(card?.querySelector('.food-price')?.textContent.replace(/[^0-9.]/g, '') || '15.00');
                    itemCategory = 'Food';
                } else if (btn.classList.contains('hot-deal-add')) {
                    const card = btn.closest('.hot-deal-card');
                    itemName = card?.querySelector('.hot-deal-title')?.textContent || 'Food Item';
                    itemPrice = parseFloat(card?.querySelector('.hot-deal-price')?.textContent.replace(/[^0-9.]/g, '') || '15.00');
                    itemCategory = 'Hot Deal';
                }

                // Store item for checkout
                const cartItem = {
                    id: Date.now(),
                    name: itemName,
                    category: itemCategory,
                    price: itemPrice,
                    quantity: 1,
                    selected: true
                };

                let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                cartItems.push(cartItem);
                localStorage.setItem('cartItems', JSON.stringify(cartItems));

                // Visual feedback then redirect
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    btn.style.transform = '';
                    window.location.href = './checkout.html';
                }, 300);
                return;
            }

            // Visual feedback for regular cart buttons
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 150);
        });
    });

    // Menu Detail Page - Add to Cart with Quantity
    const addToCartBtn = document.querySelector('[data-add-to-cart]');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const quantity = parseInt(addToCartBtn.getAttribute('data-quantity') || '1', 10);
            setCartCount(cartCount + quantity);

            // Store item data for checkout
            const itemName = document.querySelector('.menu-detail-name')?.textContent || 'Food Item';
            const itemPrice = parseFloat(document.querySelector('.menu-detail-price')?.textContent.replace(/[^0-9.]/g, '') || '15.00');

            // Store in localStorage for checkout page
            const cartItem = {
                id: Date.now(),
                name: itemName,
                category: 'Food',
                price: itemPrice,
                quantity: quantity,
                selected: true
            };

            let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            cartItems.push(cartItem);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));

            // Visual feedback
            addToCartBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                addToCartBtn.style.transform = '';
                // Redirect to checkout
                window.location.href = './checkout.html';
            }, 300);
        });
    }

    searchInputs.forEach((input) => {
        input.addEventListener('input', (event) => {
            const query = event.target.value.trim().toLowerCase();

            // Filter hot deals
            if (liveResults) {
                liveResults.querySelectorAll('.hot-deal-card').forEach((card) => {
                    const title = card.querySelector('.hot-deal-title');
                    const matches = !query || (title && title.textContent.toLowerCase().includes(query));
                    card.style.display = matches ? 'flex' : 'none';
                });
            }

            // Filter recommended food cards
            const recommendedSection = document.querySelector('.food-cards-scroll');
            if (recommendedSection) {
                recommendedSection.querySelectorAll('.food-card').forEach((card) => {
                    const title = card.querySelector('.food-name');
                    const matches = !query || (title && title.textContent.toLowerCase().includes(query));
                    card.style.display = matches ? 'flex' : 'none';
                });
            }

            // Filter super deals
            const superDealsSection = document.querySelector('.deals-section .food-cards-scroll');
            if (superDealsSection) {
                superDealsSection.querySelectorAll('.food-card').forEach((card) => {
                    const title = card.querySelector('.food-name');
                    const matches = !query || (title && title.textContent.toLowerCase().includes(query));
                    card.style.display = matches ? 'flex' : 'none';
                });
            }
        });

        if (window.location.pathname.endsWith('home.html')) {
            input.addEventListener('focus', () => {
                window.location.href = './search.html';
            });
        }
    });

    if (recentClearBtn && chipsContainer) {
        recentClearBtn.addEventListener('click', () => {
            chipsContainer.innerHTML = '';
        });
    }

    if (orderStatus) {
        let statusIndex = 0;
        setInterval(() => {
            statusIndex = (statusIndex + 1) % orderStatuses.length;
            orderStatus.textContent = `Order Status: ${orderStatuses[statusIndex]}`;
        }, 4000);
    }

    if (locationLabel) {
        let locationIndex = 0;
        setInterval(() => {
            locationIndex = (locationIndex + 1) % locations.length;
            locationLabel.textContent = locations[locationIndex];
        }, 6000);
    }

    if (notificationBadge) {
        setInterval(() => {
            const delta = Math.random() > 0.6 ? 1 : 0;
            setNotificationCount(notificationCount + delta);
        }, 5000);
    }

    // Filter page interactions
    const applyFilterBtn = document.querySelector('[data-apply-filter]');
    const clearFilterBtn = document.querySelector('[data-clear-filter]');
    const priceRange = document.querySelector('[data-live-price]');
    const filterChips = document.querySelectorAll('.chip-row .chip');
    const ratingChips = document.querySelectorAll('.rating-chip');

    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', () => {
            // Store filter state and navigate back
            const selectedFilters = {
                price: priceRange ? priceRange.value : null,
                popular: Array.from(filterChips).filter(c => c.classList.contains('active')).map(c => c.textContent.trim()),
                rating: Array.from(ratingChips).filter(c => c.classList.contains('active')).map(c => c.textContent.trim())
            };
            localStorage.setItem('activeFilters', JSON.stringify(selectedFilters));
            window.location.href = 'search.html';
        });
    }

    if (clearFilterBtn) {
        clearFilterBtn.addEventListener('click', () => {
            if (priceRange) priceRange.value = 200;
            filterChips.forEach(chip => chip.classList.remove('active'));
            ratingChips.forEach(chip => chip.classList.remove('active'));
            localStorage.removeItem('activeFilters');
        });
    }

    // Chip toggle functionality
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
        });
    });

    ratingChips.forEach(chip => {
        chip.addEventListener('click', () => {
            ratingChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });

    // Remove chip functionality
    document.querySelectorAll('.chip span').forEach(removeBtn => {
        if (removeBtn.textContent === '×') {
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeBtn.parentElement.remove();
            });
        }
    });

    setCartCount(cartCount);
})();
