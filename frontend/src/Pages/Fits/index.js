import { useApi } from "../../api";
import { InputGroup, Button, Buttons, AButton } from "../../Components/Form";
import { Fitout } from "./FittingSortDisplay";
import { PageTitle } from "../../Components/Page";
import { useLocation, useHistory } from "react-router-dom";
import { usePageTitle } from "../../Util/title";

export function Fits() {
  const queryParams = new URLSearchParams(useLocation().search);
  const history = useHistory();
  var tier = queryParams.get("Tier") || "Starter";
  const setTier = (newTier) => {
    queryParams.set("Tier", newTier);
    history.push({
      search: queryParams.toString(),
    });
  };

  return <FitsDisplay tier={tier} setTier={setTier} />;
}

function FitsDisplay({ tier, setTier = null }) {
  usePageTitle(`${tier} Fits`);
  const [fitData] = useApi(`/api/fittings`);
  if (fitData === null) {
    return <em>Loading fits...</em>;
  }

  return (
    <>
      <PageTitle>Incursions 0.0</PageTitle>
      <AButton href="/skills/plans" style={{ float: "right" }}>
        Skill Plans
      </AButton>
      {setTier != null && (
        <Buttons style={{ marginBottom: "0.5em" }}>
          <InputGroup>
            <Button active={tier === "Newbee"} onClick={(evt) => setTier("Newbee")}>
              Newbee
            </Button>
            <Button active={tier === "DPS"} onClick={(evt) => setTier("DPS")}>
              DPS
            </Button>
            <Button active={tier === "Logi"} onClick={(evt) => setTier("Logi")}>
              Logi
            </Button>
          </InputGroup>                  
        </Buttons>
      )}

      <Fitout data={fitData} tier={tier} />          
    </>
  );
}
