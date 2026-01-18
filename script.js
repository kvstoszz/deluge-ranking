const SPREADSHEET_ID = "1KBHt_-c7aBGze2fETxpU9eITrJMT--epxXZDQnaxwus";
const SHEET_NAME = "ranking";
let allRows = [];   
let displayed = 0;  
let filteredRows = [];
let comparisonPlayers = [];
const MAX_COMPARISON_PLAYERS = 2;
const contributors = [
  "Snykas",
  "Kimono"
];


const query = `
  select *
  order by B desc
`;


const url =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?` +
  `sheet=${encodeURIComponent(SHEET_NAME)}` +
  `&tq=${encodeURIComponent(query)}` +
  `&cachebuster=${Date.now()}`;

fetch(url)
  .then(res => res.text())
  .then(text => {
    const jsonText = text
      .replace(/^[\s\S]*?\(/, "")   
      .replace(/\);\s*$/, "");      

    const data = JSON.parse(jsonText);

    renderTable(data.table);
  })
  .catch(err => console.error("GViz error:", err));

function getRank(elo) {
  if (elo < 801) {
    return { name: "Gałgan", color: "#db7c9a", icon: "ranks/galgan.png", className: "rank-galgan" };
  }
  if (elo < 1001) {
    return { name: "Czerń", color: "#deaa4a", icon: "ranks/czern.png", className: "rank-czern" };
  }
  if (elo < 1201) {
    return { name: "Hajduk", color: "#bdbdbd", icon: "ranks/muszkieter2.png", className: "rank-muszkieter" };
  }
  if (elo < 1401) {
    return { name: "Tatar Krymski", color: "#001b44", icon: "ranks/tatar.png", className: "rank-tatar" };
  }
  if (elo < 1601) {
    return { name: "Dragon", color: "#154115", icon: "ranks/dragon.png", className: "rank-dragon" };
  }
  if (elo < 1801) {
    return { name: "Rezun", color: "#78ab67", icon: "ranks/rezun.png", className: "rank-rezun" };
  }
  if (elo < 2001) {
    return { name: "Rajtar", color: "#3a1401", icon: "ranks/rajtar2.png", className: "rank-rajtar" };
  }
  if (elo < 2201) {
    return { name: "Chorąży", color: "#ffd637", icon: "ranks/chorazy.png", className: "rank-chorazy" };
  }
  if (elo < 2401) {
    return { name: "Oficer", color: "#321b43", icon: "ranks/oficer.png", className: "rank-oficer" };
  }
  if (elo < 2601) {
    return { name: "Szlachcic", color: "#2b1c11", icon: "ranks/szlachcic.png", className: "rank-szlachcic" };
  }
  if (elo < 2801) {
    return { name: "Husarz", color: "#c91a1a", icon: "ranks/husarz.png", className: "rank-husarz" };
  }
  if (elo < 3001) {
    return { name: "Hetman", color: "#731f00", icon: "ranks/hetman.png", className: "rank-hetman" };
  }
  return { name: "Imperator", color: "#ffd700", icon: "ranks/czern.png", className: "rank-imperator" };
}

function getColorByValue(value) {
  // Spectrum gradient: Red → Orange → Yellow → Green
  // value = 0-100 (percentage)
  if (value < 25) {
    // Red to Orange (0-25)
    const t = value / 25;
    const r = 239;
    const g = Math.round(83 + (165 - 83) * t);
    const b = 80;
    return `rgb(${r}, ${g}, ${b})`;
  } else if (value < 50) {
    // Orange to Yellow (25-50)
    const t = (value - 25) / 25;
    const r = 239;
    const g = Math.round(165 + (255 - 165) * t);
    const b = Math.round(80 - 80 * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (value < 75) {
    // Yellow to Light Green (50-75)
    const t = (value - 50) / 25;
    const r = Math.round(239 - (200 - 100) * t);
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Light Green to Green (75-100)
    const t = (value - 75) / 25;
    const r = Math.round(100 - 50 * t);
    const g = 255;
    const b = 0;
    return `rgb(${r}, ${g}, ${b})`;
  }
}

// Porównywanie graczy - funkcje globalne
function togglePlayerComparison(nick) {
  const index = comparisonPlayers.indexOf(nick);
  
  if (index > -1) {
    comparisonPlayers.splice(index, 1);
  } else if (comparisonPlayers.length < MAX_COMPARISON_PLAYERS) {
    comparisonPlayers.push(nick);
  } else {
    return;
  }
  
  updateComparisonButton();
}

function updateComparisonButton() {
  const comparisonBtn = document.getElementById("comparison-btn");
  if (comparisonBtn) {
    if (comparisonPlayers.length > 0) {
      comparisonBtn.textContent = `Porównaj (${comparisonPlayers.length}/${MAX_COMPARISON_PLAYERS})`;
      comparisonBtn.style.display = "block";
      if (comparisonPlayers.length >= 1) {
        comparisonBtn.style.opacity = "1";
        comparisonBtn.style.cursor = "pointer";
      } else {
        comparisonBtn.style.opacity = "0.5";
        comparisonBtn.style.cursor = "not-allowed";
      }
    } else {
      comparisonBtn.style.display = "none";
    }
  }
}

function openComparison() {
  if (comparisonPlayers.length < 1) {
    console.error("Wybierz przynajmniej 1 gracza");
    return;
  }
  
  const player1Nick = comparisonPlayers[0];
  const player2Nick = comparisonPlayers[1] || null;
  
  const row1 = allRows.find(r => r.c[0].v === player1Nick);
  const row2 = player2Nick ? allRows.find(r => r.c[0].v === player2Nick) : null;
  
  if (!row1) {
    console.error("Nie znaleziono gracza 1 w allRows");
    return;
  }
  
  const elo1 = row1.c[1]?.v ?? 1000;
  const elo2 = row2 ? (row2.c[1]?.v ?? 1000) : null;
  const rank1 = getRank(elo1);
  const rank2 = row2 ? getRank(elo2) : null;
  
  document.getElementById("comp-player1-nick").textContent = player1Nick;
  document.getElementById("comp-player1-rank").textContent = rank1.name;
  document.getElementById("comp-player1-rank-img").src = rank1.icon;
  
  // Jeśli jest 2 gracz, pokaż go; jeśli jest sam, ukryj drugiego gracza
  const player2Container = document.getElementById("player2-container");
  const vsSeparator = document.getElementById("vs-separator");
  
  if (row2) {
    document.getElementById("comp-player2-nick").textContent = player2Nick;
    document.getElementById("comp-player2-rank").textContent = rank2.name;
    document.getElementById("comp-player2-rank-img").src = rank2.icon;
    player2Container.style.display = "flex";
    vsSeparator.style.display = "block";
  } else {
    player2Container.style.display = "none";
    vsSeparator.style.display = "none";
  }
  
  // Funkcja pomocnicza do kolorowania ze spektrum gradientu
  const updateComparisons = (val1, val2, cellId1, cellId2, display1, display2, higherIsBetter = true) => {
    const num1 = parseFloat(val1) || 0;
    const num2 = parseFloat(val2) || 0;
    
    const cell1 = document.getElementById(cellId1);
    const cell2 = document.getElementById(cellId2);
    
    cell1.textContent = display1;
    if (cell2) cell2.textContent = display2;
    
    // Resetuj style
    cell1.style.fontWeight = "400";
    cell1.style.textShadow = "";
    cell1.style.color = "#cbbd9a";
    if (cell2) {
      cell2.style.fontWeight = "400";
      cell2.style.textShadow = "";
      cell2.style.color = "#cbbd9a";
    }
    
    // Jeśli jest tylko 1 gracz, pokaż kremowy kolor
    if (!row2) {
      cell1.style.color = "#cbbd9a";
      cell1.style.fontWeight = "400";
      return;
    }
    
    if (num1 === num2) {
      cell1.style.color = "#cbbd9a";
      cell2.style.color = "#cbbd9a";
      cell1.style.textShadow = "0 0 2px #cbbd9a, 0 0 4px #cbbd9a";
      cell2.style.textShadow = "0 0 2px #cbbd9a, 0 0 4px #cbbd9a";
      cell1.style.fontWeight = "700";
      cell2.style.fontWeight = "700";
    } else {
      const isBetter1 = higherIsBetter ? num1 > num2 : num1 < num2;
      
      const max = Math.max(num1, num2);
      const min = Math.min(num1, num2);
      const range = max - min || 1;
      
      let percent1, percent2;
      
      if (higherIsBetter) {
        percent1 = ((num1 - min) / range) * 100;
        percent2 = ((num2 - min) / range) * 100;
      } else {
        percent1 = ((max - num1) / range) * 100;
        percent2 = ((max - num2) / range) * 100;
      }
      
      const color1 = getColorByValue(percent1);
      const color2 = getColorByValue(percent2);
      
      cell1.style.color = color1;
      cell2.style.color = color2;
      
      if (isBetter1) {
        cell1.style.fontWeight = "700";
        cell1.style.textShadow = `0 0 2px ${color1}, 0 0 4px ${color1}`;
        cell2.style.fontWeight = "400";
      } else {
        cell1.style.fontWeight = "400";
        cell2.style.fontWeight = "700";
        cell2.style.textShadow = `0 0 2px ${color2}, 0 0 4px ${color2}`;
      }
    }
  };
  
  // Rating
  updateComparisons(elo1, elo2, "comp-player1-elo-cell", "comp-player2-elo-cell", elo1, elo2, true);
  
  // Zabójstwa
  const kills1 = row1.c[2]?.v ?? "--";
  const kills2 = row2 ? (row2.c[2]?.v ?? "--") : null;
  updateComparisons(kills1, kills2, "comp-player1-kills-cell", "comp-player2-kills-cell", kills1, kills2, true);
  
  // Śmierci
  const deaths1 = row1.c[3]?.v ?? "--";
  const deaths2 = row2 ? (row2.c[3]?.v ?? "--") : null;
  updateComparisons(deaths1, deaths2, "comp-player1-deaths-cell", "comp-player2-deaths-cell", deaths1, deaths2, false);
  
  // Teamkille
  const teamkills1 = row1.c[4]?.v ?? "--";
  const teamkills2 = row2 ? (row2.c[4]?.v ?? "--") : null;
  updateComparisons(teamkills1, teamkills2, "comp-player1-teamkills-cell", "comp-player2-teamkills-cell", teamkills1, teamkills2, false);
  
  // Wygrane
  const wins1 = row1.c[5]?.v ?? "--";
  const wins2 = row2 ? (row2.c[5]?.v ?? "--") : null;
  updateComparisons(wins1, wins2, "comp-player1-wins-cell", "comp-player2-wins-cell", wins1, wins2, true);
  
  // Przegrane
  const losses1 = row1.c[6]?.v ?? "--";
  const losses2 = row2 ? (row2.c[6]?.v ?? "--") : null;
  updateComparisons(losses1, losses2, "comp-player1-losses-cell", "comp-player2-losses-cell", losses1, losses2, false);
  
  // Mecze
  const matches1 = row1.c[7]?.v ?? "--";
  const matches2 = row2 ? (row2.c[7]?.v ?? "--") : null;
  updateComparisons(matches1, matches2, "comp-player1-matches-cell", "comp-player2-matches-cell", matches1, matches2, true);
  
  // K/D
  const kd1 = row1.c[8]?.v ?? "--";
  const kd2 = row2 ? (row2.c[8]?.v ?? "--") : null;
  updateComparisons(kd1, kd2, "comp-player1-kd-cell", "comp-player2-kd-cell", kd1, kd2, true);
  
  // Win %
  const winrate1 = row1.c[9]?.v ?? "--";
  const winrate2 = row2 ? (row2.c[9]?.v ?? "--") : null;
  updateComparisons(winrate1, winrate2, "comp-player1-winrate-cell", "comp-player2-winrate-cell", winrate1 + "%", (winrate2 || "--") + (winrate2 ? "%" : ""), true);
  
  document.getElementById("comparison-modal").classList.remove("hidden");
}

function removeFromComparison(nick) {
  const index = comparisonPlayers.indexOf(nick);
  if (index > -1) {
    comparisonPlayers.splice(index, 1);
  }
  updateComparisonButton();
  
  // Jeśli został 1 gracz, zaktualizuj modal; jeśli 0, zamknij
  if (comparisonPlayers.length === 1) {
    openComparison();
  } else if (comparisonPlayers.length === 0) {
    closeComparison();
  }
}

function closeComparison() {
  document.getElementById("comparison-modal").classList.add("hidden");
}


function renderTable(table) {
  const thead = document.querySelector("#ranking thead");
  const tbody = document.querySelector("#ranking tbody");

thead.innerHTML = `
  <tr>
    <th>#</th>
    ${table.cols.map(c => `<th>${c.label}</th>`).join("")}
  </tr>
`;

  const winrateColIndex = table.cols.findIndex(c => c.label === "Win %");
  const kdColIndex = table.cols.findIndex(c => c.label === "KD");

allRows = table.rows.filter(row => {
  const nickCell = row.c[0];
  return nickCell && typeof nickCell.v === "string" && nickCell.v.trim() !== "";
});
allRows.forEach((row, index) => {
  row.rankPosition = index + 1;
});

const leaderBox = document.getElementById("leader");
if (leaderBox && allRows.length > 0) {
  leaderBox.textContent = allRows[0].c[0].v; // nick top gracza
}



const pc = document.getElementById("player-count");
if (pc) pc.textContent = allRows.length;


  filteredRows = allRows;
  displayed = 0;
  tbody.innerHTML = "";

  loadMoreRows(20);

  function loadMoreRows(count) {
    const nextRows = filteredRows.slice(displayed, displayed + count);


    nextRows.forEach(row => {
      let rowHtml = "";
let rankDisplay = row.rankPosition;

if (row.rankPosition === 1) {
  rankDisplay = `<span class="rank-medal rank-1">🥇</span>`;
} else if (row.rankPosition === 2) {
  rankDisplay = `<span class="rank-medal rank-2">🥈</span>`;
} else if (row.rankPosition === 3) {
  rankDisplay = `<span class="rank-medal rank-3">🥉</span>`;
}

rowHtml += `<td>${rankDisplay}</td>`;



      row.c.forEach((cell, i) => {
        if (!cell) {
          rowHtml += "<td></td>";
          return;
        }

        if (i === 0) {
          const elo = row.c[1]?.v ?? 1000;
          const rank = getRank(elo);

const isContributor = contributors.includes(cell.v);

rowHtml += `
  <td class="player-cell"
      data-nick="${cell.v}"
      data-place="${row.rankPosition}">
    <div class="cell-content">
      <span class="rank ${rank.className}" style="color:${rank.color}">
        <img src="${rank.icon}" class="rank-icon" alt="${rank.name}">
        <span class="rank-name">${rank.name}</span>
      </span>
      <span class="player-name${isContributor ? " contributor-glow" : ""}">
        ${cell.v}
      </span>
    </div>
  </td>
`;

          return;
        }

        // Win %
        if (i === winrateColIndex) {
          const value = cell.v;
          const color = getColorByValue(value);
          rowHtml += `<td style="color:${color}">${value}%</td>`;
          return;
        }

        // KD
        if (i === kdColIndex) {
          const kdValue = cell.v;
          const percent = Math.min(kdValue / 2 * 100, 100);
          const color = getColorByValue(percent);
          rowHtml += `<td style="color:${color}">${kdValue.toFixed(2)}</td>`;
          return;
        }

        rowHtml += `<td>${cell.v}</td>`;
      });

const elo = row.c[1]?.v ?? 1000;
const rank = getRank(elo);

const top5Class = row.rankPosition <= 5 ? "top-5" : "";

tbody.innerHTML += `<tr class="${rank.className} ${top5Class}">${rowHtml}</tr>`;




    });

    displayed += nextRows.length;
	attachPlayerClickHandlers();

    const btn = document.getElementById("load-more-btn");
    if (btn && displayed >= filteredRows.length) {
      btn.style.display = "none";
    }
  }

  const btn = document.getElementById("load-more-btn");
  if (btn) {
    btn.onclick = () => loadMoreRows(10);
  }
  
const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();

    filteredRows = allRows.filter(row => {
      const nick = row.c[0].v.toLowerCase();
      return nick.includes(query);
    });

    displayed = 0;
    tbody.innerHTML = "";
    const btn = document.getElementById("load-more-btn");
    if (btn) btn.style.display = "block";

    loadMoreRows(20);
  };
}

// Przycisk wyczyść
const clearBtn = document.getElementById('search-clear');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.classList.remove('visible');
    
    // Resetuj filtr - pokaż wszystkich graczy
    filteredRows = allRows;
    displayed = 0;
    document.getElementById('ranking').querySelector('tbody').innerHTML = '';
    const btn = document.getElementById('load-more-btn');
    if (btn) btn.style.display = 'block';
    loadMoreRows(20);
    
    searchInput.focus();
  });
}

attachPlayerClickHandlers();

function attachPlayerClickHandlers() {
  document.querySelectorAll(".player-name").forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", e => {
      e.stopPropagation();
      const playerCell = el.closest(".player-cell");
      const nick = playerCell.dataset.nick;
      const place = playerCell.dataset.place;

      openPlayerModal(nick, place);
    });
  });
}

function openPlayerModal(nick, currentPlace) {
  document.getElementById("modal-nick").textContent = nick;
  document.getElementById("modal-current-place").textContent = `#${currentPlace}`;

  // placeholder zanim dane się załadują
  document.getElementById("modal-best-place").textContent = "---";
  document.getElementById("modal-matches").innerHTML = "<span style='opacity:0.6'>Ładowanie…</span>";

  // fetch danych asynchronicznie
  loadLastMatches(nick);
  loadBestPlace(nick);
  
  // Ustaw przycisk porównania
  const compareBtn = document.getElementById("compare-btn");
  const isSelected = comparisonPlayers.includes(nick);
  compareBtn.textContent = isSelected ? "Usuń z porównania" : "Dodaj do porównania";
  compareBtn.style.background = isSelected ? "#e53935" : "#cbbd9a";
  compareBtn.onclick = () => {
    togglePlayerComparison(nick);
    compareBtn.textContent = comparisonPlayers.includes(nick) ? "Usuń z porównania" : "Dodaj do porównania";
    compareBtn.style.background = comparisonPlayers.includes(nick) ? "#e53935" : "#cbbd9a";
    
    // Jeśli jest 2+ graczy, pokaż przycisk porównania
    updateComparisonButton();
  };

  document.getElementById("player-modal").classList.remove("hidden");
}

document.getElementById("modal-close").onclick = () => {
  document.getElementById("player-modal").classList.add("hidden");
};

function loadLastMatches(displayName) {
  const query = `
    select A, L
    where K = '${displayName}'
  `;

  const url =
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?` +
    `sheet=per_match_calc&tq=${encodeURIComponent(query)}&cachebuster=${Date.now()}`;

  fetch(url)
    .then(r => r.text())
    .then(t => {
      const json = JSON.parse(
        t.replace(/^[\s\S]*?\(/, "").replace(/\);\s*$/, "")
      );

      const container = document.getElementById("modal-matches");
      container.innerHTML = "";

      if (!json.table.rows || json.table.rows.length === 0) {
        container.innerHTML = "<span style='opacity:0.6'>Brak danych</span>";
        return;
      }

      // 🔽 sortowanie po match_id (STRING DESC)
      const sorted = json.table.rows.sort((a, b) => {
        const aId = a.c[0]?.v ?? "";
        const bId = b.c[0]?.v ?? "";
        return bId.localeCompare(aId);
      });

      // 🔽 tylko 5 ostatnich
      sorted.slice(0, 5).forEach(r => {
        const result = r.c[1]?.v;

        container.innerHTML += `
          <span class="match-result ${result === "W" ? "win" : "loss"}">
            ${result}
          </span>
        `;
      });
    });
}




function loadBestPlace(nick) {
  const query = `
    select min(D)
    where B = '${nick}'
  `;

  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=ranking_snapshot&tq=${encodeURIComponent(query)}`;

  fetch(url)
    .then(r => r.text())
    .then(t => {
      const json = JSON.parse(t.replace(/^[\s\S]*?\(/, "").replace(/\);\s*$/, ""));

      const bestPlaceFromSnapshot = json.table.rows[0]?.c[0]?.v;

      // aktualne miejsce z modala
      const currentPlaceText =
        document.getElementById("modal-current-place").textContent.replace("#", "");
      const currentPlace = parseInt(currentPlaceText, 10);

      let bestPlace;

      if (typeof bestPlaceFromSnapshot === "number" && !isNaN(currentPlace)) {
        bestPlace = Math.min(bestPlaceFromSnapshot, currentPlace);
      } else if (!isNaN(currentPlace)) {
        bestPlace = currentPlace;
      } else {
        bestPlace = "-";
      }

      document.getElementById("modal-best-place").textContent = `#${bestPlace}`;
    });
}

const modalOverlay = document.getElementById("player-modal");
const modalContent = document.querySelector(".player-modal-content");

function closePlayerModal() {
  modalOverlay.classList.add("hidden");
}

// klik w X
document.getElementById("modal-close").onclick = closePlayerModal;

// klik w tło
modalOverlay.addEventListener("click", closePlayerModal);

// klik w okienko → NIE zamykaj
modalContent.addEventListener("click", e => e.stopPropagation());

// ESC do zamknięcia modala porównania
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const comparisonModal = document.getElementById("comparison-modal");
    if (comparisonModal && !comparisonModal.classList.contains("hidden")) {
      closeComparison();
    }
    // ESC dla player modala
    closePlayerModal();
  }
});

// Klik poza polem porównania - zamknij modal
const comparisonModal = document.getElementById("comparison-modal");
if (comparisonModal) {
  comparisonModal.addEventListener("click", e => {
    if (e.target === comparisonModal) {
      closeComparison();
    }
  });
}
}
