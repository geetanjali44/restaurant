// ============================================================
// RESTAURANT POS
// KITCHEN DASHBOARD
// CUSTOM SESSION
// ============================================================


// ============================================================
// CONFIG
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


let currentOrders = [];

let currentOrderDetails = {};

let currentFilter = "all";

let liveTimer = null;

let toastTimer = null;

let isLoadingOrders = false;


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

const ordersGrid =
    document.getElementById(
        "ordersGrid"
    );

const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );

const toast =
    document.getElementById(
        "toast"
    );


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function formatStatus(status) {

    if (!status) {
        return "";
    }

    return status
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );
}


function formatTime(value) {

    if (!value) {
        return "";
    }

    return new Date(value)
        .toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


function formatElapsedTime(value) {

    if (!value) {
        return "";
    }

    const created =
        new Date(value).getTime();

    const now =
        Date.now();

    const diffMinutes =
        Math.max(
            0,
            Math.floor(
                (now - created) /
                60000
            )
        );


    if (diffMinutes < 1) {
        return "Just now";
    }


    if (diffMinutes < 60) {
        return `${diffMinutes} min ago`;
    }


    const hours =
        Math.floor(
            diffMinutes / 60
        );

    const minutes =
        diffMinutes % 60;


    if (minutes === 0) {
        return `${hours} hr ago`;
    }


    return `${hours} hr ${minutes} min ago`;
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


    isLoadingOrders = true;


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
        status === "preparing"
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

            if (liveTimer) {

                clearInterval(
                    liveTimer
                );
            }


            if (sessionToken) {

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

    if (!sessionToken) {

        goLogin();

        return;
    }


    try {

        await loadKitchenInfo();

        await loadKitchenOrders();


        if (loader) {

            loader.style.display =
                "none";
        }


        startLiveSync();


    } catch (error) {

        console.error(
            "Kitchen init error:",
            error
        );


        if (loader) {

            loader.style.display =
                "none";
        }
    }
}


// ============================================================
// START
// ============================================================

init();