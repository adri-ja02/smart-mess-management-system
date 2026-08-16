const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const connectDB =
    require("./config/db");

const {
    startWaitlistJob,
} = require("./utils/waitlist.job");


dotenv.config();


// ===========================================================
// DATABASE
// ===========================================================

connectDB();


const app =
    express();


// ===========================================================
// MIDDLEWARE
// ===========================================================

app.use(
    cors()
);


app.use(
    express.json({
        limit:
            "15mb",
    })
);


app.use(
    express.urlencoded({
        extended:
            true,

        limit:
            "20mb",
    })
);


// ===========================================================
// STATIC UPLOADS
// ===========================================================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);


// ===========================================================
// ROUTES
// ===========================================================

const authRoutes =
    require("./routes/auth.routes");

const adminRoutes =
    require("./routes/admin.routes");

const profileRoutes =
    require("./routes/profile.routes");

const roomRoutes =
    require("./routes/room.routes");

const onboardingRoutes =
    require("./routes/onboarding.routes");

const spaceFitRoutes =
    require("./routes/spaceFit.routes");

const reservationRoutes =
    require("./routes/reservation.routes");

const analyticsRoutes =
    require("./routes/analytics.routes");

const waitlistRoutes =
    require("./routes/waitlist.routes");

const mealPlannerRoutes =
    require("./routes/mealPlanner.routes");

// FIX: this require + its app.use below were missing entirely — the whole
// QR check-in / consumption record feature (Sadia's Feature 2) had no
// mounted route, so every call from mealRecordService.js on the frontend
// (checkin/qr, checkin/manual, my-history, status/:mealMenuId, etc.) would
// 404 against the live server, regardless of how correct the controller
// logic itself was.
const mealRecordRoutes =
    require("./routes/meal.routes");


// ===========================================================
// API ROUTES
// ===========================================================

app.use(
    "/api/analytics",
    analyticsRoutes
);


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/admin",
    adminRoutes
);


app.use(
    "/api/profile",
    profileRoutes
);


app.use(
    "/api/rooms",
    roomRoutes
);


app.use(
    "/api/onboarding",
    onboardingRoutes
);


app.use(
    "/api/spacefit",
    spaceFitRoutes
);


app.use(
    "/api/reservations",
    reservationRoutes
);


app.use(
    "/api/waitlist",
    waitlistRoutes
);

app.use(
    "/api/meal-planner",
    mealPlannerRoutes
);

// FIX: newly mounted — matches the "/meal-records/..." paths already used
// throughout mealRecordService.js on the frontend.
app.use(
    "/api/meal-records",
    mealRecordRoutes
);


// ===========================================================
// TEST
// ===========================================================

app.get(
    "/",
    (req, res) => {

        res.send(
            "Smart Mess Management API is running..."
        );
    }
);


// ===========================================================
// START WAITLIST JOB
// ===========================================================

startWaitlistJob();


// ===========================================================
// SERVER
// ===========================================================

const PORT =
    process.env.PORT ||
    5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server is running on port ${PORT}`
        );
    }
);
