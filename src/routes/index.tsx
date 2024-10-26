import { lazy } from 'react';
// const FormElements = lazy(() => import('../pages/Form/FormElements'));
// const FormLayout = lazy(() => import('../pages/Form/FormLayout'));
// const Buttons = lazy(() => import('../pages/UiElements/Buttons'));

const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const AddStaff = lazy(() => import('../pages/AddStaff'));
const AddClient = lazy(() => import('../pages/AddClient'));
const AddTask = lazy(() => import('../pages/AddTask'));
const StaffList = lazy(() => import('../pages/StaffList'));
const TaskList = lazy(() => import('../pages/TaskList'));
const ClientList = lazy(() => import('../pages/ClientList'));
const IncidenetsList = lazy(() => import('../pages/IncidenetsList'));
const Profile = lazy(() => import('../pages/Profile'));
const MapScreen = lazy(() => import('../pages/MapScreen'));




const coreRoutes = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    component: Dashboard,
  },

  {
    path: '/addclient/:id?',
    title: 'AddClient',
    component: AddClient,
  },
  {
    path: '/addTask/:tag/:id?/:clientid?',
    title: 'AddTask',
    component: AddTask,
  },
  {
    path: '/addStaff/:id?',
    title: 'AddStaff',
    component: AddStaff,
  },
  {
    path: '/staffList',
    title: 'StaffList',
    component: StaffList,
  },
  {
    path: '/taskList',
    title: 'TaskList',
    component: TaskList,
  },
  {
    path: '/clientlist',
    title: 'clientlist',
    component: ClientList,
  },
  {
    path: '/incidenetsList',
    title: 'IncidenetsList',
    component: IncidenetsList,
  },
  {
    path: '/profile/:id?',
    title: 'Profile',
    component: Profile,
  },
  {
    path: '/MapScreen',
    title: 'MapScreen',
    component: MapScreen,
  }
];

const routes = [...coreRoutes];
export default routes;
