// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getDatabase, ref, get, set, push, update, remove } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global Variables
let calorieData = [];
let cumulativeTotalCalories = 0;

// Fetch Data from Firebase
const calorieDataRef = ref(db, 'calorieData');
get(calorieDataRef).then((snapshot) => {
  const data = snapshot.val();
  if (data) {
    calorieData = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
    window.filteredData = calorieData;
    populateFoodItems();
  } else {
    console.log('No data available in Firebase');
  }
}).catch((error) => {
  console.error('Error fetching data from Firebase:', error);
});

// Filter Food Items Based on Search Query
function filterFoodItems() {
  const searchQuery = document.getElementById('searchFood').value.toLowerCase();
  window.filteredData = calorieData.filter(item => item.item.toLowerCase().includes(searchQuery));
  populateFoodItems();
}

// Populate the Food Items Dropdown
function populateFoodItems() {
  const foodSelect = document.getElementById('foodItem');
  foodSelect.innerHTML = '';
  const dataToDisplay = window.filteredData.length ? window.filteredData : calorieData;

  dataToDisplay.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.text = item.item;
    option.dataset.caloriesPerUnit = item.caloriesPerUnit;
    option.dataset.unit = item.unit;
    foodSelect.add(option);
  });

  updateUnit();
}

// Update the Unit Label when a Food Item is Selected
function updateUnit() {
  const selectedFood = document.getElementById('foodItem').selectedOptions[0];
  if (selectedFood) {
    document.getElementById('unitLabel').innerText = selectedFood.dataset.unit;
    document.getElementById('foodName').value = selectedFood.text;
    document.getElementById('caloriesPerUnit').value = selectedFood.dataset.caloriesPerUnit;
    document.getElementById('unitDropdown').value = selectedFood.dataset.unit;
  }
}

// Calculate the Total Calories Based on the Quantity
function calculateCalories() {
  const quantity = document.getElementById('quantity').value;
  const selectedFood = document.getElementById('foodItem').selectedOptions[0];
  const totalCalories = quantity * selectedFood.dataset.caloriesPerUnit;

  document.getElementById('result').innerText = `Total Calories for This Entry: ${totalCalories}`;
  cumulativeTotalCalories += totalCalories;
  document.getElementById('totalCalories').innerText = `Cumulative Total Calories: ${cumulativeTotalCalories}`;

  logCalorieEntry(selectedFood.text, quantity, selectedFood.dataset.unit, totalCalories);
}

// Log the Calorie Entry
function logCalorieEntry(foodItem, quantity, unit, calories) {
  const calorieLog = document.getElementById('calorieLog');
  const logEntry = document.createElement('li');
  logEntry.innerText = `${foodItem} - Quantity: ${quantity} ${unit}, Calories: ${calories}`;
  calorieLog.appendChild(logEntry);
}

// Add New Food Item to Firebase
function addFood() {
  const foodName = document.getElementById('foodName').value;
  const caloriesPerUnit = parseInt(document.getElementById('caloriesPerUnit').value);
  const unit = document.getElementById('unitDropdown').value;

  const newFoodRef = push(calorieDataRef);
  set(newFoodRef, {
    item: foodName,
    caloriesPerUnit: caloriesPerUnit,
    unit: unit
  }).then(() => {
    alert("Food item added successfully!");
    window.location.reload();
  }).catch((error) => {
    console.error("Error adding food:", error);
  });
}

// Update Food Item in Firebase
function updateFood() {
  const foodNameToUpdate = document.getElementById('foodName').value;

  const itemToUpdate = calorieData.find(item => item.item.toLowerCase() === foodNameToUpdate.toLowerCase());

  if (itemToUpdate) {
    const foodName = document.getElementById('foodName').value;
    const caloriesPerUnit = parseInt(document.getElementById('caloriesPerUnit').value);
    const unit = document.getElementById('unitDropdown').value;

    const foodRef = ref(db, `calorieData/${itemToUpdate.id}`);
    update(foodRef, {
      item: foodName,
      caloriesPerUnit: caloriesPerUnit,
      unit: unit
    }).then(() => {
      alert("Food item updated successfully!");
      window.location.reload();
    }).catch((error) => {
      console.error("Error updating food:", error);
    });
  } else {
    alert("Food item not found!");
  }
}

// Delete Food Item from Firebase
function deleteFood() {
  const foodNameToDelete = document.getElementById('foodName').value;

  const itemToDelete = calorieData.find(item => item.item.toLowerCase() === foodNameToDelete.toLowerCase());

  if (itemToDelete) {
    const foodRef = ref(db, `calorieData/${itemToDelete.id}`);
    remove(foodRef).then(() => {
      alert("Food item deleted successfully!");
      window.location.reload();
    }).catch((error) => {
      console.error("Error deleting food:", error);
    });
  } else {
    alert("Food item not found!");
  }
}

// Event Listeners for DOM Content
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('searchFood').addEventListener('input', filterFoodItems);
  document.querySelector("button[type='button']").addEventListener("click", calculateCalories);
  document.getElementById('foodItem').addEventListener("change", updateUnit);
  document.getElementById('addFoodButton').addEventListener('click', addFood);
  document.getElementById('updateFoodButton').addEventListener('click', updateFood);
  document.getElementById('deleteFoodButton').addEventListener('click', deleteFood);
});
