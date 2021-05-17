import Dashboard from '../components/Dashboard';
import Header from '../components/Header';
import withApollo from '../lib/apolloClient'
import ContainerFlex from '../components/ContainerFlex';
import {Layout} from 'antd';


function Home() {
    return (
        <ContainerFlex>
            <Layout>
                <Header/>
                <Dashboard/>
            </Layout>
        </ContainerFlex>
    )
}

export default withApollo({ssr: true})(Home);
