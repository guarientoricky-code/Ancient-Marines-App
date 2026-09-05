/**
 * Main Application Logic - The Ancient Mariners Web App
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const songGridEl = document.getElementById('song-grid');
  const songViewerEl = document.getElementById('song-viewer');
  const songTitleEl = document.getElementById('viewer-title');
  const songAlbumEl = document.getElementById('viewer-album');
  const songTuningEl = document.getElementById('viewer-tuning');
  const songKeyEl = document.getElementById('viewer-key');
  const songBpmEl = document.getElementById('viewer-bpm');
  const songContentEl = document.getElementById('viewer-content');
  const searchInputEl = document.getElementById('search-input');
  const filterPillsEl = document.getElementById('filter-pills');
  
  // YouTube Elements
  const btnYtEmbedC = document.getElementById('btn-yt-embed-c');
  const btnYtEmbedOrig = document.getElementById('btn-yt-embed-orig');
  const linkYtExternal = document.getElementById('link-yt-external');
  const ytEmbedWrapper = document.getElementById('youtube-embed-wrapper');
  const ytPlayerStatusTitle = document.getElementById('yt-player-status-title');
  const ytIframe = document.getElementById('youtube-iframe');
  const btnCloseYtPlayer = document.getElementById('btn-close-yt-player');
  
  // Transpose Hint Elements
  const transposeHintBadge = document.getElementById('transpose-hint-badge');
  const transposeHintText = document.getElementById('transpose-hint-text');

  // Controls
  const btnBackEl = document.getElementById('btn-back');
  const btnTransposeMinus = document.getElementById('btn-transpose-minus');
  const btnTransposePlus = document.getElementById('btn-transpose-plus');
  const btnTransposeReset = document.getElementById('btn-transpose-reset');
  const transposeValueEl = document.getElementById('transpose-value');
  
  // Auto-scroll
  const btnScrollToggle = document.getElementById('btn-scroll-toggle');
  const scrollSpeedEl = document.getElementById('scroll-speed');
  
  // Stage Mode & Setlist
  const btnStageMode = document.getElementById('btn-stage-mode');
  const btnSetlist = document.getElementById('btn-setlist');
  const modalSetlist = document.getElementById('modal-setlist');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const setlistContainerEl = document.getElementById('setlist-container');
  const btnToggleSetlistFavorite = document.getElementById('btn-toggle-favorite');

  // Chord Popover
  const chordPopoverEl = document.getElementById('chord-popover');

  // State
  let currentSong = null;
  let currentSemitones = 0; // Default to ORIGINAL fingerings (0 semitones)
  let activeAlbumFilter = 'ALL';
  let isAutoScrolling = false;
  let autoScrollInterval = null;
  let mySetlist = JSON.parse(localStorage.getItem('ancient_mariners_setlist') || '[]');

  // Initialize App
  init();

  function init() {
    renderAlbumFilters();
    renderSongGrid(SONGS_DATABASE);
    setupEventListeners();
    checkUrlHash();
    updateSetlistBadge();
  }

  function renderAlbumFilters() {
    const albums = ['ALL', 'BAND_PRIORITY', ...new Set(SONGS_DATABASE.map(s => s.album.split(' (')[0]))];
    filterPillsEl.innerHTML = albums.map(album => {
      let label = album;
      if (album === 'ALL') label = 'Tutti gli Album';
      else if (album === 'BAND_PRIORITY') label = '⭐ Scaletta Band (9 Canzoni)';
      return `
        <button class="filter-pill ${album === 'ALL' ? 'active' : ''}" data-album="${album}">
          ${label}
        </button>
      `;
    }).join('');
  }

  function renderSongGrid(songs) {
    if (songs.length === 0) {
      songGridEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
          <h3>Nessuna canzone trovata</h3>
          <p>Prova a cercare con un altro termine o seleziona "Tutti gli Album".</p>
        </div>
      `;
      return;
    }

    songGridEl.innerHTML = songs.map(song => `
      <div class="song-card" data-song-id="${song.id}">
        <div class="song-card-header">
          <h3 class="song-title">${song.title}</h3>
          ${mySetlist.includes(song.id) ? '<span title="In Scaletta" style="color: var(--text-gold); font-size: 1.2rem;">★</span>' : ''}
        </div>
        <div class="song-album">${song.album}</div>
        <div class="song-tags">
          ${song.isBandPriority ? '<span class="badge badge-crimson">⭐ Scaletta</span>' : ''}
          <span class="badge">Accordi Originali (${song.key})</span>
          <span class="badge" style="border-color: var(--accent-crimson); color: var(--accent-crimson-bright);">Suono C: ${MusicTransposer.transposeChord(song.key, -4)}</span>
        </div>
      </div>
    `).join('');

    // Attach Click Event to Cards
    document.querySelectorAll('.song-card').forEach(card => {
      card.addEventListener('click', () => {
        const songId = card.dataset.songId;
        openSong(songId);
      });
    });
  }

  function openSong(songId) {
    const song = SONGS_DATABASE.find(s => s.id === songId);
    if (!song) return;

    currentSong = song;
    currentSemitones = 0; // Show original fingerings (0 semitones)
    updateTransposeUI();
    stopAutoScroll();

    songTitleEl.textContent = song.title;
    songAlbumEl.textContent = song.album;
    songTuningEl.textContent = `Accordi Originali (${song.key})`;
    songKeyEl.textContent = `${MusicTransposer.transposeChord(song.key, -4)} (2 toni sotto)`;
    songBpmEl.textContent = `${song.bpm} BPM`;

    // Setup YouTube external link
    linkYtExternal.href = song.youtubeCLink || `https://www.youtube.com/results?search_query=${encodeURIComponent(`Iron Maiden ${song.title} C tuning`)}`;

    // Reset YouTube embed
    ytEmbedWrapper.style.display = 'none';
    ytIframe.src = '';

    renderSongContent();

    // Toggle Views
    document.querySelector('.search-container').style.display = 'none';
    document.querySelector('.hero-banner').style.display = 'none';
    songGridEl.style.display = 'none';
    songViewerEl.classList.add('active');

    // Update URL hash without reload
    window.location.hash = `song=${song.id}`;
    
    // Favorite Button state
    updateFavoriteButtonUI();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeSongViewer() {
    stopAutoScroll();
    ytIframe.src = ''; // Stop video playback
    songViewerEl.classList.remove('active');
    document.querySelector('.search-container').style.display = 'block';
    document.querySelector('.hero-banner').style.display = 'block';
    songGridEl.style.display = 'grid';
    currentSong = null;
    window.location.hash = '';
  }

  function renderSongContent() {
    if (!currentSong) return;

    // Transpose raw text
    const transposedText = MusicTransposer.transposeContent(currentSong.content, currentSemitones);

    // Format content with spans for chords and pre for tab blocks
    let html = transposedText;

    // Replace [TAB]...[/TAB] blocks
    html = html.replace(/\[TAB\]([\s\S]*?)\[\/TAB\]/g, (match, tabCode) => {
      return `<pre class="tab-block">${tabCode.trim()}</pre>`;
    });

    // Replace section headers like [Verse 1], [Chorus], [Intro]
    html = html.replace(/\[(Verse[^\\]]*|Chorus[^\\]]*|Intro[^\\]]*|Outro[^\\]]*|Bridge[^\\]]*|Solo[^\\]]*)\]/g, (match, section) => {
      return `<div class="section-tag">${section}</div>`;
    });

    // Replace [Chord] tags into interactive spans
    html = html.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chordName) => {
      return `<span class="chord" data-chord="${chordName}">${chordName}</span>`;
    });

    songContentEl.innerHTML = html;

    // Attach chord tooltip / diagram listeners
    attachChordListeners();
  }

  function attachChordListeners() {
    document.querySelectorAll('.chord').forEach(chordEl => {
      chordEl.addEventListener('mouseenter', (e) => showChordDiagram(e, chordEl.dataset.chord));
      chordEl.addEventListener('mouseleave', hideChordDiagram);
      chordEl.addEventListener('click', (e) => {
        e.stopPropagation();
        showChordDiagram(e, chordEl.dataset.chord);
      });
    });
  }

  function showChordDiagram(e, chordName) {
    const chordInfo = GUITAR_CHORDS_DB[chordName] || GUITAR_CHORDS_DB[chordName.replace(/[0-9]/g, '')];
    
    let diagramHtml = '';
    if (chordInfo) {
      diagramHtml = `
        <div class="chord-diagram-title">Accordo: ${chordName}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Diteggiatura sulla tastiera</div>
        <div class="chord-grid-visual">
          E A D G B E (Fisicamente in C)<br>
          ${chordInfo.frets.split('').join(' ')}<br>
          <span style="color: var(--text-gold);">${chordInfo.fingers.split('').join(' ')}</span>
        </div>
      `;
    } else {
      diagramHtml = `
        <div class="chord-diagram-title">${chordName}</div>
        <div style="font-size: 0.85rem; color: var(--text-muted);">Posizione diteggiatura chitarra</div>
      `;
    }

    chordPopoverEl.innerHTML = diagramHtml;
    chordPopoverEl.classList.add('active');

    const rect = e.target.getBoundingClientRect();
    chordPopoverEl.style.left = `${Math.min(window.innerWidth - 230, Math.max(10, rect.left - 70))}px`;
    chordPopoverEl.style.top = `${rect.top + window.scrollY - 110}px`;
  }

  function hideChordDiagram() {
    chordPopoverEl.classList.remove('active');
  }

  // Transposition Handlers
  function updateTransposeUI() {
    const sign = currentSemitones > 0 ? '+' : '';
    transposeValueEl.textContent = `${sign}${currentSemitones}`;

    if (currentSemitones === 0) {
      transposeHintBadge.style.display = 'block';
      transposeHintText.textContent = 'Accordi Originali (Diteggiatura standard - Suonato sulle vostre chitarre in Do emetterà il suono in C)';
    } else {
      transposeHintBadge.style.display = 'block';
      if (currentSemitones === -4) {
        transposeHintText.textContent = 'Accordi trasposti formalmente in Do (C: -4 Semitoni)';
      } else {
        transposeHintText.textContent = `Trasposizione diteggiatura: ${sign}${currentSemitones} Semitoni`;
      }
    }
  }

  // Auto-scroll Engine
  function toggleAutoScroll() {
    if (isAutoScrolling) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  }

  function startAutoScroll() {
    isAutoScrolling = true;
    btnScrollToggle.innerHTML = '<span>⏸ Fermare Scroll</span>';
    btnScrollToggle.classList.add('btn-primary');

    const scrollStep = () => {
      if (!isAutoScrolling) return;
      const speed = parseInt(scrollSpeedEl.value, 10);
      window.scrollBy({ top: speed, behavior: 'smooth' });

      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20) {
        stopAutoScroll(); // Stop at end of page
      }
    };

    autoScrollInterval = setInterval(scrollStep, 250);
  }

  function stopAutoScroll() {
    isAutoScrolling = false;
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    btnScrollToggle.innerHTML = '<span>▶ Auto-Scroll</span>';
    btnScrollToggle.classList.remove('btn-primary');
  }

  // Search & Filters
  function handleSearchAndFilter() {
    const query = searchInputEl.value.toLowerCase().trim();

    const filtered = SONGS_DATABASE.filter(song => {
      let matchesFilter = false;
      if (activeAlbumFilter === 'ALL') {
        matchesFilter = true;
      } else if (activeAlbumFilter === 'BAND_PRIORITY') {
        matchesFilter = !!song.isBandPriority;
      } else {
        matchesFilter = song.album.startsWith(activeAlbumFilter);
      }

      const matchesQuery = !query || 
        song.title.toLowerCase().includes(query) ||
        song.album.toLowerCase().includes(query) ||
        song.key.toLowerCase().includes(query) ||
        song.content.toLowerCase().includes(query);

      return matchesFilter && matchesQuery;
    });

    renderSongGrid(filtered);
  }

  // Setlist Favorite Toggle
  function toggleFavorite() {
    if (!currentSong) return;
    const index = mySetlist.indexOf(currentSong.id);
    if (index === -1) {
      mySetlist.push(currentSong.id);
    } else {
      mySetlist.splice(index, 1);
    }
    localStorage.setItem('ancient_mariners_setlist', JSON.stringify(mySetlist));
    updateFavoriteButtonUI();
    updateSetlistBadge();
  }

  function updateFavoriteButtonUI() {
    if (!currentSong) return;
    const isFav = mySetlist.includes(currentSong.id);
    btnToggleSetlistFavorite.innerHTML = isFav 
      ? '★ Rimuovi da Scaletta' 
      : '☆ Aggiungi a Scaletta';
  }

  function updateSetlistBadge() {
    btnSetlist.innerHTML = `📋 Scaletta live (${mySetlist.length})`;
  }

  function renderSetlistModal() {
    if (mySetlist.length === 0) {
      setlistContainerEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Nessuna canzone aggiunta alla tua scaletta live.<br>Apri una canzone e premi "☆ Aggiungi a Scaletta".
        </div>
      `;
      return;
    }

    const songsInSetlist = mySetlist.map(id => SONGS_DATABASE.find(s => s.id === id)).filter(Boolean);

    setlistContainerEl.innerHTML = songsInSetlist.map((song, index) => `
      <div class="setlist-item">
        <div>
          <strong>${index + 1}. ${song.title}</strong>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${song.album} | Accordi Orig: ${song.key}</div>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-open-setlist" data-id="${song.id}">Apri</button>
          <button class="btn btn-remove-setlist" data-id="${song.id}" style="color: var(--accent-crimson);">✕</button>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.btn-open-setlist').forEach(btn => {
      btn.addEventListener('click', () => {
        modalSetlist.classList.remove('active');
        openSong(btn.dataset.id);
      });
    });

    document.querySelectorAll('.btn-remove-setlist').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        mySetlist = mySetlist.filter(sId => sId !== id);
        localStorage.setItem('ancient_mariners_setlist', JSON.stringify(mySetlist));
        renderSetlistModal();
        updateSetlistBadge();
      });
    });
  }

  function setupEventListeners() {
    // Player Audio in C Tuning (Esatti video forniti dalla band)
    btnYtEmbedC.addEventListener('click', () => {
      if (!currentSong) return;
      ytEmbedWrapper.style.display = 'block';
      ytPlayerStatusTitle.textContent = `🎸 Player Audio in DO (C Tuning) — ${currentSong.title}`;
      
      const cVideoId = currentSong.youtubeCId || 'fMS63sq13EA';
      ytIframe.src = `https://www.youtube.com/embed/${cVideoId}?autoplay=1`;
      
      ytEmbedWrapper.scrollIntoView({ behavior: 'smooth' });
    });

    // Player Audio Originale (E Standard)
    btnYtEmbedOrig.addEventListener('click', () => {
      if (!currentSong) return;
      ytEmbedWrapper.style.display = 'block';
      ytPlayerStatusTitle.textContent = `🔴 Audio Originale da Studio (E Standard) — ${currentSong.title}`;
      
      const embedId = currentSong.youtubeId || 'X4bgXH3sJ2Q';
      ytIframe.src = `https://www.youtube.com/embed/${embedId}?autoplay=1`;
      
      ytEmbedWrapper.scrollIntoView({ behavior: 'smooth' });
    });

    // Close Player
    btnCloseYtPlayer.addEventListener('click', () => {
      ytEmbedWrapper.style.display = 'none';
      ytIframe.src = '';
    });

    // Search input
    searchInputEl.addEventListener('input', handleSearchAndFilter);

    // Album filters
    filterPillsEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-pill')) {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        activeAlbumFilter = e.target.dataset.album;
        handleSearchAndFilter();
      }
    });

    // Back to catalog
    btnBackEl.addEventListener('click', closeSongViewer);

    // Transpose
    btnTransposePlus.addEventListener('click', () => {
      currentSemitones++;
      updateTransposeUI();
      renderSongContent();
    });

    btnTransposeMinus.addEventListener('click', () => {
      currentSemitones--;
      updateTransposeUI();
      renderSongContent();
    });

    btnTransposeReset.addEventListener('click', () => {
      currentSemitones = 0;
      updateTransposeUI();
      renderSongContent();
    });

    // Auto scroll
    btnScrollToggle.addEventListener('click', toggleAutoScroll);

    // Stage Mode
    btnStageMode.addEventListener('click', () => {
      document.body.classList.toggle('stage-mode');
      const isStage = document.body.classList.contains('stage-mode');
      btnStageMode.style.borderColor = isStage ? 'var(--text-gold)' : 'var(--border-color)';
    });

    // Setlist modal
    btnSetlist.addEventListener('click', () => {
      renderSetlistModal();
      modalSetlist.classList.add('active');
    });

    btnCloseModal.addEventListener('click', () => {
      modalSetlist.classList.remove('active');
    });

    btnToggleSetlistFavorite.addEventListener('click', toggleFavorite);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInputEl) {
        e.preventDefault();
        searchInputEl.focus();
      }
      if (e.key === 'Escape') {
        if (modalSetlist.classList.contains('active')) {
          modalSetlist.classList.remove('active');
        } else if (songViewerEl.classList.contains('active')) {
          closeSongViewer();
        }
      }
    });
  }

  function checkUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#song=')) {
      const songId = hash.replace('#song=', '');
      openSong(songId);
    }
  }
});
