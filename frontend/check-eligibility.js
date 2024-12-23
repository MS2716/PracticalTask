async function checkEligibility() {
    const income = document.getElementById('userIncome').value;

    // Validate input
    if (!income || income < 0) {
        alert('Please enter a valid income greater than or equal to 0');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/eligible-plans', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ income })
        });

        const eligiblePlanList = document.getElementById('eligiblePlanList');
        eligiblePlanList.innerHTML = ''; // Clear previous results

        if (response.ok) {
            const plans = await response.json();

            if (plans.length === 0) {
                eligiblePlanList.innerHTML = '<li>No eligible plans found.</li>';
                return;
            }

            plans.forEach(plan => {
                const li = document.createElement('li');
                li.textContent = `${plan.name} - $${plan.price} (Single Plan)`;
                eligiblePlanList.appendChild(li);
            });

            // Reset the form field
            document.getElementById('userIncome').value = '';
        } else {
            console.error('Failed to fetch eligible plans');
            alert('Failed to fetch eligible plans. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching plans.');
    }
}

window.onload = function() {
    console.log('Page loaded successfully!');
};
