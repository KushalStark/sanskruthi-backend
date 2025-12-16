import app from "./src/app.js";
import { pool } from "./src/config/db.js";

pool.query("SELECT 1")
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB error", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
