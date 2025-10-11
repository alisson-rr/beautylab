import { createRouter, createWebHistory } from 'vue-router';

import wwPage from './views/wwPage.vue';

import { initializeData, initializePlugins, onPageUnload } from '@/_common/helpers/data';

let router;
const routes = [];

function scrollBehavior(to) {
    if (to.hash) {
        return {
            el: to.hash,
            behavior: 'smooth',
        };
    } else {
        return { top: 0 };
    }
}

 
/* wwFront:start */
import pluginsSettings from '../../plugins-settings.json';

// eslint-disable-next-line no-undef
window.wwg_designInfo = {"id":"e6cb4646-1772-4bb2-8e3f-6a7aaadf029e","homePageId":"927c5450-76bd-47f5-a81c-ac50fdbe8f62","authPluginId":null,"baseTag":null,"defaultTheme":"light","langs":[{"lang":"pt","default":true}],"background":{},"workflows":[],"pages":[{"id":"927c5450-76bd-47f5-a81c-ac50fdbe8f62","linkId":"927c5450-76bd-47f5-a81c-ac50fdbe8f62","name":"Agenda Magnetica","folder":null,"paths":{"pt":"home","default":"home"},"langs":["pt"],"cmsDataSetPath":null,"sections":[{"uid":"55430b11-ee03-44f6-b409-dbc4eeee6f66","sectionTitle":"Header Section","linkId":"fece8df4-ea4b-4452-8802-3df9d3d9d8c6"},{"uid":"dab9f441-3d5d-4ccb-a9c8-e79a36573a12","sectionTitle":"Hero Section","linkId":"a8e25711-7b02-4356-ae62-6710b5237844"},{"uid":"bcd5279c-82c0-473b-991d-7de417232f20","sectionTitle":"Problem Section","linkId":"bccbf3c5-fe9c-444e-951c-acaf7d4f35e4"},{"uid":"6c747372-475a-4489-bd9f-a52451c072bb","sectionTitle":"Solution Section","linkId":"4aa2d2bb-0033-4338-8ba4-aca8408a2f1b"},{"uid":"44a2f769-2188-405e-9617-c1d5db59fc89","sectionTitle":"Target Audience Section","linkId":"12b764bf-7d13-4e2d-9c33-e4587405a62d"},{"uid":"6537a781-13d2-49aa-bcef-ae475a154da3","sectionTitle":"Benefits Section","linkId":"364fde96-7400-4d51-81ff-c883fbc9b612"},{"uid":"f25b2385-7932-4aeb-a6cb-78da244986cd","sectionTitle":"Testimonials Section","linkId":"c6d379c3-2c68-42c2-b49d-9c6ebb1ab27a"},{"uid":"914260ec-40e9-4602-a8ee-d5baacfa1fdd","sectionTitle":"Origin Story Section","linkId":"979b2185-b04a-4552-9c89-c131c2de400b"},{"uid":"8c642a64-b44d-4111-91bb-83c15aa0ee9e","sectionTitle":"How It Works Section","linkId":"aa16ac7d-e34d-4947-bbca-13eb5826a68e"},{"uid":"a639afd0-ff72-4696-af75-0ad6297023e4","sectionTitle":"Pricing Section","linkId":"f62c1ace-857a-46f9-b9d8-a221eb2b94c2"},{"uid":"edfe7340-30cd-456c-9087-f86db48dd4a7","sectionTitle":"Guarantee Section","linkId":"9c780ead-64cf-4c64-9c93-d6dea261bfec"},{"uid":"724cb0cc-d438-4112-abc1-2da2688f005c","sectionTitle":"Objections Section","linkId":"d7d2f4bb-205c-4404-b009-e5ce9f37c626"},{"uid":"c97baed5-9d6e-45d5-8b7b-edbe20888714","sectionTitle":"Footer Section","linkId":"9f28f9c5-056a-4d66-91be-6c7fdb40dde4"}],"pageUserGroups":[],"title":{"en":"","fr":"Vide | Commencer à partir de zéro","pt":"Agenda Magnetica"},"meta":{"desc":{"pt":"Transforme cada mensagem do WhatsApp em agendamento automático em 7 dias."},"keywords":{},"socialDesc":{},"socialTitle":{},"structuredData":{}},"metaImage":"images/Logo_Preenchido.png?_wwcv=16"}],"plugins":[{"id":"2bd1c688-31c5-443e-ae25-59aa5b6431fb","name":"REST API","namespace":"restApi"}]};
// eslint-disable-next-line no-undef
window.wwg_cacheVersion = 16;
// eslint-disable-next-line no-undef
window.wwg_pluginsSettings = pluginsSettings;
// eslint-disable-next-line no-undef
window.wwg_disableManifest = false;

const defaultLang = window.wwg_designInfo.langs.find(({ default: isDefault }) => isDefault) || {};

const registerRoute = (page, lang, forcedPath) => {
    const langSlug = !lang.default || lang.isDefaultPath ? `/${lang.lang}` : '';
    let path =
        forcedPath ||
        (page.id === window.wwg_designInfo.homePageId ? '/' : `/${page.paths[lang.lang] || page.paths.default}`);

    //Replace params
    path = path.replace(/{{([\w]+)\|([^/]+)?}}/g, ':$1');

    routes.push({
        path: langSlug + path,
        component: wwPage,
        name: `page-${page.id}-${lang.lang}`,
        meta: {
            pageId: page.id,
            lang,
            isPrivate: !!page.pageUserGroups?.length,
        },
        async beforeEnter(to, from) {
            if (to.name === from.name) return;
            //Set page lang
            wwLib.wwLang.defaultLang = defaultLang.lang;
            wwLib.$store.dispatch('front/setLang', lang.lang);

            //Init plugins
            await initializePlugins();

            //Check if private page
            if (page.pageUserGroups?.length) {
                // cancel navigation if no plugin
                if (!wwLib.wwAuth.plugin) {
                    return false;
                }

                await wwLib.wwAuth.init();

                // Redirect to not sign in page if not logged
                if (!wwLib.wwAuth.getIsAuthenticated()) {
                    window.location.href = `${wwLib.wwPageHelper.getPagePath(
                        wwLib.wwAuth.getUnauthenticatedPageId()
                    )}?_source=${to.path}`;

                    return null;
                }

                //Check roles are required
                if (
                    page.pageUserGroups.length > 1 &&
                    !wwLib.wwAuth.matchUserGroups(page.pageUserGroups.map(({ userGroup }) => userGroup))
                ) {
                    window.location.href = `${wwLib.wwPageHelper.getPagePath(
                        wwLib.wwAuth.getUnauthorizedPageId()
                    )}?_source=${to.path}`;

                    return null;
                }
            }

            try {
                await import(`@/pages/${page.id.split('_')[0]}.js`);
                await wwLib.wwWebsiteData.fetchPage(page.id);

                //Scroll to section or on top after page change
                if (to.hash) {
                    const targetElement = document.getElementById(to.hash.replace('#', ''));
                    if (targetElement) targetElement.scrollIntoView();
                } else {
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                }

                return;
            } catch (err) {
                wwLib.$store.dispatch('front/showPageLoadProgress', false);

                if (err.redirectUrl) {
                    return { path: err.redirectUrl || '404' };
                } else {
                    //Any other error: go to target page using window.location
                    window.location = to.fullPath;
                }
            }
        },
    });
};

for (const page of window.wwg_designInfo.pages) {
    for (const lang of window.wwg_designInfo.langs) {
        if (!page.langs.includes(lang.lang)) continue;
        registerRoute(page, lang);
    }
}

const page404 = window.wwg_designInfo.pages.find(page => page.paths.default === '404');
if (page404) {
    for (const lang of window.wwg_designInfo.langs) {
        // Create routes /:lang/:pathMatch(.*)* etc for all langs of the 404 page
        if (!page404.langs.includes(lang.lang)) continue;
        registerRoute(
            page404,
            {
                default: false,
                lang: lang.lang,
            },
            '/:pathMatch(.*)*'
        );
    }
    // Create route /:pathMatch(.*)* using default project lang
    registerRoute(page404, { default: true, isDefaultPath: false, lang: defaultLang.lang }, '/:pathMatch(.*)*');
} else {
    routes.push({
        path: '/:pathMatch(.*)*',
        async beforeEnter() {
            window.location.href = '/404';
        },
    });
}

let routerOptions = {};

const isProd =
    !window.location.host.includes(
        // TODO: add staging2 ?
        '-staging.' + (process.env.WW_ENV === 'staging' ? import.meta.env.VITE_APP_PREVIEW_URL : '')
    ) && !window.location.host.includes(import.meta.env.VITE_APP_PREVIEW_URL);

if (isProd && window.wwg_designInfo.baseTag?.href) {
    let baseTag = window.wwg_designInfo.baseTag.href;
    if (!baseTag.startsWith('/')) {
        baseTag = '/' + baseTag;
    }
    if (!baseTag.endsWith('/')) {
        baseTag += '/';
    }

    routerOptions = {
        base: baseTag,
        history: createWebHistory(baseTag),
        routes,
    };
} else {
    routerOptions = {
        history: createWebHistory(),
        routes,
    };
}

router = createRouter({
    ...routerOptions,
    scrollBehavior,
});

//Trigger on page unload
let isFirstNavigation = true;
router.beforeEach(async (to, from) => {
    if (to.name === from.name) return;
    if (!isFirstNavigation) await onPageUnload();
    isFirstNavigation = false;
    wwLib.globalVariables._navigationId++;
    return;
});

//Init page
router.afterEach((to, from, failure) => {
    wwLib.$store.dispatch('front/showPageLoadProgress', false);
    let fromPath = from.path;
    let toPath = to.path;
    if (!fromPath.endsWith('/')) fromPath = fromPath + '/';
    if (!toPath.endsWith('/')) toPath = toPath + '/';
    if (failure || (from.name && toPath === fromPath)) return;
    initializeData(to);
});
/* wwFront:end */

export default router;
