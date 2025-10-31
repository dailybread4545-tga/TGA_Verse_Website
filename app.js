
/* ----- CONFIG ----- */
const firebaseConfig = {
  apiKey: "AIzaSyDDvOFSxhS7gJ9ARXyUKT71dsljzMR559A",
  authDomain: "quote-of-the-day-7403e.firebaseapp.com",
  projectId: "quote-of-the-day-7403e",
  storageBucket: "quote-of-the-day-7403e.appspot.com",
  messagingSenderId: "772583155835",
  appId: "1:772583155835:web:225040a7f1a3ce72339ade",
  measurementId: "G-2777KCXKDF"
};

/* ----- INIT ----- */
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ----- ELEMENTS ----- */
const songTitleEl = document.getElementById('songTitle');
const songRefEl = document.getElementById('songRef');
const lyricsEl = document.getElementById('lyrics');
const dailyEl = document.getElementById('dailyBread');
const dailyRefEl = document.getElementById('dailyRef');

const adminBtn = document.getElementById('adminBtn');
const modal = document.getElementById('modal');
const authSection = document.getElementById('authSection');
const editor = document.getElementById('editor');
const loginSubmit = document.getElementById('loginSubmit');
const adminEmail = document.getElementById('adminEmail');
const adminPass = document.getElementById('adminPass');
const closeModal = document.getElementById('closeModal');
const saveBtn = document.getElementById('saveBtn');
const logoutBtn = document.getElementById('logoutBtn');

const editTitle = document.getElementById('editTitle');
const editRef = document.getElementById('editRef');
const editLyrics = document.getElementById('editLyrics');
const editDaily = document.getElementById('editDaily');
const editDailyRef = document.getElementById('editDailyRef');

/* ----- CALENDAR ----- */
let currentDate = new Date();
let viewYear = currentDate.getFullYear();
let viewMonth = currentDate.getMonth();

function renderCalendar(year, month) {
  const cal = document.getElementById('calendar');
  cal.innerHTML = '';
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = first.getDay();

  for (let i = 0; i < startDay; i++) {
    const d = document.createElement('div');
    d.className = 'day other-month';
    cal.appendChild(d);
  }

  for (let d = 1; d <= last.getDate(); d++) {
    const cell = document.createElement('div');
    cell.className = 'day';
    cell.textContent = d;
    if (year === currentDate.getFullYear() && month === currentDate.getMonth() && d === currentDate.getDate()) {
      cell.classList.add('today');
    }
    cal.appendChild(cell);
  }

  const monthLabel = document.getElementById('calMonth');
  const monthNames = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  monthLabel.textContent = monthNames[month] + ' ' + year;
}

document.getElementById('prev').addEventListener('click', () => {
  viewMonth--;
  if (viewMonth < 0) { viewMonth = 11; viewYear--; }
  renderCalendar(viewYear, viewMonth);
});

document.getElementById('next').addEventListener('click', () => {
  viewMonth++;
  if (viewMonth > 11) { viewMonth = 0; viewYear++; }
  renderCalendar(viewYear, viewMonth);
});

renderCalendar(viewYear, viewMonth);

/* ----- LOAD & RENDER SITE DATA ----- */
async function loadContent() {
  try {
    const doc = await db.collection('siteData').doc('content').get();
    if (doc.exists) {
      const data = doc.data();
      songTitleEl.textContent = data.title || 'The Mark Of The Beast';
      songRefEl.textContent = data.ref || '56-0715';
      lyricsEl.innerHTML = (data.lyrics || '').replace(/\n/g, '<br>');
      dailyEl.textContent = data.dailyText || 'Default daily bread';
      dailyRefEl.textContent = data.dailyRef || 'John 4:14';

      // Load admin editor fields
      editTitle.value = data.title || '';
      editRef.value = data.ref || '';
      editLyrics.value = data.lyrics || '';
      editDaily.value = data.dailyText || '';
      editDailyRef.value = data.dailyRef || '';
    } else {
      await db.collection('siteData').doc('content').set({
        title: 'The Mark Of The Beast',
        ref: '56-0715',
        lyrics: 'Put your text here',
        dailyText: 'Default daily bread',
        dailyRef: 'John 4:14'
      });
      await loadContent();
    }
  } catch (err) {
    console.error('Load content error', err);
  }
}
loadContent();

/* ----- ADMIN MODAL HANDLERS ----- */
adminBtn.addEventListener('click', () => {
  modal.classList.add('show');
  adminEmail.value = '';
  adminPass.value = '';
  authSection.style.display = 'block';
  editor.style.display = 'none';
});

closeModal.addEventListener('click', () => modal.classList.remove('show'));

/* ----- AUTH (FIREBASE EMAIL/PW) ----- */
loginSubmit.addEventListener('click', async () => {
  const email = adminEmail.value.trim();
  const pass = adminPass.value || '';
  if (!email || !pass) { alert('Provide email & password'); return; }

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    authSection.style.display = 'none';
    editor.style.display = 'block';
    await loadContent();
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      if (confirm('User not found. Create account?')) {
        try {
          await auth.createUserWithEmailAndPassword(email, pass);
          alert('Account created. You are signed in.');
          authSection.style.display = 'none';
          editor.style.display = 'block';
          await loadContent();
        } catch (ce) {
          alert('Create user failed: ' + ce.message);
        }
      }
    } else {
      alert('Login failed: ' + e.message);
    }
  }
});

/* ----- LOGOUT ----- */
logoutBtn.addEventListener('click', async () => {
  await auth.signOut();
  editor.style.display = 'none';
  authSection.style.display = 'block';
  adminEmail.value = '';
  adminPass.value = '';
  modal.classList.remove('show');
});

/* ----- SAVE TO FIRESTORE ----- */
saveBtn.addEventListener('click', async () => {
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  try {
    const payload = {
      title: editTitle.value.trim(),
      ref: editRef.value.trim(),
      lyrics: editLyrics.value.trim(),
      dailyText: editDaily.value.trim(),
      dailyRef: editDailyRef.value.trim()
    };
    await db.collection('siteData').doc('content').set(payload, { merge: true });

    // update UI instantly
    songTitleEl.textContent = payload.title;
    songRefEl.textContent = payload.ref;
    lyricsEl.innerHTML = payload.lyrics.replace(/\n/g, '<br>');
    dailyEl.textContent = payload.dailyText;
    dailyRefEl.textContent = payload.dailyRef;

    alert('Saved successfully!');
    modal.classList.remove('show');
  } catch (err) {
    alert('Save failed: ' + (err.message || err));
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
});

/* ----- AUTH STATE LISTENER ----- */
auth.onAuthStateChanged(user => {
  if (user) console.log('Signed in as', user.email);
  else console.log('Signed out');
});
