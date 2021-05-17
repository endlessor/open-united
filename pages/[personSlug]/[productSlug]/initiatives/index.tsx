import React, {useState} from 'react';
import {connect} from 'react-redux';
import {Col, Button} from 'antd';
import {useRouter} from 'next/router'
import {useQuery} from '@apollo/react-hooks';
import {GET_INITIATIVES} from '../../../../graphql/queries';
import {getUserRole, hasManagerRoots, randomKeys} from '../../../../utilities/utils';
import AddInitiative from '../../../../components/Products/AddInitiative';
import LeftPanelContainer from '../../../../components/HOC/withLeftPanel';
// @ts-ignore
import CheckCircle from "../../../../public/assets/icons/check-circle.svg";
import InitiativeTable from "../../../../components/InitiativeTable";
import {FilterOutlined} from "@ant-design/icons";
import InitiativeFilterModal from "../../../../components/InitiativeFilterModal";
import Loading from "../../../../components/Loading";

type Params = {
  user: any,
};

const InitiativeList: React.FunctionComponent<Params> = ({user}) => {
  const router = useRouter();
  const [filterModal, setFilterModal] = useState(false);
  let {productSlug, personSlug} = router.query;
  productSlug = String(productSlug);
  const [inputData, setInputData] = useState({
    statuses: [1],
    stacks: [],
    tags: [],
  });
  const initialQueryVariables = {productSlug, input: inputData};
  const userHasManagerRoots = hasManagerRoots(getUserRole(user.roles, productSlug));

  const [showEditModal, setShowEditModal] = useState(false);
  const {data, error, loading, refetch} = useQuery(GET_INITIATIVES, {
    variables: initialQueryVariables,
    fetchPolicy: "no-cache"
  });

  const applyFilter = (values: any) => {
    values = Object.assign(values, {});
    setInputData(values);
    setFilterModal(false);
  }

  return (
    <LeftPanelContainer>
      {
        !error && (
          <React.Fragment key={randomKeys()}>
            {loading ? <Loading /> :
              <InitiativeTable
                initiatives={data?.initiatives ? data.initiatives : []}
                content={<div className="d-flex-justify-center">
                  {userHasManagerRoots && (
                    <Col>
                      <Button
                        className="ml-10"
                        onClick={() => setShowEditModal(!showEditModal)}
                      >
                        Add new initiative
                      </Button>
                    </Col>
                  )}
                  <Button
                    type="primary"
                    onClick={() => setFilterModal(!filterModal)}
                    icon={<FilterOutlined/>}
                  >Filter</Button>
                </div>}
                personSlug={personSlug}
                productSlug={productSlug} />}
            {
              showEditModal &&
              <AddInitiative
                  modal={showEditModal}
                  productSlug={productSlug}
                  modalType={false}
                  closeModal={setShowEditModal}
                  submit={() => refetch()}
              />
            }
            <InitiativeFilterModal
              modal={filterModal}
              initialForm={inputData}
              closeModal={() => setFilterModal(false)}
              submit={applyFilter}
            />
          </React.Fragment>
        )
      }
    </LeftPanelContainer>
  );
};

const mapStateToProps = (state: any) => ({
  user: state.user,
});

const mapDispatchToProps = () => ({});

const InitiativeListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(InitiativeList);

export default InitiativeListContainer;