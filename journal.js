document.addEventListener("DOMContentLoaded", function () {

  const notesContainer = document.getElementById("notesContainer");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const addNoteModal = document.getElementById("addNoteModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const noteForm = document.getElementById("noteForm");
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const emptyState = document.getElementById("emptyState");
  const confirmModal = document.getElementById("confirmModal");
  const cancelDeleteBtn = document.getElementById("cancelDeletionBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let noteToDeleteId = null;

  renderNotes();
  updateEmptyState();

  if (addNoteBtn) addNoteBtn.addEventListener("click", openAddNoteModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeAddNoteModal);
  if (noteForm) noteForm.addEventListener("submit", handleNoteSubmit);
  if (searchInput) searchInput.addEventListener("input", filterNotes);
  if (filterSelect) filterSelect.addEventListener("change", filterNotes);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeConfirmModal);
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener("click", confirmDeleteNote);

 
  const animatedElements = document.querySelectorAll(".journal-animate");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observerInstance.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));

  function renderNotes(notesToRender = notes) {
    if (!notesContainer) return;
    notesContainer.innerHTML = "";

    notesToRender.forEach((note, index) => {
      const noteElement = document.createElement("div");
      noteElement.className = "note-card fade-in";
      noteElement.setAttribute("data-tag", note.tag);
      noteElement.innerHTML = `
        <div class="note-content">
          <div class="note-header">
            <h3 class="note-title">${escapeHTML(note.title)}</h3>
            <div class="note-actions">
              <button class="delete-btn" data-id="${index}" type="button">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="note-text">${escapeHTML(note.content)}</p>
          <div class="note-footer">
            <span class="note-tag ${getTagClass(note.tag)}">
              ${getTagIcon(note.tag)} ${getTagName(note.tag)}
            </span>
            <span class="note-date">${formatDate(note.date)}</span>
          </div>
        </div>`;
      notesContainer.appendChild(noteElement);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        noteToDeleteId = parseInt(this.getAttribute("data-id"));
        openConfirmModal();
      });
    });
  }

  function getTagClass(tag) {
    const classes = {
      Joyful: "tag-Joyful",
      Gloomy: "tag-Gloomy",
      Nostalgic: "tag-Nostalgic",
      Frustrated: "tag-Frustrated",
    };
    return classes[tag] || "";
  }

  function getTagName(tag) {
    const names = {
      Joyful: "Joyful",
      Gloomy: "Gloomy",
      Nostalgic: "Nostalgic",
      Frustrated: "Frustrated",
    };
    return names[tag] || tag;
  }

  function getTagIcon(tag) {
    const icons = {
      Joyful: '<i class="fas fa-sun"></i>',
      Gloomy: '<i class="fas fa-cloud-rain"></i>',
      Nostalgic: '<i class="fas fa-hourglass-half"></i>',
      Frustrated: '<i class="fas fa-bolt"></i>',
    };
    return icons[tag] || "";
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function openAddNoteModal() {
    if (addNoteModal) {
      addNoteModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeAddNoteModal() {
    if (addNoteModal) {
      addNoteModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
    if (noteForm) {
      noteForm.reset();
    }
  }

  function openConfirmModal() {
    if (confirmModal) {
      confirmModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeConfirmModal() {
    if (confirmModal) {
      confirmModal.classList.remove("active");
      document.body.style.overflow = "auto";
    }
    noteToDeleteId = null;
  }

  function handleNoteSubmit(e) {
    e.preventDefault();

    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const checkedTag = document.querySelector('input[name="noteTag"]:checked');

    if (!titleInput || !contentInput) return;

    const newNote = {
      title: titleInput.value,
      content: contentInput.value,
      tag: checkedTag ? checkedTag.value : "Joyful",
      date: new Date().toISOString(),
    };

    notes.unshift(newNote);
    saveNotes();
    renderNotes();
    closeAddNoteModal();
    updateEmptyState();
    filterNotes();
  }

  function confirmDeleteNote() {
    if (noteToDeleteId !== null && noteToDeleteId >= 0 && noteToDeleteId < notes.length) {
      notes.splice(noteToDeleteId, 1);
      saveNotes();
      renderNotes();
      updateEmptyState();
      filterNotes();
      closeConfirmModal();
    }
  }

  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  function filterNotes() {
    if (!searchInput || !filterSelect) return;

    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterValue = filterSelect.value;

    let filteredNotes = notes;

    if (searchTerm) {
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm)
      );
    }

    if (filterValue !== "all") {
      filteredNotes = filteredNotes.filter(
        (note) => note.tag.toLowerCase() === filterValue.toLowerCase()
      );
    }

    renderNotes(filteredNotes);
    updateEmptyState(filteredNotes);
  }

  function updateEmptyState(notesToCheck = notes) {
    if (!emptyState) return;
    if (notesToCheck.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
    }
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});

function goToSection(sectionId) {
  document.querySelectorAll('.section-slide').forEach(sec => {
    sec.classList.remove('slide-active');
    sec.style.display = 'none';
  });

  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    setTimeout(() => {
      targetSection.classList.add('slide-active');
    }, 10);
    targetSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function goBackToPlaylist(sectionId) {
    document.querySelectorAll('.section-slide').forEach(sec => {
      sec.classList.remove('slide-active');
      sec.style.display = 'none';
    });
    
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => {
          target.classList.add('slide-active');
        }, 10);
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// Music Player Controls
function playPause() {
  let song = document.getElementById("playlistAudio");
  let ctrlIcon = document.getElementById("ctrlIcon");

  if (!song || !ctrlIcon) return;

  if (song.paused) {
    song.play().then(() => {
      ctrlIcon.classList.remove("fa-play");
      ctrlIcon.classList.add("fa-pause");
    }).catch(error => console.log("Playback prevented:", error));
  } else {
    song.pause();
    ctrlIcon.classList.remove("fa-pause");
    ctrlIcon.classList.add("fa-play");
  }
}

function playTrack(songFile, songTitle, artistName, imgPath) {
  const songSection = document.getElementById('song1');
  if (songSection) {
    songSection.style.display = 'block';

    document.querySelector('#song1 .song_name').innerText = songTitle;
    document.querySelector('#song1 .music-player p').innerText = artistName;
    document.querySelector('#song1 .song-img').src = imgPath;

    let audioPlayer = document.getElementById('playlistAudio');
    let sourceTag = audioPlayer.querySelector('source');

    sourceTag.src = songFile;
    audioPlayer.load();

    audioPlayer.play().then(() => {
      let ctrlIcon = document.getElementById('ctrlIcon');
      if (ctrlIcon) {
        ctrlIcon.classList.remove("fa-play");
        ctrlIcon.classList.add("fa-pause");
      }
    }).catch(error => console.log("Playback prevented:", error));

    songSection.scrollIntoView({ behavior: 'smooth' });
  }
}