<template>
  <div id="activities">

    <modal name="my-delete-modal" :adaptative="true" :width="320" :height="200">
        <div class="title">
          ¿Borrar {{nameActToDelete}}?
        </div>
        Se borrará para todos los miembros
        <br>
        <button :disabled="loading" @click="confirmDelete()" class="btn-new btn-danger">{{loading?'borrando...':'Confirmar'}}</button>
    </modal>

    <modal name="my-first-modal" :adaptative="true" :width="320" :height="400">
        <div class="title">
          Nueva Actividad
        </div>
        <input class="act-name" type="text" v-model="actName" placeholder="nombre de actividad(máx 20 car)">
        <label class="act-name">
          <input type="checkbox" v-model="hasPassword">
          Contraseña?
        </label>
        <input class="act-name" type="password" v-model="password" placeholder="contraseña segura" v-show="hasPassword">
        <div style="font-size:0.7rem;" v-show="hasPassword">Use entre 8 y 20 carácteres(mayúsculas,minúsculas y especiales)</div>
        <button :disabled="loading" @click="newAct()" class="btn-new">{{loading?'agregando...':'Agregar'}}</button>
        <br>
        <small style="color:#E34B5B">{{error}}</small>
    </modal>
    <modal name="my-second-modal" :adaptative="true" :width="320" :height="220">
        <div class="title">
          Nueva Tarea en {{nameAct}}
        </div>
        <input class="act-name" type="text" v-model="taskName" placeholder="nombre de tarea(máx 50 car)">
        <button :disabled="!taskName || loading" @click="newTaskAdd()" class="btn-new">{{loading?'agregando...':'Agregar'}}</button>
        <br>
        <small style="color:#E34B5B">{{error}}</small>
    </modal>

    <modal name="my-third-modal" :adaptative="true" :width="320" :height="250">
        <div class="title">
          Link de actividad
        </div>
        <input class="act-name" disabled type="text" v-model="generatedLink">
        <button v-tooltip.top-center="'copiado'" class="btn-new" v-show="copied">copiar link</button>
        <button @click="copyLink()" class="btn-new" v-show="!copied">copiar link</button>
        <button @click="shareLink()" class="btn-new">compartir link</button>
    </modal>

    <div class="header">
      <div class="title">
        Mis Actividadesssss ({{activities.length}})
      </div>
      <button class="add" @click="add">+</button>
      <button class="actividad" @click="add">hey</button>
    </div>
    <hr>
    <div
      v-for="(activ,index) in activities"
      class="actividad"
      :key="activ.id">
      <div class="header">
        <i class="fas fa-link" style="color: grey;margin-right:5px" @click="genLink(activ.id)"></i>
        <div class="mini-title">
          {{activ.name}}
        </div>
        <button class="remove" :disabled="loading" @click="requestDelete(activ.name,activ.id)">x</button>
        <i class="fas fa-key" style="color: grey;margin-left:5px" v-if="activ.hasPassword"></i>
      </div>
      <div class="content">
        Tareas: {{activ.tasks.length}} <button class="add" @click="addTask(activ.name,index,activ.id)">+</button>
      </div>
      <div v-for="task in activ.tasks" :key="task.name+activ.id">
        - <select style="margin-left:5px" v-model="task.priority">
          <option v-for="index in activ.tasks.length" :key="index">{{index}}</option>
        </select>
         <label :class="{'task-done': task.done}">{{task.name}}<input type="checkbox" style="margin-left:5px" v-model="task.done"></label>
        
        <br>
      </div>
      <br>
      <button v-if="compareArray(activ.tasks,activ.tasksBackup)" class="btn-new" @click="saveChanges(activ.id,activ.tasks)" :disabled="loading">guardar cambios</button>
      <br>
      <small>
        Creado el {{formatDate(activ.date)}}
      </small>
    </div>
  </div>
</template>

<script>

import {db} from '../utils/firebase'
const baseurl = location.hostname==='localhost'?'https://upcex.herokuapp.com/actividades/':'https://upcex.herokuapp.com/actividades/'

export default {
  name: 'Actividades',
  data(){
    return {
      actToDelete: '',
      nameActToDelete: '',
      activities:[],
      actName: '',
      hasPassword: false,
      password: '',
      username: '',
      error: '',
      taskName:'',
      nameAct: '',
      idAct:'',
      actIndex:'',
      loading: false,
      generatedLink: '',
      copied:false
    }
  },
  methods:{
    async confirmDelete(){
      console.log('wdf')
      this.loading = true
      try {
        await db.collection("activities").doc(this.actToDelete).delete()
        this.getActs()
        this.$modal.hide("my-delete-modal")
      } catch (error) {
        console.log(error)
        alert('No se pudo borrar, recargue la página e intente nuevamente')
      }
      this.loading = false
    },
    requestDelete(name,id){
      this.actToDelete = id
      this.nameActToDelete = name
      this.$modal.show("my-delete-modal")
    },
    async saveChanges(id, tasks){
      this.loading = true
      try {
        await db.collection("activities").doc(id).update({tasks})
        this.getActs()
      } catch (error) {
        console.log(error)
        alert('No se pudo guardar los cambios, intente nuevamente')
      }
      this.loading = false
    },
    compareArray(arr1, arr2){
      return JSON.stringify(arr1)!=JSON.stringify(arr2)
    },
    shareLink(){
      if (navigator.share) {
        navigator.share({
          title: 'Compartir actividad',
          url: this.generatedLink
          }).then(() => {
            console.log('Thanks for use UPCex!');
          })
          .catch(console.error);
      } else {
          alert('Este navegador no soporta la función de compartir link, por favor use el boton de copiar link')
      }
    },
    async copyLink(){
      await navigator.clipboard.writeText(this.generatedLink);
      this.copied = true
      setTimeout(() => {
        this.copied = false
      }, 500);
    },
    genLink(activity){
      this.generatedLink = baseurl + activity
      this.$modal.show('my-third-modal');
    },
    async newTaskAdd(){
      var that = this
      this.error = ''
      if(!this.taskName.length>0) return this.error = 'Nombre no puede estar vacío'
      if(this.taskName.length>50) return this.error = 'Máximo 50 caracteres'
      this.loading = true
      this.activities[this.actIndex].tasks.forEach(e => {
        if(e.name == that.taskName) return that.error = 'No se puede repetir nombre de tarea'
      });
      if(this.error)return this.loading = false
      let tasks = this.activities[this.actIndex].tasks
      tasks.push({name:this.taskName,priority: tasks.length+1,done:false})
      await db.collection("activities").doc(this.idAct).update({tasks})
      this.getActs()
      this.$modal.hide('my-second-modal');
      this.loading = false
      this.taskName = ''
    },
    addTask(name,index,id){
      this.idAct = id
      this.nameAct = name
      this.actIndex = index
      this.$modal.show('my-second-modal');
    },
    formatDate(date){
      let d = new Date(date)
      return `${d.getDate()}/${String(d.getMonth()+101).substring(1,3)} a las ${d.getHours()}:${String(d.getMinutes()+100).substring(1,3)}`
    },
    add(){
      this.$modal.show('my-first-modal');
    },
    async newAct(){
      let pattern = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{8,20}$")
      var that = this
      this.error = ''
      if(!this.actName.length>0) return this.error = 'Nombre no puede estar vacío'
      if(this.actName.length>20) return this.error = 'Máximo 20 caracteres'
      if(this.hasPassword){
        if(!pattern.test(this.password)) return this.error = "Contraseña no cumple con los requisitos"
      }
      this.loading = true
      this.activities.forEach(e => {
        if(e.name == this.actName) return that.error = 'No se puede repetir nombre de actividad'
      });
      if(this.error)return this.loading = false
      await db.collection("activities").doc()
        .set({
          name:this.actName,
          hasPassword: this.hasPassword,
          password: this.password,
          members:[this.username],
          date: Date.now(),
          tasks: []
        })
      this.getActs()
      this.$modal.hide('my-first-modal');
      this.loading = false
      this.actName = ''
    },
    getActs(){
      var that = this
      db.collection("activities")
      .where("members", "array-contains", this.username)
      .get()
      .then((querySnap) => {
        // .onSnapshot(querySnap=>{
          let docs= []
          querySnap.forEach(element => {
            let e = element.data()
            e.id = element.id
            e.tasks.sort((a,b) =>(a.priority>b.priority)?1:-1)
            e.tasksBackup = JSON.parse(JSON.stringify(e.tasks))
            docs.push(e)
          });
          docs.sort((a,b) =>(a.date<b.date)?1:-1)
          that.activities = [...docs]
          console.log(that.activities)
      })
    }
  },
  created(){
    this.username = localStorage.getItem('username')
    if(!this.username){
      this.$router.push('/')
    }else{
      this.getActs()
    }
  }

}
</script>

<style lang="scss">

.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
    z-index: 1;
  }

  &[x-placement^="top"] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity .15s, visibility .15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity .15s;
  }
}
</style>


<style>

.btn-danger{
  background-color: #E34B5B !important;
}

.remove{
  padding: 5px 10px;
  color: white;
  background-color: #E34B5B;
  border: none;
}


.content{
  padding: 10px;
}

.actividad{
  width: 770vw;
  margin: 10px auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
  max-width: 300px;
}


.mini-title{
  font-size: 1.2rem;
  display: inline-block;
  margin: 10px;
  border-bottom: solid 2px wheat;
}


.add{
  padding: 5px 10px;
  color: white;
  background-color: #4CAF50;
  border: none;
}

.header{
  display: inline-block;
}


.title{
  font-size: 1.4rem;
  padding: 10px 10px;
  display: inline-block;
}

.act-name{
  text-align: center;
  width: 65vw;
  max-width: 280px;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;

}
.btn-new{
  width: 40vw;
  max-width: 200px;
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-new:hover{
  background-color: #45a049;
}

#activities{
  min-height: 100vh;
}

</style>
