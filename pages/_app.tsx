import React from "react";
import {wrapper} from "../lib/redux";
import { apolloClient } from '../lib/apolloClient';
import { ApolloProvider as ApolloHooksProvider } from '@apollo/react-hooks'
import '../styles/index.less';
import 'react-sortable-tree/style.css';

export default wrapper.withRedux(({Component, pageProps}) => {

    return (
        <ApolloHooksProvider client={apolloClient}>
            <Component {...pageProps} />
        </ApolloHooksProvider>
    );
});