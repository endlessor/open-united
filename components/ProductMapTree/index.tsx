import SortableTree, {getVisibleNodeCount} from "react-sortable-tree";
import {TreeNode} from "../../utilities/constants";
import {Button, Col, Input, message, Row} from "antd";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {DELETE_CAPABILITY, UPDATE_CAPABILITY_TREE} from "../../graphql/mutations";
import {getProp} from "../../utilities/filters";
import {GET_CAPABILITIES_BY_PRODUCT} from "../../graphql/queries";
import {useRouter} from "next/router";
import Loading from "../Loading";
import AddOrEditCapability from "../Products/AddOrEditCapability";
import {getUserRole, hasManagerRoots} from "../../utilities/utils";
import {connect} from "react-redux";


const {Search} = Input;


interface IProductMapTree {
  user: any
}

const ProductMapTree: React.FunctionComponent<IProductMapTree> = ({user}) => {
  const router = useRouter();
  const {personSlug, productSlug} = router.query;

  const [treeData, setTreeData] = useState<any>([]);

  const [searchString, setSearchString] = useState('');
  const [searchFocusIndex, setSearchFocusIndex] = useState(0);
  const [searchFoundCount, setSearchFoundCount] = useState<any>(null);

  const [showAddCapabilityModal, setShowAddOrEditModal] = useState(false);
  const [capability, setCapability] = useState<any>(null);
  const [modalType, setModalType] = useState<string>('');
  const [hideParent, setHideParent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const convertDataAndSetTree = (capabilities: any) => {
    let capabilitiesData: string = "";
    if (capabilities && capabilities.capabilities) {
      capabilitiesData = getProp(capabilities, 'capabilities', '');
      try {
        if (capabilitiesData !== "") {
          capabilitiesData = JSON.parse(capabilitiesData);
          //@ts-ignore
          setTreeData(capabilitiesData.length > 0 && capabilitiesData[0].children
            //@ts-ignore
            ? formatData(capabilitiesData[0].children) : [])
        } else {
          setTreeData([]);
        }
      } catch (e) {
        if (e instanceof SyntaxError) setTreeData([]);
      }
    } else {
      setTreeData([]);
    }
  }

  const isExpandedById = (id: number, data?: any) => {
    if (!data) data = treeData;
    let isExpanded: boolean = false;

    data.map((node: any) => {
      if (getProp(node, 'id') === id && getProp(node, 'expanded', false)) {
        isExpanded = true;
        return;
      }

      if (getProp(node, 'children', []).length > 0) {
        if (isExpandedById(id, node.children)) {
          isExpanded = true;
        }
      }
    });

    return isExpanded;
  }

  const formatData = (data: any) => {
    return data.map((node: any) => {

      return {
        id: getProp(node, 'id'),
        title: getProp(node, 'data.name'),
        description: getProp(node, 'data.description', ''),
        videoLink: getProp(node, 'data.video_link', ''),
        children: node.children ? formatData(getProp(node, 'children', [])) : [],
        expanded: isExpandedById(getProp(node, 'id'))
      }
    })
  }

  const {
    data: capabilities,
    error: capabilitiesError,
    loading: capabilitiesLoading,
    refetch
  } = useQuery(GET_CAPABILITIES_BY_PRODUCT, {
    variables: {productSlug, userId: userId == null ? 0 : userId},
    fetchPolicy: "no-cache"
  });

  useEffect(() => {
    if (!capabilitiesError && !capabilitiesLoading) {
      convertDataAndSetTree(capabilities);
    }
  }, [capabilities]);

  useEffect(() => {
    setUserId(localStorage.getItem('userId'));
  }, []);

  const [deleteCapability] = useMutation(DELETE_CAPABILITY, {
    onCompleted() {
      message.success('Item is successfully deleted!').then();
      refetch().then();
    },
    onError() {
      message.error('Failed to delete item!').then();
    }
  });

  const [updateCapabilityTree] = useMutation(UPDATE_CAPABILITY_TREE, {
    onCompleted(res) {
      if (getProp(res, 'updateCapabilityTree.status', false)) {
        message.success('Product map was updated').then();
      } else {
        message.error('Failed to update product map').then();
      }
    },
    onError() {
      message.error('Failed to update product map').then();
    }
  });

  const treeChangeHandler = () => {
    updateCapabilityTree({
      variables: {
        productSlug,
        tree: JSON.stringify(treeData)
      }
    }).then()
  }

  const selectPrevMatch = (): void => {
    const index: number =
      searchFocusIndex !== null
        ? (searchFoundCount + searchFocusIndex - 1) % searchFoundCount
        : searchFoundCount - 1;
    setSearchFocusIndex(index);
  }

  const selectNextMatch = (): void => {
    const index: number = searchFocusIndex !== null ? (searchFocusIndex + 1) % searchFoundCount : 0;
    setSearchFocusIndex(index);
  }

  const onSearch = (value: string) => setSearchString(value);
  const userHasManagerRoots = hasManagerRoots(getUserRole(user.roles, productSlug));

  if (capabilitiesLoading) return <Loading/>

  const onTreeSearch = (matches: any) => {
    setSearchFocusIndex(matches.length > 0 ? searchFocusIndex % matches.length : 0);
    setSearchFoundCount(matches.length);
  }

  const editNode = (type: string, node: any) => {
    setCapability({
      ...node,
      name: node.title
    });
    setModalType(type);
    setShowAddOrEditModal(true);
  }

  const removeNode = (node: any) => {
    try {
      deleteCapability({
        variables: {
          nodeId: node.id
        }
      }).then();
    } catch {
    }
  }

  const customSearchMethod = (data: any) => {
    const {node, searchQuery} = data;
    return searchQuery &&
      node.title.toLowerCase().indexOf(searchQuery.toLowerCase()) > -1;
  }

  const count = getVisibleNodeCount({treeData});
  const mapHeight = count * 62;

  return !capabilitiesError ? (
    <Row style={{width: '100%'}}>
      <Row justify="space-between" style={{width: '100%'}}>
        {treeData.length > 0 && (
          <Col xs={24} sm={24} md={8} lg={6} style={{marginBottom: 20}}>
            <Search placeholder="Search text" className='mr-10' onSearch={onSearch}/>
            {
              searchFoundCount > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => selectPrevMatch()}
                  >
                    &lt;
                  </button>
                  <button
                    type="submit"
                    onClick={() => selectNextMatch()}
                  >
                    &gt;
                  </button>
                </>
              )
            }
            <div>{searchFoundCount > 0 && `${searchFoundCount} items found!`}</div>
          </Col>
        )}
        {
          userHasManagerRoots &&
          <Col xs={24} sm={24} md={8} lg={6} style={{marginBottom: 20}}>
              <Button
                  style={{width: '100%'}}
                  onClick={
                    () => {
                      setModalType('add-root');
                      setHideParent(false);
                      setShowAddOrEditModal(true)
                    }
                  }
              >
                  Add new capability
              </Button>
          </Col>
        }
      </Row>

      {treeData.length > 0 && (
        <Row style={{width: '100%'}}>
          <div style={{height: mapHeight, width: '100%'}}>
            <SortableTree
              isVirtualized={false}
              treeData={treeData}
              onChange={(treeData: TreeNode[]) => setTreeData(treeData)}
              canDrag={userHasManagerRoots}
              onMoveNode={treeChangeHandler}
              searchMethod={customSearchMethod}
              searchQuery={searchString}
              searchFocusOffset={searchFocusIndex}
              searchFinishCallback={onTreeSearch}
              generateNodeProps={({node}) => ({
                buttons: userHasManagerRoots
                  ? [
                    <>
                      <button
                        className="mr-10"
                        onClick={() => {
                          setHideParent(true);
                          editNode('add-child', node)
                        }}
                      >
                        Add
                      </button>
                      <button
                        className="mr-10"
                        onClick={() => {
                          setHideParent(true);
                          editNode('edit', node);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeNode(node)}
                      >
                        Remove
                      </button>
                    </>
                  ]
                  : [],
                title: (
                  <Row
                    justify="space-between"
                    style={{minWidth: 200}}
                  >
                    <Link href={`/${personSlug}/${productSlug}/capabilities/${node.id}`}>
                      {node.title}
                    </Link>
                    <div className='pl-25'>{node.subtitle}</div>
                  </Row>
                ),
              })}
            />
          </div>
        </Row>
      )}

      {
        showAddCapabilityModal &&
        <AddOrEditCapability
            modal={showAddCapabilityModal}
            modalType={modalType}
            capability={capability}
            closeModal={setShowAddOrEditModal}
            submit={refetch}
            hideParentOptions={hideParent}
        />
      }
    </Row>
  ) : null
}

const mapStateToProps = (state: any) => ({
  user: state.user
});

const mapDispatchToProps = () => ({});

const ProductMapTreeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ProductMapTree);

export default ProductMapTreeContainer;