<template>
  <div class="home">
    <div class="login">
      <img src="https://gblobscdn.gitbook.com/spaces%2F-M2g31CUvdCruJm660Ot%2Favatar-1591606200757.png?alt=media" style="margin:0 auto" alt="logo" height="140px" width="140px">
      <!-- <input type="text" id="username" placeholder="Registra tu nombre" v-model="username"> -->
      <button @click="logIn" class="login-btn" :disabled="loading">{{loading?'registrando...':'Ingresa con Google'}}</button>
      <small class="error">{{error}}</small>
    </div>
    <div class="welcome" :class="{'appear':newUser}">
      BIENVENIDO...
    </div>
  </div>
</template>

<script>
// @ is an alias to /src


import {db,fb} from '../utils/firebase'
	


export default {
  name: 'Home',
  data(){
    return{
      username:'',
      error: '',
      loading : false,
      newUser: false
    }
  },
  methods:{
    signIn(email,name){
      this.error= ''
      this.loading = true
      var that = this
      var docRef = db.collection("users").doc(email);
      docRef.get().then(async (doc) => {
        if (!doc.exists) {
            that.newUser = true
            await db.collection('users').doc(email).set({name: name})
        }
        localStorage.setItem('email', email)
        that.$router.push('/actividades')
        
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
    },

    logIn(){
      var that = this
      var provider = new fb.auth.GoogleAuthProvider();
      fb.auth()
      .signInWithPopup(provider)
      .then((result) => {
        var credential = result.credential;
        console.log(credential);
        var token = credential.accessToken;
        console.log(token);
        var user = result.user;
        console.log(user);
        that.signIn(user.email, user.displayName)
      }).catch((error) => {
        // Handle Errors here.
        console.log(error);
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        var credential = error.credential;
      });
    },
    async saveUser(email,name,id){
      try {
        await db.collection('users').doc().set({email,name, id, date: Date.now()})
        console.log("ok");
        
      } catch (error) {
        console.log(error);
      }
      

	
    }
  },
  created(){
    let logged = localStorage.getItem('username')
    if(logged) this.$router.push('/actividades')
  }
}
</script>

<style>

.welcome{
  position: absolute;
  top: 20vh;
  font-size: 2rem;
  color: #DCDADB;
  transition: all 1s ease;
}

.appear{
  color: #525050;
}


.home{
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('http://cdn.home-designing.com/wp-content/uploads/2018/06/home-office-minimalist-furniture.jpg');
  background-size: cover;
  background-position: center;
}

.login{
  display: flex;
  flex-direction: column;
  background-color: #DDDBDC;
  border-radius: 10px;
  padding: 30px;
}

#username, #password{
  margin-top: 20px;
  text-align: center;
  border-radius: 10px;
  border: none;
  -webkit-appearance: none;
  height: 5vh;
  width: 50vw;
  max-width: 250px;
  color: gray;
  background: linear-gradient(145deg, #FFFFFF, #B6B5B6);
  box-shadow: 9.91px 9.91px 15px #C9C7C8, -9.91px -9.91px 15px #F1EFF0;
  transition: all .2s ease-out
}
/* #1071A3 */
#username:focus{
  background: #DDDBDC;
  box-shadow: inset 9.91px 9.91px 15px #C9C7C8, inset -9.91px -9.91px 15px #F1EFF0;
}

.login-btn{
  margin-top: 15px;
  height: 5vh;
  width: 50vw;
  max-width: 250px;
  color: white;
  border: none;
  border-radius: 10px;
  background: linear-gradient(145deg, #1385C0, #0D5D86);
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
}

.login-btn:active{
  background: #1071A3;
  box-shadow: inset 9.91px 9.91px 15px #0F6794, inset -9.91px -9.91px 15px #117BB2;
}

.error{
  margin-top:10px;
  color:#E34B5B;
  overflow-wrap:normal;
  width:50vw;
  max-width: 250px;
}

</style>
