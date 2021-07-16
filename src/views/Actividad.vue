<template>
  <div id="activities">

    <modal name="my-delete-modal" :adaptative="true" :width="320" :height="200">
        <div class="title">
          ¿Borrar {{nameActToDelete}}?
        </div>
        Se borrará para todos los miembros
        <br>
        <button :disabled="!taskName || loading" @click="confirmDelete()" class="btn-new btn-danger">{{loading?'borrando...':'Confirmar'}}</button>
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

    <modal name="my-fourth-modal" :adaptative="true" :width="320" :height="activitie.hasPassword?260:150">
        <div class="title">
          Miembros: {{activitie.members.join(',')}}
        </div>
        <input class="act-name" :type="showPass?'text':'password'" placeholder="contraseña" v-model="password" v-if="activitie.hasPassword">
        <label class="act-name" v-if="activitie.hasPassword">
          <input type="checkbox" v-model="showPass">
          ver contraseña
        </label>
        <button @click="confirmJoin()" :disabled="loading" class="btn-new">aceptar invitación</button>
        <small style="color:#E34B5B">{{error}}</small>
    </modal>

    <div class="header">
      <button class="add" @click="back"><i class="fas fa-backward"></i></button>
      <div class="title">
        Volver a todas las actividades
      </div>
    </div>
    <hr>
    <div v-if="notFound">
      <div class="actividad">No se encontró actividad, quizás ya haya sido archivada</div>
    </div>
    <div v-else>
      <div class="actividad" v-if="!joined">
        <div class="header">
          <div class="mini-title">
            {{activitie.name}}
          </div>
          <button class="remove" disabled >x</button>
          <i class="fas fa-key" style="color: grey;margin-left:5px" v-if="activitie.hasPassword"></i>
        </div>
        <div class="content">
          Tareas: {{activitie.tasks.length}} <button class="add" disabled>+</button>
        </div>
        <button @click="join" :disabled="!activitie.id" class="btn-new">unirse</button>
        <br>
        <small>
          Creado el {{formatDate(activitie.date)}}
        </small>
      </div>
      <div class="actividad" v-else>
        <div class="header">
          <i class="fas fa-link" style="color: grey;margin-right:5px" @click="genLink(activitie.id)"></i>
          <div class="mini-title">
            {{activitie.name}}
          </div>
          <button class="remove" :disabled="loading" @click="requestDelete(activitie.name,activitie.id)">x</button>
          <i class="fas fa-key" style="color: grey;margin-left:5px" v-if="activitie.hasPassword"></i>
        </div>
        <div class="content">
          Tareas: {{activitie.tasks.length}} <button class="add" @click="addTask(activitie.name,activitie.id)">+</button>
        </div>
        <div v-for="task in activitie.tasks" :key="task.name+activitie.id">
        - <select style="margin-left:5px" v-model="task.priority">
          <option v-for="index in activitie.tasks.length" :key="index">{{index}}</option>
        </select>
         <label :class="{'task-done': task.done}">{{task.name}}<input type="checkbox" style="margin-left:5px" v-model="task.done"></label>
        
        <br>
      </div>
         <br>
        <button v-if="compareArray(activitie.tasks,activitie.tasksBackup)" class="btn-new" @click="saveChanges(activitie.tasks)" :disabled="loading">guardar cambios</button>
        <br>
        <small>
          Creado el {{formatDate(activitie.date)}}
        </small>
      </div>
    </div>
  </div>
</template>

<script>

import {db} from '../utils/firebase'
const baseurl = location.hostname==='localhost'?'https:/lifepath-aff4c.web.app/actividades/':'https:/lifepath-aff4c.web.app/actividades/'

export default {
  name: 'Actividad',
  data(){
    return {
      actToDelete: '',
      nameActToDelete: '',
      joined: false,
      activitie: {
        tasks:[],
        members:[]
      },
      actName: '',
      showPass: false,
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
      copied:false,
      notFound: false
    }
  },
  methods:{
    async confirmDelete(){
      this.loading = true
      try {
        await db.collection("activities").doc(this.actToDelete).delete()
        this.getActs()
        this.$modal.hide("my-delete-modal")
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },
    requestDelete(name,id){
      this.actToDelete = id
      this.nameActToDelete = name
      this.$modal.show("my-delete-modal")
    },
    async saveChanges(tasks){
      this.loading = true
      try {
        await db.collection("activities").doc(this.activitie.id).update({tasks})
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
    async confirmJoin(){
      this.loading = true
      this.error = ''
      if(this.activitie.hasPassword){
        if(!this.password) return this.error = 'Debe ingresar la contraseña'
        if(!(this.activitie.password === this.password)){
          this.error = 'Contraseña incorrecta'
        }
      }
      if(!this.error){
        try {
          let members = JSON.parse(JSON.stringify(this.activitie.members))
          members.push(this.username)
          await db.collection("activities").doc(this.activitie.id).update({members})
          this.activitie.members.push(this.username)
          this.joined = true
          this.$modal.hide('my-fourth-modal');
        } catch (error) {
          console.log(error)
          this.error = "no se pudo unir a la actividad, intente nuevamente"
        }
        this.loading = false
      }  
    },
    join(){
      this.$modal.show('my-fourth-modal');
    },
    back(){
      this.$router.push('/actividades')
    },
    shareLink(){
      console.log('sds')
      if (navigator.share) {
        navigator.share({
          title: 'Compartir actividad',
          url: this.generatedLink
          }).then(() => {
            console.log('Thanks for sharing!');
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
      this.activitie.tasks.forEach(e => {
        if(e.name == that.taskName) return that.error = 'No se puede repetir nombre de tarea'
      });
      if(this.error)return this.loading = false
      let tasks = [...this.activitie.tasks]
      tasks.push({name:this.taskName,priority: tasks.length+1,done:false})
      await db.collection("activities").doc(this.activitie.id).update({tasks})
      this.getAct(this.activitie.id)
      this.$modal.hide('my-second-modal');
      this.loading = false
      this.taskName = ''
    },
    addTask(name,id){
      this.idAct = id
      this.nameAct = name
      this.$modal.show('my-second-modal');
    },
    formatDate(date){
      let d = new Date(date)
      return `${d.getDate()}/${String(d.getMonth()+101).substring(1,3)} a las ${d.getHours()}:${String(d.getMinutes()+100).substring(1,3)}`
    },
    add(){
      this.$modal.show('my-first-modal');
    },
    getAct(id){
      console.log(id)
      var that = this
      db.collection("activities")
      .doc(id)
      .get()
      .then((activity) => {
        console.log('yes')
        let data = activity.data()
        if(!data) return that.notFound = true
        data.id = id
        data.members.forEach(m => {
          if(m == that.username) return that.joined = true
        });
        data.tasks.sort((a,b) =>(a.priority>b.priority)?1:-1)
        data.tasksBackup = [...data.tasks]
        this.activitie = JSON.parse(JSON.stringify(data))
      })
    }
  },
  created(){
    this.username = localStorage.getItem('username')
    if(!this.username){
      localStorage.setItem('activity',this.$route.params.id)
      this.$router.push('/')
    }else{
      this.getAct(this.$route.params.id)
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
