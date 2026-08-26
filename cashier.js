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
    billFieldsDirty = false;

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


   // Only fill values from DB when bill is first opened
// or after a successful save.
// While cashier is typing, don't overwrite them.

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

            // User manually edited bill.
            // Live refresh must not overwrite these values.
            billFieldsDirty = true;

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


// Current bill ID ni first save chestunnam
const currentBillId =
    selectedBillId;


// User changes save ayyayi
billFieldsDirty =
    false;


// Billing cards refresh
await loadBills();


// Same bill ni fresh data tho reopen
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

        // --------------------------------------------
        // SAVE CURRENT BILL VALUES FIRST
        // --------------------------------------------

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


        if (updateResponse.error) {

            throw updateResponse.error;
        }


        // --------------------------------------------
        // SAVE FINAL RECEIPT VALUES
        // --------------------------------------------

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


        // --------------------------------------------
        // COMPLETE PAYMENT
        // --------------------------------------------

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


        closeBill();


        // Browser print for now.
        // Later Android Bluetooth printer bridge goes here.

        printReceipt(
            receiptData,
            receiptValues
        );


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
// PRINT RECEIPT
// TEMP LOGO + TEMP QR
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
    // Later replace
    // ========================================================

    const LOGO_URL =
        "https://dummyimage.com/180x70/111827/ffffff&text=RESTAURANT";


    // ========================================================
    // TEMP QR
    // Later replace with your real UPI QR/data
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


    if (!receiptWindow) {

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
                                hour: "2-digit",
                                minute: "2-digit"
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
}


closeBillModalBtn?.addEventListener(
    "click",
    closeBill
);


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


                await loadBills();


                if (selectedBillId) {

                    // Keep opened bill live as well.

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


                    if (!error && data) {

                        selectedBillData =
                            data;


                        renderBill();
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
    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadBills();
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

    if (!sessionToken) {

        goLogin();

        return;
    }


    try {

        await loadCashierInfo();

        await loadBills();


        if (loader) {

            loader.style.display =
                "none";
        }


        startLiveSync();


    } catch (error) {

        console.error(
            "Cashier init error:",
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