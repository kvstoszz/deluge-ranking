const SPREADSHEET_ID = "1KBHt_-c7aBGze2fETxpU9eITrJMT--epxXZDQnaxwus";
const SHEET_NAME = "ranking";
let allRows = [];   
let displayed = 0;  
let filteredRows = [];


const query = `
  select *
  order by B desc
`;


const url =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?` +
  `sheet=${encodeURIComponent(SHEET_NAME)}` +
  `&tq=${encodeURIComponent(query)}`;

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
    return { name: "Rajtar", color: "#3a1401", icon: "ranks/rajtar.png", className: "rank-rajtar" };
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
  let r, g;

  if (value < 50) {
    r = 255;
    g = Math.round(255 * (value / 50));
  } else {
    r = Math.round(255 * (1 - (value - 50) / 50));
    g = 255;
  }

  return `rgb(${r}, ${g}, 0)`;
}

function renderTable(table) {
  const thead = document.querySelector("#ranking thead");
  const tbody = document.querySelector("#ranking tbody");

  thead.innerHTML = `
    <tr>
      ${table.cols.map(c => `<th>${c.label}</th>`).join("")}
    </tr>
  `;

  const winrateColIndex = table.cols.findIndex(c => c.label === "Win %");
  const kdColIndex = table.cols.findIndex(c => c.label === "KD");

allRows = table.rows.filter(row => {
  const nickCell = row.c[0];
  return nickCell && typeof nickCell.v === "string" && nickCell.v.trim() !== "";
});

  filteredRows = allRows;
  displayed = 0;
  tbody.innerHTML = "";

  loadMoreRows(20);

  function loadMoreRows(count) {
    const nextRows = filteredRows.slice(displayed, displayed + count);


    nextRows.forEach(row => {
      let rowHtml = "";

      row.c.forEach((cell, i) => {
        if (!cell) {
          rowHtml += "<td></td>";
          return;
        }

        if (i === 0) {
          const elo = row.c[1]?.v ?? 1000;
          const rank = getRank(elo);

          rowHtml += `
            <td>
              <div class="cell-content">
                <span class="rank ${rank.className}" style="color:${rank.color}">
                  <img src="${rank.icon}" class="rank-icon" alt="${rank.name}">
                  <span class="rank-name">${rank.name}</span>
                </span>
                <span class="player-name">${cell.v}</span>
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

tbody.innerHTML += `<tr class="${rank.className}">${rowHtml}</tr>`;


    });

    displayed += nextRows.length;

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

}



