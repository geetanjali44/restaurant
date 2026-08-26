// ============================================================
// RESTAURANT POS
// CUSTOM LOGIN - NO SUPABASE AUTH
// ============================================================


// ============================================================
// SUPABASE CONFIG
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
// ELEMENTS
// ============================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );

const emailInput =
    document.getElementById(
        "email"
    );

const passwordInput =
    document.getElementById(
        "password"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const loginBtnText =
    document.getElementById(
        "loginBtnText"
    );

const messageBox =
    document.getElementById(
        "message"
    );

const passwordToggle =
    document.getElementById(
        "passwordToggle"
    );

const sessionLoader =
    document.getElementById(
        "sessionLoader"
    );


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    text,
    type = "error"
) {

    if (!messageBox) {
        return;
    }

    messageBox.textContent =
        text;

    messageBox.className =
        `message ${type}`;
}


function clearMessage() {

    if (!messageBox) {
        return;
    }

    messageBox.textContent =
        "";

    messageBox.className =
        "message";
}


// ============================================================
// LOADING
// ============================================================

function setLoading(
    loading
) {

    if (!loginBtn) {
        return;
    }

    loginBtn.disabled =
        loading;

    if (loading) {

        loginBtn.classList.add(
            "loading"
        );

        loginBtnText.textContent =
            "Signing in...";

    } else {

        loginBtn.classList.remove(
            "loading"
        );

        loginBtnText.textContent =
            "Sign In";
    }
}


// ============================================================
// PASSWORD SHOW / HIDE
// ============================================================

passwordToggle?.addEventListener(
    "click",
    () => {

        const hidden =
            passwordInput.type ===
            "password";

        passwordInput.type =
            hidden
                ? "text"
                : "password";

        passwordToggle.textContent =
            hidden
                ? "Hide"
                : "Show";
    }
);


// ============================================================
// REDIRECT
// ============================================================

function redirectByRole(
    role
) {

    switch (role) {

        case "owner":
        case "admin":

            window.location.replace(
                "admin.html"
            );

            break;


        case "waiter":

            window.location.replace(
                "waiter.html"
            );

            break;


        case "cashier":

            window.location.replace(
                "cashier.html"
            );

            break;


        case "kitchen":

            window.location.replace(
                "kitchen.html"
            );

            break;


        default:

            showMessage(
                "Role is not configured."
            );

            setLoading(false);
    }
}


// ============================================================
// LOGIN
// ============================================================

loginForm?.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        clearMessage();


        const email =
            emailInput.value
                .trim()
                .toLowerCase();

        const password =
            passwordInput.value;


        if (
            !email ||
            !password
        ) {

            showMessage(
                "Enter email and password."
            );

            return;
        }


        setLoading(true);


        try {

            const {
                data,
                error
            } =
                await db.rpc(
                    "staff_login",
                    {
                        p_email:
                            email,

                        p_password:
                            password
                    }
                );


            console.log(
                "CUSTOM LOGIN:",
                data,
                error
            );


            if (error) {

                throw error;
            }


            const result =
                Array.isArray(data)
                    ? data[0]
                    : data;


            if (
                !result ||
                result.success !== true
            ) {

                showMessage(
                    result?.message ||
                    "Invalid email or password."
                );

                setLoading(false);

                return;
            }


            // Store custom session

            localStorage.setItem(
                "restaurant_session_token",
                result.session_token
            );


            localStorage.setItem(
                "restaurant_user",
                JSON.stringify({
                    id:
                        result.staff_id,

                    restaurant_id:
                        result.restaurant_id,

                    full_name:
                        result.full_name,

                    role:
                        result.role
                })
            );


            showMessage(
                "Login successful.",
                "success"
            );


            redirectByRole(
                result.role
            );


        } catch (error) {

            console.error(
                "CUSTOM LOGIN ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to login."
            );


            setLoading(false);
        }
    }
);


// ============================================================
// CHECK EXISTING CUSTOM SESSION
// ============================================================

async function checkSession() {

    const token =
        localStorage.getItem(
            "restaurant_session_token"
        );


    if (!token) {

        hideLoader();

        return;
    }


    try {

        const {
            data,
            error
        } =
            await db.rpc(
                "staff_me",
                {
                    p_session_token:
                        token
                }
            );


        if (error) {
            throw error;
        }


        const user =
            Array.isArray(data)
                ? data[0]
                : data;


        if (
            !user ||
            user.valid !== true
        ) {

            clearLocalSession();

            hideLoader();

            return;
        }


        localStorage.setItem(
            "restaurant_user",
            JSON.stringify({
                id:
                    user.staff_id,

                restaurant_id:
                    user.restaurant_id,

                full_name:
                    user.full_name,

                role:
                    user.role
            })
        );


        redirectByRole(
            user.role
        );


    } catch (error) {

        console.error(
            "SESSION CHECK ERROR:",
            error
        );

        clearLocalSession();

        hideLoader();
    }
}


// ============================================================
// CLEAR SESSION
// ============================================================

function clearLocalSession() {

    localStorage.removeItem(
        "restaurant_session_token"
    );

    localStorage.removeItem(
        "restaurant_user"
    );
}


// ============================================================
// HIDE LOADER
// ============================================================

function hideLoader() {

    if (!sessionLoader) {
        return;
    }


    sessionLoader.classList.add(
        "hide"
    );


    setTimeout(
        () => {

            sessionLoader.style.display =
                "none";

        },
        250
    );
}


// ============================================================
// START
// ============================================================

checkSession();