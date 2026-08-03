import styled from "styled-components";
import { DNADisplay } from "../../Components/FitDisplay";
import { Box } from "../../Components/Box";
import React from "react";
import { Modal } from "../../Components/Modal";
import { Note } from "../../Components/NoteBox";
import BadgeIcon, { Shield } from "../../Components/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { Markdown } from "../../Components/Markdown";

export const FitCard = styled.div`
  border: solid 2px ${(props) => props.theme.colors.accent2};
  background-color: ${(props) => props.theme.colors.background};
  border-radius: 5px;
  font-size: 0.9em;
  filter: drop-shadow(0px 3px 4px ${(props) => props.theme.colors.shadow});
  width: 380px;
  a {
  }
  &:hover:not(:disabled):not(.static) {
    border-color: ${(props) => props.theme.colors.accent3};
    cursor: pointer;
  }
  @media (max-width: 480px) {
    width: 100%;
  }
`;

FitCard.Content = styled.div`
  display: flex;
  align-items: center;
  
  color: ${(props) => props.theme.colors.text};
  p {
	  @media (max-width: 480px) {
		  font-size: 3.1vw;
		}
		
	}
  
  
  img {
    border-radius: 3px 0px 0px 3px;
    margin-right: 0.5em;
	
    align-self: flex-start;
  }
}
`;
FitCard.Content.Badges = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  > * {
  }
  > *:last-child {
    margin-right: 0.5em;
  }
  > span {
    display: flex;
    align-items: center;
  }
  img {
    height: 1.3em;
    margin-right: unset;
  }
  @media (max-width: 480px) {
    font-size: 1em;
    > *:last-child {
      margin-right: 0.4em;
    }
  }
`;

const DisplayDOM = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const hullOrder = [
  624,    // Maller
  642,    // Apocalypse

  28659,  // Paladin
  28661,  // Kronos  
  17740,  // Vindicator
  17920,  // Bhaalgorn
  47271,  // Leshak

  33472,  // Nestor
  22442,  // Eos
  22474,  // Damnation
];

function Fitout({ data, tier }) {  
  // const { notes } = data;

  // Active Category
  const category = Object.keys(data.categories).find(
    key => key.toUpperCase() === tier.toUpperCase()
  );

  const hulls = new Set(data.categories[category]);
  
  // Filter for these hulls only  
  const fits = data.fittingdata.filter(fit => {
    const typeId = parseInt(fit.dna.split(':', 1)[0]);
    return hulls.has(typeId);
  })
  .sort((fitA, fitB) => {
    const typeA = parseInt(fitA.dna.split(':', 1)[0]);
    const typeB = parseInt(fitB.dna.split(':', 1)[0]);
    
    return hullOrder.indexOf(typeA) - hullOrder.indexOf(typeB);
  });

  const notes = {};
  data.notes.map(note => notes[note.name.toLowerCase()] = note.description);


  const out = [];
  fits.forEach((fit, key) =>  {
    const typeId = parseInt(fit.dna.split(':', 1)[0]);
    out.push(<ShipDisplay key={key} fit={fit} id={typeId} note={notes[fit.name.toLowerCase()]} />) 
  });


  const category_note = () => {
    const md = notes[category.toLocaleLowerCase()];
    
    return (
      <div style={{ padding: "1em 0 0.4em" }}>
        { md && <Markdown>{md}</Markdown> }
      </div>
    );
  }

  return (
    <div>
      {category_note()}

      <DisplayDOM>{out}</DisplayDOM>
    </div>
  );
}

function ShipDisplay({ fit, id, note }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  
  return (
    <>
      {modalOpen ? (
        <Modal open={true} setOpen={setModalOpen}>
          <Box style={{ maxWidth: "510px" }}>
            <div style={{ display: "flex" }}>
              <div style={{ margin: "0 0.5em" }}>
                <DNADisplay dna={fit.dna} name={fit.name} />
              </div>
            </div>
            {note ? (
              <Note variant={"secondary"}>
                <Markdown>{note}</Markdown>
              </Note>
            ) : null}
            {fit.name.toLowerCase().indexOf("hybrid") !== -1 ? (
              <Note variant={"danger"}>
                <p>This fit requires slot 1-5 Amulet implants. Click the implant button above for details.</p>
              </Note>
            ) : fit.name.toLowerCase().indexOf("ascendancy") !== -1 ? (
              <Note variant={"danger"}>
                <p>This fit requires slot 1-5 Ascendancy &amp; the WS-618 implant. Click the implants button above for details.</p>
              </Note>
            ) : null}
          </Box>
        </Modal>
      ) : null}
      <Box mpadding={"0.2em"} style={{ margin: "0.5em 0", paddingLeft: "0em", padding: "0.5em" }}>
        <FitCard variant={"input"}>
          <a onClick={(evt) => setModalOpen(true)}>
            <FitCard.Content>
              <img
                style={{ height: "64px" }}
                src={`https://images.evetech.net/types/${id}/icon`}
                alt={fit.name}
              />
              <p>{fit.name}</p>
              <FitCard.Content.Badges>
                {note ? <FontAwesomeIcon icon={faExclamationCircle} /> : null}
                {fit.name.toLowerCase().indexOf("hybrid") !== -1 ? (
                  <Shield color="red" letter="H" title="Requires Hybrid Clone" />
                ) : fit.name.toLowerCase().indexOf("ascendancy") !== -1 ? (
                  <Shield color="red" letter="W" title="Requires Ascendancy Clone" />
                ) : null}
                {fit.name.toLowerCase().includes("web specialist") && (
                  <BadgeIcon type="WEB" />
                )}
              </FitCard.Content.Badges>
            </FitCard.Content>
          </a>
        </FitCard>
      </Box>
    </>
  );
}

export { Fitout };
