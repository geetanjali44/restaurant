// ============================================================
// RESTAURANT POS
// KITCHEN DASHBOARD
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


// ============================================================
// STATE
// ============================================================

let currentOrders = [];

let currentOrderDetails = {};

let currentFilter =
    "all";

let liveTimer =
    null;

let toastTimer =
    null;

let isLoadingOrders =
    false;


// ============================================================
// KITCHEN NOTIFICATION STATE
// ============================================================

let kitchenKnownOrderIds =
    new Set();

let kitchenNotificationInitialized =
    false;


// ============================================================
// ELEMENTS
// ============================================================

const loader =
    document.getElementById(
        "loader"
    );


const restaurantName =
    document.getElementById(
        "restaurantName"
    );


const kitchenStaffName =
    document.getElementById(
        "kitchenStaffName"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const ordersGrid =
    document.getElementById(
        "ordersGrid"
    );


const newOrdersCount =
    document.getElementById(
        "newOrdersCount"
    );


const preparingCount =
    document.getElementById(
        "preparingCount"
    );


const readyCount =
    document.getElementById(
        "readyCount"
    );


const toast =
    document.getElementById(
        "toast"
    );


const filterButtons =
    document.querySelectorAll(
        "[data-filter]"
    );


// ============================================================
// MONEY
// ============================================================

function money(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style:
                "currency",

            currency:
                "INR",

            maximumFractionDigits:
                2
        }
    ).format(
        Number(
            value ||
            0
        )
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    return String(
        value ??
        ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


// ============================================================
// FORMAT STATUS
// ============================================================

function formatStatus(value) {

    if (!value) {
        return "";
    }


    return value
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );
}


// ============================================================
// FORMAT TIME
// ============================================================

function formatTime(value) {

    if (!value) {
        return "";
    }


    try {

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit"
            }
        ).format(
            new Date(
                value
            )
        );


    } catch (error) {

        return "";
    }
}


// ============================================================
// FORMAT ELAPSED TIME
// ============================================================

function formatElapsedTime(value) {

    if (!value) {
        return "";
    }


    const created =
        new Date(
            value
        ).getTime();


    const now =
        Date.now();


    const difference =
        Math.max(
            0,
            now -
            created
        );


    const minutes =
        Math.floor(
            difference /
            60000
        );


    if (
        minutes <
        1
    ) {

        return "Just now";
    }


    if (
        minutes <
        60
    ) {

        return `${minutes} min`;
    }


    const hours =
        Math.floor(
            minutes /
            60
        );


    const remainingMinutes =
        minutes %
        60;


    if (
        remainingMinutes ===
        0
    ) {

        return `${hours} hr`;
    }


    return `${hours} hr ${remainingMinutes} min`;
}


// ============================================================
// TOAST
// ============================================================

function showToast(message) {

    if (!toast) {
        return;
    }


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
// NOTIFICATION SOUND
// ============================================================

function playKitchenNotificationSound() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        const audioContext =
            new AudioContext();


        const oscillator =
            audioContext
                .createOscillator();


        const gain =
            audioContext
                .createGain();


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        oscillator.type =
            "sine";


        oscillator.frequency
            .setValueAtTime(
                880,
                audioContext.currentTime
            );


        oscillator.frequency
            .setValueAtTime(
                1100,
                audioContext.currentTime +
                0.18
            );


        gain.gain
            .setValueAtTime(
                0.22,
                audioContext.currentTime
            );


        gain.gain
            .exponentialRampToValueAtTime(
                0.01,
                audioContext.currentTime +
                0.5
            );


        oscillator.start(
            audioContext.currentTime
        );


        oscillator.stop(
            audioContext.currentTime +
            0.5
        );


    } catch (error) {

        console.log(
            "Kitchen sound unavailable:",
            error
        );
    }
}


// ============================================================
// BROWSER NOTIFICATION PERMISSION
// ============================================================

async function requestStaffNotificationPermission() {

    if (
        !(
            "Notification"
            in window
        )
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
                "Kitchen notification permission:",
                error
            );
        }
    }
}


// ============================================================
// BROWSER NOTIFICATION FALLBACK
// ============================================================

function showKitchenBrowserNotification(
    title,
    body,
    tag
) {

    if (
        !(
            "Notification"
            in window
        )
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
            title,
            {
                body:
                    body,

                tag:
                    tag
            }
        );


    } catch (error) {

        console.log(
            "Kitchen browser notification error:",
            error
        );
    }
}


// ============================================================
// NATIVE + BROWSER NOTIFICATION
// ============================================================

function notifyKitchen(
    title,
    body,
    tag
) {

    // ========================================================
    // TOAST
    // ========================================================

    showToast(
        body
    );


    // ========================================================
    // VIBRATION
    // ========================================================

    if (
        "vibrate"
        in navigator
    ) {

        navigator.vibrate([
            250,
            120,
            250,
            120,
            450
        ]);
    }


    // ========================================================
    // SOUND
    // ========================================================

    playKitchenNotificationSound();


    // ========================================================
    // ANDROID NATIVE NOTIFICATION
    // ========================================================

    try {

        if (
            window.AndroidNotification &&
            typeof window
                .AndroidNotification
                .showNotification ===
                "function"
        ) {

            window
                .AndroidNotification
                .showNotification(
                    title,
                    body
                );


            console.log(
                "Kitchen native notification sent:",
                title
            );


            return;
        }


    } catch (error) {

        console.error(
            "Kitchen native notification error:",
            error
        );
    }


    // ========================================================
    // BROWSER FALLBACK
    // ========================================================

    showKitchenBrowserNotification(
        title,
        body,
        tag
    );
}


// ============================================================
// CHECK NEW KITCHEN ORDERS
// ============================================================

function checkKitchenNewOrderNotifications(
    rows
) {

    // ========================================================
    // FIRST LOAD
    // ========================================================

    if (
        !kitchenNotificationInitialized
    ) {

        rows.forEach(
            order => {

                kitchenKnownOrderIds
                    .add(
                        String(
                            order.id
                        )
                    );
            }
        );


        kitchenNotificationInitialized =
            true;


        return;
    }


    // ========================================================
    // CHECK NEW ORDERS
    // ========================================================

    rows.forEach(
        order => {

            const orderId =
                String(
                    order.id
                );


            if (
                kitchenKnownOrderIds.has(
                    orderId
                )
            ) {

                return;
            }


            kitchenKnownOrderIds
                .add(
                    orderId
                );


            const tableName =
                order.table_name ||
                "Table";


            const billNumber =
                order.bill_number ||
                "";


            const title =
                `New Order • ${tableName}`;


            const body =
                `Bill #${billNumber} received. Start preparing.`;


            notifyKitchen(
                title,
                body,
                `kitchen-new-${orderId}`
            );
        }
    );


    // ========================================================
    // REMOVE OLD IDs FROM CACHE
    // ========================================================

    const activeIds =
        new Set(
            rows.map(
                order =>
                    String(
                        order.id
                    )
            )
        );


    [
        ...kitchenKnownOrderIds

    ].forEach(
        orderId => {

            if (
                !activeIds.has(
                    orderId
                )
            ) {

                kitchenKnownOrderIds
                    .delete(
                        orderId
                    );
            }
        }
    );
}
// ============================================================
// GO LOGIN
// ============================================================

function goLogin() {

    localStorage.removeItem(
        "restaurant_session_token"
    );

    localStorage.removeItem(
        "restaurant_user"
    );

    window.location.replace(
        "index.html"
    );
}


// ============================================================
// LOAD KITCHEN INFO
// ============================================================

async function loadKitchenInfo() {

    const {
        data,
        error
    } =
        await db.rpc(
            "kitchen_info",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Kitchen info error:",
            error
        );

        goLogin();

        return;
    }


    restaurantName.textContent =
        data?.restaurant?.name ||
        "Restaurant";


    kitchenStaffName.textContent =
        data?.staff?.full_name ||
        "Kitchen";
}


// ============================================================
// LOAD ACTIVE KITCHEN ORDERS
// ============================================================

async function loadKitchenOrders() {

    if (isLoadingOrders) {
        return;
    }


    isLoadingOrders =
        true;


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "kitchen_get_orders",
                {
                    p_session_token:
                        sessionToken
                }
            );


        if (error) {

            console.error(
                "Kitchen orders error:",
                error
            );

            return;
        }


        currentOrders =
            data || [];


        // ====================================================
        // CHECK NEW ORDER NOTIFICATION
        // ====================================================

        checkKitchenNewOrderNotifications(
            currentOrders
        );


        await loadAllOrderDetails();


        updateStats();


        renderOrders();


    } catch (error) {

        console.error(
            "Kitchen refresh error:",
            error
        );


    } finally {

        isLoadingOrders =
            false;
    }
}


// ============================================================
// LOAD DETAILS FOR ALL CURRENT ORDERS
// ============================================================

async function loadAllOrderDetails() {

    const activeIds =
        new Set(
            currentOrders.map(
                order =>
                    order.id
            )
        );


    Object.keys(
        currentOrderDetails
    ).forEach(
        id => {

            if (
                !activeIds.has(id)
            ) {

                delete currentOrderDetails[
                    id
                ];
            }
        }
    );


    const requests =
        currentOrders.map(
            async order => {

                const {
                    data,
                    error
                } =
                    await db.rpc(
                        "kitchen_get_order_details",
                        {
                            p_session_token:
                                sessionToken,

                            p_order_id:
                                order.id
                        }
                    );


                if (error) {

                    console.error(
                        `Order details error ${order.id}:`,
                        error
                    );

                    return;
                }


                currentOrderDetails[
                    order.id
                ] = data;
            }
        );


    await Promise.all(
        requests
    );
}


// ============================================================
// STATS
// ============================================================

function updateStats() {

    const newCount =
        currentOrders.filter(
            order =>
                order.status ===
                "confirmed"
        ).length;


    const preparing =
        currentOrders.filter(
            order =>
                order.status ===
                "preparing"
        ).length;


    const ready =
        currentOrders.filter(
            order =>
                order.status ===
                "ready"
        ).length;


    newOrdersCount.textContent =
        newCount;


    preparingCount.textContent =
        preparing;


    readyCount.textContent =
        ready;
}


// ============================================================
// FILTERS
// ============================================================

filterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                currentFilter =
                    button.dataset.filter ||
                    "all";


                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                renderOrders();
            }
        );
    }
);


// ============================================================
// RENDER ORDERS
// ============================================================

function renderOrders() {

    let orders =
        [...currentOrders];


    if (
        currentFilter !==
        "all"
    ) {

        orders =
            orders.filter(
                order =>
                    order.status ===
                    currentFilter
            );
    }


    if (!orders.length) {

        ordersGrid.innerHTML = `
            <div class="empty">
                No kitchen orders.
            </div>
        `;

        return;
    }


    ordersGrid.innerHTML =
        orders
            .map(
                order =>
                    renderOrderCard(
                        order
                    )
            )
            .join("");
}


// ============================================================
// RENDER ONE ORDER CARD
// ============================================================

function renderOrderCard(
    order
) {

    const details =
        currentOrderDetails[
            order.id
        ] || {};


    const items =
        details.items || [];


    const statusClass =
        `status-${order.status}`;


    const preparingDisabled =
        order.status ===
            "preparing" ||
        order.status ===
            "ready";


    const readyDisabled =
        order.status ===
            "ready";


    return `
        <article
            class="order-card"
            data-order-id="${order.id}"
        >

            <div class="order-card-head">

                <div>

                    <div class="order-table">
                        ${escapeHtml(
                            order.table_name
                        )}
                    </div>

                    <div class="order-bill">
                        Bill #${order.bill_number}
                    </div>

                </div>


                <span
                    class="
                        order-status
                        ${statusClass}
                    "
                >
                    ${formatStatus(
                        order.status
                    )}
                </span>

            </div>


            <div class="order-card-body">

                <div class="order-time">

                    ${formatTime(
                        order.created_at
                    )}
                    ·
                    ${formatElapsedTime(
                        order.created_at
                    )}

                </div>


                <div class="items-list">

                    ${
                        items.length

                        ? items
                            .map(
                                item => `
                                    <div class="item-row">

                                        <div>

                                            <div class="item-name">
                                                ${escapeHtml(
                                                    item.item_name
                                                )}
                                            </div>

                                            ${
                                                item.notes
                                                ? `
                                                    <div class="item-note">
                                                        ${escapeHtml(
                                                            item.notes
                                                        )}
                                                    </div>
                                                `
                                                : ""
                                            }

                                        </div>


                                        <div class="item-qty">
                                            ×${item.quantity}
                                        </div>

                                    </div>
                                `
                            )
                            .join("")

                        : `
                            <div
                                class="item-note"
                                style="padding:10px 0;"
                            >
                                Loading items...
                            </div>
                        `
                    }

                </div>

            </div>


            <div class="order-actions">

                <button
                    type="button"
                    class="preparing-btn"
                    data-action="preparing"
                    data-order-id="${order.id}"
                    ${
                        preparingDisabled
                        ? "disabled"
                        : ""
                    }
                >
                    ${
                        order.status ===
                        "preparing"
                        ? "Preparing"
                        : "Start Preparing"
                    }
                </button>


                <button
                    type="button"
                    class="ready-btn"
                    data-action="ready"
                    data-order-id="${order.id}"
                    ${
                        readyDisabled
                        ? "disabled"
                        : ""
                    }
                >
                    ${
                        order.status ===
                        "ready"
                        ? "Ready"
                        : "Mark Ready"
                    }
                </button>

            </div>

        </article>
    `;
}
// ============================================================
// ORDER ACTION CLICK
// ============================================================

ordersGrid?.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {
            return;
        }


        const orderId =
            button.dataset.orderId;


        const action =
            button.dataset.action;


        if (
            !orderId ||
            !action
        ) {

            return;
        }


        await updateKitchenStatus(
            orderId,
            action,
            button
        );
    }
);


// ============================================================
// UPDATE KITCHEN STATUS
// ============================================================

async function updateKitchenStatus(
    orderId,
    status,
    button
) {

    if (
        ![
            "preparing",
            "ready"
        ].includes(status)
    ) {

        return;
    }


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        status ===
            "preparing"
            ? "Updating..."
            : "Marking...";


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "kitchen_update_status",
                {
                    p_session_token:
                        sessionToken,

                    p_order_id:
                        orderId,

                    p_status:
                        status
                }
            );


        if (error) {

            throw error;
        }


        // ====================================================
        // FCM PUSH -> WAITER WHEN ORDER IS READY
        // ====================================================

        if (
            status ===
            "ready"
        ) {

            const order =
                currentOrders.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            orderId
                        )
                );


            await sendRestaurantPush({

                sourceRole:
                    "kitchen",

                targetRole:
                    "waiter",

                title:
                    `Order Ready • ${
                        order?.table_name ||
                        "Table"
                    }`,

                body:
                    `Bill #${
                        order?.bill_number ||
                        ""
                    } is ready to serve.`,

                type:
                    "order_ready",

                orderId:
                    orderId,

                tableId:
                    order?.table_id ||
                    "",

                tableName:
                    order?.table_name ||
                    "Table"
            });
        }


        showToast(
            data?.message ||
            "Order updated"
        );


        await loadKitchenOrders();


    } catch (error) {

        console.error(
            "Kitchen status error:",
            error
        );


        showToast(
            error.message ||
            "Unable to update order"
        );


        button.disabled =
            false;


        button.textContent =
            originalText;
    }
}


// ============================================================
// LIVE SYNC
// ============================================================

function startLiveSync() {

    if (
        liveTimer
    ) {

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


                await loadKitchenOrders();

            },
            2000
        );
}


// ============================================================
// REFRESH WHEN APP RETURNS TO FOREGROUND
// ============================================================

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadKitchenOrders();
        }
    }
);


// ============================================================
// LOGOUT
// ============================================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            if (
                liveTimer
            ) {

                clearInterval(
                    liveTimer
                );
            }


            if (
                sessionToken
            ) {

                await db.rpc(
                    "staff_logout",
                    {
                        p_session_token:
                            sessionToken
                    }
                );
            }


        } catch (error) {

            console.error(
                "Kitchen logout error:",
                error
            );


        } finally {

            goLogin();
        }
    }
);


// ============================================================
// INIT
// ============================================================

async function init() {

    if (
        !sessionToken
    ) {

        goLogin();

        return;
    }


    try {

        await loadKitchenInfo();


        await saveFCMToken(
            "kitchen"
        );


        // Browser notification fallback permission
        await requestStaffNotificationPermission();


        // First load initializes order cache.
        await loadKitchenOrders();


        if (
            loader
        ) {

            loader.style.display =
                "none";
        }


        startLiveSync();


    } catch (error) {

        console.error(
            "Kitchen init error:",
            error
        );


        if (
            loader
        ) {

            loader.style.display =
                "none";
        }
    }
}


// ============================================================
// START
// ============================================================

init();


// ============================================================
// SAVE FCM TOKEN
// ============================================================

async function saveFCMToken(
    role
) {

    try {

        if (
            !window.AndroidFCM ||
            typeof window
                .AndroidFCM
                .getToken !==
                "function"
        ) {

            console.log(
                "Android FCM bridge not available"
            );

            return;
        }


        // Token ready avvadaniki small wait
        let token =
            "";


        for (
            let attempt = 0;
            attempt < 5;
            attempt++
        ) {

            token =
                String(
                    window.AndroidFCM
                        .getToken() ||
                    ""
                )
                    .trim();


            if (
                token
            ) {

                break;
            }


            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1000
                    )
            );
        }


        if (
            !token
        ) {

            console.log(
                "FCM token not ready"
            );

            return;
        }


        const {
            data,
            error
        } =
            await db.rpc(
                "save_staff_fcm_token",
                {
                    p_session_token:
                        sessionToken,

                    p_fcm_token:
                        token,

                    p_role:
                        role,

                    p_device_name:
                        navigator.userAgent
                }
            );


        if (
            error
        ) {

            console.error(
                "FCM token save error:",
                error
            );

            return;
        }


        console.log(
            "FCM token saved:",
            data
        );


    } catch (error) {

        console.error(
            "FCM setup error:",
            error
        );
    }
}


// ============================================================
// SEND RESTAURANT PUSH
// ============================================================

async function sendRestaurantPush({

    sourceRole,

    targetRole,

    title,

    body,

    type,

    orderId = "",

    tableId = "",

    tableName = ""

}) {

    try {

        const {
            data,
            error
        } =
            await db.functions.invoke(
                "send-restaurant-push",
                {

                    body: {

                        session_token:
                            sessionToken,

                        source_role:
                            sourceRole,

                        target_role:
                            targetRole,

                        title,

                        body,

                        type,

                        order_id:
                            orderId
                            ? String(
                                orderId
                            )
                            : "",

                        table_id:
                            tableId
                            ? String(
                                tableId
                            )
                            : "",

                        table_name:
                            tableName
                            ? String(
                                tableName
                            )
                            : ""
                    }
                }
            );


        if (
            error
        ) {

            console.error(
                "FCM push error:",
                error
            );

            return false;
        }


        console.log(
            "FCM push:",
            data
        );


        return true;


    } catch (
        error
    ) {

        console.error(
            "FCM push exception:",
            error
        );


        return false;
    }
}
