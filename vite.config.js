import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const pages = {"index":{"outputDir":"./","lang":"pt","title":"Agenda Magnetica","cacheVersion":11,"meta":[{"name":"title","content":"Agenda Magnetica"},{"name":"description","content":"Transforme cada mensagem do WhatsApp em agendamento automático em 7 dias."},{"name":"image","content":"/images/Logo_Preenchido.png?_wwcv=11"},{"itemprop":"name","content":"Agenda Magnetica"},{"itemprop":"description","content":"Transforme cada mensagem do WhatsApp em agendamento automático em 7 dias."},{"itemprop":"image","content":"/images/Logo_Preenchido.png?_wwcv=11"},{"name":"twitter:card","content":"summary"},{"name":"twitter:title","content":"Agenda Magnetica"},{"name":"twitter:description","content":"Transforme cada mensagem do WhatsApp em agendamento automático em 7 dias."},{"name":"twitter:image","content":"/images/Logo_Preenchido.png?_wwcv=11"},{"property":"og:title","content":"Agenda Magnetica"},{"property":"og:description","content":"Transforme cada mensagem do WhatsApp em agendamento automático em 7 dias."},{"property":"og:image","content":"/images/Logo_Preenchido.png?_wwcv=11"},{"property":"og:site_name","content":"Agenda Magnetica"},{"property":"og:type","content":"website"},{"name":"robots","content":"index, follow"}],"scripts":{"head":"\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=AW-17179499169\"></script>\r\n<script>\r\n  window.dataLayer = window.dataLayer || [];\r\n  function gtag(){ dataLayer.push(arguments); }\r\n  gtag('js', new Date());\r\n  gtag('config', 'AW-17179499169');\r\n</script>\r\n\r\n<script>\r\n  function gtag_report_conversion(url){\r\n    var callback = function () {\r\n      if (typeof url !== 'undefined') { window.location = url; }\r\n    };\r\n    gtag('event', 'conversion', {\r\n      send_to: 'AW-17179499169/tffCJaI_o4bEKG16f8_',\r\n      value: 1.0,\r\n      currency: 'BRL',\r\n      event_callback: callback\r\n    });\r\n    return false;\r\n  }\r\n</script>","body":"\n"},"baseTag":{"href":"/","target":"_self"},"alternateLinks":[{"rel":"alternate","hreflang":"x-default","href":"https://e6cb4646-1772-4bb2-8e3f-6a7aaadf029e.weweb-preview.io/"},{"rel":"alternate","hreflang":"pt","href":"https://e6cb4646-1772-4bb2-8e3f-6a7aaadf029e.weweb-preview.io/"}]}};

// Read the main HTML template
const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf-8');
const compiledTemplate = handlebars.compile(template);

// Generate an HTML file for each page with its metadata
Object.values(pages).forEach(pageConfig => {
    // Compile the template with page metadata
    const html = compiledTemplate({
        title: pageConfig.title,
        lang: pageConfig.lang,
        meta: pageConfig.meta,
        scripts: {
            head: pageConfig.scripts.head,
            body: pageConfig.scripts.body,
        },
        alternateLinks: pageConfig.alternateLinks,
        cacheVersion: pageConfig.cacheVersion,
        baseTag: pageConfig.baseTag,
    });

    // Save output html for each page
    if (!fs.existsSync(pageConfig.outputDir)) {
        fs.mkdirSync(pageConfig.outputDir, { recursive: true });
    }
    fs.writeFileSync(`${pageConfig.outputDir}/index.html`, html);
});

const rollupOptionsInput = {};
for (const pageName in pages) {
    rollupOptionsInput[pageName] = path.resolve(__dirname, pages[pageName].outputDir, 'index.html');
}

export default defineConfig(() => {
    return {
        plugins: [nodePolyfills({ include: ['events', 'stream', 'string_decoder'] }), vue()],
        base: "/",
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler',
                },
            },
            postcss: {
                plugins: [autoprefixer],
            },
        },
        build: {
            chunkSizeWarningLimit: 10000,
            rollupOptions: {
                input: rollupOptionsInput,
                onwarn: (entry, next) => {
                    if (entry.loc?.file && /js$/.test(entry.loc.file) && /Use of eval in/.test(entry.message)) return;
                    return next(entry);
                },
                maxParallelFileOps: 900,
            },
        },
        logLevel: 'warn',
    };
});
