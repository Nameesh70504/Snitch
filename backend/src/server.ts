import app from "./app/app.js";
import { connectToDB } from "./config/db.js";

connectToDB().then(() => {
    app.listen(3000, () => {
        console.log("server running on port http://localhost:3000");
    });
});
