// ============================================================
// RESTAURANT POS
// WAITER DASHBOARD
// CUSTOM SESSION
// ============================================================


const SUPABASE_URL =
    "https://ovrxvvmywpoakjlsiuni.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_fvYspXM_RqfedMUaPYskog_oZj8UwEM";


const { createClient } =
    window.supabase;


const db =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ============================================================
// SESSION
// ============================================================

const sessionToken =
    localStorage.getItem(
        "restaurant_session_token"
    );


let currentTables = [];

let currentMenu = [];

let cart = {};

let selectedTable = null;

let existingOrder = null;

let selectedCategory = "";

let searchText = "";

let liveTimer = null;

let toastTimer = null;
let lastReadyOrders = new Set();

let readyOrderCache = new Set();

let readyNotificationsInitialized = false;

// ============================================================
// ELEMENTS
// ============================================================

const markServedBtn =
    document.getElementById(
        "markServedBtn"
    );

const readyOrderBanner =
    document.getElementById(
        "readyOrderBanner"
    );

const readyOrderTitle =
    document.getElementById(
        "readyOrderTitle"
    );

const readyOrderText =
    document.getElementById(
        "readyOrderText"
    );

const loader =
    document.getElementById("loader");

const restaurantName =
    document.getElementById("restaurantName");

const waiterName =
    document.getElementById("waiterName");

const logoutBtn =
    document.getElementById("logoutBtn");

const tableScreen =
    document.getElementById("tableScreen");

const orderScreen =
    document.getElementById("orderScreen");

const tablesGrid =
    document.getElementById("tablesGrid");

const backBtn =
    document.getElementById("backBtn");

const selectedTableName =
    document.getElementById("selectedTableName");

const categoryBar =
    document.getElementById("categoryBar");

const menuSearch =
    document.getElementById("menuSearch");

const menuGrid =
    document.getElementById("menuGrid");

const existingOrderWrap =
    document.getElementById("existingOrderWrap");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const sendOrderBtn =
    document.getElementById("sendOrderBtn");

const requestBillBtn =
    document.getElementById("requestBillBtn");

const toast =
    document.getElementById("toast");


// ============================================================
// MONEY
// ============================================================

function money(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(
        Number(value || 0)
    );
}


// ============================================================
// ESCAPE
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(value) {

    if (!value) {
        return "";
    }

    return value
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            x => x.toUpperCase()
        );
}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );
}


// ============================================================
// LOGIN
// ============================================================

function goLogin() {

    localStorage.removeItem(
        "restaurant_session_token"
    );

    localStorage.removeItem(
        "restaurant_user"
    );

    location.replace(
        "index.html"
    );
}


// ============================================================
// INFO
// ============================================================

async function loadInfo() {

    const {
        data,
        error
    } =
        await db.rpc(
            "waiter_info",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(error);

        goLogin();

        return;
    }


    restaurantName.textContent =
        data?.restaurant?.name ||
        "Restaurant";


    waiterName.textContent =
        data?.staff?.full_name ||
        "Waiter";
}


// ============================================================
// TABLES
// ============================================================

async function loadTables() {

    const {
        data,
        error
    } =
        await db.rpc(
            "waiter_get_tables",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Tables error:",
            error
        );

        return;
    }


    currentTables =
        data || [];


    renderTables();
}


// ============================================================
// RENDER TABLES
// ============================================================

function renderTables() {

    if (!currentTables.length) {

        tablesGrid.innerHTML = `
            <div class="empty">
                No tables available.
            </div>
        `;

        return;
    }


    tablesGrid.innerHTML =
        currentTables
            .map(table => {

                return `
                    <div
                        class="table-card"
                        data-id="${table.id}"
                    >

                        <div class="table-top">

                            <div class="table-name">
                                ${escapeHtml(
                                    table.table_name
                                )}
                            </div>

                            <span
                                class="
                                    table-status
                                    ${escapeHtml(
                                        table.status
                                    )}
                                "
                            >
                                ${formatStatus(
                                    table.status
                                )}
                            </span>

                        </div>


                        <div class="table-price">
                            ${
                                table.order_id
                                ? money(
                                    table.grand_total
                                )
                                : "₹0"
                            }
                        </div>


                        <div class="table-meta">
                            ${
                                table.order_id
                                ? `Bill #${table.bill_number}`
                                : `Capacity ${table.capacity || "-"}`
                            }
                        </div>

                    </div>
                `;
            })
            .join("");
}


// ============================================================
// TABLE CLICK
// ============================================================

tablesGrid.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                ".table-card"
            );


        if (!card) {
            return;
        }


        openTable(
            card.dataset.id
        );
    }
);


// ============================================================
// OPEN TABLE
// ============================================================

async function openTable(tableId) {

    selectedTable =
        currentTables.find(
            table =>
                table.id ===
                tableId
        );


    if (!selectedTable) {
        return;
    }
if (
    selectedTable.status ===
        "bill_requested" ||
    selectedTable.status ===
        "billing"
) {

    showToast(
        "Bill already requested. Admin must reopen the order."
    );

    return;
}

    cart = {};

    selectedCategory = "";

    searchText = "";

    menuSearch.value = "";


    selectedTableName.textContent =
        selectedTable.table_name;


    tableScreen.classList.remove(
        "active"
    );


    orderScreen.classList.add(
        "active"
    );


    await Promise.all([
        loadMenu(),
        loadExistingOrder()
    ]);


    renderAll();
}


// ============================================================
// BACK
// ============================================================

backBtn.addEventListener(
    "click",
    () => {

        orderScreen.classList.remove(
            "active"
        );

        tableScreen.classList.add(
            "active"
        );


        selectedTable =
            null;

        cart =
            {};

        existingOrder =
            null;


        loadTables();
    }
);


// ============================================================
// MENU
// ============================================================

async function loadMenu() {

    const {
        data,
        error
    } =
        await db.rpc(
            "waiter_get_menu",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Menu error:",
            error
        );

        return;
    }


    currentMenu =
        data || [];


    if (selectedTable) {

        renderCategories();
        renderMenu();
    }
}


// ============================================================
// EXISTING ORDER
// ============================================================

async function loadExistingOrder() {

    if (!selectedTable) {
        return;
    }


    const {
        data,
        error
    } =
        await db.rpc(
            "waiter_get_order",
            {
                p_session_token:
                    sessionToken,

                p_table_id:
                    selectedTable.id
            }
        );


    if (error) {

        console.error(
            "Order error:",
            error
        );

        return;
    }


    existingOrder =
        data || {
            has_order: false
        };
}


// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {

    renderCategories();

    renderMenu();

    renderExistingOrder();

    renderCart();
}


// ============================================================
// CATEGORIES
// ============================================================

function getCategories() {

    const map =
        new Map();


    currentMenu.forEach(
        item => {

            if (
                item.category_id &&
                !map.has(
                    item.category_id
                )
            ) {

                map.set(
                    item.category_id,
                    item.category_name
                );
            }
        }
    );


    return Array.from(
        map.entries()
    );
}


function renderCategories() {

    categoryBar.innerHTML = `
        <button
            class="
                category-chip
                ${
                    selectedCategory === ""
                    ? "active"
                    : ""
                }
            "
            data-id=""
        >
            All
        </button>

        ${
            getCategories()
                .map(
                    ([id,name]) => `
                        <button
                            class="
                                category-chip
                                ${
                                    selectedCategory === id
                                    ? "active"
                                    : ""
                                }
                            "
                            data-id="${id}"
                        >
                            ${escapeHtml(name)}
                        </button>
                    `
                )
                .join("")
        }
    `;
}


categoryBar.addEventListener(
    "click",
    event => {

        const chip =
            event.target.closest(
                ".category-chip"
            );


        if (!chip) {
            return;
        }


        selectedCategory =
            chip.dataset.id || "";


        renderCategories();

        renderMenu();
    }
);


// ============================================================
// SEARCH
// ============================================================

menuSearch.addEventListener(
    "input",
    () => {

        searchText =
            menuSearch.value
                .trim()
                .toLowerCase();


        renderMenu();
    }
);


// ============================================================
// RENDER MENU
// ============================================================

function renderMenu() {

    let items =
        [...currentMenu];


    if (selectedCategory) {

        items =
            items.filter(
                item =>
                    item.category_id ===
                    selectedCategory
            );
    }


    if (searchText) {

        items =
            items.filter(
                item =>
                    item.item_name
                        .toLowerCase()
                        .includes(
                            searchText
                        )
            );
    }


    if (!items.length) {

        menuGrid.innerHTML = `
            <div class="empty">
                No items found.
            </div>
        `;

        return;
    }


    menuGrid.innerHTML =
        items
            .map(item => {

                const quantity =
                    cart[item.id]?.quantity ||
                    0;


                return `
                    <div
                        class="
                            menu-card
                            ${
                                !item.is_available
                                ? "unavailable"
                                : ""
                            }
                        "
                    >

                        <div class="menu-name">
                            ${escapeHtml(
                                item.item_name
                            )}
                        </div>


                        <div class="menu-cat">
                            ${escapeHtml(
                                item.category_name
                            )}
                        </div>


                        <div class="menu-price">
                            ${money(
                                item.price
                            )}
                        </div>


                        <div class="qty-row">

                            <span>
                                ${
                                    item.is_available
                                    ? ""
                                    : "Out of stock"
                                }
                            </span>


                            ${
                                item.is_available
                                ? `
                                    <div class="qty-control">

                                        <button
                                            class="minus"
                                            data-id="${item.id}"
                                        >
                                            −
                                        </button>

                                        <span class="qty-value">
                                            ${quantity}
                                        </span>

                                        <button
                                            class="plus"
                                            data-id="${item.id}"
                                        >
                                            +
                                        </button>

                                    </div>
                                `
                                : ""
                            }

                        </div>

                    </div>
                `;
            })
            .join("");
}


// ============================================================
// QUANTITY
// ============================================================

menuGrid.addEventListener(
    "click",
    event => {

        const plus =
            event.target.closest(
                ".plus"
            );


        if (plus) {

            changeQty(
                plus.dataset.id,
                1
            );

            return;
        }


        const minus =
            event.target.closest(
                ".minus"
            );


        if (minus) {

            changeQty(
                minus.dataset.id,
                -1
            );
        }
    }
);


function changeQty(
    itemId,
    change
) {

    const item =
        currentMenu.find(
            x =>
                x.id === itemId
        );


    if (
        !item ||
        !item.is_available
    ) {
        return;
    }


    const current =
        cart[itemId]?.quantity ||
        0;


    const next =
        Math.max(
            0,
            current + change
        );


    if (next === 0) {

        delete cart[itemId];

    } else {

        cart[itemId] = {
            item,
            quantity: next
        };
    }


    renderMenu();

    renderCart();
}


// ============================================================
// EXISTING ORDER
// ============================================================

function renderExistingOrder() {

   if (
    !existingOrder?.has_order
) {

    existingOrderWrap.innerHTML =
        "";

    requestBillBtn.style.display =
        "none";


    readyOrderBanner.classList.remove(
        "show"
    );

    return;
}


    const items =
        existingOrder.items || [];


    existingOrderWrap.innerHTML = `
        <div class="existing-order">

            <h3>
                Existing Bill #${existingOrder.bill_number}
                • ${money(existingOrder.grand_total)}
            </h3>

            ${
                items
                    .map(
                        item => `
                            <div class="existing-item">

                                <span>
                                    ${escapeHtml(item.item_name)}
                                    × ${item.quantity}
                                </span>

                                <span>
                                    ${money(item.line_total)}
                                </span>

                            </div>
                        `
                    )
                    .join("")
            }

        </div>
    `;


    requestBillBtn.style.display =
    [
        "served",
        "ready"
    ].includes(
        existingOrder.status
    )
        ? "block"
        : "none";
    updateReadyBanner();
}


// ============================================================
// CART
// ============================================================

function renderCart() {

    const values =
        Object.values(cart);


    if (!values.length) {

        cartItems.innerHTML = `
            <div class="empty">
                Select items from menu.
            </div>
        `;


        cartTotal.textContent =
            money(0);


        sendOrderBtn.disabled =
            true;

        return;
    }


    cartItems.innerHTML =
        values
            .map(entry => {

                const total =
                    Number(entry.item.price) *
                    entry.quantity;


                return `
                    <div class="cart-item">

                        <span>
                            ${escapeHtml(
                                entry.item.item_name
                            )}
                            × ${entry.quantity}
                        </span>

                        <strong>
                            ${money(total)}
                        </strong>

                    </div>
                `;
            })
            .join("");


    const total =
        values.reduce(
            (sum,entry) =>
                sum +
                Number(
                    entry.item.price
                ) *
                entry.quantity,
            0
        );


    cartTotal.textContent =
        money(total);


    sendOrderBtn.disabled =
        false;
}


// ============================================================
// SEND ORDER
// ============================================================

sendOrderBtn.addEventListener(
    "click",
    sendOrder
);


async function sendOrder() {

    if (!selectedTable) {
        return;
    }


    const items =
        Object.values(cart)
            .map(
                entry => ({
                    menu_item_id:
                        entry.item.id,

                    quantity:
                        entry.quantity
                })
            );


    if (!items.length) {
        return;
    }


    sendOrderBtn.disabled =
        true;

    sendOrderBtn.textContent =
        "Sending...";


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "waiter_send_order",
                {
                    p_session_token:
                        sessionToken,

                    p_table_id:
                        selectedTable.id,

                    p_items:
                        items
                }
            );


        if (error) {
            throw error;
        }


        showToast(
            data?.message ||
            "Order sent"
        );


        cart =
            {};


        await Promise.all([
            loadExistingOrder(),
            loadTables()
        ]);


        renderAll();


    } catch (error) {

        console.error(
            "Send order error:",
            error
        );


        showToast(
            error.message ||
            "Unable to send order"
        );


    } finally {

        sendOrderBtn.disabled =
            false;

        sendOrderBtn.textContent =
            "Send Order";
    }
}


// ============================================================
// REQUEST BILL
// ============================================================

requestBillBtn.addEventListener(
    "click",
    requestBill
);


async function requestBill() {

    if (
        !selectedTable ||
        !existingOrder?.has_order
    ) {
        return;
    }


    requestBillBtn.disabled =
        true;


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "waiter_request_bill",
                {
                    p_session_token:
                        sessionToken,

                    p_table_id:
                        selectedTable.id
                }
            );


        if (error) {
            throw error;
        }


        showToast(
            data?.message ||
            "Bill requested"
        );


        await Promise.all([
            loadExistingOrder(),
            loadTables()
        ]);


        renderAll();


    } catch (error) {

        showToast(
            error.message ||
            "Unable to request bill"
        );


    } finally {

        requestBillBtn.disabled =
            false;
    }
}


// ============================================================
// LIVE SYNC
// ============================================================

function startLiveSync() {

    if (liveTimer) {

        clearInterval(
            liveTimer
        );

    }


    liveTimer =
        setInterval(
            async () => {

                if (
                    document.visibilityState !==
                    "visible"
                ) {

                    return;

                }


                await Promise.all([
                    loadTables(),
                    loadMenu(),
                    checkReadyOrders()
                ]);


                if (selectedTable) {

                    await loadExistingOrder();


                    renderExistingOrder();

                    renderCart();

                }

            },
            2000
        );
}


// ============================================================
// LOGOUT
// ============================================================

logoutBtn.addEventListener(
    "click",
    async () => {

        try {

            if (liveTimer) {

                clearInterval(
                    liveTimer
                );
            }


            await db.rpc(
                "staff_logout",
                {
                    p_session_token:
                        sessionToken
                }
            );

        } catch (error) {

            console.error(error);

        } finally {

            goLogin();
        }
    }
);


// ============================================================
// INIT
// ============================================================

async function init() {

    if (!sessionToken) {

        goLogin();

        return;
    }


    await Promise.all([
        loadInfo(),
        loadTables()
    ]);


    loader.style.display =
        "none";
    requestNotificationPermission();

    startLiveSync();
}


init();


async function checkReadyOrders() {

    const {
        data,
        error
    } = await db.rpc(
        "waiter_get_tables",
        {
            p_session_token:
                sessionToken
        }
    );

    if (error) {
        console.error(
            "Ready check error:",
            error
        );
        return;
    }

    const tables =
        data || [];


    tables.forEach(table => {

        if (
            table.order_id &&
            table.status === "ready"
        ) {

            const key =
                table.order_id;

            if (
                !lastReadyOrders.has(key)
            ) {

                lastReadyOrders.add(key);

                showToast(
                    `${table.table_name} order is READY`
                );

                if (
                    "vibrate" in navigator
                ) {
                    navigator.vibrate(
                        [200,100,200]
                    );
                }
            }
        }
    });
}

// ============================================================
// CHECK KITCHEN READY ORDERS
// CURRENT WAITER ONLY
// ============================================================

async function checkReadyOrders() {

    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "waiter_get_ready_orders",
                {
                    p_session_token:
                        sessionToken
                }
            );


        if (error) {

            console.error(
                "Ready order check error:",
                error
            );

            return;
        }


        const readyOrders =
            data || [];


        // First poll lo already existing READY orders ki
        // repeated old notifications ravakunda cache initialize.

        if (
            !readyNotificationsInitialized
        ) {

            readyOrders.forEach(
                order => {

                    readyOrderCache.add(
                        order.order_id
                    );

                }
            );


            readyNotificationsInitialized =
                true;


            return;
        }


        readyOrders.forEach(
            order => {

                if (
                    readyOrderCache.has(
                        order.order_id
                    )
                ) {

                    return;
                }


                readyOrderCache.add(
                    order.order_id
                );


                showReadyNotification(
                    order
                );

            }
        );


        // Orders READY state nundi move ayithe cache remove.
        // Same order later malli ready ayithe notification allow.

        const currentlyReady =
            new Set(
                readyOrders.map(
                    order =>
                        order.order_id
                )
            );


        [
            ...readyOrderCache
        ].forEach(
            orderId => {

                if (
                    !currentlyReady.has(
                        orderId
                    )
                ) {

                    readyOrderCache.delete(
                        orderId
                    );
                }

            }
        );


    } catch (error) {

        console.error(
            "Ready notification error:",
            error
        );
    }
}

// ============================================================
// SHOW READY NOTIFICATION
// ============================================================

function showReadyNotification(
    order
) {

    const message =
        `${order.table_name} Order Ready`;


    // Existing waiter toast
    showToast(
        message
    );


    // Vibration

    if (
        "vibrate" in navigator
    ) {

        navigator.vibrate(
            [
                250,
                120,
                250,
                120,
                400
            ]
        );
    }


    // Beep

    playReadySound();


    // Browser notification if permission exists.

    showSystemReadyNotification(
        order
    );
}


// ============================================================
// READY SOUND
// ============================================================

function playReadySound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        const context =
            new AudioContext();


        const oscillator =
            context.createOscillator();


        const gain =
            context.createGain();


        oscillator.connect(
            gain
        );


        gain.connect(
            context.destination
        );


        oscillator.type =
            "sine";


        oscillator.frequency.value =
            880;


        gain.gain.setValueAtTime(
            0.22,
            context.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.01,
            context.currentTime + 0.4
        );


        oscillator.start();


        oscillator.stop(
            context.currentTime +
            0.4
        );


    } catch (error) {

        console.log(
            "Sound unavailable:",
            error
        );
    }
}

// ============================================================
// SYSTEM NOTIFICATION
// ============================================================

async function requestNotificationPermission() {

    if (
        !("Notification" in window)
    ) {
        return;
    }


    if (
        Notification.permission ===
        "default"
    ) {

        try {

            await Notification
                .requestPermission();

        } catch (error) {

            console.log(
                "Notification permission:",
                error
            );
        }
    }
}


function showSystemReadyNotification(
    order
) {

    if (
        !("Notification" in window)
    ) {
        return;
    }


    if (
        Notification.permission !==
        "granted"
    ) {
        return;
    }


    try {

        new Notification(
            `${order.table_name} Order Ready`,
            {
                body:
                    `Bill #${order.bill_number} is ready for service.`,

                tag:
                    `ready-${order.order_id}`
            }
        );


    } catch (error) {

        console.log(
            "Notification error:",
            error
        );
    }
}
function updateReadyBanner() {

    if (
        !selectedTable ||
        !existingOrder?.has_order
    ) {

        readyOrderBanner.classList.remove(
            "show",
            "preparing",
            "ready"
        );

        markServedBtn.style.display =
            "none";

        return;
    }


    const status =
        existingOrder.status;


    // ========================================================
    // PREPARING
    // ========================================================

    if (status === "preparing") {

        readyOrderBanner.classList.remove(
            "ready"
        );

        readyOrderBanner.classList.add(
            "show",
            "preparing"
        );


        readyOrderTitle.textContent =
            `${selectedTable.table_name} • PREPARING`;


        readyOrderText.textContent =
            `Bill #${existingOrder.bill_number} is being prepared in the kitchen.`;


        readyOrderBanner
            .querySelector(
                ".ready-order-icon"
            )
            .textContent = "•••";


        markServedBtn.style.display =
            "none";


        return;
    }


    // ========================================================
    // READY
    // ========================================================

    if (status === "ready") {

        readyOrderBanner.classList.remove(
            "preparing"
        );

        readyOrderBanner.classList.add(
            "show",
            "ready"
        );


        readyOrderTitle.textContent =
            `${selectedTable.table_name} • ORDER READY`;


        readyOrderText.textContent =
            `Bill #${existingOrder.bill_number} is ready. Serve the order and mark it as served.`;


        readyOrderBanner
            .querySelector(
                ".ready-order-icon"
            )
            .textContent = "✓";


        markServedBtn.style.display =
            "block";


        return;
    }


    // ========================================================
    // OTHER STATUS
    // ========================================================

    readyOrderBanner.classList.remove(
        "show",
        "preparing",
        "ready"
    );


    markServedBtn.style.display =
        "none";
}

 // ============================================================
// MARK ORDER AS SERVED
// ============================================================

markServedBtn?.addEventListener(
    "click",
    markOrderServed
);


async function markOrderServed() {

    if (
        !selectedTable ||
        !existingOrder?.has_order
    ) {
        return;
    }


    if (
        existingOrder.status !==
        "ready"
    ) {

        showToast(
            "Order is not ready yet"
        );

        return;
    }


    markServedBtn.disabled =
        true;


    const oldText =
        markServedBtn.textContent;


    markServedBtn.textContent =
        "Updating...";


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "waiter_mark_served",
                {
                    p_session_token:
                        sessionToken,

                    p_table_id:
                        selectedTable.id
                }
            );


        if (error) {
            throw error;
        }


        showToast(
            data?.message ||
            "Order served"
        );


        await Promise.all([
            loadExistingOrder(),
            loadTables()
        ]);


        renderExistingOrder();

        renderCart();


    } catch (error) {

        console.error(
            "Mark served error:",
            error
        );


        showToast(
            error.message ||
            "Unable to mark served"
        );


    } finally {

        markServedBtn.disabled =
            false;

        markServedBtn.textContent =
            oldText;
    }
}