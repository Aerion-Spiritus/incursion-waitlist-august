import { useContext, useMemo } from "react";
import Table from "../../Components/DataTable";
import { AllianceName, CharacterName } from "../../Components/EntityLinks";
import { Header } from "../../Components/Page";
import { formatDatetime } from "../../Util/time";
import { usePageTitle } from "../../Util/title";
import { AddButton, FilterComponents } from "./whitelists/TableControls";
import { AuthContext } from "../../contexts";
import styled from "styled-components";
import { useApi } from "../../api";

const TableControls = styled.div`
  align-content: space-between;
  display: flex;
  width: 100%;
  flex-wrap: wrap;

  > button {
    @media (max-width: 800px) {
      width: 100%;
    }
  }

  #filters {
    flex-grow: 1;

    span:first-of-type {
      font-style: italic;
      margin-right: 10px;

      @media (max-width: 800px) {
        display: block;
        margin-bottom: 5px;
      }
    }

    @media (max-width: 800px) {
      input,
      select {
        width: calc(calc(100vw - 158px) / 2);
      }
    }

    @media (max-width: 500px) {
      input,
      select {
        width: 100%;
      }
      button {
        display: block;
        width: 100%;
      }
    }
  }
`;


const special_sort = (charA, charB) => {
  const a = charA.name.toLowerCase();
  const b = charB.name.toLowerCase();
  if (a > b) return 1;
  else if (b > a) return -1;
  else return 0;
};

const columns = [
  {
    name:"Alliance",
    sortable: true,   
    sortFunction:  (rowA, rowB) => special_sort(rowA.entity.name, rowB.entity.name),
    grow: 2,
    selector: (row) => <AllianceName id={row.entity.id} name={row.entity.name} noLink />
  },
  {
    name: "Issued By",
    sortable: true,
    sortFunction: (rowA, rowB) => special_sort(rowA.issued_by, rowB.issued_by),
    hide: "md",
    grow: 1,
    selector: (row) => <CharacterName {...row.issued_by} />,
  },
  {
    name: "Issued At",
    hide: "sm",
    grow: 1,
    selector: (row) => formatDatetime(new Date(row.issued_at * 1000)),
  },
  // todo: remove button
];

const WhitelistPage = () => {
  const authContext = useContext(AuthContext);
  const [ data, refreshData ] = useApi('/api/v1/whitelist');
  usePageTitle("Whitelist");
  console.log(data && data[0].entity.id)
  const TableHeader = useMemo(() => {    
    return (
      <TableControls>
        <FilterComponents />
        {authContext && authContext.access["whitelist-manage"] && (
          <AddButton handleRefreshData={refreshData} />
        )}
      </TableControls>
    )
    
    // return (
    //   <TableControls>
    //     <FilterComponents
    //       filterOptions={data?.filters}
    //       filters={filters}
    //       onChange={(e) =>
    //         setFilters({
    //           ...e,
    //         })
    //       }
    //       onClear={handleClear}
    //     />

    //     {authContext && authContext.access["commanders-manage"] && (
    //       <AddButton refreshData={refreshData} />
    //     )}
    //   </TableControls>
    // );
  }, []);

  const filteredData = data;

  return (
    <>
      <Header>
        <h1>Alliance Whitelist</h1>
      </Header>
      
      <p style={{ marginBottom: "10px" }}>
        Pilots must be in one of these alliances to login or join the waitlist.
      </p>

      <Table
        textAlign="center"
        verticalAlign="middle"
        columns={columns}
        data={filteredData ?? []}
        defaultSortFieldId={2}
        subHeader
        subHeaderComponent={TableHeader}
        progressPending={!data}
      />
    </>
  )  
}

export default WhitelistPage;
