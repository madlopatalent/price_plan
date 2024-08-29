import express from 'express';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import { totalPhoneBill } from './totalPhoneBill.js';
import cors from 'cors';


const app = express();
app.use(cors());


// Middleware to parse JSON requests
app.use(express.json());
app.use(express.static('public'));

const db = await sqlite.open({
  filename: './data_plan.db',  
  driver: sqlite3.Database
});
await db.migrate();

app.post('/api/phonebill/', async (req, res) => {
  const { price_plan, actions } = req.body;
  
  const { sms_price, call_price } = await db.get(`select * from price_plan where plan_name = $1`, [price_plan]);
  const total = totalPhoneBill(actions, sms_price, call_price);
  return res.status(200).json({ total })

})

app.get('/api/price_plans/', async (req, res) => {
  try {

    const pricePlans = await db.all('SELECT * FROM price_plan');


    if (pricePlans.length === 0) {
      return res.status(404).json({ message: 'No price plans found' });
    }


    return res.status(200).json(pricePlans);
  } catch (error) {
  
    console.error('Error fetching price plans:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/price_plan/create', async (req, res) => {
  const { name, call_cost, sms_cost } = req.body;

  if (!name || typeof call_cost !== 'number' || typeof sms_cost !== 'number') {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
 
    const result = await db.run(
      `INSERT INTO price_plan (plan_name, call_price, sms_price) VALUES ($1, $2, $3)`,
      [name, call_cost, sms_cost]
    );

    return res.status(201).json({
      id: result.lastID, 
      plan_name: name,
      call_price: call_cost,
      sms_price: sms_cost
    });
  } catch (error) {
  
    console.error('Error creating price plan:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/api/price_plan/update', async (req, res) => {
  console.log(req.body);  
  const { name, call_cost, sms_cost } = req.body;

  // Validate the input
  if (!name || typeof call_cost !== 'number' || typeof sms_cost !== 'number') {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {

    const result = await db.run(
      `UPDATE price_plan SET call_price = ?, sms_price = ? WHERE plan_name = ?`,
      [call_cost, sms_cost, name]
    );

 
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Price plan not found' });
    }


    return res.status(200).json({
      plan_name: name,
      call_price: call_cost,
      sms_price: sms_cost
    });
  } catch (error) {
   
    console.error('Error updating price plan:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/api/price_plan/delete', async (req, res) => {
  const { id } = req.body;

  
  if (typeof id !== 'number') {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
 
    const result = await db.run(
      `DELETE FROM price_plan WHERE id = ?`,
      [id]
    );

 
    if (result.changes === 0) {
      return res.status(404).json({ message: 'Price plan not found' });
    }

    return res.status(200).json({ message: 'Price plan deleted successfully' });
  } catch (error) {
 
    console.error('Error deleting price plan:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Start the server
const PORT = process.env.PORT || 4011;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
