import React, { lazy, memo, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Loader } from '@trezor/components';

import routes from '@suite-constants/routes';

const ErrorPage = lazy(() => import('@suite-views/error'));
const components: { [key: string]: React.LazyExoticComponent<any> } = {
    'suite-index': lazy(() => import('@dashboard-views')),
    'notifications-index': lazy(() => import('@suite-views/notifications')),
    'passwords-index': lazy(() => import('@passwords-views')),
    'portfolio-index': lazy(() => import('@portfolio-views')),

    'wallet-index': lazy(() => import('@wallet-views/transactions')),
    'wallet-receive': lazy(() => import('@wallet-views/receive')),
    'wallet-details': lazy(() => import('@wallet-views/details')),
    'wallet-send': lazy(() => import('@wallet-views/send')),
    'wallet-sign-verify': lazy(() => import('@wallet-views/sign-verify')),

    'wallet-coinmarket-buy': lazy(() => import('@wallet-views/coinmarket/buy')),
    'wallet-coinmarket-buy-detail': lazy(() => import('@wallet-views/coinmarket/buy/detail')),
    'wallet-coinmarket-buy-offers': lazy(() => import('@wallet-views/coinmarket/buy/offers')),
    'wallet-coinmarket-exchange': lazy(() => import('@wallet-views/coinmarket/exchange')),
    'wallet-coinmarket-exchange-detail': lazy(
        () => import('@wallet-views/coinmarket/exchange/detail'),
    ),
    'wallet-coinmarket-exchange-offers': lazy(
        () => import('@wallet-views/coinmarket/exchange/offers'),
    ),
    'wallet-coinmarket-spend': lazy(() => import('@wallet-views/coinmarket/spend')),
    'wallet-coinmarket-redirect': lazy(() => import('@wallet-views/coinmarket/redirect')),

    'settings-index': lazy(() => import('@settings-views')),
    'settings-coins': lazy(() => import('@settings-views/coins')),
    'settings-debug': lazy(() => import('@settings-views/debug')),
    'settings-device': lazy(() => import('@settings-views/device')),
};

const AppRouter = () => (
    <Suspense fallback={<Loader size={64} />}>
        <Switch>
            {routes.map(route => (
                <Route
                    key={route.name}
                    path={process.env.assetPrefix + route.pattern}
                    exact={route.exact}
                    component={components[route.name]}
                />
            ))}
            {/* 404 */}
            <Route path="*" component={ErrorPage} />
        </Switch>
    </Suspense>
);

export default memo(AppRouter);
