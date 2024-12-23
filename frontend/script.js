let editingPlanId = null;
let editingComboPlanId = null;

async function fetchPlans() {
    try {
        const response = await fetch('http://localhost:3000/plans');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const plans = await response.json();
        const planList = document.getElementById('planList');
        const comboPlanOptions = document.getElementById('comboPlanOptions');
        planList.innerHTML = '';
        comboPlanOptions.innerHTML = '<option value="">Select Plan</option>'; // Default option
        
        plans.forEach(plan => {
            const planType = plan.type === 'plan' ? 'Single Plan' : 'Combo Plan';
            const li = document.createElement('li');
            li.innerHTML = `
                ${plan.name} - $${plan.price} (${planType})
                <div>
                    <button class="edit-btn" onclick="startEditPlan(${plan.id}, '${plan.name}', ${plan.price})">Edit</button>
                    <button class="delete-btn" onclick="deletePlan(${plan.id})">Delete</button>
                </div>
            `;
            planList.appendChild(li);

            // Only add single plans to the combo plan dropdown
            if (plan.type === 'plan') {
                const option = document.createElement('option');
                option.value = plan.id;
                option.textContent = `${plan.name} - $${plan.price}`;
                comboPlanOptions.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function fetchComboPlans() {
    try {
        const response = await fetch('http://localhost:3000/combo-plans');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const comboPlans = await response.json();
        const comboPlanList = document.getElementById('comboPlanList');
        comboPlanList.innerHTML = '';
        comboPlans.forEach(comboPlan => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${comboPlan.name} - $${comboPlan.price}
                <div>
                    <button class="edit-btn" onclick="startEditComboPlan(${comboPlan.id}, '${comboPlan.name}', ${comboPlan.price})">Edit</button>
                    <button class="delete-btn" onclick="deleteComboPlan(${comboPlan.id})">Delete</button>
                </div>
            `;
            comboPlanList.appendChild(li);
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
}


async function createPlan() {
    const name = document.getElementById('planName').value;
    const price = document.getElementById('planPrice').value;
    await fetch('http://localhost:3000/plans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, price })
    });
    fetchPlans();
}

async function createComboPlan() {
    const name = document.getElementById('comboPlanName').value;
    const price = parseFloat(document.getElementById('comboPlanPrice').value);
    const planId = document.getElementById('comboPlanOptions').value;

    // Fetch the selected plan to get its price
    const planResponse = await fetch(`http://localhost:3000/plans/${planId}`);
    if (!planResponse.ok) {
        throw new Error('Network response was not ok');
    }
    const plan = await planResponse.json();
    const totalPrice = plan.price + price;

    await fetch('http://localhost:3000/combo-plans', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, price: totalPrice, plans: [parseInt(planId)] }) // send selected plan ID
    });
    fetchComboPlans();
}

async function deletePlan(id) {
    await fetch(`http://localhost:3000/plans/${id}`, {
        method: 'DELETE'
    });
    fetchPlans();
}

async function deleteComboPlan(id) {
    await fetch(`http://localhost:3000/combo-plans/${id}`, {
        method: 'DELETE'
    });
    fetchComboPlans();
}

function startEditPlan(id, name, price) {
    editingPlanId = id;
    document.getElementById('editPlanName').value = name;
    document.getElementById('editPlanPrice').value = price;
    document.getElementById('edit-container').style.display = 'block';
}

async function updatePlan() {
    const name = document.getElementById('editPlanName').value;
    const price = document.getElementById('editPlanPrice').value;
    await fetch(`http://localhost:3000/plans/${editingPlanId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, price })
    });
    editingPlanId = null;
    document.getElementById('edit-container').style.display = 'none';
    fetchPlans();
}

function startEditComboPlan(id, name, price) {
    editingComboPlanId = id;
    document.getElementById('editComboPlanName').value = name;
    document.getElementById('editComboPlanPrice').value = price;
    document.getElementById('edit-combo-container').style.display = 'block';
}

async function updateComboPlan() {
    const name = document.getElementById('editComboPlanName').value;
    const price = document.getElementById('editComboPlanPrice').value;
    const planId = document.getElementById('comboPlanOptions').value;

    // Fetch the selected plan to get its price
    const planResponse = await fetch(`http://localhost:3000/plans/${planId}`);
    if (!planResponse.ok) {
        throw new Error('Network response was not ok');
    }
    const plan = await planResponse.json();
    const totalPrice = plan.price + price;

    await fetch(`http://localhost:3000/combo-plans/${editingComboPlanId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, price: totalPrice, plans: [parseInt(planId)] }) // send selected plan ID
    });
    editingComboPlanId = null;
    document.getElementById('edit-combo-container').style.display = 'none';
    fetchComboPlans();
}

function cancelEdit() {
    editingPlanId = null;
    editingComboPlanId = null;
    document.getElementById('edit-container').style.display = 'none';
    document.getElementById('edit-combo-container').style.display = 'none';
}


//Eligibility criteria

let editingCriterionId = null;

async function fetchEligibilityCriteria() {
    try {
        const response = await fetch('http://localhost:3000/eligibility-criteria');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const criteria = await response.json();
        const criteriaList = document.getElementById('criteriaList');
        criteriaList.innerHTML = '';
        criteria.forEach(criterion => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Name:</strong> ${criterion.name}<br>
                <strong>Age Less Than:</strong> ${criterion.age_less_than || 'N/A'}<br>
                <strong>Age Greater Than:</strong> ${criterion.age_greater_than || 'N/A'}<br>
                <strong>Last Login Days Ago:</strong> ${criterion.last_login_days_ago || 'N/A'}<br>
                <strong>Income Less Than:</strong> ${criterion.income_less_than || 'N/A'}<br>
                <strong>Income Greater Than:</strong> ${criterion.income_greater_than || 'N/A'}<br>
                <button class="edit-btn" onclick="startEditCriterion(${criterion.id}, '${criterion.name}', ${criterion.age_less_than}, ${criterion.age_greater_than}, ${criterion.last_login_days_ago}, ${criterion.income_less_than}, ${criterion.income_greater_than})">Edit</button>
                <button class="delete-btn" onclick="deleteCriterion(${criterion.id})">Delete</button>
            `;
            criteriaList.appendChild(li);
        });
    } catch (error) {
        console.error('Fetch error:', error);
    }
}


async function createEligibilityCriteria() {
    const name = document.getElementById('criteriaName').value;
    const age_less_than = document.getElementById('ageLessThan').value;
    const age_greater_than = document.getElementById('ageGreaterThan').value;
    const last_login_days_ago = document.getElementById('lastLoginDaysAgo').value;
    const income_less_than = document.getElementById('incomeLessThan').value;
    const income_greater_than = document.getElementById('incomeGreaterThan').value;

    await fetch('http://localhost:3000/eligibility-criteria', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than })
    });
    fetchEligibilityCriteria();
    resetForm();
}

async function deleteCriterion(id) {
    await fetch(`http://localhost:3000/eligibility-criteria/${id}`, {
        method: 'DELETE'
    });
    fetchEligibilityCriteria();
}

function startEditCriterion(id, name, age_less_than, age_greater_than, last_login_days_ago, income_less_than, income_greater_than) {
    editingCriterionId = id;
    document.getElementById('criteriaName').value = name;
    document.getElementById('ageLessThan').value = age_less_than || '';
    document.getElementById('ageGreaterThan').value = age_greater_than || '';
    document.getElementById('lastLoginDaysAgo').value = last_login_days_ago || '';
    document.getElementById('incomeLessThan').value = income_less_than || '';
    document.getElementById('incomeGreaterThan').value = income_greater_than || '';

    // Show the update and cancel buttons, hide the create button
    document.querySelector('button[onclick="createEligibilityCriteria()"]').style.display = 'none';
    document.querySelector('button[onclick="updateEligibilityCriteria()"]').style.display = 'block';
    document.querySelector('button[onclick="cancelEdit()"]').style.display = 'block';
}

async function updateEligibilityCriteria() {
    const name = document.getElementById('criteriaName').value;
    const age_less_than = document.getElementById('ageLessThan').value;
    const age_greater_than = document.getElementById('ageGreaterThan').value;
    const last_login_days_ago = document.getElementById('lastLoginDaysAgo').value;
    const income_less_than = document.getElementById('incomeLessThan').value;
    const income_greater_than = document.getElementById('incomeGreaterThan').value;

    await fetch(`http://localhost:3000/eligibility-criteria/${editingCriterionId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name, 
            age_less_than: age_less_than || null, 
            age_greater_than: age_greater_than || null, 
            last_login_days_ago: last_login_days_ago || null, 
            income_less_than: income_less_than || null, 
            income_greater_than: income_greater_than || null
        })
    });

    editingCriterionId = null;
    fetchEligibilityCriteria();
    resetForm();
}

function cancelEdit() {
    editingCriterionId = null;
    resetForm();
}

function resetForm() {
    document.getElementById('criteriaName').value = '';
    document.getElementById('ageLessThan').value = '';
    document.getElementById('ageGreaterThan').value = '';
    document.getElementById('lastLoginDaysAgo').value = '';
    document.getElementById('incomeLessThan').value = '';
    document.getElementById('incomeGreaterThan').value = '';

    // Show the create button, hide the update and cancel buttons
    document.querySelector('button[onclick="createEligibilityCriteria()"]').style.display = 'block';
    document.querySelector('button[onclick="updateEligibilityCriteria()"]').style.display = 'none';
    document.querySelector('button[onclick="cancelEdit()"]').style.display = 'none';
}

window.onload = function() {
    fetchPlans();
    fetchComboPlans();
    fetchEligibilityCriteria();
}


