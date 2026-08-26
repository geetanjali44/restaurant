// ============================================================
// MOBILE COMMON
// BACK SWIPE + 2 SECOND SHIMMER
// ============================================================

(function () {

    // ========================================================
    // MOBILE CHECK
    // ========================================================

    const isMobile =
        window.matchMedia(
            "(max-width: 900px)"
        ).matches;


    if (!isMobile) {
        return;
    }


    // ========================================================
    // CONFIG
    // ========================================================

    const EDGE_AREA = 35;

    const BACK_DISTANCE = 85;

    const SHIMMER_TIME = 2000;


    // ========================================================
    // VARIABLES
    // ========================================================

    let startX = 0;

    let startY = 0;

    let trackingSwipe = false;

    let shimmerTimer = null;


    // ========================================================
    // CSS
    // ========================================================

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        /* ==================================================
           MOBILE SHIMMER
           ================================================== */

        #mobilePageLoader {

            position: fixed;

            inset: 0;

            z-index: 999999;

            background: #f6f7f9;

            padding:
                calc(
                    20px +
                    env(safe-area-inset-top)
                )
                16px
                calc(
                    20px +
                    env(safe-area-inset-bottom)
                );

            opacity: 1;

            visibility: visible;

            pointer-events: auto;

            transition:
                opacity .20s ease,
                visibility .20s ease;
        }


        #mobilePageLoader.hide {

            opacity: 0;

            visibility: hidden;

            pointer-events: none;
        }


        .mobile-shimmer-top {

            display: flex;

            align-items: center;

            gap: 12px;

            margin-bottom: 28px;
        }


        .mobile-shimmer-circle {

            width: 42px;

            height: 42px;

            flex-shrink: 0;

            border-radius: 13px;

            background: #e8eaed;
        }


        .mobile-shimmer-title {

            width: 145px;

            height: 17px;

            border-radius: 8px;

            background: #e8eaed;
        }


        .mobile-shimmer-line {

            height: 13px;

            margin-bottom: 10px;

            border-radius: 8px;

            background: #e8eaed;
        }


        .mobile-shimmer-line.big {

            width: 65%;

            height: 24px;

            margin-bottom: 18px;
        }


        .mobile-shimmer-line.medium {

            width: 46%;
        }


        .mobile-shimmer-line.small {

            width: 32%;
        }


        .mobile-shimmer-grid {

            display: grid;

            grid-template-columns:
                repeat(
                    2,
                    minmax(0,1fr)
                );

            gap: 10px;

            margin-top: 20px;
        }


        .mobile-shimmer-card {

            height: 105px;

            border-radius: 15px;

            background: #e8eaed;
        }


        .mobile-shimmer-panel {

            height: 170px;

            margin-top: 18px;

            border-radius: 16px;

            background: #e8eaed;
        }


        #mobilePageLoader
        .mobile-shimmer-circle,

        #mobilePageLoader
        .mobile-shimmer-title,

        #mobilePageLoader
        .mobile-shimmer-line,

        #mobilePageLoader
        .mobile-shimmer-card,

        #mobilePageLoader
        .mobile-shimmer-panel {

            position: relative;

            overflow: hidden;
        }


        #mobilePageLoader
        .mobile-shimmer-circle::after,

        #mobilePageLoader
        .mobile-shimmer-title::after,

        #mobilePageLoader
        .mobile-shimmer-line::after,

        #mobilePageLoader
        .mobile-shimmer-card::after,

        #mobilePageLoader
        .mobile-shimmer-panel::after {

            content: "";

            position: absolute;

            top: 0;

            bottom: 0;

            left: -120%;

            width: 120%;

            background:
                linear-gradient(
                    90deg,
                    transparent,
                    rgba(
                        255,
                        255,
                        255,
                        .82
                    ),
                    transparent
                );

            animation:
                mobileShimmerMove
                1.1s
                infinite;
        }


        @keyframes mobileShimmerMove {

            from {

                left: -120%;
            }

            to {

                left: 120%;
            }
        }


        /* ==================================================
           BACK SWIPE INDICATOR
           ================================================== */

        #mobileBackIndicator {

            position: fixed;

            top: 50%;

            left: 10px;

            z-index: 999998;

            width: 44px;

            height: 44px;

            display: grid;

            place-items: center;

            border-radius: 50%;

            background:
                rgba(
                    17,
                    24,
                    39,
                    .92
                );

            color: white;

            font-size: 24px;

            font-weight: 700;

            transform:
                translate(
                    -70px,
                    -50%
                );

            opacity: 0;

            pointer-events: none;

            transition:
                transform .16s ease,
                opacity .16s ease;
        }


        #mobileBackIndicator.show {

            transform:
                translate(
                    0,
                    -50%
                );

            opacity: 1;
        }

    `;


    document.head.appendChild(
        style
    );


    // ========================================================
    // CREATE SHIMMER
    // ========================================================

    function createLoader() {

        if (
            document.getElementById(
                "mobilePageLoader"
            )
        ) {

            return;
        }


        const loader =
            document.createElement(
                "div"
            );


        loader.id =
            "mobilePageLoader";


        loader.innerHTML = `

            <div class="mobile-shimmer-top">

                <div
                    class="mobile-shimmer-circle"
                ></div>

                <div
                    class="mobile-shimmer-title"
                ></div>

            </div>


            <div
                class="
                    mobile-shimmer-line
                    big
                "
            ></div>


            <div
                class="
                    mobile-shimmer-line
                    medium
                "
            ></div>


            <div
                class="
                    mobile-shimmer-line
                    small
                "
            ></div>


            <div class="mobile-shimmer-grid">

                <div
                    class="mobile-shimmer-card"
                ></div>

                <div
                    class="mobile-shimmer-card"
                ></div>

                <div
                    class="mobile-shimmer-card"
                ></div>

                <div
                    class="mobile-shimmer-card"
                ></div>

            </div>


            <div
                class="mobile-shimmer-panel"
            ></div>
        `;


        document.body.prepend(
            loader
        );
    }


    // ========================================================
    // CREATE BACK INDICATOR
    // ========================================================

    function createBackIndicator() {

        if (
            document.getElementById(
                "mobileBackIndicator"
            )
        ) {

            return;
        }


        const indicator =
            document.createElement(
                "div"
            );


        indicator.id =
            "mobileBackIndicator";


        indicator.textContent =
            "‹";


        document.body.appendChild(
            indicator
        );
    }


    // ========================================================
    // SHOW SHIMMER
    // ========================================================

    function showPageLoader(
        duration = SHIMMER_TIME
    ) {

        const loader =
            document.getElementById(
                "mobilePageLoader"
            );


        if (!loader) {
            return;
        }


        clearTimeout(
            shimmerTimer
        );


        loader.classList.remove(
            "hide"
        );


        shimmerTimer =
            setTimeout(
                () => {

                    loader.classList.add(
                        "hide"
                    );

                },
                duration
            );
    }


    // ========================================================
    // HIDE SHIMMER
    // ========================================================

    function hidePageLoader() {

        const loader =
            document.getElementById(
                "mobilePageLoader"
            );


        if (!loader) {
            return;
        }


        clearTimeout(
            shimmerTimer
        );


        loader.classList.add(
            "hide"
        );
    }


    // ========================================================
    // BACK INDICATOR
    // ========================================================

    function showBackIndicator() {

        document
            .getElementById(
                "mobileBackIndicator"
            )
            ?.classList.add(
                "show"
            );
    }


    function hideBackIndicator() {

        document
            .getElementById(
                "mobileBackIndicator"
            )
            ?.classList.remove(
                "show"
            );
    }


    // ========================================================
    // CLOSE SIDEBAR
    // ========================================================

    function closeSidebarIfOpen() {

        const sidebar =
            document.querySelector(
                ".sidebar.open"
            );


        if (!sidebar) {
            return false;
        }


        sidebar.classList.remove(
            "open"
        );


        document
            .getElementById(
                "sidebarOverlay"
            )
            ?.classList.remove(
                "show"
            );


        document.body.style.overflow =
            "";


        return true;
    }


    // ========================================================
    // CLOSE MODAL
    // ========================================================

    function closeModalIfOpen() {

        const modal =
            document.querySelector(
                ".modal.show"
            );


        if (!modal) {
            return false;
        }


        modal.classList.remove(
            "show"
        );


        document.body.style.overflow =
            "";


        return true;
    }


    // ========================================================
    // BACK
    // ========================================================

    function goBack() {

        if (
            closeSidebarIfOpen()
        ) {

            return;
        }


        if (
            closeModalIfOpen()
        ) {

            return;
        }


        if (
            window.history.length >
            1
        ) {

            showPageLoader(
                SHIMMER_TIME
            );


            setTimeout(
                () => {

                    window.history.back();

                },
                250
            );
        }
    }


    // ========================================================
    // SWIPE START
    // ========================================================

    document.addEventListener(
        "touchstart",
        event => {

            if (
                event.touches.length !==
                1
            ) {

                return;
            }


            const touch =
                event.touches[0];


            if (
                touch.clientX >
                EDGE_AREA
            ) {

                trackingSwipe =
                    false;

                return;
            }


            startX =
                touch.clientX;


            startY =
                touch.clientY;


            trackingSwipe =
                true;

        },
        {
            passive: true
        }
    );


    // ========================================================
    // SWIPE MOVE
    // ========================================================

    document.addEventListener(
        "touchmove",
        event => {

            if (
                !trackingSwipe
            ) {

                return;
            }


            const touch =
                event.touches[0];


            const distanceX =
                touch.clientX -
                startX;


            const distanceY =
                Math.abs(
                    touch.clientY -
                    startY
                );


            if (
                distanceY >
                65
            ) {

                trackingSwipe =
                    false;


                hideBackIndicator();


                return;
            }


            if (
                distanceX >
                30
            ) {

                showBackIndicator();
            }

        },
        {
            passive: true
        }
    );


    // ========================================================
    // SWIPE END
    // ========================================================

    document.addEventListener(
        "touchend",
        event => {

            if (
                !trackingSwipe
            ) {

                hideBackIndicator();

                return;
            }


            const touch =
                event.changedTouches[0];


            const distanceX =
                touch.clientX -
                startX;


            const distanceY =
                Math.abs(
                    touch.clientY -
                    startY
                );


            trackingSwipe =
                false;


            hideBackIndicator();


            if (
                distanceX >=
                    BACK_DISTANCE &&
                distanceY <
                    65
            ) {

                goBack();
            }

        },
        {
            passive: true
        }
    );


    // ========================================================
    // SIDEBAR SECTION CLICK
    // ========================================================

    document.addEventListener(
        "click",
        event => {

            const sectionBtn =
                event.target.closest(
                    ".nav button[data-section]"
                );


            if (!sectionBtn) {
                return;
            }


            showPageLoader(
                SHIMMER_TIME
            );

        }
    );


    // ========================================================
    // ANDROID WEBVIEW TOUCH SUPPORT
    // ========================================================

    document.addEventListener(
        "touchend",
        event => {

            const sectionBtn =
                event.target.closest(
                    ".nav button[data-section]"
                );


            if (!sectionBtn) {
                return;
            }


            showPageLoader(
                SHIMMER_TIME
            );

        },
        {
            passive: true
        }
    );


    // ========================================================
    // PAGE LINK NAVIGATION
    // ========================================================

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a[href]"
                );


            if (!link) {
                return;
            }


            const href =
                link.getAttribute(
                    "href"
                );


            if (
                !href ||
                href.startsWith(
                    "#"
                ) ||
                href.startsWith(
                    "javascript:"
                ) ||
                link.target ===
                    "_blank"
            ) {

                return;
            }


            showPageLoader(
                SHIMMER_TIME
            );

        }
    );


    // ========================================================
    // INIT
    // ========================================================

    function initMobileCommon() {

        createLoader();

        createBackIndicator();


        // App/page first open
        // SHOW SHIMMER FOR 2 SECONDS

        showPageLoader(
            SHIMMER_TIME
        );
    }


    // ========================================================
    // DOM READY
    // ========================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initMobileCommon
        );

    } else {

        initMobileCommon();
    }


    // ========================================================
    // HISTORY RETURN
    // ========================================================

    window.addEventListener(
        "pageshow",
        event => {

            if (
                event.persisted
            ) {

                showPageLoader(
                    SHIMMER_TIME
                );
            }
        }
    );


})();