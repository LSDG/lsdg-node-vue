import './scss/theme.scss';
import Vue from 'vue';
import VueRx from 'vue-rx'
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';

//Setup RxJS
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription'; // Disposable if using RxJS4
import { Subject } from 'rxjs/Subject'; // required for domStreams option

//Import our main component, and pages for the router.
import AppComponent from './app.vue';
import HomePage from './pages/home.vue';

//Init Vue.js plugins
Vue.use(Vuetify);
Vue.use(VueRouter);
Vue.use(VueRx, {
    Observable,
    Subscription,
    Subject
});

//Setup Vue Router
const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: HomePage }
    ]
});

Vue.config.debug = true;

//Bootstrap the application
const App = Vue.component('app', AppComponent);

new App({
    el: '#mainApp',
    router,
});
