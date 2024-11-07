let calorieData = [];
let filteredData = [];
let cumulativeTotalCalories = 0;  // Global variable to keep track of total calories

fetch('calorie_data.json')
  .then(response => response.json())
  .then(data => {
    calorieData = data;
    filteredData = data;  // Initially, filteredData is the same as calorieData
    populateFoodItems();
  })
  .catch(error => console.error('Error loading calorie data:', error));

// Populate the dropdown with food items from filteredData
function populateFoodItems() {
  const foodSelect = document.getElementById('foodItem');
  foodSelect.innerHTML = '';  // Clear previous options

  filteredData.forEach(item => {
    const option = document.createElement('option');
    option.value = JSON.stringify(item);  // Store item data as JSON string
    option.text = item.item;
    foodSelect.add(option);
  });
  
  updateUnit();  // Set initial unit based on the first item in the filtered list
}

// Filter the food items based on the search input
function filterFoodItems() {
  const searchQuery = document.getElementById('searchFood').value.toLowerCase();
  filteredData = calorieData.filter(item => item.item.toLowerCase().includes(searchQuery));
  
  populateFoodItems();  // Re-populate dropdown with filtered results
}

// Update displayed unit based on selected food item
// Update displayed unit based on selected food item
function updateUnit() {
  const selectedFood = JSON.parse(document.getElementById('foodItem').value);
  document.getElementById('unitLabel').innerText = selectedFood.unit;  // Ensure this reflects the 'unit' in JSON
}

// Calculate calories for the current entry and add to cumulative total
function calculateCalories() {
  const quantity = document.getElementById('quantity').value;
  const selectedFood = JSON.parse(document.getElementById('foodItem').value);

  const totalCalories = quantity * selectedFood.caloriesPerUnit;
  document.getElementById('result').innerText = `Total Calories for This Entry: ${totalCalories}`;

  // Add to cumulative total and update the display
  cumulativeTotalCalories += totalCalories;
  document.getElementById('totalCalories').innerText = `Cumulative Total Calories: ${cumulativeTotalCalories}`;

  // Log the current entry to the list, including the unit
  logCalorieEntry(selectedFood.item, quantity, selectedFood.unit, totalCalories);
}

// Log each entry in a list format, including the unit
function logCalorieEntry(foodItem, quantity, unit, calories) {
  const calorieLog = document.getElementById('calorieLog');
  const logEntry = document.createElement('li');
  logEntry.innerText = `${foodItem} - Quantity: ${quantity} ${unit}, Calories: ${calories}`;
  calorieLog.appendChild(logEntry);
}