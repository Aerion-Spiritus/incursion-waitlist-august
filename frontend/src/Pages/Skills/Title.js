import styled from "styled-components";
import { useHistory, useLocation } from "react-router-dom";
import { Button, Buttons } from "../../Components/Form";
import SkillsHelp from "./SkillsHelp";
import { useEffect } from "react";

const TitleDOM = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-flow: wrap;
  gap: 16px;
  justify-content: space-between;

  h2 {
    font-weight: 700;
    font-size: 26px;
    line-height: 1.35;
    margin: 0px;
  }
`;

const StarterHulls = ['Bhaalgorn', 'Maller', 'Apocalypse'];

const Title = ({ hull, mastery }) => {
  const queryParams = new URLSearchParams(useLocation().search);
  const history = useHistory();

  const onClick = (mastery) => {
    queryParams.set("mastery", mastery);
    history.push({
      search: queryParams.toString()
    });
  }


  const IsStarterHull = StarterHulls.includes(hull.replace('+', ' '));
  const Tooltip = `The ${hull.replace('+', ' ')} is a starter ship and <br />does not have Elite or Elite Gold skills.`;

  useEffect(() => {
    if (IsStarterHull && (mastery !== 'required' || mastery !== 'min')) {
      onClick('required');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IsStarterHull, mastery ])

  return (
    <>
      <TitleDOM>
        <div>
          <h2>{hull}</h2>
        </div>
        <Buttons>
          <Button
            variant={mastery === 'required' || mastery === 'min' ? 'primary' : null}
            onClick={e => onClick('required')}
          >
            Required
          </Button>

          { !StarterHulls.includes(hull) && (
            <>
              <Button
                variant={mastery === 'elite' ? 'primary' : null}
                onClick={e => onClick('elite')}
                disabled={IsStarterHull}
                data-tooltip-id={IsStarterHull ? 'tip' : null}
                data-tooltip-html={IsStarterHull ? Tooltip : null}
              >
                Advanced
              </Button>

              <Button
                variant={mastery === 'gold' ? 'primary' : null}
                onClick={e => onClick('gold')}
                disabled={IsStarterHull}
                data-tooltip-id={IsStarterHull ? 'tip' : null}
                data-tooltip-html={IsStarterHull ? Tooltip : null}
              >
                Max
              </Button>
            </>
          )}
        </Buttons>
      </TitleDOM>
      <SkillsHelp />
    </>
  );
}

export default Title;
