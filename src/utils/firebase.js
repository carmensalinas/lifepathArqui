import firebase from "firebase/app";
import 'firebase/firestore'
var firebaseui = require('firebaseui');
// Initialize the FirebaseUI Widget using Firebase.


var firebaseConfig = {
  apiKey: "AIzaSyDUicAhp5pUzDpemfNyb3nKZ_tQnqKI7l4",
    authDomain: "lifepath-aff4c.firebaseapp.com",
    projectId: "lifepath-aff4c",
    storageBucket: "lifepath-aff4c.appspot.com",
    messagingSenderId: "1053957609389",
    appId: "1:1053957609389:web:e25e5b4c429b352ac3f324",

    //your firebase key here
  };


  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore()
export const fb = firebase
