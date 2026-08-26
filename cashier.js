// ============================================================
// RESTAURANT POS
// CASHIER DASHBOARD
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


// ============================================================
// STATE
// ============================================================

let currentBills = [];

let selectedBillId = null;

let selectedBill = null;

let liveTimer = null;

let toastTimer = null;

let isLoadingBills = false;

let billFieldsDirty = false;


// ============================================================
// CASHIER NOTIFICATION STATE
// ============================================================

// First login/open app lo already unna bills ki
// notification raakunda cache initialize chestam.

let cashierNotificationInitialized =
    false;


const cashierKnownBillIds =
    new Set();


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


const cashierStaffName =
    document.getElementById(
        "cashierStaffName"
    );


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


const billsList =
    document.getElementById(
        "billsList"
    );


const billDetails =
    document.getElementById(
        "billDetails"
    );


const toast =
    document.getElementById(
        "toast"
    );


// ============================================================
// HELPERS
// ============================================================

function escapeHtml(value) {

    return String(
        value ?? ""
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


function money(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


function formatTime(value) {

    if (!value) {
        return "";
    }


    return new Date(
        value
    ).toLocaleTimeString(
        "en-IN",
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );
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
// NATIVE / BROWSER NOTIFICATION
// ============================================================

function sendStaffNotification(
    title,
    body,
    tag = ""
) {

    try {

        // ====================================================
        // ANDROID APP
        // ====================================================

        if (
            window.AndroidNotification &&
            typeof window
                .AndroidNotification
                .showNotification ===
                "function"
        ) {

            window.AndroidNotification
                .showNotification(
                    String(
                        title ||
                        "Restaurant"
                    ),
                    String(
                        body ||
                        ""
                    )
                );


            return;
        }


        // ====================================================
        // BROWSER FALLBACK
        // ====================================================

        if (
            "Notification" in window &&
            Notification.permission ===
                "granted"
        ) {

            new Notification(
                String(
                    title ||
                    "Restaurant"
                ),
                {
                    body:
                        String(
                            body ||
                            ""
                        ),

                    tag:
                        String(
                            tag ||
                            title ||
                            "restaurant"
                        )
                }
            );
        }


    } catch (error) {

        console.log(
            "Notification unavailable:",
            error
        );
    }
}


// ============================================================
// BROWSER NOTIFICATION PERMISSION
// ============================================================

async function requestStaffNotificationPermission() {

    try {

        if (
            "Notification" in window &&
            Notification.permission ===
                "default"
        ) {

            await Notification
                .requestPermission();
        }


    } catch (error) {

        console.log(
            "Notification permission unavailable:",
            error
        );
    }
}


// ============================================================
// VIBRATION
// ============================================================

function vibrateStaffNotification() {

    try {

        if (
            "vibrate" in navigator
        ) {

            navigator.vibrate([
                250,
                120,
                250,
                120,
                400
            ]);
        }

    } catch (_) {

        // Ignore unsupported vibration
    }
}


// ============================================================
// NOTIFY CASHIER
// ============================================================

function notifyCashier(
    title,
    body,
    tag
) {

    showToast(
        title
    );


    vibrateStaffNotification();


    sendStaffNotification(
        title,
        body,
        tag
    );
}


// ============================================================
// DETECT NEW BILL REQUEST
// ============================================================

function checkCashierBillNotifications(
    bills
) {

    const rows =
        Array.isArray(
            bills
        )
            ? bills
            : [];


    // ========================================================
    // FIRST LOAD
    // ========================================================

    if (
        !cashierNotificationInitialized
    ) {

        rows.forEach(
            bill => {

                cashierKnownBillIds.add(
                    String(
                        bill.id
                    )
                );
            }
        );


        cashierNotificationInitialized =
            true;


        return;
    }


    // ========================================================
    // NEW BILL
    // ========================================================

    rows.forEach(
        bill => {

            const billId =
                String(
                    bill.id
                );


            if (
                cashierKnownBillIds
                    .has(
                        billId
                    )
            ) {

                return;
            }


            cashierKnownBillIds.add(
                billId
            );


            const tableName =
                bill.table_name ||
                "Table";


            const billNumber =
                bill.bill_number ||
                "";


            const title =
                `Bill Requested • ${tableName}`;


            const body =
                `Bill #${billNumber} is waiting for payment.`;


            notifyCashier(
                title,
                body,
                `cashier-bill-${billId}`
            );
        }
    );


    // ========================================================
    // CLEAN OLD CACHE
    // ========================================================

    const activeIds =
        new Set(
            rows.map(
                bill =>
                    String(
                        bill.id
                    )
            )
        );


    [
        ...cashierKnownBillIds

    ].forEach(
        billId => {

            if (
                !activeIds.has(
                    billId
                )
            ) {

                cashierKnownBillIds
                    .delete(
                        billId
                    );
            }
        }
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


    window.location.replace(
        "index.html"
    );
}


// ============================================================
// LOAD CASHIER INFO
// ============================================================

async function loadCashierInfo() {

    const {
        data,
        error
    } =
        await db.rpc(
            "cashier_info",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Cashier info error:",
            error
        );


        goLogin();


        return;
    }


    if (
        restaurantName
    ) {

        restaurantName.textContent =
            data?.restaurant?.name ||
            "Restaurant";
    }


    if (
        cashierStaffName
    ) {

        cashierStaffName.textContent =
            data?.staff?.full_name ||
            "Cashier";
    }
}


// ============================================================
// LOAD BILLS
// ============================================================

async function loadBills() {

    if (
        isLoadingBills
    ) {

        return;
    }


    isLoadingBills =
        true;


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "cashier_get_bills",
                {
                    p_session_token:
                        sessionToken
                }
            );


        if (error) {

            throw error;
        }


        currentBills =
            data || [];


        // ====================================================
        // CHECK NEW BILL REQUEST
        // ====================================================

        checkCashierBillNotifications(
            currentBills
        );


        renderBills();


        // ====================================================
        // KEEP SELECTED BILL OPEN
        // ====================================================

        if (
            selectedBillId
        ) {

            const stillExists =
                currentBills.some(
                    bill =>
                        String(
                            bill.id
                        ) ===
                        String(
                            selectedBillId
                        )
                );


            if (
                !stillExists
            ) {

                selectedBillId =
                    null;


                selectedBill =
                    null;


                billFieldsDirty =
                    false;


                renderEmptyBill();
            }
        }


    } catch (error) {

        console.error(
            "Cashier bills error:",
            error
        );


    } finally {

        isLoadingBills =
            false;
    }
}


// ============================================================
// RENDER BILLS
// ============================================================

function renderBills() {

    if (
        !billsList
    ) {

        return;
    }


    if (
        !currentBills.length
    ) {

        billsList.innerHTML = `
            <div class="empty">
                No bills waiting.
            </div>
        `;


        return;
    }


    billsList.innerHTML =
        currentBills
            .map(
                bill => {

                    const active =
                        String(
                            bill.id
                        ) ===
                        String(
                            selectedBillId
                        );


                    return `
                        <button
                            type="button"
                            class="
                                bill-card
                                ${
                                    active
                                        ? "active"
                                        : ""
                                }
                            "
                            data-bill-id="${escapeHtml(
                                bill.id
                            )}"
                        >

                            <div class="bill-card-top">

                                <strong>
                                    ${escapeHtml(
                                        bill.table_name ||
                                        "Table"
                                    )}
                                </strong>

                                <span>
                                    #${escapeHtml(
                                        bill.bill_number ||
                                        ""
                                    )}
                                </span>

                            </div>


                            <div class="bill-card-bottom">

                                <span>
                                    ${formatTime(
                                        bill.created_at
                                    )}
                                </span>

                                <strong>
                                    ₹${money(
                                        bill.grand_total ||
                                        bill.total ||
                                        0
                                    )}
                                </strong>

                            </div>

                        </button>
                    `;
                }
            )
            .join("");
}


// ============================================================
// EMPTY BILL
// ============================================================

function renderEmptyBill() {

    if (
        !billDetails
    ) {

        return;
    }


    billDetails.innerHTML = `
        <div class="empty">
            Select a bill to view details.
        </div>
    `;
}


// ============================================================
// BILL LIST CLICK
// ============================================================

billsList?.addEventListener(
    "click",
    async event => {

        const card =
            event.target.closest(
                "[data-bill-id]"
            );


        if (!card) {
            return;
        }


        const billId =
            card.dataset.billId;


        if (!billId) {
            return;
        }


        await openBill(
            billId
        );
    }
);


// ============================================================
// OPEN BILL
// ============================================================

async function openBill(
    billId
) {

    selectedBillId =
        billId;


    billFieldsDirty =
        false;


    renderBills();


    if (
        billDetails
    ) {

        billDetails.innerHTML = `
            <div class="empty">
                Loading bill...
            </div>
        `;
    }


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "cashier_get_bill_details",
                {
                    p_session_token:
                        sessionToken,

                    p_bill_id:
                        billId
                }
            );


        if (error) {

            throw error;
        }


        selectedBill =
            data;


        renderBillDetails();


    } catch (error) {

        console.error(
            "Bill details error:",
            error
        );


        showToast(
            error.message ||
            "Unable to load bill"
        );
    }
}


// ============================================================
// RENDER BILL DETAILS
// ============================================================

function renderBillDetails() {

    if (
        !billDetails ||
        !selectedBill
    ) {

        return;
    }


    const bill =
        selectedBill.bill ||
        selectedBill;


    const items =
        selectedBill.items ||
        bill.items ||
        [];


    const subtotal =
        Number(
            bill.subtotal ||
            bill.item_total ||
            0
        );


    const tax =
        Number(
            bill.tax ||
            bill.tax_amount ||
            0
        );


    const discount =
        Number(
            bill.discount ||
            bill.discount_amount ||
            0
        );


    const grandTotal =
        Number(
            bill.grand_total ||
            bill.total ||
            (
                subtotal +
                tax -
                discount
            )
        );


    billDetails.innerHTML = `

        <div class="bill-head">

            <div>

                <h2>
                    ${escapeHtml(
                        bill.table_name ||
                        "Table"
                    )}
                </h2>

                <p>
                    Bill #${escapeHtml(
                        bill.bill_number ||
                        ""
                    )}
                </p>

            </div>

        </div>


        <div class="bill-items">

            ${
                items.length

                    ? items
                        .map(
                            item => `

                                <div class="bill-item">

                                    <div>

                                        <strong>
                                            ${escapeHtml(
                                                item.item_name ||
                                                item.name ||
                                                "Item"
                                            )}
                                        </strong>

                                        <small>
                                            ${Number(
                                                item.quantity ||
                                                1
                                            )}
                                            ×
                                            ₹${money(
                                                item.price ||
                                                item.unit_price ||
                                                0
                                            )}
                                        </small>

                                    </div>


                                    <strong>
                                        ₹${money(
                                            item.total ||
                                            (
                                                Number(
                                                    item.quantity ||
                                                    1
                                                ) *
                                                Number(
                                                    item.price ||
                                                    item.unit_price ||
                                                    0
                                                )
                                            )
                                        )}
                                    </strong>

                                </div>
                            `
                        )
                        .join("")

                    : `
                        <div class="empty">
                            No bill items.
                        </div>
                    `
            }

        </div>


        <div class="bill-summary">

            <div>
                <span>
                    Subtotal
                </span>

                <strong>
                    ₹${money(
                        subtotal
                    )}
                </strong>
            </div>


            <div>
                <span>
                    Tax
                </span>

                <strong>
                    ₹${money(
                        tax
                    )}
                </strong>
            </div>


            <div class="discount-row">

                <label>
                    Discount
                </label>

                <input
                    type="number"
                    id="discountInput"
                    min="0"
                    step="0.01"
                    value="${discount}"
                >

            </div>


            <div class="grand-total">

                <span>
                    Total
                </span>

                <strong
                    id="grandTotalValue"
                >
                    ₹${money(
                        grandTotal
                    )}
                </strong>

            </div>

        </div>


        <div class="payment-section">

            <label>
                Payment Method
            </label>


            <select
                id="paymentMethod"
            >

                <option value="cash">
                    Cash
                </option>

                <option value="upi">
                    UPI
                </option>

                <option value="card">
                    Card
                </option>

            </select>

        </div>


        <div class="bill-actions">

            <button
                type="button"
                id="printBillBtn"
                class="secondary-btn"
            >
                Print Bill
            </button>


            <button
                type="button"
                id="completePaymentBtn"
                class="primary-btn"
            >
                Complete Payment
            </button>

        </div>
    `;


    setupBillEvents(
        subtotal,
        tax
    );
}


// ============================================================
// BILL FIELD EVENTS
// ============================================================

function setupBillEvents(
    subtotal,
    tax
) {

    const discountInput =
        document.getElementById(
            "discountInput"
        );


    const grandTotalValue =
        document.getElementById(
            "grandTotalValue"
        );


    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        );


    const printBillBtn =
        document.getElementById(
            "printBillBtn"
        );


    const completePaymentBtn =
        document.getElementById(
            "completePaymentBtn"
        );


    // ========================================================
    // DISCOUNT
    // ========================================================

    discountInput?.addEventListener(
        "input",
        () => {

            billFieldsDirty =
                true;


            const discount =
                Math.max(
                    0,
                    Number(
                        discountInput.value ||
                        0
                    )
                );


            const total =
                Math.max(
                    0,
                    subtotal +
                    tax -
                    discount
                );


            if (
                grandTotalValue
            ) {

                grandTotalValue.textContent =
                    `₹${money(
                        total
                    )}`;
            }
        }
    );


    paymentMethod?.addEventListener(
        "change",
        () => {

            billFieldsDirty =
                true;
        }
    );


    // ========================================================
    // PRINT
    // ========================================================

    printBillBtn?.addEventListener(
        "click",
        () => {

            printCurrentBill();
        }
    );


    // ========================================================
    // COMPLETE PAYMENT
    // ========================================================

    completePaymentBtn?.addEventListener(
        "click",
        async () => {

            const discount =
                Math.max(
                    0,
                    Number(
                        discountInput?.value ||
                        0
                    )
                );


            const method =
                paymentMethod?.value ||
                "cash";


            await completePayment(
                discount,
                method,
                completePaymentBtn
            );
        }
    );
}


// ============================================================
// COMPLETE PAYMENT
// ============================================================

async function completePayment(
    discount,
    paymentMethod,
    button
) {

    if (
        !selectedBillId
    ) {

        return;
    }


    const originalText =
        button.textContent;


    button.disabled =
        true;


    button.textContent =
        "Processing...";


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "cashier_complete_payment",
                {
                    p_session_token:
                        sessionToken,

                    p_bill_id:
                        selectedBillId,

                    p_discount:
                        discount,

                    p_payment_method:
                        paymentMethod
                }
            );


        if (error) {

            throw error;
        }


        showToast(
            data?.message ||
            "Payment completed"
        );


        // ====================================================
        // IMPORTANT:
        // Keep current bill id before reload.
        // Prevent discount fields from automatically resetting
        // while editing.
        // ====================================================

        const currentBillId =
            selectedBillId;


        selectedBillId =
            null;


        selectedBill =
            null;


        billFieldsDirty =
            false;


        await loadBills();


        renderEmptyBill();


    } catch (error) {

        console.error(
            "Complete payment error:",
            error
        );


        showToast(
            error.message ||
            "Unable to complete payment"
        );


        button.disabled =
            false;


        button.textContent =
            originalText;
    }
}


// ============================================================
// PRINT BILL
// ============================================================

function printCurrentBill() {

    if (
        !selectedBill
    ) {

        showToast(
            "Select a bill first"
        );


        return;
    }


    // Temporary browser print.
    // Later Android Bluetooth thermal printer
    // bridge ni ikkada connect chestam.

    window.print();
}


// ============================================================
// LIVE REFRESH
// ============================================================

async function refreshCashier() {

    // User discount/payment fields edit chestunte
    // current bill ni reopen cheyyakudadhu.

    if (
        billFieldsDirty
    ) {

        await loadBills();


        return;
    }


    const currentBillId =
        selectedBillId;


    await loadBills();


    if (
        currentBillId
    ) {

        const stillExists =
            currentBills.some(
                bill =>
                    String(
                        bill.id
                    ) ===
                    String(
                        currentBillId
                    )
            );


        if (
            stillExists
        ) {

            await openBill(
                currentBillId
            );
        }
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


                await refreshCashier();

            },
            2000
        );
}


// ============================================================
// APP RETURNS TO FOREGROUND
// ============================================================

document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            await refreshCashier();
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
                "Cashier logout error:",
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

        // ====================================================
        // CASHIER INFO
        // ====================================================

        await loadCashierInfo();


        // ====================================================
        // BROWSER FALLBACK NOTIFICATION PERMISSION
        // Android app permission is handled in MainActivity.kt
        // ====================================================

        await requestStaffNotificationPermission();


        // ====================================================
        // INITIAL BILLS
        // Existing bills only cache అవుతాయి.
        // Notification రావదు.
        // ====================================================

        await loadBills();


        // ====================================================
        // EMPTY STATE
        // ====================================================

        if (
            !selectedBillId
        ) {

            renderEmptyBill();
        }


        // ====================================================
        // HIDE LOADER
        // ====================================================

        if (
            loader
        ) {

            loader.style.display =
                "none";
        }


        // ====================================================
        // START 2 SECOND LIVE CHECK
        // ====================================================

        startLiveSync();


    } catch (error) {

        console.error(
            "Cashier init error:",
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
