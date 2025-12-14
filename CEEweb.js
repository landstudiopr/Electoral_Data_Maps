// --- CONFIGURATION ---
const BASE_URL = "https://elecciones2024.ceepur.org/Escrutinio_General_123/data/";
const FILENAME = "Puerto_Rico_2024_Complete_Units_JAVAA.csv";

// Master List of Precincts
const PRECINCTS = [
    "AXU_SAN_JUAN_001","AXU_SAN_JUAN_002","AXU_SAN_JUAN_003","AXU_SAN_JUAN_004","AXU_SAN_JUAN_005",
    "AXU_GUAYNABO_006","AXU_GUAYNABO_007","AXU_CATANO_008","AXU_CATANO_009","AXU_BAYAMON_010",
    "AXU_BAYAMON_011","AXU_BAYAMON_012","AXU_TOA_ALTA_013","AXU_TOA_BAJA_014","AXU_DORADO_015",
    "AXU_VEGA_ALTA_016","AXU_VEGA_ALTA_017","AXU_VEGA_BAJA_018","AXU_VEGA_BAJA_019","AXU_MOROVIS_020",
    "AXU_MANATI_021","AXU_MANATI_022","AXU_CIALES_023","AXU_FLORIDA_024","AXU_BARCELONETA_025",
    "AXU_ARECIBO_026","AXU_ARECIBO_027","AXU_HATILLO_028","AXU_HATILLO_029","AXU_CAMUY_030",
    "AXU_QUEBRADILLAS_031","AXU_ISABELA_032","AXU_SAN_SEBASTIAN_033","AXU_LAS_MARIAS_034","AXU_AGUADILLA_035",
    "AXU_MOCA_036","AXU_MOCA_037","AXU_AGUADA_038","AXU_RINCON_039","AXU_ANASCO_040","AXU_BAYAMON_041",
    "AXU_MAYAGUEZ_042","AXU_SAN_GERMAN_043","AXU_SAN_GERMAN_044","AXU_HORMIGUEROS_045","AXU_CABO_ROJO_046",
    "AXU_LAJAS_047","AXU_GUANICA_048","AXU_SABANA_GRANDE_049","AXU_MARICAO_050","AXU_YAUCO_051",
    "AXU_YAUCO_052","AXU_LARES_053","AXU_UTUADO_054","AXU_ADJUNTAS_055","AXU_JAYUYA_056",
    "AXU_JAYUYA_057","AXU_GUAYANILLA_058","AXU_PENUELAS_059","AXU_PONCE_060","AXU_PONCE_061",
    "AXU_PONCE_062","AXU_JUANA_DIAZ_063","AXU_JUANA_DIAZ_064","AXU_VILLALBA_065","AXU_OROCOVIS_066",
    "AXU_SANTA_ISABEL_067","AXU_COAMO_068","AXU_AIBONITO_069","AXU_BARRANQUITAS_070","AXU_BARRANQUITAS_071",
    "AXU_COROZAL_072","AXU_NARANJITO_073","AXU_COMERIO_074","AXU_COAMO_075","AXU_CIDRA_076",
    "AXU_CAYEY_077","AXU_SALINAS_078","AXU_GUAYAMA_079","AXU_ARROYO_080","AXU_AGUAS_BUENAS_081",
    "AXU_CAGUAS_082","AXU_CAGUAS_083","AXU_GURABO_084","AXU_AGUADILLA_085","AXU_SAN_LORENZO_086",
    "AXU_SAN_LORENZO_087","AXU_JUNCOS_088","AXU_LAS_PIEDRAS_089","AXU_LAS_PIEDRAS_090","AXU_PATILLAS_091",
    "AXU_MAUNABO_092","AXU_YABUCOA_093","AXU_HUMACAO_094","AXU_NAGUABO_095","AXU_VIEQUES_096",
    "AXU_CULEBRA_097","AXU_CEIBA_098","AXU_FAJARDO_099","AXU_LUQUILLO_100","AXU_RIO_GRANDE_101",
    "AXU_RIO_GRANDE_102","AXU_LOIZA_103","AXU_CANOVANAS_104","AXU_CANOVANAS_105","AXU_CAROLINA_106",
    "AXU_CAROLINA_107","AXU_CAROLINA_108","AXU_TRUJILLO_ALTO_109","AXU_TRUJILLO_ALTO_110","AXU_ADJUNTAS_111",
    "AXU_COROZAL_112","AXU_SANTA_ISABEL_113","AXU_GURABO_114"
];

// Special JAVAA / Added Hand-Tally Range
const SPECIAL_RANGE_START = 72;
const SPECIAL_RANGE_END = 80; // Typically 72-78, going to 80 to be safe

// Initialize CSV
let csvContent = "Precinct_Code,Precinct_Name,Unit_ID,Ballot_Type,Position,Party,Candidate,Votes\n";
const delay = ms => new Promise(res => setTimeout(res, ms));

function parseXML(xmlText, precinctCode, unitID) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    const nameTag = xmlDoc.querySelector("subtitleline1 NAME");
    const precinctName = nameTag ? nameTag.textContent.trim() : precinctCode;

    const sections = xmlDoc.querySelectorAll("section");
    sections.forEach(section => {
        const ballotNameEs = section.querySelector("ballot name es");
        if (!ballotNameEs) return;
        const ballotType = ballotNameEs.textContent.trim();

        const tables = section.querySelectorAll("table");
        tables.forEach(table => {
            const positionNameEs = table.querySelector("name es");
            if (!positionNameEs) return;
            const position = positionNameEs.textContent.trim();

            const columns = table.querySelectorAll("column");
            columns.forEach(col => {
                const party = col.getAttribute("name");
                const options = col.querySelectorAll("option");
                options.forEach(opt => {
                    const candidate = opt.querySelector("voinit")?.textContent || "Unknown";
                    const votes = opt.querySelector("votes")?.textContent || "0";
                    
                    const row = [
                        precinctCode,
                        `"${precinctName}"`,
                        unitID,
                        `"${ballotType}"`,
                        `"${position}"`,
                        party,
                        candidate,
                        votes
                    ].join(",");
                    csvContent += row + "\n";
                });
            });
        });
    });
}

async function startMining() {
    console.log("🚀 STARTING GAP-JUMPER MINER (Standard 1..N + JAVAA 72..80)...");
    
    for (let i = 0; i < PRECINCTS.length; i++) {
        const pCode = PRECINCTS[i];
        console.log(`\n📂 Precinct ${i+1}/${PRECINCTS.length}: ${pCode}`);

        // --- PHASE 1: STANDARD SEQUENTIAL SCAN (1, 2, 3...) ---
        let unitID = 1;
        let missCount = 0;
        while (true) {
            const success = await fetchUnit(pCode, unitID);
            if (success) {
                missCount = 0;
                console.log(`   ✅ Found Unit ${unitID}`);
            } else {
                missCount++;
                if (missCount >= 3) break; // Stop after 3 misses
            }
            unitID++;
            await delay(50); 
        }

        // --- PHASE 2: JUMP TO SPECIAL RANGE (72 - 80) ---
        // This runs regardless of where Phase 1 stopped
        for (let spID = SPECIAL_RANGE_START; spID <= SPECIAL_RANGE_END; spID++) {
            // Check if we didn't already download it in Phase 1 (unlikely but safe)
            if (spID >= unitID) { 
                const success = await fetchUnit(pCode, spID);
                if (success) {
                    console.log(`   ⭐ Found SPECIAL Unit ${spID} (JAVAA/Ausente)`);
                }
                await delay(50);
            }
        }
    }
    
    console.log("🏁 COMPLETE! Downloading full dataset...");
    downloadCSV();
}

// Helper to fetch single unit and return success/fail boolean
async function fetchUnit(pCode, uID) {
    const url = `${BASE_URL}${pCode}_${uID}.xml`;
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const text = await response.text();
            parseXML(text, pCode, uID);
            return true;
        }
    } catch (e) {
        console.error(`Error ${url}`);
    }
    return false;
}

function downloadCSV() {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

startMining();
