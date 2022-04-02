import * as React from 'react';

export default [
    {
        path: '/demo',
        name: 'Demo',
        component: React.lazy(
            () =>
                import(
                    /* webpackChunkName: "js/demo" */
                    /* webpackMode: "lazy-once" */
                    `./pages/Demo`
                ),
        ),
    },
];
