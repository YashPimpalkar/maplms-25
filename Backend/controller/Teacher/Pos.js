import { connection as db} from "../../config/dbConfig.js"; 

export const showpos = (req, res) => {
    db.connect();
const branch=req.body.branch;
const sql="SELECT * FROM copo_POS WHERE BRANCH_id=?"
db.query(sql,branch,(error,result)=>{
    if (error){
        console.log(error);
        
        return res.status(500).json({ error: error.message });
    }
    
    return res.status(200).json(result)
})
}

export const editpos = (req, res) => {
    db.connect();
    const { po_id, po_name, po_body, branch } = req.body; // Include po_id
    console.log(branch);

    // Ensure all required data is provided
    if (!po_id || !po_name || !po_body || !branch) {
         // Check for po_id and branch
        return res.status(400).json({ message: "All fields are required." });
    }

    // SQL query to update the specific PO row
    const sql = `
        UPDATE copo_pos 
        SET po_name = ?, po_body = ? 
        WHERE po_id = ? AND branch_id = ?`;

    const values = [po_name, po_body, po_id, branch]; // Include po_id and ensure correct order
    console.log(values);

    // Execute the query
    db.query(sql, values, (error, result) => {
        if (error) {
            console.error("Error updating PO:", error);
            
            return res.status(500).json({ message: "Error updating PO." });
        }

        if (result.affectedRows === 0) {
            
            return res.status(404).json({ message: "PO not found or branch mismatch." });
        }
        
      return  res.status(200).json({ message: "PO updated successfully!" });
    });
};

export const savenewpos = (req,res) => {
    db.connect();
    const { po_id, po_name, po_body, branch } = req.body; // Include po_id
    console.log(branch);

    // Ensure all required data is provided
    if (!po_id || !po_name || !po_body || !branch) { 
        // Check for po_id and branch
        return res.status(400).json({ message: "All fields are required." });
    }
    
    const sql = `
        INSERT INTO copo_pos (po_id, po_name, po_body, created_time, branch_id)
        VALUES (?, ?, ?, NOW(), ?)`; // NOW() sets the current timestamp for created_time

    const values = [po_id, po_name, po_body, branch];
    console.log(values)

    // Execute the query
    db.query(sql, values, (error, result) => {
        if (error) {
            console.error("Error inserting PO:", error);
            
            return res.status(500).json({ message: "Error inserting PO." });
        }
        
       return res.status(201).json({ message: "PO added successfully!", id: result.insertId });
    });
};

export const deletepos = (req, res) => {
    db.connect();
    const { po_id, branch } = req.body; // Use req.body here

    // Ensure all required data is provided
    if (!po_id || !branch) {
        
        return res.status(400).json({ message: "PO ID and branch are required." });
    }
    console.log(po_id);
    console.log(branch);

    // SQL query to delete the specific PO row
    const sql = `
        DELETE FROM copo_pos 
        WHERE po_id = ? AND branch_id = ?`;

    const values = [po_id, branch]; // Use po_id and branch for identifying the row
    console.log(values);

    // Execute the query
    db.query(sql, values, (error, result) => {
        if (error) {
            
            console.error("Error deleting PO:", error);
            return res.status(500).json({ message: "Error deleting PO." });
        }

        if (result.affectedRows === 0) {
            
            return res.status(404).json({ message: "PO not found or branch mismatch." });
        }
        
     return   res.status(200).json({ message: "PO deleted successfully!" });
    });
};
