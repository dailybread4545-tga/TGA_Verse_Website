TGA Songs Website (Modular)

Files:
- index.html
- style.css
- app.js
- qotd.jpg  (you should place the hero image in same folder)

Instructions:
1. Replace firebaseConfig in app.js with your Firebase project values.
2. Enable Firebase services: Authentication (Email/Password), Firestore, Storage.
3. Add an admin user in Firebase Console (Authentication -> Users) or allow create-from-login (code offers create user prompt).
4. Set Firestore/Storage rules:
   Firestore:
     match /siteData/{doc} { allow read: if true; allow write: if request.auth != null; }
   Storage:
     match /audio/{allPaths=**} { allow read: if true; allow write: if request.auth != null; }
5. Open index.html in a browser or host on Firebase Hosting.

Notes:
- The app uploads audio files to /audio/ in Storage and writes audioUrl to Firestore at siteData/content.
- For production, enforce stricter security rules and restrict admin users.
