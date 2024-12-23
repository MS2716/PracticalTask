const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./plans.db');

// Function to generate a random price between 10 and 1000
function getRandomPrice() {
    return (Math.random() * 990 + 10).toFixed(2);
}

// Function to generate a random plan name
function getRandomPlanName(index) {
    return `Plan ${index}`;
}

// Function to get random plan IDs
function getRandomPlanIds(totalPlans, numPlans) {
    const planIds = [];
    for (let i = 0; i < numPlans; i++) {
        const randomId = Math.floor(Math.random() * totalPlans) + 1;
        if (!planIds.includes(randomId)) {
            planIds.push(randomId);
        }
    }
    return planIds;
}

// Function to generate a random combo plan name
function getRandomComboPlanName(index) {
    return `Combo Plan ${index}`;
}

// Function to generate random criteria
function getRandomAgeLessThan() {
    return Math.floor(Math.random() * 100) + 1;
}

function getRandomAgeGreaterThan() {
    return Math.floor(Math.random() * 100);
}

function getRandomLastLoginDaysAgo() {
    return Math.floor(Math.random() * 365) + 1;
}

function getRandomIncomeLessThan() {
    return (Math.random() * 200000 + 10000).toFixed(2);
}

function getRandomIncomeGreaterThan() {
    return (Math.random() * 200000).toFixed(2);
}

// Function to generate a random eligibility name
function getRandomEligibilityName(index) {
    return `Eligibility ${index}`;
}

db.serialize(() => {
    // Delete all data from the tables
    db.run(`DELETE FROM plan_eligibility`);
    db.run(`DELETE FROM eligibility_criteria`);
    db.run(`DELETE FROM combo_plan_relations`);
    db.run(`DELETE FROM combo_plans`);
    db.run(`DELETE FROM plans`, () => {
        // Insert records into plans table
        const stmtPlans = db.prepare("INSERT INTO plans (name, price) VALUES (?, ?)");
        for (let i = 1; i <= 50000; i++) {
            stmtPlans.run(getRandomPlanName(i), getRandomPrice());
        }
        stmtPlans.finalize();

        // Get total number of plans for combo plans generation
        db.get('SELECT COUNT(*) as count FROM plans', (err, row) => {
            if (err) throw err;
            const totalPlans = row.count;

            // Insert records into combo_plans table
            const stmtComboPlans = db.prepare("INSERT INTO combo_plans (name, price) VALUES (?, ?)");
            const stmtComboPlanRelations = db.prepare("INSERT INTO combo_plan_relations (combo_plan_id, plan_id) VALUES (?, ?)");
            for (let i = 1; i <= 15000; i++) {
                const comboName = getRandomComboPlanName(i);
                const comboPrice = getRandomPrice();
                stmtComboPlans.run(comboName, comboPrice, function() {
                    const comboPlanId = this.lastID;
                    const planIds = getRandomPlanIds(totalPlans, Math.floor(Math.random() * 5) + 1); // Randomly select 1 to 5 plans
                    planIds.forEach(planId => {
                        stmtComboPlanRelations.run(comboPlanId, planId);
                    });
                });
            }
            stmtComboPlans.finalize(() => {
                stmtComboPlanRelations.finalize(() => { // Finalize after all operations
                    // Insert records into eligibility_criteria table
                    const stmtEligibility = db.prepare("INSERT INTO eligibility_criteria (name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than) VALUES (?, ?, ?, ?, ?, ?)");
                    for (let i = 1; i <= 15000; i++) {
                        stmtEligibility.run(
                            getRandomEligibilityName(i),
                            getRandomAgeLessThan(),
                            getRandomAgeGreaterThan(),
                            getRandomLastLoginDaysAgo(),
                            getRandomIncomeLessThan(),
                            getRandomIncomeGreaterThan()
                        );
                    }
                    stmtEligibility.finalize();
                    console.log('Inserted records into plans, combo_plans, and eligibility_criteria tables');

                    // Close the database after all operations are complete
                    db.close();
                });
            });
        });
    });
});

