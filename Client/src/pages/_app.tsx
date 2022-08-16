import 'styles/globals.css'
import type { AppProps } from 'next/app';
import { MainLayout } from 'layouts';
import { ApolloProvider } from '@apollo/client'
import apolloClient from 'utils/apolloClient';

function MyApp({ Component, pageProps }: AppProps) {
  
  return (
    <ApolloProvider client={apolloClient}>
      <MainLayout>
        <Component {...pageProps}/>
      </MainLayout>
    </ApolloProvider>
  )
}

export default MyApp
