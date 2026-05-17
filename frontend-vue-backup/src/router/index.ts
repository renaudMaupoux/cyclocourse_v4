import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'Accueil' }
    },
    {
      path: '/acquisition',
      name: 'acquisition',
      component: () => import('@/views/AcquisitionView.vue'),
      meta: { title: 'Acquisition' }
    },
    {
      path: '/resultats-acquisition',
      name: 'resultats-acquisition',
      component: () => import('@/views/ResultatsAcquisitionView.vue'),
      meta: { title: 'Résultats acquisition' }
    },
    {
      path: '/course',
      name: 'course',
      component: () => import('@/views/CourseView.vue'),
      meta: { title: 'Course' }
    }
  ]
});

router.afterEach((to) => {
  const title = to.meta.title as string | undefined;
  document.title = title ? `${title} — CycloCourse` : 'CycloCourse';
});

export default router;
