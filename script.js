const SPREADSHEET_ID = "1KBHt_-c7aBGze2fETxpU9eITrJMT--epxXZDQnaxwus";
const SHEET_NAME = "ranking";
let allRows = [];   
let displayed = 0;  
let filteredRows = [];
let comparisonPlayers = [];
const MAX_COMPARISON_PLAYERS = 2;
const contributors = [
  "Kimono",
  "Zares"
];

function loadYouTubeAvatars() {
  // Avatary są już załadowane w HTML-u z bezpośrednimi URL-ami YouTube
  // Dodaj fallback na wypadek, gdyby jakiś URL nie zadziałał
  const avatarMapping = {
    'lanos': 'https://yt3.googleusercontent.com/ytc/AIdro_n5T29uIFdoe4_CuNNbKOwiNAEedyfLIUs3iP-C1igGtcA=s160-c-k-c0x00ffffff-no-rj',
    'kustosz': 'https://yt3.googleusercontent.com/NJAggX0jYv-oF7Sq7szQUMWfrTumeTiSZqbP_Gh1Wu8SZm8Q1QWKdLYesgD9ePXb4s7BN7ZONw=s160-c-k-c0x00ffffff-no-rj',
    'zares': 'https://yt3.googleusercontent.com/ICNc38DsrSlej_U8-JLZ0T2Ou7IOMQQ-O0EMGxj51ictbJv3aiUIYHKW_hlEZOL3numiQR-8XA=s160-c-k-c0x00ffffff-no-rj'
  };
  
  const youtubeUrls = {
    'lanos': 'https://www.youtube.com/@lanos1502',
    'kustosz': 'https://www.youtube.com/@Kustosz2137',
    'zares': 'https://www.youtube.com/@ZaresTheDeluge'
  };
  
  // Ustaw fallback dla avatarów na wypadek błędu ładowania
  Object.entries(avatarMapping).forEach(([key, url]) => {
    const avatarElem = document.getElementById(`avatar-${key}`);
    if (avatarElem && avatarElem.src) {
      avatarElem.onerror = () => {
        // Jeśli URL się nie załaduje, spróbuj alternatywny URL
        avatarElem.src = url;
      };
      
      // Dodaj klikanie na avatar
      avatarElem.style.cursor = 'pointer';
      avatarElem.addEventListener('click', (e) => {
        e.stopPropagation();
        if (youtubeUrls[key]) {
          window.open(youtubeUrls[key], '_blank');
        }
      });
    }
  });
}

// Dźwięki
function playSound(soundFile) {
  const audio = new Audio(soundFile);
  audio.volume = 0.5;
  audio.play().catch(err => console.log("Audio play failed:", err));
}

document.addEventListener('click', function(e) {
  const x = e.clientX;
  const y = e.clientY;
  if (typeof x !== 'number' || typeof y !== 'number') return;

  const el = document.elementFromPoint(x, y);
  if (!el) return;

  const clickedEaster = el.closest && el.closest('.easter-k');
  if (clickedEaster) {
    playSound('secondclick.mp3');
    // Dodaj klasę animacji
    clickedEaster.classList.add('easter-k-clicked');
    // Usuń klasę po zakończeniu animacji
    setTimeout(() => {
      clickedEaster.classList.remove('easter-k-clicked');
    }, 300);
  }
}, true);

// Języki i tłumaczenia
let currentLanguage = localStorage.getItem('deluge-language') || 'pl';
let sortColumn = 0; // 0 = domyślnie bez sortowania (ranking)
let sortDirection = 'asc';

const translations = {
  pl: {
    searchPlaceholder: "Szukaj gracza...",
    players: "Gracze",
    season: "Aktualny sezon",
    leader: "Lider",
    loadMore: "Pokaż więcej",
    showLess: "Pokaż mniej",
    preseason: "Preseason",
    addToComparison: "Dodaj do porównania",
    removeFromComparison: "Usuń z porównania",
    compare: "Porównaj",
    removeCompare: "Usuń z porównania",
    currentPlace: "Obecne miejsce",
    bestPlace: "Najwyższe miejsce w sezonie",
    lastMatches: "Ostatnie 5 meczy",
    noData: "Brak danych",
    loading: "Ładowanie…",
    notFound: "Nie znaleziono gracza",
    titleMain: "The Deluge Matchmaking",
    titleSub: "Community ranking & player stats",
    playerRole: "Gracz",
    colRating: "Rating",
    colKills: "Zabójstwa",
    colDeaths: "Śmierci",
    colTeamkills: "Teamkille",
    colWins: "Wygrane",
    colLosses: "Przegrane",
    colMatches: "Mecze",
    colKD: "KD",
    colWinrate: "Win %",
    supportersContributors: "Kontrybutorzy",
    supportersCreators: "Kreatorzy Treści",
    supportersLeader: "Lider Projektu",
    supportersButtonLabel: "Wspierający",
    contribDescKustosz: "Główny zarządca projektu The Deluge Matchmaking, zarządca infrastruktury serwerowej oraz bazy danych, programista backendu, twórca systemu rankingowego oraz mechaniki gry.",
    contribDescHawriil: "Główny zarządca i programista Discordowego bota Rozjemca, odpowiadającego za organizację meczy.",
    contribDescJessica: "Inicjator pomysłu, twórca regulaminu The Deluge Matchmaking",
    contribDescHromiczekk: "Główny programista frontendu, odpowiadający za strukturę strony internetowej The Deluge Matchmaking.",
    contribDescZares: "Twórca graficzny projektu, pomysłodawca.",
    contribDescLanos: "Orangutan.",
    contribDescCiom: "Nie wiem",
    quoteKustosz: "\"Nie ważne ilu tylko gdzie. HITLERJUGEND!.\"",
    quoteHawriil: "\"Pickup o 20:00.\"",
    quoteJessica: "\"Kwik.\"",
    quoteHromiczekk: "\"NIE BĘDĘ LICZYŁ\"",
    quoteZares: "\"Wodzionka\"",
    quoteLanos: "\"🦧\"",
    quoteCiom: "\"Nie wiem\"",
    creatorNameLanos: "Lanos",
    creatorNameKustosz: "Kustosz",
    creatorNameZares: "Zares",
    faqTitle: "FAQ - Najczęstsze Pytania",
    faqQuestion1: "Czym jest The Deluge Matchmaking?",
    faqAnswer1: "Szczerze to jebać deluge",
    faqQuestion2: "Jak działa system rankingowy?",
    faqAnswer2: "Jestem gejem, jestem czarny i nie chodzę do kościoła",
    faqQuestion3: "Jak zagrać mecz?",
    faqAnswer3: "Aby zagrać mecz, włóż sobie palec do dupy i zrób 3 pajacyki",
    faqQuestion4: "Jak dołączyć do Discord?",
    faqAnswer4: "Link do naszego Discorda znajduje się na dole strony. Wystarczy kliknąć w ikonkę, aby zostać przekierowanym!",
    faqQuestion5: "Jak porównać dwóch graczy?",
    faqAnswer5: "Kliknij na gracza w tabeli, a następnie wybierz \"Dodaj do porównania\". Powtórz dla drugiego gracza i kliknij \"Porównaj\".",
    faqQuestion6: "Gdzie mogę znaleźć więcej informacji?",
    faqAnswer6: "Odwiedź nasz Discord lub skontaktuj się z administracją projektu. Możesz również sprawdzić sekcję 'Kontrybutorzy' aby dowiedzieć się więcej o zespole."

  },
  en: {
    searchPlaceholder: "Search player...",
    players: "Players",
    season: "Current season",
    leader: "Leader",
    loadMore: "Show more",
    showLess: "Show less",
    preseason: "Preseason",
    addToComparison: "Add to comparison",
    removeFromComparison: "Remove from comparison",
    compare: "Compare",
    removeCompare: "Remove from comparison",
    currentPlace: "Current place",
    bestPlace: "Best place this season",
    lastMatches: "Last 5 matches",
    noData: "No data",
    loading: "Loading…",
    notFound: "Player not found",
    titleMain: "The Deluge Matchmaking",
    titleSub: "Community ranking & player stats",
    playerRole: "Player",
    colRating: "Rating",
    colKills: "Kills",
    colDeaths: "Deaths",
    colTeamkills: "Teamkills",
    colWins: "Wins",
    colLosses: "Losses",
    colMatches: "Matches",
    colKD: "KD",
    colWinrate: "Win %",
    supportersContributors: "Contributors",
    supportersCreators: "Content Creators",
    supportersLeader: "Project Leader",
    supportersButtonLabel: "Supporters",
    contribDescKustosz: "Main administrator of The Deluge Matchmaking project, server infrastructure manager and database administrator, backend programmer, creator of the ranking system and game mechanics.",
    contribDescHawriil: "Main administrator and programmer of the Discord bot Rozjemca, responsible for match organization.",
    contribDescJessica: "Initiator of the idea, author of the rules for The Deluge Matchmaking",
    contribDescHromiczekk: "Main frontend programmer, responsible for the structure of The Deluge Matchmaking website.",
    contribDescZares: "Graphic designer of the project, ideator.",
    contribDescLanos: "Orangutan.",
    contribDescCiom: "I don't know",
    quoteKustosz: "\"Nie ważne ilu tylko gdzie. HITLERJUGEND!.\"",
    quoteHawriil: "\"Pickup o 20:00.\"",
    quoteJessica: "\"Kwik.\"",
    quoteHromiczekk: "\"NIE BĘDĘ LICZYŁ\"",
    quoteZares: "\"Wodzionka\"",
    quoteLanos: "\"🦧\"",
    quoteCiom: "\"Nie wiem\"",
    creatorNameLanos: "Lanos",
    creatorNameKustosz: "Kustosz",
    creatorNameZares: "Zares",
    faqTitle: "FAQ - Frequently Asked Questions",
    faqQuestion1: "What is The Deluge Matchmaking?",
    faqAnswer1: "Honestly, jebać Deluge.",
    faqQuestion2: "How does the ranking system work?",
    faqAnswer2: "I’m gay, I’m Black, and I don’t go to church.",
    faqQuestion3: "How do I play a match?",
    faqAnswer3: "To play a match, stick a finger up your ass and do 3 jumping jacks.",
    faqQuestion4: "How do I join the Discord?",
    faqAnswer4: "The link to our Discord is at the bottom of the page. Just click the icon and you’ll be redirected!",
    faqQuestion5: "How do I compare two players?",
    faqAnswer5: "Click a player in the table, then choose \"Add to comparison\". Repeat for the second player and click \"Compare\".",
    faqQuestion6: "Where can I find more information?",
    faqAnswer6: "Visit our Discord or contact the project admins. You can also check the 'Contributors' section to learn more about the team."
    },
  sl: {
    searchPlaceholder: "Szukej szpilera...",
    players: "Szpilery",
    season: "Aktualny syzōn",
    leader: "Szpicnlajter",
    loadMore: "Pokŏż wiyncyj",
    showLess: "Pokŏż mynij",
    preseason: "Przedsyzōn",
    addToComparison: "Dej do przirōwnaniŏ",
    removeFromComparison: "Wycŏfej  z przirōwnaniŏ",
    compare: "Przirōwnej",
    removeCompare: "Wycŏfej  z przirōwnaniŏ",
    currentPlace: "Aktualny plac",
    bestPlace: "Nojlepsze plac w tym syzōnie",
    lastMatches: "Ôstatnie 5 meczy",
    noData: "Ni ma danych",
    loading: "Laduje…",
    notFound: "Niy ma szpilera",
    titleMain: "Sroge Zalōnie Matchmaking",
    titleSub: "Społycznoś hierarchijŎ i statystyki szpilery",
    playerRole: "Szpiler",
    colRating: "ôcyna",
    colKills: "Zabōjstwa",
    colDeaths: "Śmierći",
    colTeamkills: "Zabōjstwa zwōlynnikōw",
    colWins: "Wygrane",
    colLosses: "Niderlagi",
    colMatches: "Mecze",
    colKD: "KD",
    colWinrate: "Zwyciyjnstwo %",
    supportersContributors: "Kōntrybutŏrzy",
    supportersCreators: "Kreatŏrzy inhaltōw",
    supportersLeader: "lajter projektu",
    supportersButtonLabel: "spiyrajōncy",
    contribDescKustosz: "Gōwny administratōr projektu Sroge Zalōnie Matchmaking,administrator infrastrutury serwerowyj a bazy danych, programiŏrz backendutwōrca systymu hierarchiji a funkcji szpilu.",
    contribDescHawriil: "Gōwny administratōr i programiŏrz Discordowygo bota Rozjemca, lajter za ôrganizacyjã meczy.",
    contribDescJessica: "Inicjator idyje, twōrca regulaminu Sroge Zalōnie Matchmaking.",
    contribDescHromiczekk: "Gōwny programiŏrz frontendu, lajter za sztrukturã strōny internetowyj Sroge Zalōnie Matchmaking.",
    contribDescZares: "Twōrca graficzny projektu, idyjodŏwca.",
    contribDescLanos: "Ôrangutan.",
    contribDescCiom: "Niy wiã",
    quoteKustosz: "\"Nie ważne ilu tylko gdzie. HITLERJUGEND!.\"",
    quoteHawriil: "\"Pickup o 20:00.\"",
    quoteJessica: "\"Kwik.\"",
    quoteHromiczekk: "\"NIE BĘDĘ LICZYŁ\"",
    quoteZares: "\"Wodzionka\"",
    quoteLanos: "\"🦧\"",
    quoteCiom: "\"Nie wiem\"",
    creatorNameLanos: "Lanos",
    creatorNameKustosz: "Kustosz",
    creatorNameZares: "Zares",
    faqTitle: "FAQ - Czasto Pytane Rzeczy",
    faqQuestion1: "Czym jest The Deluge Matchmaking?",
    faqAnswer1: "Szczerze to jebać deluge",
    faqQuestion2: "Jak działa system rankingowy?",
    faqAnswer2: "Jestem gejem, jestem czarny i nie chodzę do kościoła",
    faqQuestion3: "Jak zagrać mecz?",
    faqAnswer3: "Aby zagrać mecz, włóż sobie palec do dupy i zrób 3 pajacyki",
    faqQuestion4: "Jak dołączyć do Discord?",
    faqAnswer4: "Link do naszego Discorda znajduje się na dole strony. Wystarczy kliknąć w ikonkę, aby zostać przekierowanym!",
    faqQuestion5: "Jak porównać dwóch graczy?",
    faqAnswer5: "Kliknij na gracza w tabeli, a następnie wybierz \"Dodaj do porównania\". Powtórz dla drugiego gracza i kliknij \"Porównaj\".",
    faqQuestion6: "Gdzie mogę znaleźć więcej informacji?",
    faqAnswer6: "Odwiedź nasz Discord lub skontaktuj się z administracją projektu. Możesz również sprawdzić sekcję 'Kontrybutorzy' aby dowiedzieć się więcej o zespole."
  }
};

function t(key) {
  return translations[currentLanguage]?.[key] || translations['pl'][key];
}

function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('deluge-language', lang);
  updateLanguageUI();
  applyTranslations();
}

function updateLanguageUI() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.lang === currentLanguage) {
      btn.classList.add('active');
    }
  });
}

function applyTranslations() {
  // Aktualizuj tytuł główny
  const titleElement = document.getElementById('title-main');
  if (titleElement) {
    const prefix = currentLanguage === 'sl' ? 'Sroge Zalōnie ' : 'The Deluge ';
    titleElement.innerHTML = prefix + 'Matchma<span class="easter-k">k</span>ing';
  }
  
  // Aktualizuj podtytuł
  const subtitleElement = document.getElementById('title-sub');
  if (subtitleElement) {
    subtitleElement.textContent = t('titleSub');
  }
  
  // Aktualizuj placeholder wyszukiwarki
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.placeholder = t('searchPlaceholder');
  }
  
  // Aktualizuj etykiety
  const labelPlayers = document.getElementById('label-players');
  if (labelPlayers) labelPlayers.textContent = t('players');
  
  const labelSeason = document.getElementById('label-season');
  if (labelSeason) labelSeason.textContent = t('season');
  
  const labelLeader = document.getElementById('label-leader');
  if (labelLeader) labelLeader.textContent = t('leader');
  
  const seasonValue = document.getElementById('season-value');
  if (seasonValue) seasonValue.textContent = t('preseason');
  
  // Aktualizuj przyciski
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.textContent = t('loadMore');
  }
  const showLessBtn = document.getElementById('show-less-btn');
  if (showLessBtn) showLessBtn.textContent = t('showLess');
  
  const compareBtn = document.getElementById('compare-btn');
  if (compareBtn) {
    const nick = document.getElementById('modal-nick')?.textContent;
    if (nick && comparisonPlayers.includes(nick)) {
      compareBtn.textContent = t('removeFromComparison');
    } else {
      compareBtn.textContent = t('addToComparison');
    }
  }
  
  // Aktualizuj modal statystyk gracza
  const modalRole = document.querySelector('.modal-role');
  if (modalRole) modalRole.textContent = t('playerRole');
  
  const modalLabels = document.querySelectorAll('.modal-stat-label');
  if (modalLabels[0]) modalLabels[0].textContent = t('currentPlace');
  if (modalLabels[1]) modalLabels[1].textContent = t('bestPlace');
  
  // Aktualizuj sekcję ostatnich meczy
  const sectionTitle = document.querySelector('.modal-section-title');
  if (sectionTitle) sectionTitle.textContent = t('lastMatches');
  
  // Aktualizuj komunikaty
  const getColLabel = (label) => {
    const labelMap = {
      'Rating': 'colRating',
      'Zabójstwa': 'colKills',
      'Śmierci': 'colDeaths',
      'Teamkille': 'colTeamkills',
      'Wygrane': 'colWins',
      'Przegrane': 'colLosses',
      'Mecze': 'colMatches',
      'KD': 'colKD',
      'Win %': 'colWinrate'
    };
    const translationKey = labelMap[label];
    if (translationKey) {
      return t(translationKey);
    }
    // Przywrót: zwróć etykietę bez zmian
    return label || '';
  };
  
  // Aktualizuj nagłówek kolumny Nick
  const nickHeader = document.querySelector('th[data-sort-col="1"]');
  if (nickHeader) {
    const translated = t('playerRole');
    const sortClass = nickHeader.className.includes('sort-asc') ? 'sort-asc' : (nickHeader.className.includes('sort-desc') ? 'sort-desc' : '');
    nickHeader.innerHTML = translated + '<span class="sort-indicator"></span>';
    nickHeader.className = 'sortable-header ' + sortClass;
  }
  
  // Aktualizuj nagłówki kolumn z tłumaczeniami
  document.querySelectorAll('th[data-sort-col]').forEach(th => {
    const colName = th.getAttribute('data-col-name');
    if (colName) {
      const translatedLabel = getColLabel(colName);
      const sortClass = th.className.includes('sort-asc') ? 'sort-asc' : (th.className.includes('sort-desc') ? 'sort-desc' : '');
      th.innerHTML = translatedLabel + '<span class="sort-indicator"></span>';
      th.className = 'sortable-header ' + sortClass;
    }
  });
  
  // Aktualizuj przycisk porównania
  const comparisonBtn = document.getElementById('comparison-btn');
  if (comparisonBtn && comparisonPlayers.length > 0) {
    comparisonBtn.textContent = `${t('compare')} (${comparisonPlayers.length}/${MAX_COMPARISON_PLAYERS})`;
  }
  
  // Aktualizuj przycisk "Dodaj do porównania" w modalu gracza jeśli jest otwarty
  const playerModal = document.getElementById('player-modal');
  if (playerModal && !playerModal.classList.contains('hidden')) {
    const compareBtn = document.getElementById('compare-btn');
    if (compareBtn) {
      const nick = document.getElementById('modal-nick')?.textContent;
      if (nick && comparisonPlayers.includes(nick)) {
        compareBtn.textContent = t('removeFromComparison');
      } else {
        compareBtn.textContent = t('addToComparison');
      }
    }
  }
  
  // Aktualizuj etykiety w modalu porównania jeśli jest otwarty
  const comparisonModal = document.getElementById('comparison-modal');
  if (comparisonModal && !comparisonModal.classList.contains('hidden')) {
    updateComparisonModalLabels();
  }
  
  // Aktualizuj tytuły sekcji Supporters
  const supportersContribTitle = document.getElementById('supporters-title-contributors');
  if (supportersContribTitle) {
    supportersContribTitle.textContent = t('supportersContributors');
  }
  
  const supportersLeaderTitle = document.getElementById('supporters-title-leader');
  if (supportersLeaderTitle) {
    supportersLeaderTitle.textContent = t('supportersLeader');
  }
  
  const supportersCreatorsTitle = document.getElementById('supporters-title-creators');
  if (supportersCreatorsTitle) {
    supportersCreatorsTitle.textContent = t('supportersCreators');
  }
  
  // Aktualizuj opisy kontrybutorów
  document.querySelectorAll('[data-translation-key]').forEach(elem => {
    const key = elem.getAttribute('data-translation-key');
    if (key && t(key)) {
      elem.textContent = t(key);
    }
  });
}

// Inicjalizacja języka przy załadowaniu strony
window.addEventListener('load', () => {
  updateLanguageUI();
  applyTranslations();
  loadYouTubeAvatars();
  
  // Obsługa kliknięć na kontrybutorów - pokaż/ukryj opisy i cytaty
  document.querySelectorAll('.contributor-clickable').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      playSound('press.mp3');
      const contributor = elem.dataset.contributor;
      const descElem = document.getElementById(`desc-${contributor}`);
      const quoteElem = document.getElementById(`quote-${contributor}`);
      
      if (descElem) {
        // Zamknij wszystkie inne opisy i cytaty
        document.querySelectorAll('.supporter-description.active').forEach(desc => {
          if (desc !== descElem) {
            desc.classList.remove('active');
          }
        });
        document.querySelectorAll('.contributor-quote.active').forEach(quote => {
          if (quote !== quoteElem) {
            quote.classList.remove('active');
          }
        });
        
        // Toggle aktualny opis
        descElem.classList.toggle('active');
        // Toggle aktualny cytat
        if (quoteElem && quoteElem.textContent.trim()) {
          quoteElem.classList.toggle('active');
        }
      }
    });
  });
});

// Dodaj nasłuchiwanie przycisków językowych
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('press.mp3');
      setLanguage(btn.dataset.lang);
    });
  });
});

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
    return { name: "Dragon", color: "#0345bf", icon: "ranks/dragon.png", className: "rank-dragon" };
  }
  if (elo < 1801) {
    return { name: "Rezun", color: "#4bd51d", icon: "ranks/rezun.png", className: "rank-rezun" };
  }
  if (elo < 2001) {
    return { name: "Rajtar", color: "#3a1401", icon: "ranks/rajtar2.png", className: "rank-rajtar" };
  }
  if (elo < 2201) {
    return { name: "Chorąży", color: "#ffd637", icon: "ranks/chorazy.png", className: "rank-chorazy" };
  }
  if (elo < 2401) {
    return { name: "Oficer", color: "#46136a", icon: "ranks/oficer.png", className: "rank-oficer" };
  }
  if (elo < 2601) {
    return { name: "Szlachcic", color: "#592703", icon: "ranks/szlachcic.png", className: "rank-szlachcic" };
  }
  if (elo < 2801) {
    return { name: "Husarz", color: "#b60707", icon: "ranks/husarz.png", className: "rank-husarz" };
  }
  if (elo < 3001) {
    return { name: "Hetman", color: "#731f00", icon: "ranks/hetman.png", className: "rank-hetman" };
  }
  return { name: "Imperator", color: "#ffd700", icon: "ranks/imperator.png", className: "rank-imperator" };
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

// Porównywanie graczy
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
      comparisonBtn.textContent = `${t('compare')} (${comparisonPlayers.length}/${MAX_COMPARISON_PLAYERS})`;
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

function updateComparisonModalLabels() {
  // Aktualizuj etykiety poprzez data-label-key atribute
  document.querySelectorAll('#comparison-modal [data-label-key]').forEach(labelDiv => {
    const translationKey = labelDiv.getAttribute('data-label-key');
    if (translationKey) {
      labelDiv.textContent = t(translationKey);
    }
  });
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
  
  // Aktualizuj tłumaczenia etykiet w modalu
  updateComparisonModalLabels();
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

  const getColLabel = (label) => {
    const labelMap = {
      'Rating': 'colRating',
      'Zabójstwa': 'colKills',
      'Śmierci': 'colDeaths',
      'Teamkille': 'colTeamkills',
      'Wygrane': 'colWins',
      'Przegrane': 'colLosses',
      'Mecze': 'colMatches',
      'KD': 'colKD',
      'Win %': 'colWinrate'
    };
    const translationKey = labelMap[label];
    if (translationKey) {
      return t(translationKey);
    }
    // Powrót: zwróć etykietę bez zmian
    return label || '';
  };

  const headerCells = table.cols.map((c, idx) => {
    // Nick jest w kolumnie 0, colIndex = 1
    if (idx === 0) {
      return `<th data-sort-col="1">${t('playerRole')}<span class="sort-indicator"></span></th>`;
    }
    const colIndex = idx + 1;
    const label = getColLabel(c.label);
    return `<th data-sort-col="${colIndex}" data-col-name="${c.label}">${label}<span class="sort-indicator"></span></th>`;
  }).join("");

  thead.innerHTML = `
    <tr>
      <th>#</th>
      ${headerCells}
    </tr>
  `;

  const winrateColIndex = table.cols.findIndex(c => c.label === "Win %");
  const kdColIndex = table.cols.findIndex(c => c.label === "KD");
  const nickColIndex = 0; // Nick jest zawsze w kolumnie 0

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

  // pokaz mniej zmienne
  let initialDisplayed = null;
  const incrementsStack = [];

  // pokaż mniej przycisk
  const showLessBtn = document.getElementById('show-less-btn');
  function updateShowLessUI() {
    if (!showLessBtn) return;
    if (incrementsStack.length > 0) {
      showLessBtn.style.display = 'inline-block';
      showLessBtn.textContent = t('showLess');
    } else {
      showLessBtn.style.display = 'none';
    }
  }

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
        <span class="rank-name" style="color:${rank.color}">${rank.name}</span>
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
    // after first load, set initialDisplayed; subsequent loads push increments
    if (initialDisplayed === null) {
      initialDisplayed = displayed;
    } else {
      incrementsStack.push(nextRows.length);
    }

    attachPlayerClickHandlers();

    const btn = document.getElementById("load-more-btn");
    if (btn && displayed >= filteredRows.length) {
      btn.style.display = "none";
    }

    updateShowLessUI();
  }

  const btn = document.getElementById("load-more-btn");
  if (btn) {
    btn.onclick = () => {
      playSound('showmore.mp3');
      loadMoreRows(10);
    };
  }

  // Show less button behaviour
  const showLessBtnEl = document.getElementById('show-less-btn');
  if (showLessBtnEl) {
    showLessBtnEl.onclick = () => {
      playSound('press.mp3');
      // pop last increment
      const last = incrementsStack.pop();
      if (!last) return updateShowLessUI();

      // determine how many rows we should actually remove (don't go below initialDisplayed)
      const removable = Math.max(0, displayed - (initialDisplayed || 0));
      const removeCount = Math.min(last, removable);
      if (removeCount <= 0) return updateShowLessUI();

      // take a snapshot of current rows and pick the last `removeCount`
      const currentRows = Array.from(tbody.children);
      const rowsToRemove = currentRows.slice(-removeCount);

      // animate removal
      rowsToRemove.forEach(r => r.classList.add('row-remove'));

      // after animation, remove nodes and update counters
      setTimeout(() => {
        rowsToRemove.forEach(r => { if (r && r.parentNode) r.parentNode.removeChild(r); });
        displayed = Math.max(initialDisplayed || 0, displayed - removeCount);
        const lmBtn = document.getElementById('load-more-btn');
        if (lmBtn) lmBtn.style.display = 'inline-block';
        updateShowLessUI();
      }, 300);
    };
  }
  
const searchInput = document.getElementById("search-input");

if (searchInput) {
  searchInput.addEventListener('focus', () => {
    playSound('presstext.mp3');
  });
  
  searchInput.oninput = () => {
    const query = searchInput.value.toLowerCase();

    filteredRows = allRows.filter(row => {
      const nick = row.c[0].v.toLowerCase();
      return nick.includes(query);
    });

    displayed = 0;
    tbody.innerHTML = "";
    // reset expansion tracking
    initialDisplayed = null;
    incrementsStack.length = 0;
    updateShowLessUI();
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
    // reset expansion tracking
    initialDisplayed = null;
    incrementsStack.length = 0;
    updateShowLessUI();
    const btn = document.getElementById('load-more-btn');
    if (btn) btn.style.display = 'block';
    loadMoreRows(20);
    
    searchInput.focus();
  });
}

// Sortowanie kolumn
document.querySelectorAll('th[data-sort-col]').forEach(header => {
  header.addEventListener('click', () => {
    // data-sort-col zaczyna się od 1
    // ale sortColumn jest indeksowany od 0
    const colIndex = parseInt(header.dataset.sortCol);
    
    // trójstanowe sortowanie: dla Nick (colIndex=1) asc→desc→none, dla reszty desc→asc→none
    let newState = (colIndex === 1) ? 'asc' : 'desc';
    let isUnsorted = false;
    
    if (sortColumn === colIndex) {
      if (colIndex === 1) {
        // Nick: asc → desc → none
        if (header.classList.contains('sort-asc')) {
          newState = 'desc';
        } else if (header.classList.contains('sort-desc')) {
          newState = 'none';
          isUnsorted = true;
        }
      } else {
        // Reszta: desc → asc → none
        if (header.classList.contains('sort-desc')) {
          newState = 'asc';
        } else if (header.classList.contains('sort-asc')) {
          newState = 'none';
          isUnsorted = true;
        }
      }
    }
    
    // aktywuj odpowiednią klasę sortowania
    document.querySelectorAll('th[data-sort-col]').forEach(th => {
      th.classList.remove('sort-asc', 'sort-desc');
    });
    
    if (!isUnsorted) {
      header.classList.add(`sort-${newState}`);
      sortColumn = colIndex;
      sortDirection = newState;
    } else {
      // reset sortowania
      sortColumn = 0;
      sortDirection = 'asc';
    }
    
    // sortuj filteredRows według wybranej kolumny
    if (!isUnsorted) {
      filteredRows.sort((a, b) => {
        const cellA = a.c[colIndex - 1];
        const cellB = b.c[colIndex - 1];
        
        const valA = cellA?.v ?? '';
        const valB = cellB?.v ?? '';
        
        // Porównanie liczbowe, jeśli oba są liczbami
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);
        
        let result = 0;
        if (!isNaN(numA) && !isNaN(numB)) {
          result = numA - numB;
        } else {
          // Porównanie tekstowe (polskie sortowanie)
          result = String(valA).localeCompare(String(valB), 'pl');
        }
        
        return sortDirection === 'asc' ? result : -result;
      });
    } else {
      // reset do oryginalnego rankingu
      filteredRows.sort((a, b) => a.rankPosition - b.rankPosition);
    }
    
    // przeładuj widoczne wiersze
    const tbody = document.querySelector("#ranking tbody");
    displayed = 0;
    tbody.innerHTML = '';
    // reset expansion tracking when sorting/reseting
    initialDisplayed = null;
    incrementsStack.length = 0;
    updateShowLessUI();
    const btn = document.getElementById('load-more-btn');
    if (btn) btn.style.display = 'block';
    loadMoreRows(20);
  });
});

attachPlayerClickHandlers();

function attachPlayerClickHandlers() {
  document.querySelectorAll(".player-name").forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", e => {
      e.stopPropagation();
      playSound('press.mp3');
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
  document.getElementById("modal-matches").innerHTML = `<span style='opacity:0.6'>${t('loading')}</span>`;

  // fetch danych asynchronicznie
  loadLastMatches(nick);
  loadBestPlace(nick);
  
  // Ustaw przycisk porównania
  const compareBtn = document.getElementById("compare-btn");
  const isSelected = comparisonPlayers.includes(nick);
  compareBtn.textContent = isSelected ? t('removeFromComparison') : t('addToComparison');
  compareBtn.style.background = isSelected ? "#e53935" : "#cbbd9a";
  compareBtn.onclick = () => {
    playSound('press.mp3');
    togglePlayerComparison(nick);
    compareBtn.textContent = comparisonPlayers.includes(nick) ? t('removeFromComparison') : t('addToComparison');
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
        container.innerHTML = `<span style='opacity:0.6'>${translations[currentLanguage]['noData']}</span>`;
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
    // ESC dla FAQ
    closeFAQ();
  }
});

// === FAQ FUNCTIONS ===
function toggleFAQ() {
  const faqPanel = document.getElementById('faq-panel');
  if (!faqPanel) {
    console.error('FAQ panel element not found');
    return;
  }
  faqPanel.classList.toggle('open');
  playSound('press.mp3');
}

function closeFAQ() {
  const faqPanel = document.getElementById('faq-panel');
  if (!faqPanel) return;
  faqPanel.classList.remove('open');
}

function toggleFAQItem(element) {
  const faqItem = element.closest('.faq-item');
  if (faqItem) {
    faqItem.classList.toggle('active');
    playSound('press.mp3');
  }
}

// Zamknij FAQ gdy klikniesz poza panel
document.addEventListener('click', (e) => {
  const faqPanel = document.getElementById('faq-panel');
  const faqBtn = document.getElementById('faq-btn');
  const langBtn = e.target.closest('.lang-btn'); // Sprawdź czy klik był na przycisk języka
  
  if (faqPanel && faqBtn && !langBtn) { // Nie zamykaj FAQ jeśli klik był na lang-btn
    if (!faqPanel.contains(e.target) && !faqBtn.contains(e.target)) {
      closeFAQ();
    }
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

// Upewnij się, że FAQ funkcje są dostępne globalnie
window.toggleFAQ = toggleFAQ;
window.closeFAQ = closeFAQ;
window.toggleFAQItem = toggleFAQItem;
}



