const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
const db = new sqlite3.Database('./plans.db');

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());


db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS combo_plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS combo_plan_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            combo_plan_id INTEGER,
            plan_id INTEGER,
            FOREIGN KEY(combo_plan_id) REFERENCES combo_plans(id),
            FOREIGN KEY(plan_id) REFERENCES plans(id)
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS eligibility_criteria (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age_less_than INTEGER,
            age_greater_than INTEGER,
            last_login_days_ago INTEGER,
            income_less_than REAL,
            income_greater_than REAL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS plan_eligibility (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            plan_id INTEGER,
            eligibility_id INTEGER,
            FOREIGN KEY(plan_id) REFERENCES plans(id),
            FOREIGN KEY(eligibility_id) REFERENCES eligibility_criteria(id)
        )
    `);
});

// Fetch single plan to get its price
app.get('/plans/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM plans WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(row);
        }
    });
});

// Fetch all plans
app.get('/plans', (req, res) => {
    const sql = `
        SELECT p.id, p.name, p.price, 'plan' as type 
        FROM plans p
        UNION ALL
        SELECT cp.id, cp.name, cp.price, 'combo_plan' as type 
        FROM combo_plans cp
        ORDER BY id DESC
        LIMIT 10`;
        
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});


// Fetch all combo plans
app.get('/combo-plans', (req, res) => {
    db.all('SELECT * FROM combo_plans ORDER BY id DESC LIMIT 10', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

app.get('/combo-plans/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM combo_plans WHERE id = ?', id, (err, row) => {
        if (err) {
            res.status(500).send(err);
        } else {
            db.all('SELECT plan_id FROM combo_plan_relations WHERE combo_plan_id = ?', id, (err, planRows) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    const plans = planRows.map(row => row.plan_id);
                    res.json({ ...row, plans });
                }
            });
        }
    });
});

app.post('/plans', (req, res) => {
    const { name, price } = req.body;
    db.run('INSERT INTO plans (name, price) VALUES (?, ?)', [name, price], function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ id: this.lastID });
        }
    });
});

app.post('/combo-plans', (req, res) => {
    const { name, price, plans } = req.body;
    if (!plans || !Array.isArray(plans)) {
        return res.status(400).send('Invalid plans array');
    }
    
    db.run('INSERT INTO combo_plans (name, price) VALUES (?, ?)', [name, price], function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            const comboPlanId = this.lastID;
            const stmt = db.prepare('INSERT INTO combo_plan_relations (combo_plan_id, plan_id) VALUES (?, ?)');
            plans.forEach(planId => {
                stmt.run(comboPlanId, planId);
            });
            stmt.finalize();

            // Also insert the combo plan into the plans table
            db.run('INSERT INTO plans (name, price) VALUES (?, ?)', [name, price], function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.json({ id: comboPlanId });
                }
            });
        }
    });
});

app.put('/plans/:id', (req, res) => {
    const id = req.params.id;
    const { name, price } = req.body;
    db.run('UPDATE plans SET name = ?, price = ? WHERE id = ?', [name, price, id], function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

app.put('/combo-plans/:id', (req, res) => {
    const id = req.params.id;
    const { name, price, plans } = req.body;
    db.run('UPDATE combo_plans SET name = ?, price = ? WHERE id = ?', [name, price, id], function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            db.run('DELETE FROM combo_plan_relations WHERE combo_plan_id = ?', id, function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    const stmt = db.prepare('INSERT INTO combo_plan_relations (combo_plan_id, plan_id) VALUES (?, ?)');
                    plans.forEach(planId => {
                        stmt.run(id, planId);
                    });
                    stmt.finalize();
                    res.sendStatus(200);
                }
            });
        }
    });
});

app.delete('/plans/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM plans WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

app.delete('/combo-plans/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM combo_plan_relations WHERE combo_plan_id = ?', id, function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            db.run('DELETE FROM combo_plans WHERE id = ?', id, function (err) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
});

// Eligibility Criteria Endpoints
app.get('/eligibility-criteria', (req, res) => {
    db.all('SELECT * FROM eligibility_criteria ORDER BY id DESC', (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

// Create a new eligibility criterion
app.post('/eligibility-criteria', (req, res) => {
    const { name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than } = req.body;
    db.run(`
        INSERT INTO eligibility_criteria (name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than) 
        VALUES (?, ?, ?, ?, ?, ?)
    `, [name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than], function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// Update an existing eligibility criterion
app.put('/eligibility-criteria/:id', (req, res) => {
    const id = req.params.id;
    const { name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than } = req.body;
    db.run(`
        UPDATE eligibility_criteria SET name = ?, age_less_than = ?, age_greater_than = ?, last_login_days_ago = ?, income_less_than = ?, income_greater_than = ? 
        WHERE id = ?
    `, [name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than, id], function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

// Delete an eligibility criterion
app.delete('/eligibility-criteria/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM eligibility_criteria WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.sendStatus(200);
        }
    });
});

// Endpoint to fetch eligible plans for a user based on income
app.post('/eligible-plans', (req, res) => {
    const { income } = req.body;

    // Input validation
    if (income === undefined || income === null || isNaN(income) || income < 0) {
        return res.status(400).json({ error: 'Invalid income. Please provide a non-negative number.' });
    }

    const query = `
        SELECT p.id, p.name, p.price, 'plan' AS type
        FROM plans p
        WHERE p.price <= ?
        ORDER BY p.price ASC
    `;

    db.all(query, [income], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Failed to fetch eligible plans. Please try again later.' });
        }

        if (rows.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(rows);
    });
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
