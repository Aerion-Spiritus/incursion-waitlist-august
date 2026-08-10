import { useContext, useEffect, useState } from "react";
// import { ToastContext } from "../../../contexts";
import { Button, Buttons, Input, Label } from "../../../Components/Form";
import { Modal } from "../../../Components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { Box } from "../../../Components/Box";
import { Title } from "../../../Components/Page";
import styled from "styled-components";
import { AllianceName } from "../../../Components/EntityLinks";
import { apiCall, errorToaster } from "../../../api";
import { ToastContext } from "../../../contexts";
import { addToast } from "../../../Components/Toast";

const FormGroup = styled.div`
  margin: 15px 0px;
  padding: 5px 10px;
  flex-grow: 2;
`;

const WideWraper = styled.form`
  display: flex;
  flex-wrap: wrap;
  flex-flow: column;
  justify-content: space-between;

  & label::selection,
  div::selection,
  button::selection {
    background: none;
  }
`;

const AddButton = ({ handleRefreshData }) => {
  const toastContext = useContext(ToastContext);

  const [ entity, handleSetEntity ] = useState({ id: null, name: "" });
  const [ isOpen, handleIsOpen ] = useState(false);
  const [ isPending, handleIsPending ] = useState(false);
  const [ searchValue, handleSearchValue ] = useState("");
  const [ searchPending, handleSearch ] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isPending) {
      return; // stop users from clicking this twice      
    }
    handleIsPending(true);

    if (!entity.id) {
      addToast(toastContext, {
        variant: "danger",
        message: 'You need to provide an alliance name.'
      });
      return;
    }

    errorToaster(
      toastContext,
      apiCall(`/api/v1/whitelist`, {
        method: 'POST',
        json: {
          ...entity
        }
      })
      .then(() => {
        handleIsOpen(false);
        handleRefreshData();
        handleReset();
      })
      .finally(() => handleIsPending(false))
    );
  }

  const handleReset = () => {
    handleSetEntity({ id: null, name: "" });
    handleSearch(false);
  }

  useEffect(() => {
    const reset = () => {
      return handleSetEntity({ id: null, name: "" });
    };

    if (searchValue.length < 3) return reset();

    handleSearch(true);
    errorToaster(
      toastContext,
      apiCall(`/api/search`, {
        method: 'POST',
        json: {
          search: searchValue,
          category: 'alliance',
          strict: true
        }
      }).then((response) => {
        handleSearch(false);
        if (response.length > 0) {
          handleSetEntity({
            id: response[0],
            name: searchValue
          });
        } else {
          reset();
        }
      })
    )
  }, [ searchValue, toastContext ])
  // console.log(entity)
  return (
    <>
      <Button variant="primary" onClick={() => handleIsOpen(true)}>
        <FontAwesomeIcon icon={faSearch} fixedWidth /> Add Alliance
      </Button>

      <Modal open={isOpen} setOpen={handleIsOpen}>
        <Box>
          <Title>Add an Alliance to the Whitelist</Title>

          <WideWraper onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="alliance-name" required>
                Alliance Name:
              </Label>
              <Input
                id="alliance-name"
                type="text"
                value={searchValue}
                required
                tabIndex={1}
                onChange={(e) => handleSearchValue(e.target.value)}
              />
            </FormGroup>
            <div style={{ padding: "10px" }}>
              {searchPending ? "Searching..." : entity?.id && <AllianceName
                id={entity.id}
                name={entity.name}
                noLink
              /> }
            </div>

            <Buttons style={{ paddingLeft: "8px" }}>
              <Button variant="secondary" type="button" onClick={() => handleIsOpen(false)}>
                Cancel
              </Button>

              <Button variant="primary" type="submit" disabled={isPending}>
                Confirm
              </Button>              
            </Buttons>
          </WideWraper>
        </Box>
      </Modal>
    </>
  )
};

const FilterComponents = ({ filters, filterOptions, onChange, onClear }) => {
  return <>Filter</>
}

const RevokeButton = ({ id, handleRefreshData }) => {
  const toastContext = useContext(ToastContext);

  const deAuthorise = async (id) => {
    return await apiCall(`/api/v1/whitelist/${id}`, {
      method: 'DELETE'
    });
  }
  
  const handleDelete = (e) => {
    e.preventDefault();

    errorToaster(
      toastContext,
      deAuthorise(id).then(handleRefreshData)
    );
  }

  return <Button
    variant='danger'
    onClick={handleDelete}
  >
    Revoke
  </Button>
}

export { AddButton, FilterComponents, RevokeButton };
