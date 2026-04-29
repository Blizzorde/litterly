import express from "express";
import pool from "../config/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC - get missions
// "in other words the R in CRUD" -nathan
router.get("/", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM missions");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Error fetching missions" });
    }
});


// ====PRIVATE:
// join mission
router.post("/join", authMiddleware, async (req, res) => {
    const { missionId } = req.body;
    const userId = req.session.user.id;

    try {
        await pool.query(
            "INSERT INTO mission_participants (user_id, mission_id) VALUES (?, ?)",
            [userId, missionId]
        );

        res.json({ message: "Joined mission" });
    } catch (err) {
        res.status(500).json({ message: "Error joining mission" });
    }
});


//need to have company acc - need to add middleware
//creating mission - 
router.post("/create", async (req, res) => {
    const { 
        title,
        description,
        location,
        mission_date,
        status,
        max_volunteers
     } = req.body;

     try {

        await pool.query(
            'INSERT INTO missions (title, description, location, mission_date, status, max_volunteers) VALUES (?, ?, ?, ?, ?, ?)',
            [
                title,
                description,
                location,
                mission_date,
                status,
                max_volunteers
            ]
        );

        res.json({
            message: "mission created"
        });
     } catch (err) {

        res.status(500).json({
            message: "Error creating mission"
        });
     }
});


//Updating mission
router.put("/:id", authMiddleware, async (req,res)=>{

    const missionId = req.params.id;

    const {
        title,
        description,
        location,
        mission_date,
        status,
        max_volunteers
    } = req.body;

    try{

        await pool.query(
        `UPDATE missions
         SET title=?,
             description=?,
             location=?,
             mission_date=?,
             status=?,
             max_volunteers=?
         WHERE id=?`,
         [
            title,
            description,
            location,
            mission_date,
            status,
            max_volunteers,
            missionId
         ]
        );

        res.json({
            message:"Mission updated"
        });

    }
    catch(err){

        res.status(500).json({
            message:"Error updating mission"
        });

    }

});


//Deleting mission, need to change to flag system 
router.delete("/:id", authMiddleware, async(req,res)=>{

    const missionId = req.params.id;

    try{

        await pool.query(
        "DELETE FROM missions WHERE id=?",
        [missionId]
        );

        res.json({
            message:"Mission deleted"
        });

    }
    catch(err){

        res.status(500).json({
            message:"Error deleting mission"
        });

    }

});


export default router;