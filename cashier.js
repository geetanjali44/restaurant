// ============================================================
// RESTAURANT POS
// CASHIER BILLING DASHBOARD
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


let currentBills = [];

let selectedBillId = null;

let selectedBillData = null;

let selectedPaymentMethod = "cash";

let liveTimer = null;

let toastTimer = null;

let isLoadingBills = false;

let billFieldsDirty = false;


// ============================================================
// CASHIER NOTIFICATION STATE
// ============================================================

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

const cashierName =
    document.getElementById(
        "cashierName"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const pendingBillsCount =
    document.getElementById(
        "pendingBillsCount"
    );

const pendingAmount =
    document.getElementById(
        "pendingAmount"
    );

const billingNowCount =
    document.getElementById(
        "billingNowCount"
    );

const billingGrid =
    document.getElementById(
        "billingGrid"
    );

const billModal =
    document.getElementById(
        "billModal"
    );

const billTitle =
    document.getElementById(
        "billTitle"
    );

const billTableName =
    document.getElementById(
        "billTableName"
    );

const closeBillModalBtn =
    document.getElementById(
        "closeBillModal"
    );

const billItems =
    document.getElementById(
        "billItems"
    );

const discountInput =
    document.getElementById(
        "discountInput"
    );

const taxInput =
    document.getElementById(
        "taxInput"
    );

const serviceInput =
    document.getElementById(
        "serviceInput"
    );

const billSummary =
    document.getElementById(
        "billSummary"
    );

const paymentMethodButtons =
    document.querySelectorAll(
        ".payment-method"
    );

const referenceInput =
    document.getElementById(
        "referenceInput"
    );

const updateBillBtn =
    document.getElementById(
        "updateBillBtn"
    );

const completePaymentBtn =
    document.getElementById(
        "completePaymentBtn"
    );

const toast =
    document.getElementById(
        "toast"
    );


// ============================================================
// HELPERS
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


function formatDateTime(value) {

    if (!value) {
        return "";
    }

    return new Date(value)
        .toLocaleString(
            "en-IN"
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
// CASHIER NATIVE NOTIFICATION
// ============================================================

function sendCashierNotification(
    title,
    body,
    tag = ""
) {

    try {

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
                            "cashier-notification"
                        )
                }
            );
        }

    } catch (error) {

        console.log(
            "Cashier notification unavailable:",
            error
        );
    }
}


// ============================================================
// NOTIFICATION PERMISSION
// ============================================================

async function requestCashierNotificationPermission() {

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

function vibrateCashierNotification() {

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

    } catch (error) {

        console.log(
            "Vibration unavailable:",
            error
        );
    }
}


// ============================================================
// CHECK NEW BILL REQUESTS
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


            const message =
                `Bill #${billNumber} is waiting for payment.`;


            showToast(
                title
            );


            vibrateCashierNotification();


            sendCashierNotification(
                title,
                message,
                `cashier-bill-${billId}`
            );
        }
    );


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

                cashierKnownBillIds.delete(
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
// CASHIER INFO
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


    restaurantName.textContent =
        data?.restaurant?.name ||
        "Restaurant";


    cashierName.textContent =
        data?.staff?.full_name ||
        "Cashier";
}


// ============================================================
// LOAD BILLS
// ============================================================

async function loadBills() {

    if (isLoadingBills) {
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
                "admin_get_billing_orders",
                {
                    p_session_token:
                        sessionToken
                }
            );


        if (error) {

            console.error(
                "Billing orders error:",
                error
            );

            return;
        }


        currentBills =
            data || [];


        // ====================================================
        // NEW BILL REQUEST NOTIFICATION
        // ====================================================

        checkCashierBillNotifications(
            currentBills
        );


        renderStats();

        renderBills();


    } catch (error) {

        console.error(
            "Billing refresh error:",
            error
        );


    } finally {

        isLoadingBills =
            false;
    }
}


// ============================================================
// STATS
// ============================================================

function renderStats() {

    const pending =
        currentBills.length;


    const amount =
        currentBills.reduce(
            (total, bill) =>
                total +
                Number(
                    bill.grand_total || 0
                ),
            0
        );


    const billingNow =
        currentBills.filter(
            bill =>
                bill.status ===
                "billing"
        ).length;


    pendingBillsCount.textContent =
        pending;


    pendingAmount.textContent =
        money(amount);


    billingNowCount.textContent =
        billingNow;
}


// ============================================================
// RENDER BILL CARDS
// ============================================================

function renderBills() {

    if (!currentBills.length) {

        billingGrid.innerHTML = `
            <div class="empty">
                No bill requests.
            </div>
        `;

        return;
    }


    billingGrid.innerHTML =
        currentBills
            .map(
                bill => `
                    <div
                        class="billing-card"
                        data-bill-id="${bill.id}"
                    >

                        <div class="billing-card-top">

                            <div class="billing-table">
                                ${escapeHtml(
                                    bill.table_name
                                )}
                            </div>


                            <div class="billing-total">
                                ${money(
                                    bill.grand_total
                                )}
                            </div>

                        </div>


                        <div class="billing-bill">
                            Bill #${bill.bill_number}
                        </div>


                        <div class="billing-status">
                            ${formatStatus(
                                bill.status
                            )}
                        </div>


                        <div class="billing-time">
                            ${
                                formatDateTime(
                                    bill.bill_requested_at ||
                                    bill.created_at
                                )
                            }
                        </div>

                    </div>
                `
            )
            .join("");
}


// ============================================================
// BILL CARD CLICK
// ============================================================

billingGrid?.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                ".billing-card"
            );


        if (!card) {
            return;
        }


        openBill(
            card.dataset.billId
        );
    }
);


// ============================================================
// OPEN BILL
// ============================================================

async function openBill(orderId) {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_get_bill_details",
            {
                p_session_token:
                    sessionToken,

                p_order_id:
                    orderId
            }
        );


    if (error) {

        console.error(
            "Bill details error:",
            error
        );


        showToast(
            error.message ||
            "Unable to open bill"
        );

        return;
    }


    selectedBillId =
        orderId;


    selectedBillData =
        data;


    billFieldsDirty =
        false;


    selectedPaymentMethod =
        "cash";


    paymentMethodButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.method ===
                    "cash"
            );
        }
    );


    referenceInput.value =
        "";


    referenceInput.style.display =
        "none";


    renderBill();


    billModal.classList.add(
        "show"
    );
}


// ============================================================
// RENDER BILL
// ============================================================

function renderBill() {

    const order =
        selectedBillData?.order;


    const items =
        selectedBillData?.items ||
        [];


    if (!order) {
        return;
    }


    billTitle.textContent =
        `Bill #${order.bill_number}`;


    billTableName.textContent =
        `${order.table_name} • ${formatStatus(order.status)}`;


    if (!billFieldsDirty) {

        discountInput.value =
            Number(
                order.discount_amount || 0
            );


        taxInput.value =
            Number(
                order.tax_amount || 0
            );


        serviceInput.value =
            Number(
                order.service_charge || 0
            );
    }


    if (!items.length) {

        billItems.innerHTML = `
            <div
                style="
                    padding:20px 0;
                    text-align:center;
                    color:#6b7280;
                    font-size:11px;
                "
            >
                No items found.
            </div>
        `;

    } else {

        billItems.innerHTML = `
            <div class="bill-items">

                ${
                    items
                        .map(
                            item => `
                                <div class="bill-item">

                                    <div>

                                        <div class="bill-item-name">
                                            ${escapeHtml(
                                                item.item_name
                                            )}
                                        </div>

                                        <div class="bill-item-meta">
                                            ${item.quantity}
                                            ×
                                            ${money(
                                                item.unit_price
                                            )}
                                        </div>

                                    </div>


                                    <strong>
                                        ${money(
                                            item.line_total
                                        )}
                                    </strong>

                                </div>
                            `
                        )
                        .join("")
                }

            </div>
        `;
    }


    renderBillSummary();
}
// ============================================================
// BILL SUMMARY
// ============================================================

function renderBillSummary() {

    const order =
        selectedBillData?.order;


    if (!order) {
        return;
    }


    const subtotal =
        Number(
            order.subtotal ||
            0
        );


    const discount =
        Math.max(
            0,
            Number(
                discountInput.value ||
                0
            )
        );


    const tax =
        Math.max(
            0,
            Number(
                taxInput.value ||
                0
            )
        );


    const service =
        Math.max(
            0,
            Number(
                serviceInput.value ||
                0
            )
        );


    const total =
        Math.max(
            0,
            subtotal
            + tax
            + service
            - discount
        );


    billSummary.innerHTML = `

        <div class="bill-summary-row">

            <span>
                Subtotal
            </span>

            <strong>
                ${money(subtotal)}
            </strong>

        </div>


        <div class="bill-summary-row">

            <span>
                Tax
            </span>

            <strong>
                ${money(tax)}
            </strong>

        </div>


        <div class="bill-summary-row">

            <span>
                Service Charge
            </span>

            <strong>
                ${money(service)}
            </strong>

        </div>


        <div class="bill-summary-row">

            <span>
                Discount
            </span>

            <strong>
                - ${money(discount)}
            </strong>

        </div>


        <div class="bill-summary-row grand">

            <span>
                Total
            </span>

            <span>
                ${money(total)}
            </span>

        </div>
    `;
}


// ============================================================
// LIVE BILL CALCULATION
// ============================================================

[
    discountInput,
    taxInput,
    serviceInput

].forEach(input => {

    input?.addEventListener(
        "input",
        () => {

            billFieldsDirty =
                true;

            renderBillSummary();
        }
    );
});


// ============================================================
// PAYMENT METHOD
// ============================================================

paymentMethodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                selectedPaymentMethod =
                    button.dataset.method;


                paymentMethodButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                referenceInput.style.display =
                    selectedPaymentMethod ===
                    "cash"
                        ? "none"
                        : "block";


                if (
                    selectedPaymentMethod ===
                    "cash"
                ) {

                    referenceInput.value =
                        "";
                }
            }
        );
    }
);


// ============================================================
// UPDATE BILL
// ============================================================

updateBillBtn?.addEventListener(
    "click",
    updateBill
);


async function updateBill() {

    if (!selectedBillId) {
        return;
    }


    updateBillBtn.disabled =
        true;


    const oldText =
        updateBillBtn.textContent;


    updateBillBtn.textContent =
        "Updating...";


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "admin_update_bill",
                {
                    p_session_token:
                        sessionToken,

                    p_order_id:
                        selectedBillId,

                    p_discount:
                        Number(
                            discountInput.value ||
                            0
                        ),

                    p_tax:
                        Number(
                            taxInput.value ||
                            0
                        ),

                    p_service_charge:
                        Number(
                            serviceInput.value ||
                            0
                        )
                }
            );


        if (error) {
            throw error;
        }


        showToast(
            data?.message ||
            "Bill updated"
        );


        const currentBillId =
            selectedBillId;


        billFieldsDirty =
            false;


        await loadBills();


        await openBill(
            currentBillId
        );


    } catch (error) {

        console.error(
            "Update bill error:",
            error
        );


        showToast(
            error.message ||
            "Unable to update bill"
        );


    } finally {

        updateBillBtn.disabled =
            false;


        updateBillBtn.textContent =
            oldText;
    }
}


// ============================================================
// COMPLETE PAYMENT
// ============================================================

completePaymentBtn?.addEventListener(
    "click",
    completePayment
);


async function completePayment() {

    if (!selectedBillId) {
        return;
    }


    if (
        selectedPaymentMethod !==
            "cash" &&
        !referenceInput.value.trim()
    ) {

        showToast(
            "Enter payment reference number"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Complete ${selectedPaymentMethod.toUpperCase()} payment?`
        );


    if (!confirmed) {
        return;
    }


    completePaymentBtn.disabled =
        true;


    const originalText =
        completePaymentBtn.textContent;


    completePaymentBtn.textContent =
        "Processing...";


    try {

        // ====================================================
        // SAVE CURRENT BILL VALUES FIRST
        // ====================================================

        const updateResponse =
            await db.rpc(
                "admin_update_bill",
                {
                    p_session_token:
                        sessionToken,

                    p_order_id:
                        selectedBillId,

                    p_discount:
                        Number(
                            discountInput.value ||
                            0
                        ),

                    p_tax:
                        Number(
                            taxInput.value ||
                            0
                        ),

                    p_service_charge:
                        Number(
                            serviceInput.value ||
                            0
                        )
                }
            );


        if (
            updateResponse.error
        ) {

            throw updateResponse.error;
        }


        // ====================================================
        // SAVE RECEIPT DATA BEFORE PAYMENT
        // ====================================================

        const receiptData =
            selectedBillData;


        const receiptValues = {

            discount:
                Number(
                    discountInput.value ||
                    0
                ),

            tax:
                Number(
                    taxInput.value ||
                    0
                ),

            service:
                Number(
                    serviceInput.value ||
                    0
                ),

            paymentMethod:
                selectedPaymentMethod
        };


        // ====================================================
        // COMPLETE PAYMENT
        // ====================================================

        const {
            data,
            error
        } =
            await db.rpc(
                "admin_complete_payment",
                {
                    p_session_token:
                        sessionToken,

                    p_order_id:
                        selectedBillId,

                    p_payment_method:
                        selectedPaymentMethod,

                    p_reference_number:
                        referenceInput.value
                            .trim()
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
        // CLOSE BILL MODAL
        // ====================================================

        closeBill();


        // ====================================================
        // PRINT RECEIPT
        // Android app -> PSF588 physical printer
        // Browser -> existing print fallback
        // ====================================================

        printReceipt(
            receiptData,
            receiptValues
        );


        // ====================================================
        // REFRESH BILLING
        // ====================================================

        await loadBills();


    } catch (error) {

        console.error(
            "Complete payment error:",
            error
        );


        showToast(
            error.message ||
            "Payment failed"
        );


    } finally {

        completePaymentBtn.disabled =
            false;


        completePaymentBtn.textContent =
            originalText;
    }
}


// ============================================================
// ANDROID BLUETOOTH PRINTER
// ============================================================

const BLUETOOTH_PRINTER_NAME =
    "PSF588";


// ============================================================
// CHECK ANDROID PRINTER BRIDGE
// ============================================================

function hasAndroidPrinter() {

    return !!(
        window.AndroidPrinter &&
        typeof window
            .AndroidPrinter
            .printReceipt ===
            "function"
    );
}


// ============================================================
// BUILD THERMAL RECEIPT TEXT
// ============================================================

function buildThermalReceipt(
    billData,
    values
) {

    const order =
        billData?.order;


    const restaurant =
        billData?.restaurant ||
        {};


    const items =
        billData?.items ||
        [];


    if (!order) {
        return "";
    }


    const subtotal =
        Number(
            order.subtotal ||
            0
        );


    const tax =
        Number(
            values.tax ||
            0
        );


    const service =
        Number(
            values.service ||
            0
        );


    const discount =
        Number(
            values.discount ||
            0
        );


    const total =
        Math.max(
            0,
            subtotal +
            tax +
            service -
            discount
        );


    // 58mm printer width
    const line =
        "--------------------------------";


    let receipt =
        "";


    // ========================================================
    // RESTAURANT NAME
    // ========================================================

    receipt +=
        `${
            restaurant.name ||
            "RESTAURANT"
        }\n`;


    // ========================================================
    // ADDRESS
    // ========================================================

    if (
        restaurant.address
    ) {

        receipt +=
            `${restaurant.address}\n`;
    }


    // ========================================================
    // PHONE
    // ========================================================

    if (
        restaurant.phone
    ) {

        receipt +=
            `Phone: ${restaurant.phone}\n`;
    }


    // ========================================================
    // GST
    // ========================================================

    if (
        restaurant.gst_number
    ) {

        receipt +=
            `GST: ${restaurant.gst_number}\n`;
    }


    receipt +=
        `${line}\n`;


    // ========================================================
    // BILL INFO
    // ========================================================

    receipt +=
        `Bill #${order.bill_number}\n`;


    receipt +=
        `${order.table_name}\n`;


    receipt +=
        `${
            new Date()
                .toLocaleDateString(
                    "en-IN"
                )
        } `;


    receipt +=
        `${
            new Date()
                .toLocaleTimeString(
                    "en-IN",
                    {
                        hour:
                            "2-digit",

                        minute:
                            "2-digit"
                    }
                )
        }\n`;


    receipt +=
        `${line}\n`;


    // ========================================================
    // ITEMS HEADER
    // ========================================================

    receipt +=
        `ITEM\n`;


    receipt +=
        `${line}\n`;


    // ========================================================
    // ITEMS
    // ========================================================

    items.forEach(
        item => {

            const itemName =
                String(
                    item.item_name ||
                    "Item"
                );


            const quantity =
                Number(
                    item.quantity ||
                    0
                );


            const unitPrice =
                Number(
                    item.unit_price ||
                    0
                );


            const lineTotal =
                Number(
                    item.line_total ||
                    0
                );


            receipt +=
                `${itemName}\n`;


            receipt +=
                `${quantity} x Rs.${unitPrice.toFixed(2)}`;


            receipt +=
                `   Rs.${lineTotal.toFixed(2)}\n`;
        }
    );


    receipt +=
        `${line}\n`;


    // ========================================================
    // SUBTOTAL
    // ========================================================

    receipt +=
        `Subtotal : Rs.${subtotal.toFixed(2)}\n`;


    // ========================================================
    // TAX
    // ========================================================

    if (
        tax > 0
    ) {

        receipt +=
            `Tax      : Rs.${tax.toFixed(2)}\n`;
    }


    // ========================================================
    // SERVICE
    // ========================================================

    if (
        service > 0
    ) {

        receipt +=
            `Service  : Rs.${service.toFixed(2)}\n`;
    }


    // ========================================================
    // DISCOUNT
    // ========================================================

    if (
        discount > 0
    ) {

        receipt +=
            `Discount : -Rs.${discount.toFixed(2)}\n`;
    }
        receipt +=
        `${line}\n`;


    // ========================================================
    // TOTAL
    // ========================================================

    receipt +=
        `TOTAL    : Rs.${total.toFixed(2)}\n`;


    receipt +=
        `${line}\n`;


    // ========================================================
    // PAYMENT METHOD
    // ========================================================

    receipt +=
        `Payment: ${
            String(
                values.paymentMethod ||
                "cash"
            ).toUpperCase()
        }\n`;


    receipt +=
        `${line}\n\n`;


    // ========================================================
    // FOOTER
    // ========================================================

    receipt +=
        `${
            restaurant.receipt_footer ||
            "Thank you! Visit Again."
        }\n`;


    receipt +=
        "\n\n\n";


    return receipt;
}


// ============================================================
// PRINT DIRECT TO PSF588
// ============================================================

function printAndroidReceipt(
    billData,
    values
) {

    if (
        !hasAndroidPrinter()
    ) {

        return false;
    }


    const receiptText =
        buildThermalReceipt(
            billData,
            values
        );


    if (
        !receiptText
    ) {

        showToast(
            "Unable to prepare receipt"
        );

        return true;
    }


    try {

        // ====================================================
        // IMPORTANT
        // MainActivity.kt lo function signature:
        //
        // printReceipt(
        //     printerName: String,
        //     receiptText: String
        // )
        // ====================================================

        window.AndroidPrinter
            .printReceipt(
                BLUETOOTH_PRINTER_NAME,
                receiptText
            );


        showToast(
            "Sending bill to PSF588..."
        );


        return true;


    } catch (error) {

        console.error(
            "PSF588 print error:",
            error
        );


        showToast(
            "Unable to send bill to printer"
        );


        return true;
    }
}


// ============================================================
// PRINT RECEIPT
// ============================================================

function printReceipt(
    billData,
    values
) {

    const order =
        billData?.order;


    const restaurant =
        billData?.restaurant ||
        {};


    const items =
        billData?.items ||
        [];


    if (!order) {
        return;
    }


    // ========================================================
    // ANDROID APP
    // Direct physical PSF588 Bluetooth print.
    // NO phone print preview.
    // ========================================================

    if (
        printAndroidReceipt(
            billData,
            values
        )
    ) {

        return;
    }


    // ========================================================
    // NORMAL BROWSER FALLBACK
    // ========================================================

    const subtotal =
        Number(
            order.subtotal ||
            0
        );


    const tax =
        Number(
            values.tax ||
            0
        );


    const service =
        Number(
            values.service ||
            0
        );


    const discount =
        Number(
            values.discount ||
            0
        );


    const total =
        Math.max(
            0,
            subtotal +
            tax +
            service -
            discount
        );


    // ========================================================
    // TEMP LOGO
    // ========================================================

    const LOGO_URL =
        "https://dummyimage.com/180x70/111827/ffffff&text=RESTAURANT";


    // ========================================================
    // TEMP QR
    // ========================================================

    const qrText =
        encodeURIComponent(
            `Bill ${order.bill_number} ${restaurant.name || "Restaurant"} ${total.toFixed(2)}`
        );


    const QR_URL =
        `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrText}`;


    const rows =
        items
            .map(
                item => `
                    <tr>

                        <td>

                            <strong>
                                ${escapeHtml(
                                    item.item_name
                                )}
                            </strong>

                            <div class="small">

                                ${item.quantity}
                                ×
                                ₹${Number(
                                    item.unit_price
                                ).toFixed(2)}

                            </div>

                        </td>


                        <td class="right">

                            ₹${Number(
                                item.line_total
                            ).toFixed(2)}

                        </td>

                    </tr>
                `
            )
            .join("");


    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=420,height=800"
        );


    if (
        !receiptWindow
    ) {

        showToast(
            "Please allow popups for printing"
        );

        return;
    }


    receiptWindow.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Bill #${order.bill_number}
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }


                body {

                    width: 72mm;

                    margin: 0 auto;

                    padding: 5mm 4mm;

                    font-family:
                        Arial,
                        sans-serif;

                    font-size: 11px;

                    color: #000;

                    background: #fff;
                }


                .center {
                    text-align: center;
                }


                .logo {
                    text-align: center;
                    margin-bottom: 4px;
                }


                .logo img {
                    max-width: 40mm;
                    max-height: 16mm;
                    object-fit: contain;
                }


                .restaurant {
                    font-size: 17px;
                    font-weight: bold;
                    text-align: center;
                }


                .small {
                    font-size: 9px;
                    line-height: 1.4;
                }


                .line {
                    border-top:
                        1px dashed #000;

                    margin: 8px 0;
                }


                .info {
                    display: flex;
                    justify-content: space-between;

                    gap: 10px;
                    font-size: 9px;
                    margin: 3px 0;
                }


                table {
                    width: 100%;
                    border-collapse: collapse;
                }


                th,
                td {
                    padding: 5px 0;
                    vertical-align: top;
                }


                th {
                    border-bottom:
                        1px solid #000;

                    font-size: 9px;
                    text-align: left;
                }


                .right {
                    text-align: right;
                }


                .summary td {
                    padding: 3px 0;
                }


                .grand td {
                    padding-top: 7px;

                    font-size: 15px;
                    font-weight: bold;
                }


                .payment {
                    margin-top: 8px;

                    border:
                        1px solid #000;

                    border-radius: 4px;
                    padding: 7px;
                }


                .qr {
                    text-align: center;
                    margin-top: 10px;
                }


                .qr img {
                    width: 32mm;
                    height: 32mm;
                }


                .footer {
                    text-align: center;

                    margin-top: 10px;

                    font-size: 9px;

                    line-height: 1.5;
                }


                @page {
                    size: 80mm auto;
                    margin: 0;
                }


                @media print {

                    html,
                    body {

                        width: 72mm;

                        margin: 0 auto;
                    }
                }

            </style>

        </head>


        <body>


            <div class="logo">

                <img
                    src="${LOGO_URL}"
                    alt="Logo"
                >

            </div>


            <div class="restaurant">

                ${escapeHtml(
                    restaurant.name ||
                    "Restaurant"
                )}

            </div>


            ${
                restaurant.address
                    ? `
                        <div class="center small">

                            ${escapeHtml(
                                restaurant.address
                            )}

                        </div>
                    `
                    : ""
            }


            ${
                restaurant.phone
                    ? `
                        <div class="center small">

                            ${escapeHtml(
                                restaurant.phone
                            )}

                        </div>
                    `
                    : ""
            }


            ${
                restaurant.gst_number
                    ? `
                        <div class="center small">

                            GST:
                            ${escapeHtml(
                                restaurant.gst_number
                            )}

                        </div>
                    `
                    : ""
            }


            <div class="line"></div>


            <div class="info">

                <span>
                    Bill #${order.bill_number}
                </span>


                <span>
                    ${escapeHtml(
                        order.table_name
                    )}
                </span>

            </div>


            <div class="info">

                <span>

                    ${new Date()
                        .toLocaleDateString(
                            "en-IN"
                        )}

                </span>


                <span>

                    ${new Date()
                        .toLocaleTimeString(
                            "en-IN",
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        )}

                </span>

            </div>


            <div class="line"></div>


            <table>

                <thead>

                    <tr>

                        <th>
                            Item
                        </th>


                        <th class="right">
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>


            <div class="line"></div>


            <table class="summary">

                <tr>

                    <td>
                        Subtotal
                    </td>

                    <td class="right">
                        ₹${subtotal.toFixed(2)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Tax
                    </td>

                    <td class="right">
                        ₹${tax.toFixed(2)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Service
                    </td>

                    <td class="right">
                        ₹${service.toFixed(2)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Discount
                    </td>

                    <td class="right">
                        -₹${discount.toFixed(2)}
                    </td>

                </tr>


                <tr class="grand">

                    <td>
                        TOTAL
                    </td>

                    <td class="right">
                        ₹${total.toFixed(2)}
                    </td>

                </tr>

            </table>


            <div class="payment">

                Payment:

                <strong>

                    ${escapeHtml(
                        String(
                            values.paymentMethod ||
                            "cash"
                        ).toUpperCase()
                    )}

                </strong>

            </div>


            <div class="qr">

                <strong>
                    Scan QR
                </strong>

                <br><br>


                <img
                    src="${QR_URL}"
                    alt="QR"
                >


                <div class="small">

                    Scan for payment / bill details

                </div>

            </div>


            <div class="line"></div>


            <div class="footer">

                ${escapeHtml(
                    restaurant.receipt_footer ||
                    "Thank you! Visit Again."
                )}

            </div>


            <script>

                window.onload =
                    function() {

                        setTimeout(
                            function() {

                                window.print();
                            },
                            600
                        );
                    };

            <\/script>


        </body>

        </html>
    `);


    receiptWindow.document.close();
}


// ============================================================
// CLOSE BILL
// ============================================================

function closeBill() {

    billModal.classList.remove(
        "show"
    );


    selectedBillId =
        null;


    selectedBillData =
        null;


    selectedPaymentMethod =
        "cash";


    billFieldsDirty =
        false;
}


// ============================================================
// CLOSE BILL BUTTON
// ============================================================

closeBillModalBtn?.addEventListener(
    "click",
    closeBill
);


// ============================================================
// CLICK OUTSIDE MODAL TO CLOSE
// ============================================================

billModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            billModal
        ) {

            closeBill();
        }
    }
);


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

                // App/page visible unte matrame refresh

                if (
                    document.visibilityState !==
                    "visible"
                ) {

                    return;
                }


                // ====================================================
                // REFRESH BILLING CARDS
                // ====================================================

                await loadBills();


                // ====================================================
                // KEEP OPENED BILL LIVE
                // ====================================================

                if (
                    selectedBillId
                ) {

                    const openedId =
                        selectedBillId;


                    const {
                        data,
                        error
                    } =
                        await db.rpc(
                            "admin_get_bill_details",
                            {
                                p_session_token:
                                    sessionToken,

                                p_order_id:
                                    openedId
                            }
                        );


                    if (
                        !error &&
                        data
                    ) {

                        selectedBillData =
                            data;


                        /*
                         * Important:
                         * Discount / tax / service user edit chestunte
                         * 2-second refresh values ni reset cheyyakudadhu.
                         */

                        if (
                            !billFieldsDirty
                        ) {

                            renderBill();
                        }
                    }
                }

            },
            2000
        );
}


// ============================================================
// FOREGROUND REFRESH
// ============================================================

document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            await loadBills();


            if (
                selectedBillId &&
                !billFieldsDirty
            ) {

                const openedId =
                    selectedBillId;


                try {

                    const {
                        data,
                        error
                    } =
                        await db.rpc(
                            "admin_get_bill_details",
                            {
                                p_session_token:
                                    sessionToken,

                                p_order_id:
                                    openedId
                            }
                        );


                    if (
                        !error &&
                        data
                    ) {

                        selectedBillData =
                            data;


                        renderBill();
                    }


                } catch (error) {

                    console.error(
                        "Foreground bill refresh error:",
                        error
                    );
                }
            }
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

            // ====================================================
            // STOP LIVE TIMER
            // ====================================================

            if (
                liveTimer
            ) {

                clearInterval(
                    liveTimer
                );


                liveTimer =
                    null;
            }


            // ====================================================
            // SERVER LOGOUT
            // ====================================================

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
        // SAVE CASHIER FCM TOKEN
        // ====================================================

        await saveFCMToken(
            "cashier"
        );


        // ====================================================
        // NOTIFICATION PERMISSION
        // ====================================================

        await requestCashierNotificationPermission();


        // ====================================================
        // INITIAL BILL LOAD
        // ====================================================

        await loadBills();


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
        // START LIVE SYNC
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


// ============================================================
// SAVE FCM TOKEN
// ============================================================

async function saveFCMToken(
    role
) {

    try {

        if (
            !window.AndroidFCM ||
            typeof window.AndroidFCM
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
                ).trim();


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
