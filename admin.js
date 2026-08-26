// ============================================================
// RESTAURANT POS
// ADMIN DASHBOARD + WORKING SIDEBAR
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


let refreshTimer =
    null;

let loadingData =
    false;

let currentTables =
    [];

let toastTimer =
    null;

let currentCategories = [];
let currentMenuItems = [];
let selectedMenuCategory = "";
let menuSearchText = "";

let currentStaff = [];
let currentOrders = [];
let selectedOrderId = null;
let selectedOrderDetails = null;
let currentOrderFilter = "all";

let currentBillingOrders = [];

let selectedBillId = null;

let selectedBillData = null;

let selectedPaymentMethod = "cash";

let reportFrom = "";
let reportTo = "";

let reportHistory = [];
// ============================================================
// ELEMENTS
// ============================================================

const reportFromDate =
    document.getElementById(
        "reportFromDate"
    );

const reportToDate =
    document.getElementById(
        "reportToDate"
    );

const applyReportFilter =
    document.getElementById(
        "applyReportFilter"
    );

const reportSales =
    document.getElementById(
        "reportSales"
    );

const reportPaidOrders =
    document.getElementById(
        "reportPaidOrders"
    );

const reportCancelled =
    document.getElementById(
        "reportCancelled"
    );

const reportAverage =
    document.getElementById(
        "reportAverage"
    );

const reportCash =
    document.getElementById(
        "reportCash"
    );

const reportUpi =
    document.getElementById(
        "reportUpi"
    );

const reportCard =
    document.getElementById(
        "reportCard"
    );

const reportOther =
    document.getElementById(
        "reportOther"
    );

const topItemsList =
    document.getElementById(
        "topItemsList"
    );

const waiterReportList =
    document.getElementById(
        "waiterReportList"
    );

const orderHistoryBody =
    document.getElementById(
        "orderHistoryBody"
    );

const billingGrid =
    document.getElementById(
        "billingGrid"
    );

const billingModal =
    document.getElementById(
        "billingModal"
    );

const billingTitle =
    document.getElementById(
        "billingTitle"
    );

const billingTableName =
    document.getElementById(
        "billingTableName"
    );

const billingItems =
    document.getElementById(
        "billingItems"
    );

const billDiscountInput =
    document.getElementById(
        "billDiscountInput"
    );

const billTaxInput =
    document.getElementById(
        "billTaxInput"
    );

const billServiceInput =
    document.getElementById(
        "billServiceInput"
    );

const billSummary =
    document.getElementById(
        "billSummary"
    );

const paymentMethodButtons =
    document.querySelectorAll(
        ".payment-method"
    );

const paymentReferenceInput =
    document.getElementById(
        "paymentReferenceInput"
    );

const closeBillingModal =
    document.getElementById(
        "closeBillingModal"
    );

const reopenOrderBtn =
    document.getElementById(
        "reopenOrderBtn"
    );

const updateBillBtn =
    document.getElementById(
        "updateBillBtn"
    );

const completePaymentBtn =
    document.getElementById(
        "completePaymentBtn"
    );



const adminOrdersGrid =
    document.getElementById(
        "adminOrdersGrid"
    );

const orderFilterButtons =
    document.querySelectorAll(
        ".order-filter"
    );

const orderDetailsModal =
    document.getElementById(
        "orderDetailsModal"
    );

const orderDetailsTitle =
    document.getElementById(
        "orderDetailsTitle"
    );

const orderDetailsTable =
    document.getElementById(
        "orderDetailsTable"
    );

const orderDetailsBody =
    document.getElementById(
        "orderDetailsBody"
    );

const orderStatusSelect =
    document.getElementById(
        "orderStatusSelect"
    );

const closeOrderDetailsModal =
    document.getElementById(
        "closeOrderDetailsModal"
    );

const closeOrderBtn =
    document.getElementById(
        "closeOrderBtn"
    );

const updateOrderStatusBtn =
    document.getElementById(
        "updateOrderStatusBtn"
    );
const addStaffBtn =
    document.getElementById("addStaffBtn");

const staffGrid =
    document.getElementById("staffGrid");

const staffModal =
    document.getElementById("staffModal");

const staffForm =
    document.getElementById("staffForm");

const staffModalTitle =
    document.getElementById("staffModalTitle");

const editingStaffId =
    document.getElementById("editingStaffId");

const staffNameInput =
    document.getElementById("staffNameInput");

const staffEmailInput =
    document.getElementById("staffEmailInput");

const staffPhoneInput =
    document.getElementById("staffPhoneInput");

const staffRoleInput =
    document.getElementById("staffRoleInput");

const staffPasswordInput =
    document.getElementById("staffPasswordInput");

const staffPasswordField =
    document.getElementById("staffPasswordField");

const closeStaffModal =
    document.getElementById("closeStaffModal");

const cancelStaffBtn =
    document.getElementById("cancelStaffBtn");

const saveStaffBtn =
    document.getElementById("saveStaffBtn");


const staffPasswordModal =
    document.getElementById("staffPasswordModal");

const staffPasswordForm =
    document.getElementById("staffPasswordForm");

const resetPasswordStaffId =
    document.getElementById("resetPasswordStaffId");

const newStaffPasswordInput =
    document.getElementById("newStaffPasswordInput");

const closeStaffPasswordModal =
    document.getElementById("closeStaffPasswordModal");

const cancelStaffPasswordBtn =
    document.getElementById("cancelStaffPasswordBtn");

const saveStaffPasswordBtn =
    document.getElementById("saveStaffPasswordBtn");
const addCategoryBtn =

    document.getElementById("addCategoryBtn");

const addMenuItemBtn =
    document.getElementById("addMenuItemBtn");

const categoryBar =
    document.getElementById("categoryBar");

const menuSearch =
    document.getElementById("menuSearch");

const menuItemsGrid =
    document.getElementById("menuItemsGrid");


// CATEGORY MODAL

const categoryModal =
    document.getElementById("categoryModal");

const categoryForm =
    document.getElementById("categoryForm");

const categoryModalTitle =
    document.getElementById("categoryModalTitle");

const editingCategoryId =
    document.getElementById("editingCategoryId");

const categoryNameInput =
    document.getElementById("categoryNameInput");

const closeCategoryModal =
    document.getElementById("closeCategoryModal");

const cancelCategoryBtn =
    document.getElementById("cancelCategoryBtn");

const saveCategoryBtn =
    document.getElementById("saveCategoryBtn");


// MENU ITEM MODAL

const menuItemModal =
    document.getElementById("menuItemModal");

const menuItemForm =
    document.getElementById("menuItemForm");

const editingMenuItemId =
    document.getElementById("editingMenuItemId");

const menuItemModalTitle =
    document.getElementById("menuItemModalTitle");

const menuCategoryInput =
    document.getElementById("menuCategoryInput");

const menuItemNameInput =
    document.getElementById("menuItemNameInput");

const menuPriceInput =
    document.getElementById("menuPriceInput");

const menuTypeInput =
    document.getElementById("menuTypeInput");

const menuDescriptionInput =
    document.getElementById("menuDescriptionInput");

const menuImageInput =
    document.getElementById("menuImageInput");

const closeMenuItemModal =
    document.getElementById("closeMenuItemModal");

const cancelMenuItemBtn =
    document.getElementById("cancelMenuItemBtn");

const saveMenuItemBtn =
    document.getElementById("saveMenuItemBtn");
const loader =
    document.getElementById(
        "loader"
    );

const restaurantName =
    document.getElementById(
        "restaurantName"
    );

const mobileRestaurantName =
    document.getElementById(
        "mobileRestaurantName"
    );

const userName =
    document.getElementById(
        "userName"
    );

const userRole =
    document.getElementById(
        "userRole"
    );

const welcomeText =
    document.getElementById(
        "welcomeText"
    );

const todaySales =
    document.getElementById(
        "todaySales"
    );

const activeOrders =
    document.getElementById(
        "activeOrders"
    );

const freeTables =
    document.getElementById(
        "freeTables"
    );

const occupiedTables =
    document.getElementById(
        "occupiedTables"
    );

const billRequested =
    document.getElementById(
        "billRequested"
    );

const overviewTablesGrid =
    document.getElementById(
        "overviewTablesGrid"
    );

const tablesGrid =
    document.getElementById(
        "tablesGrid"
    );

const recentOrders =
    document.getElementById(
        "recentOrders"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const mobileLogoutBtn =
    document.getElementById(
        "mobileLogoutBtn"
    );


// ============================================================
// NAVIGATION
// ============================================================

const navButtons =
    document.querySelectorAll(
        ".nav button[data-section]"
    );

const sections =
    document.querySelectorAll(
        ".section"
    );


// ============================================================
// TABLE MODAL ELEMENTS
// ============================================================

const addTableBtn =
    document.getElementById(
        "addTableBtn"
    );

const tableModal =
    document.getElementById(
        "tableModal"
    );

const closeTableModal =
    document.getElementById(
        "closeTableModal"
    );

const cancelTableBtn =
    document.getElementById(
        "cancelTableBtn"
    );

const tableForm =
    document.getElementById(
        "tableForm"
    );

const editingTableId =
    document.getElementById(
        "editingTableId"
    );

const tableNameInput =
    document.getElementById(
        "tableNameInput"
    );

const tableNumberInput =
    document.getElementById(
        "tableNumberInput"
    );

const tableCapacityInput =
    document.getElementById(
        "tableCapacityInput"
    );

const tableModalTitle =
    document.getElementById(
        "tableModalTitle"
    );

const saveTableBtn =
    document.getElementById(
        "saveTableBtn"
    );

const toast =
    document.getElementById(
        "toast"
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
        Number(value || 0)
    );
}


// ============================================================
// HTML ESCAPE
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


// ============================================================
// STATUS
// ============================================================

function formatStatus(status) {

    if (!status) {
        return "-";
    }


    return status
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
// TIME
// ============================================================

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
            2500
        );
}


// ============================================================
// LOGIN REDIRECT
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
// SIDEBAR NAVIGATION
// ============================================================

function openSection(
    sectionName
) {

    navButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                    sectionName
            );
        }
    );


    sections.forEach(
        section => {

            section.classList.toggle(
                "active",
                section.id ===
                    `section-${sectionName}`
            );
        }
    );
    if (sectionName === "menu") {
    loadMenu();
}

if (sectionName === "orders") {
    loadAdminOrders();
}
if (sectionName === "reports") {
    loadReports();
}

if (sectionName === "billing") {
    loadBillingOrders();
}

if (sectionName === "staff") {
    loadStaff();
}
    if (
        sectionName ===
        "overview"
    ) {

        refreshDashboard();
    }


    if (
        sectionName ===
        "tables"
    ) {

        loadTables();
    }
}


navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                openSection(
                    button.dataset.section
                );
            }
        );
    }
);


// ============================================================
// LOAD INFO
// ============================================================

async function loadInfo() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_dashboard_info",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Dashboard info error:",
            error
        );


        if (
            error.message
                ?.toLowerCase()
                .includes(
                    "session"
                )
        ) {

            goLogin();
        }

        return;
    }


    const staff =
        data?.staff || {};

    const restaurant =
        data?.restaurant || {};

    const stats =
        data?.stats || {};


    restaurantName.textContent =
        restaurant.name ||
        "Restaurant";


    mobileRestaurantName.textContent =
        restaurant.name ||
        "Restaurant";


    userName.textContent =
        staff.full_name ||
        "Owner";


    userRole.textContent =
        staff.role ||
        "owner";


    welcomeText.textContent =
        `${restaurant.name || "Restaurant"} • Welcome ${staff.full_name || "Owner"}`;


    todaySales.textContent =
        money(
            stats.today_sales
        );


    activeOrders.textContent =
        Number(
            stats.active_orders || 0
        );


    freeTables.textContent =
        Number(
            stats.free_tables || 0
        );


    occupiedTables.textContent =
        Number(
            stats.occupied_tables || 0
        );


    billRequested.textContent =
        Number(
            stats.bill_requested || 0
        );
}


// ============================================================
// LOAD TABLES
// ============================================================

async function loadTables() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_get_tables",
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


    renderOverviewTables();

    renderManageTables();
}


// ============================================================
// OVERVIEW TABLES
// ============================================================

function renderOverviewTables() {

    if (!currentTables.length) {

        overviewTablesGrid.innerHTML = `
            <div
                class="empty"
                style="grid-column:1/-1"
            >
                No tables created yet.
            </div>
        `;

        return;
    }


    overviewTablesGrid.innerHTML =
        currentTables
            .map(
                table => {

                    const total =
                        table.order_id
                            ? money(
                                table.order_total
                            )
                            : "₹0";


                    return `
                        <div
                            class="table-card"
                        >

                            <div class="table-top">

                                <div class="table-name">
                                    ${escapeHtml(
                                        table.table_name
                                    )}
                                </div>


                                <span
                                    class="
                                        status
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


                            <div class="table-total">
                                ${total}
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
                }
            )
            .join("");
}


// ============================================================
// TABLE MANAGEMENT RENDER
// ============================================================

function renderManageTables() {

    if (!currentTables.length) {

        tablesGrid.innerHTML = `
            <div
                class="empty"
                style="grid-column:1/-1"
            >
                No tables created yet.
            </div>
        `;

        return;
    }


    tablesGrid.innerHTML =
        currentTables
            .map(
                table => {

                    const total =
                        table.order_id
                            ? money(
                                table.order_total
                            )
                            : "₹0";


                    const disableButton =
                        table.status === "free"
                            ? `
                                <button
                                    type="button"
                                    class="disable-table"
                                    data-table-id="${table.id}"
                                >
                                    Disable
                                </button>
                            `
                            : "";


                    return `
                        <div
                            class="table-card"
                        >

                            <div class="table-top">

                                <div class="table-name">
                                    ${escapeHtml(
                                        table.table_name
                                    )}
                                </div>


                                <span
                                    class="
                                        status
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


                            <div class="table-total">
                                ${total}
                            </div>


                            <div class="table-meta">

                                ${
                                    table.order_id
                                        ? `Bill #${table.bill_number}`
                                        : `Table ${table.table_number || "-"} • Capacity ${table.capacity || "-"}`
                                }

                            </div>


                            <div class="table-actions">

                                <button
                                    type="button"
                                    class="edit-table"
                                    data-table-id="${table.id}"
                                >
                                    Edit
                                </button>

                                ${disableButton}

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


// ============================================================
// RECENT ORDERS
// ============================================================

async function loadRecentOrders() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_recent_orders",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Recent orders error:",
            error
        );

        return;
    }


    if (!data?.length) {

        recentOrders.innerHTML = `
            <div class="empty">
                No orders yet.
            </div>
        `;

        return;
    }


    recentOrders.innerHTML =
        data
            .map(
                order => {

                    return `
                        <div class="order">

                            <div class="order-top">

                                <div class="order-bill">
                                    Bill #${order.bill_number}
                                </div>

                                <div class="order-price">
                                    ${money(
                                        order.grand_total
                                    )}
                                </div>

                            </div>


                            <div class="order-bottom">

                                <span>
                                    ${escapeHtml(
                                        order.table_name
                                    )}
                                    •
                                    ${formatStatus(
                                        order.status
                                    )}
                                </span>


                                <span>
                                    ${formatTime(
                                        order.created_at
                                    )}
                                </span>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


// ============================================================
// REFRESH
// ============================================================

async function refreshDashboard() {

    if (loadingData) {
        return;
    }


    loadingData =
        true;


    try {

        await Promise.all([
            loadInfo(),
            loadTables(),
            loadRecentOrders()
        ]);

    } catch (error) {

        console.error(
            "Dashboard refresh error:",
            error
        );

    } finally {

        loadingData =
            false;
    }
}


// ============================================================
// AUTO LIVE SYNC
// ============================================================

function startLiveSync() {

    if (refreshTimer) {

        clearInterval(
            refreshTimer
        );
    }
    if (
    document
        .getElementById(
            "section-orders"
        )
        ?.classList.contains(
            "active"
        )
) {
    loadAdminOrders();
}

    refreshTimer =
        setInterval(
            () => {

                if (
                    document.visibilityState ===
                    "visible"
                ) {

                    refreshDashboard();
                }

            },
            2000
        );
}


// ============================================================
// ADD TABLE
// ============================================================

function openAddTable() {

    editingTableId.value =
        "";


    tableModalTitle.textContent =
        "Add Table";


    tableNameInput.value =
        "";


    tableNumberInput.value =
        "";


    tableCapacityInput.value =
        "4";


    saveTableBtn.textContent =
        "Save Table";


    tableModal.classList.add(
        "show"
    );
}


// ============================================================
// EDIT TABLE
// ============================================================

function openEditTable(
    tableId
) {

    const table =
        currentTables.find(
            item =>
                item.id ===
                tableId
        );


    if (!table) {

        showToast(
            "Table not found"
        );

        return;
    }


    editingTableId.value =
        table.id;


    tableModalTitle.textContent =
        "Edit Table";


    tableNameInput.value =
        table.table_name ||
        "";


    tableNumberInput.value =
        table.table_number ??
        "";


    tableCapacityInput.value =
        table.capacity ||
        4;


    saveTableBtn.textContent =
        "Update Table";


    tableModal.classList.add(
        "show"
    );
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    tableModal.classList.remove(
        "show"
    );


    tableForm.reset();


    editingTableId.value =
        "";
}


// ============================================================
// SAVE TABLE
// ============================================================

tableForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const tableId =
            editingTableId.value;


        const name =
            tableNameInput.value
                .trim();


        const tableNumber =
            tableNumberInput.value
                ? Number(
                    tableNumberInput.value
                )
                : null;


        const capacity =
            Number(
                tableCapacityInput.value
            );


        if (!name) {

            showToast(
                "Enter table name"
            );

            return;
        }


        saveTableBtn.disabled =
            true;


        saveTableBtn.textContent =
            "Saving...";


        try {

            let response;


            if (tableId) {

                response =
                    await db.rpc(
                        "admin_update_table",
                        {
                            p_session_token:
                                sessionToken,

                            p_table_id:
                                tableId,

                            p_table_name:
                                name,

                            p_table_number:
                                tableNumber,

                            p_capacity:
                                capacity
                        }
                    );

            } else {

                response =
                    await db.rpc(
                        "admin_add_table",
                        {
                            p_session_token:
                                sessionToken,

                            p_table_name:
                                name,

                            p_table_number:
                                tableNumber,

                            p_capacity:
                                capacity
                        }
                    );
            }


            if (response.error) {

                throw response.error;
            }


            closeModal();


            showToast(
                response.data?.message ||
                "Saved successfully"
            );


            await refreshDashboard();


        } catch (error) {

            console.error(
                "Save table error:",
                error
            );


            showToast(
                error.message ||
                "Unable to save table"
            );


        } finally {

            saveTableBtn.disabled =
                false;


            saveTableBtn.textContent =
                "Save Table";
        }
    }
);


// ============================================================
// TABLE ACTIONS
// ============================================================

tablesGrid?.addEventListener(
    "click",
    async event => {

        const editButton =
            event.target.closest(
                ".edit-table"
            );


        if (editButton) {

            openEditTable(
                editButton.dataset.tableId
            );

            return;
        }


        const disableButton =
            event.target.closest(
                ".disable-table"
            );


        if (disableButton) {

            await disableTable(
                disableButton.dataset.tableId
            );
        }
    }
);


// ============================================================
// DISABLE TABLE
// ============================================================

async function disableTable(
    tableId
) {

    const table =
        currentTables.find(
            item =>
                item.id ===
                tableId
        );


    if (!table) {
        return;
    }


    if (
        table.status !==
        "free"
    ) {

        showToast(
            "Only free tables can be disabled"
        );

        return;
    }


    const confirmed =
        confirm(
            `Disable ${table.table_name}?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "admin_disable_table",
                {
                    p_session_token:
                        sessionToken,

                    p_table_id:
                        tableId
                }
            );


        if (error) {

            throw error;
        }


        showToast(
            data?.message ||
            "Table disabled"
        );


        await refreshDashboard();


    } catch (error) {

        console.error(
            "Disable table error:",
            error
        );


        showToast(
            error.message ||
            "Unable to disable table"
        );
    }
}


// ============================================================
// MODAL BUTTONS
// ============================================================

addTableBtn?.addEventListener(
    "click",
    openAddTable
);


closeTableModal?.addEventListener(
    "click",
    closeModal
);


cancelTableBtn?.addEventListener(
    "click",
    closeModal
);


tableModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            tableModal
        ) {

            closeModal();
        }
    }
);


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        if (refreshTimer) {

            clearInterval(
                refreshTimer
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
            "Logout error:",
            error
        );

    } finally {

        goLogin();
    }
}


logoutBtn?.addEventListener(
    "click",
    logout
);


mobileLogoutBtn?.addEventListener(
    "click",
    logout
);


// ============================================================
// INIT
// ============================================================

async function init() {

    if (!sessionToken) {

        goLogin();

        return;
    }


    await refreshDashboard();


    if (loader) {

        loader.style.display =
            "none";
    }


    startLiveSync();
}


// ============================================================
// START
// ============================================================

init();

// ============================================================
// LOAD MENU
// ============================================================

async function loadMenu() {

    await Promise.all([
        loadCategories(),
        loadMenuItems()
    ]);

    renderMenu();
}


// ============================================================
// CATEGORIES
// ============================================================

async function loadCategories() {

    const {
        data,
        error
    } = await db.rpc(
        "admin_get_categories",
        {
            p_session_token:
                sessionToken
        }
    );


    if (error) {

        console.error(
            "Categories error:",
            error
        );

        return;
    }


    currentCategories =
        data || [];


    renderCategories();

    fillCategoryDropdown();
}


// ============================================================
// MENU ITEMS
// ============================================================

async function loadMenuItems() {

    const {
        data,
        error
    } = await db.rpc(
        "admin_get_menu_items",
        {
            p_session_token:
                sessionToken
        }
    );


    if (error) {

        console.error(
            "Menu items error:",
            error
        );

        return;
    }


    currentMenuItems =
        data || [];
}


// ============================================================
// CATEGORY BAR
// ============================================================

function renderCategories() {

    categoryBar.innerHTML = `
        <button
            class="category-chip
            ${selectedMenuCategory === "" ? "active" : ""}"
            data-category=""
        >
            All
        </button>

        ${
            currentCategories
                .map(category => `
                    <button
                        class="category-chip
                        ${
                            selectedMenuCategory === category.id
                            ? "active"
                            : ""
                        }"
                        data-category="${category.id}"
                    >
                        ${escapeHtml(category.name)}
                    </button>
                `)
                .join("")
        }
    `;
}


// ============================================================
// CATEGORY SELECT
// ============================================================

categoryBar?.addEventListener(
    "click",
    event => {

        const chip =
            event.target.closest(
                ".category-chip"
            );

        if (!chip) {
            return;
        }


        selectedMenuCategory =
            chip.dataset.category || "";


        renderCategories();

        renderMenu();
    }
);


// ============================================================
// DROPDOWN
// ============================================================

function fillCategoryDropdown() {

    menuCategoryInput.innerHTML = `
        <option value="">
            Select Category
        </option>

        ${
            currentCategories
                .map(category => `
                    <option value="${category.id}">
                        ${escapeHtml(category.name)}
                    </option>
                `)
                .join("")
        }
    `;
}


// ============================================================
// RENDER MENU ITEMS
// ============================================================

function renderMenu() {

    let items =
        [...currentMenuItems];


    if (selectedMenuCategory) {

        items =
            items.filter(
                item =>
                    item.category_id ===
                    selectedMenuCategory
            );
    }


    if (menuSearchText) {

        items =
            items.filter(
                item =>
                    item.item_name
                        .toLowerCase()
                        .includes(
                            menuSearchText
                        )
            );
    }


    if (!items.length) {

        menuItemsGrid.innerHTML = `
            <div
                class="empty"
                style="grid-column:1/-1"
            >
                No menu items found.
            </div>
        `;

        return;
    }


    menuItemsGrid.innerHTML =
        items
            .map(item => {

                const image =
                    item.image_url
                    ? `
                        <img
                            src="${escapeHtml(item.image_url)}"
                            alt=""
                        >
                    `
                    : "No image";


                return `
                    <div
                        class="
                            menu-item-card
                            ${
                                !item.is_available
                                ? "out-of-stock"
                                : ""
                            }
                        "
                    >

                        <div class="menu-item-image">
                            ${image}
                        </div>


                        <div class="menu-item-body">

                            <div class="menu-category">
                                ${escapeHtml(
                                    item.category_name
                                )}
                            </div>


                            <div class="menu-item-name">
                                ${escapeHtml(
                                    item.item_name
                                )}
                            </div>


                            <div class="menu-item-description">
                                ${escapeHtml(
                                    item.description || ""
                                )}
                            </div>


                            <div class="menu-item-price">
                                ${money(
                                    item.price
                                )}
                            </div>


                            <div
                                class="
                                    stock-text
                                    ${
                                        item.is_available
                                        ? "available"
                                        : "unavailable"
                                    }
                                "
                            >
                                ${
                                    item.is_available
                                    ? "Available"
                                    : "Out of stock"
                                }
                            </div>


                            <div class="menu-item-bottom">

                                <span
                                    class="
                                        food-type
                                        ${item.item_type}
                                    "
                                >
                                    ${formatStatus(
                                        item.item_type
                                    )}
                                </span>


                                <div class="item-actions">

                                    <button
                                        class="edit-menu-item"
                                        data-id="${item.id}"
                                    >
                                        Edit
                                    </button>


                                    <button
                                        class="
                                            toggle-menu-item
                                            ${
                                                item.is_available
                                                ? "stock-off"
                                                : "stock-on"
                                            }
                                        "
                                        data-id="${item.id}"
                                        data-current="${item.is_available}"
                                    >
                                        ${
                                            item.is_available
                                            ? "Out of stock"
                                            : "Available"
                                        }
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                `;
            })
            .join("");
}


// ============================================================
// SEARCH
// ============================================================

menuSearch?.addEventListener(
    "input",
    () => {

        menuSearchText =
            menuSearch.value
                .trim()
                .toLowerCase();

        renderMenu();
    }
);


// ============================================================
// ADD CATEGORY MODAL
// ============================================================

addCategoryBtn?.addEventListener(
    "click",
    () => {

        editingCategoryId.value = "";

        categoryNameInput.value = "";

        categoryModalTitle.textContent =
            "Add Category";

        saveCategoryBtn.textContent =
            "Save Category";

        categoryModal.classList.add(
            "show"
        );
    }
);


function closeCategory() {

    categoryModal.classList.remove(
        "show"
    );

    categoryForm.reset();

    editingCategoryId.value = "";
}


closeCategoryModal?.addEventListener(
    "click",
    closeCategory
);

cancelCategoryBtn?.addEventListener(
    "click",
    closeCategory
);


// ============================================================
// SAVE CATEGORY
// ============================================================

categoryForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            categoryNameInput.value.trim();


        if (!name) {

            showToast(
                "Enter category name"
            );

            return;
        }


        saveCategoryBtn.disabled =
            true;


        try {

            const categoryId =
                editingCategoryId.value;


            let response;


            if (categoryId) {

                response =
                    await db.rpc(
                        "admin_update_category",
                        {
                            p_session_token:
                                sessionToken,

                            p_category_id:
                                categoryId,

                            p_name:
                                name
                        }
                    );

            } else {

                response =
                    await db.rpc(
                        "admin_add_category",
                        {
                            p_session_token:
                                sessionToken,

                            p_name:
                                name
                        }
                    );
            }


            if (response.error) {
                throw response.error;
            }


            closeCategory();

            showToast(
                response.data?.message ||
                "Category saved"
            );


            await loadMenu();


        } catch (error) {

            showToast(
                error.message ||
                "Unable to save category"
            );

        } finally {

            saveCategoryBtn.disabled =
                false;
        }
    }
);


// ============================================================
// ADD MENU ITEM MODAL
// ============================================================

addMenuItemBtn?.addEventListener(
    "click",
    async () => {

        if (!currentCategories.length) {

            showToast(
                "First create a category"
            );

            return;
        }


        editingMenuItemId.value = "";

        menuItemForm.reset();

        menuItemModalTitle.textContent =
            "Add Menu Item";

        saveMenuItemBtn.textContent =
            "Save Item";


        menuTypeInput.value =
            "non_veg";


        menuItemModal.classList.add(
            "show"
        );
    }
);


function closeMenuItem() {

    menuItemModal.classList.remove(
        "show"
    );

    menuItemForm.reset();

    editingMenuItemId.value = "";
}


closeMenuItemModal?.addEventListener(
    "click",
    closeMenuItem
);

cancelMenuItemBtn?.addEventListener(
    "click",
    closeMenuItem
);


// ============================================================
// SAVE MENU ITEM
// ============================================================

menuItemForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const itemId =
            editingMenuItemId.value;


        const categoryId =
            menuCategoryInput.value ||
            null;


        const itemName =
            menuItemNameInput.value
                .trim();


        const price =
            Number(
                menuPriceInput.value
            );


        const type =
            menuTypeInput.value;


        const description =
            menuDescriptionInput.value
                .trim();


        const image =
            menuImageInput.value
                .trim();


        if (!itemName) {

            showToast(
                "Enter item name"
            );

            return;
        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            showToast(
                "Enter valid price"
            );

            return;
        }


        saveMenuItemBtn.disabled =
            true;


        try {

            let response;


            if (itemId) {

                response =
                    await db.rpc(
                        "admin_update_menu_item",
                        {
                            p_session_token:
                                sessionToken,

                            p_item_id:
                                itemId,

                            p_category_id:
                                categoryId,

                            p_item_name:
                                itemName,

                            p_description:
                                description,

                            p_price:
                                price,

                            p_item_type:
                                type,

                            p_image_url:
                                image
                        }
                    );

            } else {

                response =
                    await db.rpc(
                        "admin_add_menu_item",
                        {
                            p_session_token:
                                sessionToken,

                            p_category_id:
                                categoryId,

                            p_item_name:
                                itemName,

                            p_description:
                                description,

                            p_price:
                                price,

                            p_item_type:
                                type,

                            p_image_url:
                                image
                        }
                    );
            }


            if (response.error) {

                throw response.error;
            }


            closeMenuItem();


            showToast(
                response.data?.message ||
                "Menu item saved"
            );


            await loadMenu();


        } catch (error) {

            console.error(error);


            showToast(
                error.message ||
                "Unable to save menu item"
            );


        } finally {

            saveMenuItemBtn.disabled =
                false;
        }
    }
);


// ============================================================
// MENU CARD ACTIONS
// ============================================================

menuItemsGrid?.addEventListener(
    "click",
    async event => {

        const edit =
            event.target.closest(
                ".edit-menu-item"
            );


        if (edit) {

            openEditMenuItem(
                edit.dataset.id
            );

            return;
        }


        const toggle =
            event.target.closest(
                ".toggle-menu-item"
            );


        if (toggle) {

            const current =
                toggle.dataset.current ===
                "true";


            await toggleMenuAvailability(
                toggle.dataset.id,
                !current
            );
        }
    }
);


// ============================================================
// EDIT MENU ITEM
// ============================================================

function openEditMenuItem(id) {

    const item =
        currentMenuItems.find(
            x => x.id === id
        );


    if (!item) {
        return;
    }


    editingMenuItemId.value =
        item.id;


    menuCategoryInput.value =
        item.category_id || "";


    menuItemNameInput.value =
        item.item_name || "";


    menuPriceInput.value =
        item.price || 0;


    menuTypeInput.value =
        item.item_type ||
        "other";


    menuDescriptionInput.value =
        item.description || "";


    menuImageInput.value =
        item.image_url || "";


    menuItemModalTitle.textContent =
        "Edit Menu Item";


    saveMenuItemBtn.textContent =
        "Update Item";


    menuItemModal.classList.add(
        "show"
    );
}


// ============================================================
// TOGGLE STOCK
// ============================================================

async function toggleMenuAvailability(
    itemId,
    available
) {

    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "admin_toggle_menu_item",
                {
                    p_session_token:
                        sessionToken,

                    p_item_id:
                        itemId,

                    p_available:
                        available
                }
            );


        if (error) {
            throw error;
        }


        showToast(
            data?.message ||
            "Updated"
        );


        await loadMenu();


    } catch (error) {

        showToast(
            error.message ||
            "Unable to update item"
        );
    }
}

// ============================================================
// LOAD STAFF
// ============================================================

async function loadStaff() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_get_staff",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Staff error:",
            error
        );

        showToast(
            error.message ||
            "Unable to load staff"
        );

        return;
    }


    currentStaff =
        data || [];


    renderStaff();
}


// ============================================================
// RENDER STAFF
// ============================================================

function renderStaff() {

    if (!currentStaff.length) {

        staffGrid.innerHTML = `
            <div
                class="empty"
                style="grid-column:1/-1;"
            >
                No staff accounts found.
            </div>
        `;

        return;
    }


    staffGrid.innerHTML =
        currentStaff
            .map(staff => {

                const isOwner =
                    staff.role === "owner";


                return `
                    <div
                        class="
                            staff-card
                            ${
                                !staff.is_active
                                ? "disabled"
                                : ""
                            }
                        "
                    >

                        <div class="staff-name">
                            ${escapeHtml(
                                staff.full_name
                            )}
                        </div>


                        <span class="staff-role">
                            ${formatStatus(
                                staff.role
                            )}
                        </span>


                        <div class="staff-email">
                            ${escapeHtml(
                                staff.email
                            )}
                        </div>


                        <div class="staff-phone">
                            ${
                                escapeHtml(
                                    staff.phone ||
                                    "No phone"
                                )
                            }
                        </div>


                        <div
                            class="
                                staff-status
                                ${
                                    staff.is_active
                                    ? "active"
                                    : "inactive"
                                }
                            "
                        >
                            ${
                                staff.is_active
                                ? "Active"
                                : "Inactive"
                            }
                        </div>


                        ${
                            !isOwner
                            ? `
                                <div class="staff-actions">

                                    <button
                                        class="edit-staff"
                                        data-id="${staff.id}"
                                    >
                                        Edit
                                    </button>


                                    <button
                                        class="reset-staff-password"
                                        data-id="${staff.id}"
                                    >
                                        Password
                                    </button>


                                    <button
                                        class="
                                            toggle-staff
                                            ${
                                                staff.is_active
                                                ? "disable-staff"
                                                : "enable-staff"
                                            }
                                        "
                                        data-id="${staff.id}"
                                        data-current="${staff.is_active}"
                                    >
                                        ${
                                            staff.is_active
                                            ? "Disable"
                                            : "Enable"
                                        }
                                    </button>

                                </div>
                            `
                            : ""
                        }

                    </div>
                `;
            })
            .join("");
}


// ============================================================
// ADD STAFF
// ============================================================

addStaffBtn?.addEventListener(
    "click",
    () => {

        editingStaffId.value = "";

        staffForm.reset();

        staffModalTitle.textContent =
            "Add Staff";

        staffPasswordField.style.display =
            "block";

        staffPasswordInput.required =
            true;

        saveStaffBtn.textContent =
            "Create Staff";

        staffRoleInput.value =
            "waiter";


        staffModal.classList.add(
            "show"
        );
    }
);


// ============================================================
// EDIT STAFF
// ============================================================

function openEditStaff(
    id
) {

    const staff =
        currentStaff.find(
            item =>
                item.id === id
        );


    if (!staff) {
        return;
    }


    editingStaffId.value =
        staff.id;


    staffNameInput.value =
        staff.full_name || "";


    staffEmailInput.value =
        staff.email || "";


    staffPhoneInput.value =
        staff.phone || "";


    staffRoleInput.value =
        staff.role;


    staffPasswordInput.value =
        "";


    staffPasswordInput.required =
        false;


    staffPasswordField.style.display =
        "none";


    staffModalTitle.textContent =
        "Edit Staff";


    saveStaffBtn.textContent =
        "Update Staff";


    staffModal.classList.add(
        "show"
    );
}


// ============================================================
// CLOSE STAFF
// ============================================================

function closeStaff() {

    staffModal.classList.remove(
        "show"
    );

    staffForm.reset();

    editingStaffId.value = "";
}


closeStaffModal?.addEventListener(
    "click",
    closeStaff
);


cancelStaffBtn?.addEventListener(
    "click",
    closeStaff
);


// ============================================================
// SAVE STAFF
// ============================================================

staffForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const id =
            editingStaffId.value;


        const name =
            staffNameInput.value.trim();


        const email =
            staffEmailInput.value
                .trim()
                .toLowerCase();


        const phone =
            staffPhoneInput.value.trim();


        const role =
            staffRoleInput.value;


        const password =
            staffPasswordInput.value;


        if (
            !name ||
            !email
        ) {

            showToast(
                "Enter name and email"
            );

            return;
        }


        if (
            !id &&
            password.length < 6
        ) {

            showToast(
                "Password minimum 6 characters"
            );

            return;
        }


        saveStaffBtn.disabled =
            true;


        try {

            let response;


            if (id) {

                response =
                    await db.rpc(
                        "admin_update_staff",
                        {
                            p_session_token:
                                sessionToken,

                            p_staff_id:
                                id,

                            p_full_name:
                                name,

                            p_email:
                                email,

                            p_phone:
                                phone,

                            p_role:
                                role
                        }
                    );

            } else {

                response =
                    await db.rpc(
                        "admin_add_staff",
                        {
                            p_session_token:
                                sessionToken,

                            p_full_name:
                                name,

                            p_email:
                                email,

                            p_phone:
                                phone,

                            p_password:
                                password,

                            p_role:
                                role
                        }
                    );
            }


            if (response.error) {
                throw response.error;
            }


            closeStaff();


            showToast(
                response.data?.message ||
                "Staff saved"
            );


            await loadStaff();


        } catch (error) {

            console.error(
                "Staff save error:",
                error
            );


            showToast(
                error.message ||
                "Unable to save staff"
            );


        } finally {

            saveStaffBtn.disabled =
                false;
        }
    }
);


// ============================================================
// STAFF CARD ACTIONS
// ============================================================

staffGrid?.addEventListener(
    "click",
    async event => {

        const edit =
            event.target.closest(
                ".edit-staff"
            );


        if (edit) {

            openEditStaff(
                edit.dataset.id
            );

            return;
        }


        const reset =
            event.target.closest(
                ".reset-staff-password"
            );


        if (reset) {

            resetPasswordStaffId.value =
                reset.dataset.id;

            newStaffPasswordInput.value =
                "";

            staffPasswordModal
                .classList.add(
                    "show"
                );

            return;
        }


        const toggle =
            event.target.closest(
                ".toggle-staff"
            );


        if (toggle) {

            const currentlyActive =
                toggle.dataset.current ===
                "true";


            await toggleStaff(
                toggle.dataset.id,
                !currentlyActive
            );
        }
    }
);


// ============================================================
// ENABLE / DISABLE STAFF
// ============================================================

async function toggleStaff(
    staffId,
    active
) {

    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "admin_toggle_staff",
                {
                    p_session_token:
                        sessionToken,

                    p_staff_id:
                        staffId,

                    p_active:
                        active
                }
            );


        if (error) {
            throw error;
        }


        showToast(
            data?.message ||
            "Staff updated"
        );


        await loadStaff();


    } catch (error) {

        showToast(
            error.message ||
            "Unable to update staff"
        );
    }
}


// ============================================================
// PASSWORD MODAL
// ============================================================

function closeStaffPassword() {

    staffPasswordModal.classList.remove(
        "show"
    );

    staffPasswordForm.reset();

    resetPasswordStaffId.value = "";
}


closeStaffPasswordModal?.addEventListener(
    "click",
    closeStaffPassword
);


cancelStaffPasswordBtn?.addEventListener(
    "click",
    closeStaffPassword
);


// ============================================================
// RESET PASSWORD
// ============================================================

staffPasswordForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const id =
            resetPasswordStaffId.value;


        const password =
            newStaffPasswordInput.value;


        if (
            !id ||
            password.length < 6
        ) {

            showToast(
                "Password minimum 6 characters"
            );

            return;
        }


        saveStaffPasswordBtn.disabled =
            true;


        try {

            const {
                data,
                error
            } =
                await db.rpc(
                    "admin_reset_staff_password",
                    {
                        p_session_token:
                            sessionToken,

                        p_staff_id:
                            id,

                        p_new_password:
                            password
                    }
                );


            if (error) {
                throw error;
            }


            closeStaffPassword();


            showToast(
                data?.message ||
                "Password reset"
            );


        } catch (error) {

            showToast(
                error.message ||
                "Unable to reset password"
            );


        } finally {

            saveStaffPasswordBtn.disabled =
                false;
        }
    }
);
// ============================================================
// LOAD ADMIN ORDERS
// ============================================================

async function loadAdminOrders() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_get_orders",
            {
                p_session_token:
                    sessionToken
            }
        );


    if (error) {

        console.error(
            "Admin orders error:",
            error
        );

        showToast(
            error.message ||
            "Unable to load orders"
        );

        return;
    }


    currentOrders =
        data || [];


    renderAdminOrders();
}


// ============================================================
// FILTER ORDERS
// ============================================================

orderFilterButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                currentOrderFilter =
                    button.dataset.orderFilter;


                orderFilterButtons.forEach(
                    btn =>
                        btn.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                renderAdminOrders();
            }
        );
    }
);


// ============================================================
// RENDER ORDERS
// ============================================================

function renderAdminOrders() {

    let orders =
        [...currentOrders];


    if (
        currentOrderFilter ===
        "active"
    ) {

        orders =
            orders.filter(
                order =>
                    ![
                        "paid",
                        "cancelled"
                    ].includes(
                        order.status
                    )
            );

    } else if (
        currentOrderFilter !==
        "all"
    ) {

        orders =
            orders.filter(
                order =>
                    order.status ===
                    currentOrderFilter
            );
    }


    if (!orders.length) {

        adminOrdersGrid.innerHTML = `
            <div
                class="empty"
                style="grid-column:1/-1;"
            >
                No orders found.
            </div>
        `;

        return;
    }


    adminOrdersGrid.innerHTML =
        orders
            .map(order => {

                return `
                    <div
                        class="admin-order-card"
                        data-order-id="${order.id}"
                    >

                        <div class="admin-order-head">

                            <div class="admin-order-bill">
                                Bill #${order.bill_number}
                            </div>

                            <div class="admin-order-total">
                                ${money(
                                    order.grand_total
                                )}
                            </div>

                        </div>


                        <div class="admin-order-table">
                            ${escapeHtml(
                                order.table_name
                            )}
                        </div>


                        <div class="admin-order-status">
                            ${formatStatus(
                                order.status
                            )}
                        </div>


                        <div class="admin-order-time">
                            ${new Date(
                                order.created_at
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </div>

                    </div>
                `;
            })
            .join("");
}


// ============================================================
// ORDER CARD CLICK
// ============================================================

adminOrdersGrid?.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                ".admin-order-card"
            );


        if (!card) {
            return;
        }


        openOrderDetails(
            card.dataset.orderId
        );
    }
);


// ============================================================
// OPEN ORDER DETAILS
// ============================================================

async function openOrderDetails(
    orderId
) {

    selectedOrderId =
        orderId;


    const {
        data,
        error
    } =
        await db.rpc(
            "admin_get_order_details",
            {
                p_session_token:
                    sessionToken,

                p_order_id:
                    orderId
            }
        );


    if (error) {

        showToast(
            error.message ||
            "Unable to load order"
        );

        return;
    }


    selectedOrderDetails =
        data;


    renderOrderDetails();


    orderDetailsModal.classList.add(
        "show"
    );
}


// ============================================================
// RENDER ORDER DETAILS
// ============================================================

function renderOrderDetails() {

    const order =
        selectedOrderDetails;


    if (!order) {
        return;
    }


    orderDetailsTitle.textContent =
        `Bill #${order.bill_number}`;


    orderDetailsTable.textContent =
        `${order.table_name} • ${formatStatus(order.status)}`;


    orderStatusSelect.value =
        order.status;


    const items =
        order.items || [];


    orderDetailsBody.innerHTML = `
        <div class="order-detail-items">

            ${
                items.length
                ? items
                    .map(item => {

                        const cancelled =
                            item.item_status ===
                            "cancelled";


                        return `
                            <div
                                class="
                                    order-detail-item
                                    ${
                                        cancelled
                                        ? "cancelled-order-item"
                                        : ""
                                    }
                                "
                            >

                                <div class="order-detail-item-top">

                                    <div class="order-detail-item-name">
                                        ${escapeHtml(
                                            item.item_name
                                        )}
                                        × ${item.quantity}
                                    </div>

                                    <div class="order-detail-item-price">
                                        ${money(
                                            item.line_total
                                        )}
                                    </div>

                                </div>


                                <div class="order-detail-item-meta">
                                    ${money(
                                        item.unit_price
                                    )}
                                    each
                                    •
                                    ${formatStatus(
                                        item.item_status
                                    )}
                                </div>


                                ${
                                    !cancelled
                                    &&
                                    ![
                                        "paid",
                                        "cancelled"
                                    ].includes(
                                        order.status
                                    )
                                    ? `
                                        <button
                                            class="cancel-item-btn"
                                            data-item-id="${item.id}"
                                        >
                                            Cancel Item
                                        </button>
                                    `
                                    : ""
                                }


                                ${
                                    cancelled &&
                                    item.cancel_reason
                                    ? `
                                        <div class="order-detail-item-meta">
                                            Reason:
                                            ${escapeHtml(
                                                item.cancel_reason
                                            )}
                                        </div>
                                    `
                                    : ""
                                }

                            </div>
                        `;
                    })
                    .join("")
                : `
                    <div class="empty">
                        No items.
                    </div>
                `
            }

        </div>


        <div class="order-detail-summary">

            <div class="order-summary-row">
                <span>Subtotal</span>
                <strong>
                    ${money(order.subtotal)}
                </strong>
            </div>

            <div class="order-summary-row">
                <span>Tax</span>
                <strong>
                    ${money(order.tax_amount)}
                </strong>
            </div>

            <div class="order-summary-row">
                <span>Service Charge</span>
                <strong>
                    ${money(order.service_charge)}
                </strong>
            </div>

            <div class="order-summary-row">
                <span>Discount</span>
                <strong>
                    - ${money(order.discount_amount)}
                </strong>
            </div>

            <div class="order-summary-row total">
                <span>Total</span>
                <span>
                    ${money(order.grand_total)}
                </span>
            </div>

        </div>
    `;
}


// ============================================================
// CANCEL ITEM
// ============================================================

orderDetailsBody?.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".cancel-item-btn"
            );


        if (!button) {
            return;
        }


        const reason =
            prompt(
                "Cancellation reason:"
            );


        if (reason === null) {
            return;
        }


        try {

            const {
                data,
                error
            } =
                await db.rpc(
                    "admin_cancel_order_item",
                    {
                        p_session_token:
                            sessionToken,

                        p_order_item_id:
                            button.dataset.itemId,

                        p_reason:
                            reason
                    }
                );


            if (error) {
                throw error;
            }


            showToast(
                data?.message ||
                "Item cancelled"
            );


            await Promise.all([
                loadAdminOrders(),
                refreshDashboard()
            ]);


            await openOrderDetails(
                selectedOrderId
            );


        } catch (error) {

            showToast(
                error.message ||
                "Unable to cancel item"
            );
        }
    }
);


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

updateOrderStatusBtn?.addEventListener(
    "click",
    async () => {

        if (!selectedOrderId) {
            return;
        }


        const status =
            orderStatusSelect.value;


        updateOrderStatusBtn.disabled =
            true;


        try {

            const {
                data,
                error
            } =
                await db.rpc(
                    "admin_update_order_status",
                    {
                        p_session_token:
                            sessionToken,

                        p_order_id:
                            selectedOrderId,

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


            closeOrderDetails();


            await Promise.all([
                loadAdminOrders(),
                refreshDashboard()
            ]);


        } catch (error) {

            showToast(
                error.message ||
                "Unable to update order"
            );


        } finally {

            updateOrderStatusBtn.disabled =
                false;
        }
    }
);


// ============================================================
// CLOSE ORDER DETAILS
// ============================================================

function closeOrderDetails() {

    orderDetailsModal.classList.remove(
        "show"
    );


    selectedOrderId =
        null;


    selectedOrderDetails =
        null;
}


closeOrderDetailsModal?.addEventListener(
    "click",
    closeOrderDetails
);


closeOrderBtn?.addEventListener(
    "click",
    closeOrderDetails
);


orderDetailsModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            orderDetailsModal
        ) {

            closeOrderDetails();
        }
    }
);

// ============================================================
// LOAD BILLING ORDERS
// ============================================================

async function loadBillingOrders() {

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


    currentBillingOrders =
        data || [];


    renderBillingOrders();
}


// ============================================================
// RENDER BILLING ORDERS
// ============================================================

function renderBillingOrders() {

    if (!currentBillingOrders.length) {

        billingGrid.innerHTML = `
            <div
                class="empty"
                style="grid-column:1/-1;"
            >
                No bill requests.
            </div>
        `;

        return;
    }


    billingGrid.innerHTML =
        currentBillingOrders
            .map(order => `
                <div
                    class="billing-card"
                    data-id="${order.id}"
                >

                    <div class="billing-card-top">

                        <div class="billing-card-table">
                            ${escapeHtml(
                                order.table_name
                            )}
                        </div>

                        <div class="billing-card-total">
                            ${money(
                                order.grand_total
                            )}
                        </div>

                    </div>


                    <div class="billing-card-bill">
                        Bill #${order.bill_number}
                    </div>


                    <div class="billing-card-status">
                        ${formatStatus(
                            order.status
                        )}
                    </div>

                </div>
            `)
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
            card.dataset.id
        );
    }
);


// ============================================================
// OPEN BILL
// ============================================================

async function openBill(
    orderId
) {

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


    selectedPaymentMethod =
        "cash";


    paymentMethodButtons.forEach(
        button =>
            button.classList.toggle(
                "active",
                button.dataset.method ===
                "cash"
            )
    );


    paymentReferenceInput.style.display =
        "none";

    paymentReferenceInput.value =
        "";


    renderBill();


    billingModal.classList.add(
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
        selectedBillData?.items || [];


    if (!order) {
        return;
    }


    billingTitle.textContent =
        `Bill #${order.bill_number}`;


    billingTableName.textContent =
        order.table_name;


    billDiscountInput.value =
        Number(
            order.discount_amount || 0
        );


    billTaxInput.value =
        Number(
            order.tax_amount || 0
        );


    billServiceInput.value =
        Number(
            order.service_charge || 0
        );


    billingItems.innerHTML = `
        <div class="bill-items">

            ${
                items
                    .map(item => `
                        <div class="bill-item">

                            <span>
                                ${escapeHtml(
                                    item.item_name
                                )}
                                × ${item.quantity}
                            </span>

                            <strong>
                                ${money(
                                    item.line_total
                                )}
                            </strong>

                        </div>
                    `)
                    .join("")
            }

        </div>
    `;


    renderBillSummary();
}


// ============================================================
// LIVE BILL CALCULATION
// ============================================================

function renderBillSummary() {

    const order =
        selectedBillData?.order;


    if (!order) {
        return;
    }


    const subtotal =
        Number(
            order.subtotal || 0
        );


    const discount =
        Number(
            billDiscountInput.value || 0
        );


    const tax =
        Number(
            billTaxInput.value || 0
        );


    const service =
        Number(
            billServiceInput.value || 0
        );


    const grand =
        Math.max(
            0,
            subtotal
            + tax
            + service
            - discount
        );


    billSummary.innerHTML = `

        <div class="bill-summary-row">
            <span>Subtotal</span>
            <strong>
                ${money(subtotal)}
            </strong>
        </div>

        <div class="bill-summary-row">
            <span>Tax</span>
            <strong>
                ${money(tax)}
            </strong>
        </div>

        <div class="bill-summary-row">
            <span>Service Charge</span>
            <strong>
                ${money(service)}
            </strong>
        </div>

        <div class="bill-summary-row">
            <span>Discount</span>
            <strong>
                - ${money(discount)}
            </strong>
        </div>

        <div class="bill-summary-row grand">
            <span>Grand Total</span>

            <span>
                ${money(grand)}
            </span>
        </div>
    `;
}


[
    billDiscountInput,
    billTaxInput,
    billServiceInput

].forEach(
    input => {

        input?.addEventListener(
            "input",
            renderBillSummary
        );
    }
);


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
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                paymentReferenceInput.style.display =
                    selectedPaymentMethod === "cash"
                        ? "none"
                        : "block";
            }
        );
    }
);


// ============================================================
// UPDATE BILL
// ============================================================

updateBillBtn?.addEventListener(
    "click",
    async () => {

        if (!selectedBillId) {
            return;
        }


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
                                billDiscountInput.value || 0
                            ),

                        p_tax:
                            Number(
                                billTaxInput.value || 0
                            ),

                        p_service_charge:
                            Number(
                                billServiceInput.value || 0
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


            await Promise.all([
                loadBillingOrders(),
                refreshDashboard()
            ]);


            await openBill(
                selectedBillId
            );


        } catch (error) {

            showToast(
                error.message ||
                "Unable to update bill"
            );
        }
    }
);


// ============================================================
// REOPEN ORDER
// ============================================================

reopenOrderBtn?.addEventListener(
    "click",
    async () => {

        if (!selectedBillId) {
            return;
        }


        const confirmed =
            confirm(
                "Reopen this order for more items?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const {
                data,
                error
            } =
                await db.rpc(
                    "admin_reopen_order",
                    {
                        p_session_token:
                            sessionToken,

                        p_order_id:
                            selectedBillId
                    }
                );


            if (error) {
                throw error;
            }


            showToast(
                data?.message ||
                "Order reopened"
            );


            closeBillModal();


            await Promise.all([
                loadBillingOrders(),
                loadAdminOrders(),
                refreshDashboard()
            ]);


        } catch (error) {

            showToast(
                error.message ||
                "Unable to reopen order"
            );
        }
    }
);


// ============================================================
// COMPLETE PAYMENT
// ============================================================

completePaymentBtn?.addEventListener(
    "click",
    async () => {

        if (!selectedBillId) {
            return;
        }


        // First save current discount/tax/service values.

        try {

            completePaymentBtn.disabled =
                true;


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
                                billDiscountInput.value || 0
                            ),

                        p_tax:
                            Number(
                                billTaxInput.value || 0
                            ),

                        p_service_charge:
                            Number(
                                billServiceInput.value || 0
                            )
                    }
                );


            if (updateResponse.error) {

                throw updateResponse.error;
            }


            const {
                data: paymentData,
                error: paymentError
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
                            paymentReferenceInput.value
                                .trim()
                    }
                );


            if (paymentError) {

                throw paymentError;
            }


            // Fetch receipt data before modal closes.

            const receiptData =
                selectedBillData;


            const finalDiscount =
                Number(
                    billDiscountInput.value || 0
                );

            const finalTax =
                Number(
                    billTaxInput.value || 0
                );

            const finalService =
                Number(
                    billServiceInput.value || 0
                );


            showToast(
                paymentData?.message ||
                "Payment completed"
            );


            closeBillModal();


            printReceipt(
                receiptData,
                {
                    discount:
                        finalDiscount,

                    tax:
                        finalTax,

                    service:
                        finalService,

                    paymentMethod:
                        selectedPaymentMethod
                }
            );


            await Promise.all([
                loadBillingOrders(),
                loadAdminOrders(),
                refreshDashboard()
            ]);


        } catch (error) {

            console.error(
                "Payment error:",
                error
            );


            showToast(
                error.message ||
                "Payment failed"
            );


        } finally {

            completePaymentBtn.disabled =
                false;
        }
    }
);


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
        billData?.restaurant || {};

    const items =
        billData?.items || [];


    if (!order) {
        return;
    }


    const subtotal =
        Number(
            order.subtotal || 0
        );


    const total =
        Math.max(
            0,
            subtotal
            + values.tax
            + values.service
            - values.discount
        );


    // ========================================================
    // TEMP LOGO
    // Later replace with your own logo image URL
    // ========================================================

    const LOGO_URL =
        "https://dummyimage.com/180x70/111827/ffffff&text=RESTAURANT";


    // ========================================================
    // TEMP QR
    // Later replace QR data with UPI / website / order page
    // ========================================================

    const qrText =
        encodeURIComponent(
            `Bill ${order.bill_number} - ${restaurant.name || "Restaurant"} - ₹${total.toFixed(2)}`
        );


    const QR_URL =
        `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrText}`;


    const rows =
        items
            .map(
                item => `
                    <tr>
                        <td class="item-name">
                            ${escapeHtml(
                                item.item_name
                            )}

                            <div class="item-small">
                                ${item.quantity}
                                ×
                                ₹${Number(
                                    item.unit_price
                                ).toFixed(2)}
                            </div>
                        </td>

                        <td class="amount">
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
                    font-family:
                        Arial,
                        sans-serif;

                    width: 72mm;

                    margin: 0 auto;

                    padding: 6mm 4mm;

                    color: #000;

                    background: white;

                    font-size: 11px;
                }


                .logo {
                    text-align: center;
                    margin-bottom: 6px;
                }

                .logo img {
                    max-width: 42mm;
                    max-height: 18mm;
                    object-fit: contain;
                }


                .restaurant-name {
                    font-size: 17px;
                    font-weight: 800;
                    text-align: center;
                    margin-top: 3px;
                }


                .center {
                    text-align: center;
                }


                .small {
                    font-size: 9px;
                    line-height: 1.5;
                }


                .line {
                    border-top:
                        1px dashed #000;

                    margin: 8px 0;
                }


                .bill-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px;

                    font-size: 10px;
                }


                .bill-info .right {
                    text-align: right;
                }


                table {
                    width: 100%;
                    border-collapse:
                        collapse;
                }


                th {
                    text-align: left;
                    padding: 4px 0;
                    font-size: 9px;
                    border-bottom:
                        1px solid #000;
                }


                td {
                    padding: 6px 0;
                    vertical-align: top;
                }


                .item-name {
                    width: 72%;
                    font-weight: 700;
                }


                .item-small {
                    font-weight: 400;
                    font-size: 9px;
                    margin-top: 2px;
                }


                .amount {
                    width: 28%;
                    text-align: right;
                    font-weight: 700;
                }


                .summary td {
                    padding: 3px 0;
                    font-size: 10px;
                }


                .summary .grand td {
                    padding-top: 7px;
                    font-size: 15px;
                    font-weight: 800;
                }


                .payment-box {
                    margin-top: 8px;

                    padding: 7px;

                    border:
                        1px solid #000;

                    border-radius: 5px;

                    font-size: 10px;
                }


                .qr-wrap {
                    text-align: center;
                    margin-top: 12px;
                }


                .qr-title {
                    font-weight: 700;
                    font-size: 10px;
                    margin-bottom: 5px;
                }


                .qr-wrap img {
                    width: 34mm;
                    height: 34mm;
                }


                .qr-small {
                    font-size: 8px;
                    margin-top: 4px;
                }


                .footer {
                    margin-top: 10px;

                    text-align: center;

                    font-size: 9px;

                    line-height: 1.5;
                }


                .powered {
                    margin-top: 8px;
                    font-size: 7px;
                    color: #555;
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

                    button {
                        display: none !important;
                    }

                }

            </style>

        </head>


        <body>


            <!-- LOGO -->

            <div class="logo">

                <img
                    src="${LOGO_URL}"
                    alt="Restaurant Logo"
                >

            </div>


            <!-- RESTAURANT -->

            <div class="restaurant-name">

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
                        Phone:
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


            <!-- BILL INFO -->

            <div class="bill-info">

                <div>
                    Bill:
                    <strong>
                        #${order.bill_number}
                    </strong>
                </div>


                <div class="right">

                    Table:
                    <strong>
                        ${escapeHtml(
                            order.table_name
                        )}
                    </strong>

                </div>


                <div>
                    ${new Date()
                        .toLocaleDateString(
                            "en-IN"
                        )}
                </div>


                <div class="right">
                    ${new Date()
                        .toLocaleTimeString(
                            "en-IN",
                            {
                                hour: "2-digit",
                                minute: "2-digit"
                            }
                        )}
                </div>

            </div>


            <div class="line"></div>


            <!-- ITEMS -->

            <table>

                <thead>

                    <tr>

                        <th>
                            Item
                        </th>

                        <th
                            style="text-align:right;"
                        >
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${rows}

                </tbody>

            </table>


            <div class="line"></div>


            <!-- BILL SUMMARY -->

            <table class="summary">

                <tr>

                    <td>
                        Subtotal
                    </td>

                    <td
                        style="text-align:right;"
                    >
                        ₹${subtotal.toFixed(2)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Tax
                    </td>

                    <td
                        style="text-align:right;"
                    >
                        ₹${Number(
                            values.tax
                        ).toFixed(2)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Service Charge
                    </td>

                    <td
                        style="text-align:right;"
                    >
                        ₹${Number(
                            values.service
                        ).toFixed(2)}
                    </td>

                </tr>


                <tr>

                    <td>
                        Discount
                    </td>

                    <td
                        style="text-align:right;"
                    >
                        -₹${Number(
                            values.discount
                        ).toFixed(2)}
                    </td>

                </tr>


                <tr class="grand">

                    <td>
                        TOTAL
                    </td>

                    <td
                        style="text-align:right;"
                    >
                        ₹${total.toFixed(2)}
                    </td>

                </tr>

            </table>


            <!-- PAYMENT -->

            <div class="payment-box">

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


            <!-- QR / SCANNER -->

            <div class="qr-wrap">

                <div class="qr-title">
                    Scan QR
                </div>


                <img
                    src="${QR_URL}"
                    alt="QR Code"
                >


                <div class="qr-small">
                    Scan for bill / payment details
                </div>

            </div>


            <div class="line"></div>


            <!-- FOOTER -->

            <div class="footer">

                ${escapeHtml(
                    restaurant.receipt_footer ||
                    "Thank you! Visit Again."
                )}


                <div class="powered">
                    Restaurant Billing System
                </div>

            </div>


            <script>

                window.onload =
                    function() {

                        setTimeout(
                            function() {

                                window.print();

                            },
                            500
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

function closeBillModal() {

    billingModal.classList.remove(
        "show"
    );


    selectedBillId =
        null;


    selectedBillData =
        null;
}


closeBillingModal?.addEventListener(
    "click",
    closeBillModal
);


billingModal?.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            billingModal
        ) {

            closeBillModal();
        }
    }
);

// ============================================================
// DEFAULT REPORT DATES
// ============================================================

function setupReportDates() {

    const today =
        new Date();


    const firstDay =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


    reportFrom =
        firstDay
            .toISOString()
            .slice(0,10);


    reportTo =
        today
            .toISOString()
            .slice(0,10);


    reportFromDate.value =
        reportFrom;


    reportToDate.value =
        reportTo;
}


// ============================================================
// LOAD REPORTS
// ============================================================

async function loadReports() {

    if (
        !reportFrom ||
        !reportTo
    ) {

        setupReportDates();
    }


    await Promise.all([
        loadSalesSummary(),
        loadTopItems(),
        loadWaiterReport(),
        loadOrderHistory()
    ]);
}


// ============================================================
// SUMMARY
// ============================================================

async function loadSalesSummary() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_sales_report",
            {
                p_session_token:
                    sessionToken,

                p_from_date:
                    reportFrom,

                p_to_date:
                    reportTo
            }
        );


    if (error) {

        console.error(
            "Report summary error:",
            error
        );

        return;
    }


    reportSales.textContent =
        money(
            data?.total_sales
        );


    reportPaidOrders.textContent =
        Number(
            data?.paid_orders || 0
        );


    reportCancelled.textContent =
        Number(
            data?.cancelled_orders || 0
        );


    reportAverage.textContent =
        money(
            data?.average_bill
        );


    reportCash.textContent =
        money(
            data?.payments?.cash
        );


    reportUpi.textContent =
        money(
            data?.payments?.upi
        );


    reportCard.textContent =
        money(
            data?.payments?.card
        );


    reportOther.textContent =
        money(
            data?.payments?.other
        );
}


// ============================================================
// TOP ITEMS
// ============================================================

async function loadTopItems() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_top_items",
            {
                p_session_token:
                    sessionToken,

                p_from_date:
                    reportFrom,

                p_to_date:
                    reportTo
            }
        );


    if (error) {

        console.error(
            "Top items error:",
            error
        );

        return;
    }


    if (!data?.length) {

        topItemsList.innerHTML = `
            <div class="empty">
                No sales data.
            </div>
        `;

        return;
    }


    topItemsList.innerHTML =
        data
            .map(item => `
                <div class="report-list-row">

                    <div>

                        <div class="report-list-main">
                            ${escapeHtml(
                                item.item_name
                            )}
                        </div>

                        <div class="report-list-sub">
                            ${item.total_quantity}
                            items sold
                        </div>

                    </div>

                    <div class="report-list-value">
                        ${money(
                            item.total_sales
                        )}
                    </div>

                </div>
            `)
            .join("");
}


// ============================================================
// WAITER REPORT
// ============================================================

async function loadWaiterReport() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_waiter_report",
            {
                p_session_token:
                    sessionToken,

                p_from_date:
                    reportFrom,

                p_to_date:
                    reportTo
            }
        );


    if (error) {

        console.error(
            "Waiter report error:",
            error
        );

        return;
    }


    if (!data?.length) {

        waiterReportList.innerHTML = `
            <div class="empty">
                No waiter data.
            </div>
        `;

        return;
    }


    waiterReportList.innerHTML =
        data
            .map(waiter => `
                <div class="report-list-row">

                    <div>

                        <div class="report-list-main">
                            ${escapeHtml(
                                waiter.waiter_name
                            )}
                        </div>

                        <div class="report-list-sub">
                            ${waiter.orders_count}
                            paid orders
                        </div>

                    </div>

                    <div class="report-list-value">
                        ${money(
                            waiter.total_sales
                        )}
                    </div>

                </div>
            `)
            .join("");
}


// ============================================================
// ORDER HISTORY
// ============================================================

async function loadOrderHistory() {

    const {
        data,
        error
    } =
        await db.rpc(
            "admin_order_history",
            {
                p_session_token:
                    sessionToken,

                p_from_date:
                    reportFrom,

                p_to_date:
                    reportTo
            }
        );


    if (error) {

        console.error(
            "History error:",
            error
        );

        return;
    }


    reportHistory =
        data || [];


    if (!reportHistory.length) {

        orderHistoryBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No completed bills.
                </td>
            </tr>
        `;

        return;
    }


    orderHistoryBody.innerHTML =
        reportHistory
            .map(order => `
                <tr>

                    <td>
                        #${order.bill_number}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.table_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            order.waiter_name
                        )}
                    </td>

                    <td>
                        ${formatStatus(
                            order.payment_method
                        )}
                    </td>

                    <td>
                        ${money(
                            order.grand_total
                        )}
                    </td>

                    <td>
                        ${
                            order.paid_at
                            ? new Date(
                                order.paid_at
                            ).toLocaleString(
                                "en-IN"
                            )
                            : "-"
                        }
                    </td>

                </tr>
            `)
            .join("");
}


// ============================================================
// APPLY FILTER
// ============================================================

applyReportFilter?.addEventListener(
    "click",
    async () => {

        const from =
            reportFromDate.value;


        const to =
            reportToDate.value;


        if (
            !from ||
            !to
        ) {

            showToast(
                "Select both dates"
            );

            return;
        }


        if (
            from > to
        ) {

            showToast(
                "From date cannot be after To date"
            );

            return;
        }


        reportFrom =
            from;


        reportTo =
            to;


        applyReportFilter.disabled =
            true;


        try {

            await loadReports();


            showToast(
                "Report updated"
            );


        } finally {

            applyReportFilter.disabled =
                false;
        }
    }
);