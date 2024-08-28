const apiUrl = 'http://localhost:4011/api';

// Fetch and display all price plans
async function fetchPricePlans() {
    try {
        const response = await fetch(`${apiUrl}/price_plans`);
        if (response.ok) {
            const pricePlans = await response.json();
            const plansList = document.getElementById('plans-list');
            const selectPlan = document.getElementById('selected-plan');

            if (plansList) {
                plansList.innerHTML = '';
            }

            if (selectPlan) {
                selectPlan.innerHTML = ''; // Clear existing options
            }

            pricePlans.forEach(plan => {
                const li = document.createElement('li');
                li.textContent = `${plan.plan_name}: Call Cost - R${plan.call_price}, SMS Cost - R${plan.sms_price}`;

                // Create a delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
                deleteButton.setAttribute('data-plan-id', plan.id);

                // Append the delete button to the list item
                li.appendChild(deleteButton);
                plansList.appendChild(li);

                // Add event listener to delete the plan
                deleteButton.addEventListener('click', function() {
                    deletePlan(plan.id);
                });

                // Create and append option to the select element
                const option = document.createElement('option');
                option.value = plan.plan_name;
                option.textContent = plan.plan_name;
                selectPlan.appendChild(option);
            });
        } else {
            console.error('Failed to fetch price plans:', response.status);
        }
    } catch (error) {
        console.error('Error fetching price plans:', error);
    }
}

// Create a new price plan
document.getElementById('create-plan-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('plan-name').value.trim();
    const callCost = parseFloat(document.getElementById('call-cost').value);
    const smsCost = parseFloat(document.getElementById('sms-cost').value);

    // Basic validation
    if (!name || isNaN(callCost) || isNaN(smsCost)) {
        alert('Please provide valid inputs for all fields.');
        return;
    }

    try {
        // Debug: Log the data being sent to the server
        console.log('Sending data:', { name, call_cost: callCost, sms_cost: smsCost });

        const response = await fetch(`${apiUrl}/price_plan/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                call_cost: callCost,
                sms_cost: smsCost
            })
        });

        if (response.ok) {
            alert('Price plan created successfully!');
            fetchPricePlans();
            document.getElementById('create-plan-form').reset();
        } else {
            const errorData = await response.json();
            console.error('Error creating price plan:', errorData);
            alert(`Failed to create price plan: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating price plan:', error);
        alert('An error occurred while creating the price plan.');
    }
});

// Delete a price plan
async function deletePlan(planId) {
    try {
        const response = await fetch(`${apiUrl}/price_plan/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: planId })
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message || 'Plan deleted successfully!');
            fetchPricePlans();  // Refresh the list after deletion
        } else {
            const errorData = await response.json();
            console.error('Error deleting price plan:', errorData);
            alert(`Failed to delete price plan: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting price plan:', error);
    }
}
document.getElementById('updatePricePlanForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting in the traditional way

    const data = {
        name: document.getElementById('name').value,
        call_cost: parseFloat(document.getElementById('call_cost').value),
        sms_cost: parseFloat(document.getElementById('sms_cost').value)
    };

    fetch('http://localhost:4011/api/price_plan/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        const messageElement = document.getElementById('message');
        if (data.message) {
            messageElement.className = 'message error';
            messageElement.textContent = data.message;
        } else {
            messageElement.className = 'message success';
            messageElement.textContent = `Price plan "${data.plan_name}" updated successfully! Call Cost: ${data.call_price}, SMS Cost: ${data.sms_price}`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const messageElement = document.getElementById('message');
        messageElement.className = 'message error';
        messageElement.textContent = 'An error occurred while updating the price plan.';
    });
});
// Calculate the total phone bill
document.getElementById('calculate-bill-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const pricePlan = document.getElementById('selected-plan').value;
    const actions = document.getElementById('actions').value.split(',').map(action => action.trim());

    try {
        const response = await fetch(`${apiUrl}/phonebill/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ price_plan: pricePlan, actions })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('API Response:', result);

            let totalAmount = result.total;

            if (typeof totalAmount === 'string') {
                totalAmount = totalAmount.replace(/[^\d.-]/g, '');
            }

            totalAmount = parseFloat(totalAmount);

            if (!isNaN(totalAmount)) {
                document.getElementById('total-bill').textContent = `Total Bill: R${totalAmount.toFixed(2)}`;
            } else {
                document.getElementById('total-bill').textContent = 'Total Bill: RInvalid';
                console.error('Invalid total value:', result.total);
            }
        } else {
            console.error('API Request failed with status:', response.status);
            document.getElementById('total-bill').textContent = 'Total Bill: Error calculating bill';
        }
    } catch (error) {
        console.error('Error calculating the bill:', error);
        document.getElementById('total-bill').textContent = 'Total Bill: Error calculating bill';
    }
});

// Initial load of price plans
document.addEventListener('DOMContentLoaded', function() {
    fetchPricePlans();
});
