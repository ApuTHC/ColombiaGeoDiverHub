// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgHsUrZByXBeX5u_WqZERdMQ0ldOzOiwM",
  authDomain: "colombiageodiverhub-66f71.firebaseapp.com",
  projectId: "colombiageodiverhub-66f71",
  storageBucket: "colombiageodiverhub-66f71.appspot.com",
  messagingSenderId: "307391538248",
  appId: "1:307391538248:web:3de9d0f4fbacd8aa31a47d",
  measurementId: "G-QFZBSS3TYX"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();


// FirebaseUI config.
var uiConfig = {
  signInSuccessUrl: 'index.html', 
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback
  // function.
  // Terms of service url/callback.
  tosUrl: '<your-tos-url>',
  // Privacy policy url/callback.
  privacyPolicyUrl: function () {
    window.location.assign('<your-privacy-policy-url>');
  }
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

initApp = function () {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      uname = user.displayName;
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      uid = user.uid;
      var phoneNumber = user.phoneNumber;
      var providerData = user.providerData;
      user.getIdToken().then(function (accessToken) {

        var jsonProfile = JSON.stringify({
          displayName: displayName,
          email: email,
          emailVerified: emailVerified,
          phoneNumber: phoneNumber,
          photoURL: photoURL,
          uid: uid,
          accessToken: accessToken,
          providerData: providerData
        }, null, '  ');



        $("#firebaseui-auth-container").addClass("d-none");
        $("#cancel").addClass("d-none");
        $("#modal-perfil-container").removeClass("d-none");
        $("#loginModalLabel").text("Bienvenido");
        $("#user-photo").attr("src", photoURL);
        $("#foto-perfil").attr("src", photoURL);
        $("#nombre-perfil").html(displayName);
        $("#correo-perfil").html(email);
        $("#semestre-perfil").html("ColombiaGeoDiverHub");


      });
    } else {
      $("#firebaseui-auth-container").removeClass("d-none");
      $("#cancel").removeClass("d-none");
      $("#modal-perfil-container").addClass("d-none");
      $("#logout").addClass("d-none");
    }
  }, function (error) {
    console.log(error);
  });
};


window.addEventListener('load', function () {
  initApp()
});
