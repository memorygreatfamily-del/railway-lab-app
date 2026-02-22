// js/standards.js
import { db, collection, addDoc, getDocs, query, where, updateDoc, doc, arrayUnion } from "./firebase-config.js";

// Global Variables
let currentTestsList = [];
let currentStdDocId = null;
let isCreatingNewStandard = false; 
let currentSearchResults = {};
// NEW: To store partial search results temporarily

// NEW: Track current mode (Local vs Firebase)
let currentModeIsLocal = false; 


// --- 1. SEARCH STANDARD (Updated for Partial Match & List) ---
async function searchStandard() {
    const searchInput = document.getElementById('stdSearch').value.toUpperCase().trim();
    const tableBody = document.getElementById('testTableBody');
    
    tableBody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Searching DB... <i class='fas fa-spinner fa-spin'></i></td></tr>";

    if (!searchInput) { alert("Enter Name!"); tableBody.innerHTML=""; return; }

    try {
        // 'where' हटा दिया है, अब पूरा कलेक्शन लाएंगे
        const q = collection(db, "standards_master");
        const querySnapshot = await getDocs(q);
        
        tableBody.innerHTML = ""; 
        currentSearchResults = {}; // पुराने रिज़ल्ट्स क्लियर करें
        let matchCount = 0;

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Client-side filtering: Check partial match
                if (data.std_name && data.std_name.toUpperCase().includes(searchInput)) {
                    currentSearchResults[doc.id] = data; // डेटा मेमोरी में स्टोर कर लिया
                    matchCount++;
                    
                    // टेबल में लिस्ट और Select बटन दिखाएँ
                    tableBody.innerHTML += `
                        <tr>
                            <td colspan="3" style="font-weight:bold; color:#0056b3;">${data.std_name}</td>
                            <td style="text-align: center;">
                                <button class="btn btn-sm btn-primary" onclick="window.selectStandard('${doc.id}')">Select</button>
                            </td>
                        </tr>
                    `;
                }
            });
        }

        if (matchCount > 0) {
            // लिस्ट दिखने पर Custom Test बटन और हरा चेकमार्क छिपा कर रखें
            document.getElementById('btnAddCustomTest').style.display = 'none';
            document.getElementById('standardInfo').style.display = 'none';
        } else {
            // Not Found कंडीशन
            currentStdDocId = null;
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; color:red;">
                        Standard Not Found.<br>
                        <button class="btn btn-sm btn-primary" style="margin-top:10px;" onclick="window.startNewStandardCreation('${searchInput}')">
                            Create New Standard & Save to DB
                        </button>
                    </td>
                </tr>`;
             document.getElementById('btnAddCustomTest').style.display = 'none';
             document.getElementById('standardInfo').style.display = 'none';
        }
    } catch (e) { console.error(e); alert("Database Error"); }
}

// --- NEW: SELECT STANDARD ACTION (Hybrid UI) ---
function selectStandard(docId) {
    const data = currentSearchResults[docId];
    if (!data) return;

    currentStdDocId = docId;
    currentTestsList = data.tests;
    
    // आपका ओरिजिनल UI: हरा चेकमार्क वाला बॉक्स चालू करें और उसमें नाम डालें
    document.getElementById('currentStdName').innerText = data.std_name;
    document.getElementById('standardInfo').style.display = 'block';

    // अब tests को टेबल में लोड कर दें
    displayTests(data.tests);

    // "Add to Existing" बटन दिखाएँ
    const btn = document.getElementById('btnAddCustomTest');
    btn.innerText = "+ Add New Test to this Standard (Update DB)";
    btn.style.display = 'block'; 
    btn.onclick = () => openCreationModal(data.std_name, false); 
}




// --- 2. DISPLAY TESTS ---
function displayTests(testsArray) {
    const tableBody = document.getElementById('testTableBody');
    tableBody.innerHTML = "";
    document.getElementById('btnAddCustomTest').style.display = 'block'; // Ensure button is visible

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

// --- 3. AUTO LOAD ---
function initAutoLoad() {
    const category = localStorage.getItem('selectedCategory');
    const searchBox = document.querySelector('.search-box');
    const customBtn = document.getElementById('btnAddCustomTest');

    if (category === 'Water') {
        searchBox.style.display = 'none';
        customBtn.innerText = "+ Add Temporary Test (Local Only)";
        customBtn.style.display = 'block';
        customBtn.onclick = () => openCreationModal("Custom", true); // True = Local Only
        loadPredefinedTests("IS 10500:2012 (Water)", window.STD_WATER);
    } 
    else if (category === 'Diesel') {
        searchBox.style.display = 'none';
        customBtn.innerText = "+ Add Temporary Test (Local Only)";
        customBtn.style.display = 'block';
        customBtn.onclick = () => openCreationModal("Custom", true);
        loadPredefinedTests("IS 1460 (Diesel)", window.STD_DIESEL);
    }
    else {
        searchBox.style.display = 'flex';
        customBtn.style.display = 'none';
    }
}

function loadPredefinedTests(stdName, testsArray) {
    document.getElementById('stdSearch').value = stdName;
    document.getElementById('currentStdName').innerText = stdName;
    document.getElementById('standardInfo').style.display = 'block';
    currentTestsList = testsArray;
    displayTests(currentTestsList);
}

// --- 4. START NEW STANDARD ---
function startNewStandardCreation(stdName) {
    document.getElementById('testTableBody').innerHTML = "<tr><td colspan='4' style='text-align:center;'>Adding tests...</td></tr>";
    isCreatingNewStandard = true;
    currentTestsList = []; 
    currentStdDocId = null;
    openCreationModal(stdName, false); // False = Save to DB
}

// --- 5. MODAL OPEN LOGIC ---
function openCreationModal(stdName, isLocalOnly) {
    // 1. Show Modal
    document.getElementById('stdModal').classList.remove('hidden');
    document.getElementById('modalStdName').value = stdName || "";
    
    // 2. Set Global Mode Variable (CRITICAL FIX)
    currentModeIsLocal = isLocalOnly;
    console.log("Modal Opened. Mode Local?", currentModeIsLocal);

    // 3. Clear Inputs
    document.getElementById('modalTestName').value = "";
    document.getElementById('modalTestMethod').value = "";
    document.getElementById('modalMin').value = "";
    document.getElementById('modalMax').value = "";
    toggleLimitInputs();
}

// --- 6. HANDLE SAVE CLICK (Triggered by Button) ---
async function handleSaveClick() {
    console.log("Save Clicked. Mode Local?", currentModeIsLocal);
    await saveTestLogic(currentModeIsLocal);
}

// Helper: Toggle Inputs
function toggleLimitInputs() {
    const type = document.getElementById('modalLimitType').value;
    const minGroup = document.getElementById('inputMinGroup');
    const maxGroup = document.getElementById('inputMaxGroup');
    
    minGroup.classList.add('hidden');
    maxGroup.classList.add('hidden');

    if (type === 'min') { minGroup.classList.remove('hidden'); }
    else if (type === 'max') { maxGroup.classList.remove('hidden'); }
    else if (type === 'range') { minGroup.classList.remove('hidden'); maxGroup.classList.remove('hidden'); }
}

// --- 7. CORE SAVE LOGIC ---
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

    // CASE A: Local Only (Water/Diesel)
    if (isLocalOnly) {
        currentTestsList.push(newTest);
        displayTests(currentTestsList);
        document.getElementById('stdModal').classList.add('hidden');
        return;
    }

    // CASE B: New Standard (Firebase)
    if (isCreatingNewStandard) {
        try {
            const docRef = await addDoc(collection(db, "standards_master"), {
                std_name: stdName,
                created_at: new Date(),
                tests: [newTest]
            });
            currentStdDocId = docRef.id;
            isCreatingNewStandard = false;
            alert("New Standard Created!");
            document.getElementById('stdSearch').value = stdName;
            searchStandard();
            document.getElementById('stdModal').classList.add('hidden');
        } catch (e) { console.error(e); alert("Error creating standard"); }
        return;
    }

    // CASE C: Existing Standard (Firebase)
    if (currentStdDocId) {
        try {
            const stdRef = doc(db, "standards_master", currentStdDocId);
            await updateDoc(stdRef, { tests: arrayUnion(newTest) });
            alert("Test Added!");
            searchStandard();
            document.getElementById('stdModal').classList.add('hidden');
        } catch (e) { console.error(e); alert("Error updating"); }
    }
}

// EXPORT
export { searchStandard, startNewStandardCreation, openCreationModal, toggleLimitInputs, initAutoLoad, handleSaveClick, selectStandard};
