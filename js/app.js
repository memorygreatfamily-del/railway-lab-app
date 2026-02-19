// Global Variables
let currentCategory = "";

document.addEventListener('DOMContentLoaded', () => {
    // 1. Get Category
    currentCategory = localStorage.getItem('selectedCategory');
    if (!currentCategory) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Set Title
    document.getElementById('pageTitle').innerText = `${currentCategory} Entry`;

    // 3. Populate Lists
    populateDatalist('zoneList', RAILWAY_ZONES);
    populateDatalist('divisionList', NWR_DIVISIONS);

    // 4. Toggle UI Layout
    setupFormLayout();
    // 5. SET DEFAULTS (New Requirement)
    const zoneInput = document.getElementById('railwayZone');
    const divInput = document.getElementById('division');
    
    // Set Default NWR
    zoneInput.value = "NWR";
    checkZone(); // Trigger logic to show division field
    
    // Set Default AII
    divInput.value = "AII (Ajmer)";
});

// --- HELPER: Populate Datalists ---
function populateDatalist(elementId, arrayData) {
    const dataList = document.getElementById(elementId);
    if(dataList) {
        dataList.innerHTML = "";
        arrayData.forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            dataList.appendChild(option);
        });
    }
}

// --- LOGIC: Handle NWR Division Visibility ---
function checkZone() {
    const zoneInput = document.getElementById('railwayZone').value.toUpperCase();
    const divGroup = document.getElementById('divisionGroup');
    const divInput = document.getElementById('division');

    if (zoneInput === 'NWR') {
        divGroup.classList.remove('hidden');
        divInput.setAttribute('required', 'true');
    } else {
        divGroup.classList.add('hidden');
        divInput.removeAttribute('required');
        divInput.value = ""; 
    }
}

// --- LOGIC: Layout Setup ---
function setupFormLayout() {
    const batchSection = document.getElementById('batch-section');
    const singleSection = document.getElementById('single-section');

    if (currentCategory === 'Water' || currentCategory === 'Diesel') {
        singleSection.classList.add('hidden');
        batchSection.classList.remove('hidden');
        setupBatchHeaders();
        addBatchRow();
    } else {
        batchSection.classList.add('hidden');
        singleSection.classList.remove('hidden');
    }
}

// --- LOGIC: Batch Entry System ---
function setupBatchHeaders() {
    const headerRow = document.getElementById('batchHeaderRow');
    headerRow.innerHTML = `<th>Lab No.</th>`; 

    if (currentCategory === 'Water') {
        headerRow.innerHTML += `
            <th>CHI Sample No.</th>
            <th>Source (Editable)</th>
            <th>Location (Editable)</th>
            <th>Action</th>
        `;
    } else if (currentCategory === 'Diesel') {
        headerRow.innerHTML += `
            <th>Storage Tank Details</th>
            <th>Date of Collection</th>
            <th>Sample Description</th>
            <th>Action</th>
        `;
    }
}

function addBatchRow() {
    const tbody = document.getElementById('batchTableBody');
    const row = document.createElement('tr');
    let specificCells = "";
    
    if (currentCategory === 'Water') {
        specificCells = `
            <td><input type="text" placeholder="CHI ID"></td>
            <td><input list="waterSources" placeholder="Select/Type"><datalist id="waterSources">${generateOptions(WATER_SOURCES)}</datalist></td>
            <td><input list="waterLocations" placeholder="Select/Type"><datalist id="waterLocations">${generateOptions(WATER_LOCATIONS)}</datalist></td>
        `;
    } else if (currentCategory === 'Diesel') {
        specificCells = `
            <td><input type="text" placeholder="Tank No/Loc"></td>
            <td><input type="date"></td>
            <td><input type="text" placeholder="Desc"></td>
        `;
    }

    row.innerHTML = `
        <td><input type="text" placeholder="Auto/Manual Key"></td>
        ${specificCells}
        <td style="text-align:center;">
            <button class="btn btn-danger" onclick="removeRow(this)"><i class="fas fa-trash"></i></button>
        </td>
    `;
    tbody.appendChild(row);
}

function removeRow(btn) {
    if (document.getElementById('batchTableBody').rows.length > 1) {
        btn.parentNode.parentNode.remove();
    } else {
        alert("At least one sample is required!");
    }
}

function generateOptions(arr) {
    return arr.map(item => `<option value="${item}">`).join('');
}


// --- LOGIC: Proceed to UI 3 (Data Entry) ---
function goToDataEntry() {
    const receivedDate = document.getElementById('receivedDate').value;
    const letterNo = document.getElementById('letterNo').value;
    const zone = document.getElementById('railwayZone').value;

    if (!receivedDate || !letterNo || !zone) {
        alert("Please fill all Compulsory Fields (*) in Master Details!");
        return;
    }

    // Capture Selected Tests (Decoupled Logic using data-attributes)
    const activeTestRows = document.querySelectorAll('.test-row');
    let selectedTests = [];

    activeTestRows.forEach(row => {
        const checkbox = row.querySelector('.toggle-checkbox');
        if (checkbox && checkbox.checked) {
            // Decode JSON from HTML
            const testString = decodeURIComponent(row.getAttribute('data-testobj'));
            const testObj = JSON.parse(testString);
            selectedTests.push(testObj);
        }
    });

    if (selectedTests.length === 0) {
        alert("Please ensure at least one test is loaded and selected!");
        return;
    }

    let sessionData = {
        meta: {
            category: currentCategory,
            receivedDate: receivedDate,
            letterNo: letterNo,
            sender: document.getElementById('sender').value,
            zone: zone,
            division: document.getElementById('division').value || "N/A"
        },
        samples: [],
        tests: selectedTests
    };

    if (currentCategory === 'Water' || currentCategory === 'Diesel') {
        const rows = document.querySelectorAll('#batchTableBody tr');
        rows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            const labNo = inputs[0].value;
            if(labNo) { 
                sessionData.samples.push({
                    id: index + 1,
                    labNo: labNo,
                    specific1: inputs[1]?.value || "", 
                    specific2: inputs[2]?.value || ""  
                });
            }
        });
        if (sessionData.samples.length === 0) { alert("Please add at least one sample!"); return; }
    } else {
        const labNo = document.getElementById('singleLabNo').value;
        if(!labNo) { alert("Please enter Lab No!"); return; }
        sessionData.samples.push({
            id: 1,
            labNo: labNo,
            desc: document.getElementById('singleDesc').value,
            poNo: document.getElementById('poNo').value
        });
    }

    console.log("Saving Session Data:", sessionData);
    localStorage.setItem('labSessionData', JSON.stringify(sessionData));
    window.location.href = 'test-entry.html'; // Assuming this page exists or will be created
}

// Expose functions globally
window.goToDataEntry = goToDataEntry;
window.addBatchRow = addBatchRow;
window.removeRow = removeRow;
window.checkZone = checkZone;