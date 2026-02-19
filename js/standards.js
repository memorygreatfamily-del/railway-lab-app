// js/standards.js
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, arrayUnion } from "./firebase-config.js";

// Global Variables
let currentTestsList = [];
let currentStdDocId = null; // To track if we are editing a Firebase Standard
let isCreatingNewStandard = false; // Flag to check if we are creating new or just adding test

// --- 1. SEARCH STANDARD (From Firebase) ---
async function searchStandard() {
    const searchInput = document.getElementById('stdSearch').value.toUpperCase().trim();
    const tableBody = document.getElementById('testTableBody');
    
    tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Searching DB... <i class='fas fa-spinner fa-spin'></i></td></tr>";

    if (!searchInput) { alert("Enter Name!"); tableBody.innerHTML=""; return; }

    try {
        const q = query(collection(db, "standards_master"), where("std_name", "==", searchInput));
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = ""; 

        if (!querySnapshot.empty) {
            // FOUND IN DB
            querySnapshot.forEach((doc) => {
                currentStdDocId = doc.id; // SAVE ID for updates
                const data = doc.data();
                currentTestsList = data.tests;
                displayTests(data.tests);
            });
            // Show "Add to Existing" Button
            document.getElementById('btnAddCustomTest').innerText = "+ Add New Test to this Standard (Update DB)";
            document.getElementById('btnAddCustomTest').onclick = () => openCreationModal(searchInput, false);
        } else {
            // NOT FOUND
            currentStdDocId = null;
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; color:red;">
                        Standard Not Found in Firebase.<br>
                        <button class="btn btn-sm btn-primary" style="margin-top:10px;" onclick="window.startNewStandardCreation('${searchInput}')">
                            Create New Standard & Save to DB
                        </button>
                    </td>
                </tr>`;
            // Hide custom add button until standard exists
             document.getElementById('btnAddCustomTest').style.display = 'none';
        }
    } catch (e) { console.error(e); alert("Database Error"); }
}

// --- 2. DISPLAY TESTS ---
function displayTests(testsArray) {
    const tableBody = document.getElementById('testTableBody');
    tableBody.innerHTML = "";

    // Show Custom Add Button again if hidden
    document.getElementById('btnAddCustomTest').style.display = 'block';

    testsArray.forEach((test) => {
        let specText = "";
        if(test.type === 'min') specText = `Min ${test.min}`;
        else if(test.type === 'max') specText = `Max ${test.max}`;
        else if(test.type === 'range') specText = `${test.min} - ${test.max}`;
        else if(test.type === 'text') specText = test.value;
        if(test.permissible_max) specText += ` (Permissible: ${test.permissible_max})`;

        const testString = encodeURIComponent(JSON.stringify(test));

        const row = `
            <tr class="test-row" data-testobj="${testString}">
                <td>${test.name}</td>
                <td>${test.method}</td>
                <td style="font-weight:bold; color:#555;">${specText}</td>
                <td style="text-align: center;">
                    <input type="checkbox" class="toggle-checkbox" checked>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// --- 3. AUTO LOAD (FIXED) ---
function initAutoLoad() {
    const category = localStorage.getItem('selectedCategory');
    const searchBox = document.querySelector('.search-box');
    const customBtn = document.getElementById('btnAddCustomTest');

    if (category === 'Water') {
        // HIDE Search Box for Water
        searchBox.style.display = 'none';
        customBtn.innerText = "+ Add Temporary Test (Local Only)";
        customBtn.onclick = () => openCreationModal("Custom", true); // True = Local Only
        loadPredefinedTests("IS 10500:2012 (Water)", window.STD_WATER);
    } 
    else if (category === 'Diesel') {
        // HIDE Search Box for Diesel
        searchBox.style.display = 'none';
        customBtn.innerText = "+ Add Temporary Test (Local Only)";
        customBtn.onclick = () => openCreationModal("Custom", true);
        loadPredefinedTests("IS 1460 (Diesel)", window.STD_DIESEL);
    }
    else {
        // SHOW Search Box for Lube/Grease
        searchBox.style.display = 'flex';
        customBtn.style.display = 'none'; // Hide until search result
    }
}

function loadPredefinedTests(stdName, testsArray) {
    document.getElementById('stdSearch').value = stdName;
    document.getElementById('currentStdName').innerText = stdName;
    document.getElementById('standardInfo').style.display = 'block';
    currentTestsList = testsArray;
    displayTests(currentTestsList);
}

// --- 4. NEW STANDARD CREATION FLOW ---
function startNewStandardCreation(stdName) {
    // Clear Table
    document.getElementById('testTableBody').innerHTML = "<tr><td colspan='4' style='text-align:center;'>Adding tests for new standard...</td></tr>";
    
    // Set Flag
    isCreatingNewStandard = true;
    currentTestsList = []; // Reset list
    currentStdDocId = null;

    // Open Modal to add first test
    openCreationModal(stdName, false);
}

// --- 5. MODAL LOGIC & SAVING ---
function openCreationModal(stdName, isLocalOnly) {
    document.getElementById('stdModal').classList.remove('hidden');
    document.getElementById('modalStdName').value = stdName || "";
    
    // Logic: If LocalOnly (Water/Diesel), we don't save to DB.
    // If not local, we save to DB.
    const btnSave = document.getElementById('btnSaveTest');
    
    // Clear Inputs
    document.getElementById('modalTestName').value = "";
    document.getElementById('modalTestMethod').value = "";
    document.getElementById('modalMin').value = "";
    document.getElementById('modalMax').value = "";
    toggleLimitInputs();

    btnSave.onclick = async function() {
        await saveTestLogic(isLocalOnly);
    };
}

// Toggle Inputs based on dropdown
function toggleLimitInputs() {
    const type = document.getElementById('modalLimitType').value;
    const minGroup = document.getElementById('inputMinGroup');
    const maxGroup = document.getElementById('inputMaxGroup');

    minGroup.classList.add('hidden');
    maxGroup.classList.add('hidden');

    if (type === 'min') {
        minGroup.classList.remove('hidden');
        minGroup.querySelector('label').innerText = "Minimum Value:";
    } else if (type === 'max') {
        maxGroup.classList.remove('hidden'); 
        minGroup.classList.add('hidden');
    } else if (type === 'range') {
        minGroup.classList.remove('hidden');
        minGroup.querySelector('label').innerText = "Min:";
        maxGroup.classList.remove('hidden');
        maxGroup.querySelector('label').innerText = "Max:";
    }
}

// --- CORE SAVE LOGIC ---
async function saveTestLogic(isLocalOnly) {
    const stdName = document.getElementById('modalStdName').value;
    const name = document.getElementById('modalTestName').value;
    const method = document.getElementById('modalTestMethod').value;
    const type = document.getElementById('modalLimitType').value;
    const minVal = document.getElementById('modalMin').value;
    const maxVal = document.getElementById('modalMax').value;

    if(!name) { alert("Test Name Required"); return; }

    const newTest = {
        name: name,
        method: method,
        type: type,
        min: minVal,
        max: maxVal
    };

    // CASE A: Water/Diesel (Local Only)
    if (isLocalOnly) {
        currentTestsList.push(newTest);
        displayTests(currentTestsList);
        document.getElementById('stdModal').classList.add('hidden');
        return;
    }

    // CASE B: Creating NEW Standard (First Test)
    if (isCreatingNewStandard) {
        try {
            const docRef = await addDoc(collection(db, "standards_master"), {
                std_name: stdName,
                created_at: new Date(),
                tests: [newTest] // Start with 1 test
            });
            currentStdDocId = docRef.id;
            isCreatingNewStandard = false; // Now it exists
            alert("New Standard Created & Test Saved!");
            
            // Reload from DB to ensure sync
            document.getElementById('stdSearch').value = stdName;
            searchStandard();
            document.getElementById('stdModal').classList.add('hidden');
        } catch (e) { console.error(e); alert("Error creating standard"); }
        return;
    }

    // CASE C: Adding to EXISTING Standard
    if (currentStdDocId) {
        try {
            const stdRef = doc(db, "standards_master", currentStdDocId);
            await updateDoc(stdRef, {
                tests: arrayUnion(newTest)
            });
            alert("Test Added to Database!");
            
            // Reload
            const currentName = document.getElementById('stdSearch').value;
            searchStandard();
            document.getElementById('stdModal').classList.add('hidden');
        } catch (e) { console.error(e); alert("Error updating standard"); }
    }
}

// Export
export { searchStandard, startNewStandardCreation, openCreationModal, toggleLimitInputs, initAutoLoad };