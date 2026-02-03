import { connect } from "react-redux";
import { Button, Checkbox, Dropdown, Input, Label, Loader, Message, Segment } from "semantic-ui-react";
import { gql, useMutation } from "@apollo/client";
import React, { useContext, useState, useEffect } from "react";

import TranslationContext from "Layout/TranslationContext";

const cognatesSummaryMutation = gql`
  mutation cognatesSummary(
    $onlyInToc: Boolean!
    $languageGroup: String
    $languageTitle: String
    $perspectiveOffset: Int
    $perspectiveLimit: Int
    $selectedMonths: String
    $selectedYears: String
    $debugFlag: Boolean
  ) {
    cognates_summary(
      only_in_toc: $onlyInToc
      group: $languageGroup
      title: $languageTitle
      offset: $perspectiveOffset
      limit: $perspectiveLimit
      months: $selectedMonths
      years: $selectedYears
      debug_flag: $debugFlag
    ) {
      triumph
      message
    }
  }
`;

const ListCognates = connect(state => state.user)(({ user }) => {
  const [onlyInToc, setOnlyInToc] = useState(false);
  const [cleanResult, setCleanResult] = useState(false);
  const [languageGroup, setLanguageGroup] = useState(null);
  const [languageTitle, setLanguageTitle] = useState(null);
  const [perspectiveOffset, setPerspectiveOffset] = useState(0);
  const [perspectiveLimit, setPerspectiveLimit] = useState(10);
  const [shownParentGroup, showParentGroup] = useState(false);
  const [shownLanguagePosition, showLanguagePosition] = useState(false);

  const [sMonths, setSMonths] = useState([]);
  const [sYears, setSYears] = useState([]);
  const [severalYears, setSeveralYears] = useState(false);

  const [getCognatesSummary, { data, error, loading }] = useMutation(cognatesSummaryMutation);

  useEffect(() => setCleanResult(false), [loading, data]);
  const getTranslation = useContext(TranslationContext);

  const debugFlag = false;

  const selectedMonths = (!severalYears && sMonths && sMonths.length && sMonths.join("|")) || `\w{3}`;
  const selectedYears = (sYears && sYears.length && sYears.join("|")) || `\d{4}`;

  const runMutation = () => {
    getCognatesSummary({
      variables: {
        onlyInToc,
        languageGroup,
        languageTitle,
        perspectiveOffset,
        perspectiveLimit,
        selectedMonths,
        selectedYears,
        debugFlag
      }
    });
  };

  const fail = !data || !data.cognates_summary.triumph;

  const startYear = 2017;
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = startYear; i <= currentYear; i++) {
    years.push({ key: i, text: i, value: i });
  }

  const months = [
    { key: "January", text: "January", value: "Jan" },
    { key: "February", text: "February", value: "Feb" },
    { key: "March", text: "March", value: "Mar" },
    { key: "April", text: "April", value: "Apr" },
    { key: "May", text: "May", value: "May" },
    { key: "June", text: "June", value: "Jun" },
    { key: "July", text: "July", value: "Jul" },
    { key: "August", text: "August", value: "Aug" },
    { key: "September", text: "September", value: "Sep" },
    { key: "October", text: "October", value: "Oct" },
    { key: "November", text: "November", value: "Nov" },
    { key: "December", text: "December", value: "Dec" }
  ];

  console.log("sMonths=====");
  console.log(sMonths);

  console.log("sYears=====");
  console.log(sYears);

  console.log("selectedMonths=====");
  console.log(selectedMonths);
  console.log("selectedYears=====");
  console.log(selectedYears);

  return (
    <div className="background-content">
      {user.id === undefined && !loading ? (
        <Message>
          <Message.Header>{getTranslation("Please sign in")}</Message.Header>
          <p>{getTranslation("This page is available for registered users only")}</p>
        </Message>
      ) : loading ? (
        <Segment>
          <Loader active inline="centered" indeterminate>
            {getTranslation("Loading")}...
          </Loader>
        </Segment>
      ) : (
        <Segment
          onKeyDown={e => {
            if (e.key === "Enter") runMutation();
          }}
          tabIndex="0"
        >
          <Checkbox
            label={getTranslation("Set parent group as well")}
            checked={shownParentGroup}
            onChange={(e, { checked }) => {
              showParentGroup(checked);
              setCleanResult(true);
              if (!checked) {
                setLanguageGroup(null);
              }
            }}
          />
          <p />
          {shownParentGroup && (
            <Input
              label={getTranslation("Language(s) closest parent group")}
              type="text"
              value={languageGroup}
              placeholder={getTranslation("Set group name or leave empty")}
              onChange={(e, { value }) => {
                setLanguageGroup(value);
                setCleanResult(true);
              }}
              //className="lingvo-labeled-input"
              style={{ width: 500, maxWidth: "80%" }}
            />
          )}
          <p />
          <Input
            label={getTranslation("Language(s) group or title")}
            type="text"
            value={languageTitle}
            placeholder={getTranslation("Set title or leave empty")}
            onChange={(e, { value }) => {
              setLanguageTitle(value);
              setCleanResult(true);
            }}
            //className="lingvo-labeled-input"
            style={{ width: 500, maxWidth: "80%" }}
          />
          <p />
          <Checkbox
            label={getTranslation("Adjust perspectives set")}
            checked={shownLanguagePosition}
            onChange={(e, { checked }) => {
              showLanguagePosition(checked);
              setCleanResult(true);
              if (!checked) {
                setOnlyInToc(false);
                setPerspectiveOffset(0);
                setPerspectiveLimit(10);
              }
            }}
          />
          <p />
          {shownLanguagePosition && (
            <div style={{ border: "gray solid", borderRadius: 15, width: 300, padding: 10, maxWidth: "80%" }}>
              <Checkbox
                label={getTranslation("Only high-order languages")}
                checked={onlyInToc}
                onChange={(e, { checked }) => {
                  setOnlyInToc(checked);
                  setCleanResult(true);
                }}
              />
              <p />
              <Input
                label={getTranslation("Perspectives offset")}
                type="number"
                min="0"
                value={perspectiveOffset}
                onChange={(e, { value }) => {
                  setPerspectiveOffset(value);
                  setCleanResult(true);
                }}
                //className="lingvo-labeled-input"
                style={{ width: 100, maxWidth: "40%" }}
              />
              <p />
              <Input
                label={getTranslation("Perspectives limit")}
                type="number"
                min="1"
                value={perspectiveLimit}
                onChange={(e, { value }) => {
                  setPerspectiveLimit(value);
                  setCleanResult(true);
                }}
                //className="lingvo-labeled-input"
                style={{ width: 100, maxWidth: "40%" }}
              />
              <p />
              <Dropdown
                placeholder={getTranslation("Select months")}
                fluid
                multiple
                search
                selection
                options={months}
                disabled={severalYears}
                onChange={(a, { value }) => {
                  if (value.length) {
                    setSMonths(value);
                  } else {
                    setSMonths([]);
                  }
                }}
              />
              <p />
              <Dropdown
                placeholder={getTranslation("Select years")}
                fluid
                multiple
                search
                selection
                options={years}
                onChange={(a, { value }) => {
                  if (value.length) {
                    setSYears(value);
                    if (value.length > 1) {
                      setSeveralYears(true);
                    } else {
                      setSeveralYears(false);
                    }
                  } else {
                    setSYears([]);
                  }
                }}
              />
            </div>
          )}
          <p />

          <Button color="green" content={getTranslation("Get cognates summary")} onClick={runMutation} />
          {error && !cleanResult && (
            <Message negative>
              <Message.Header>{getTranslation("Request error")}</Message.Header>
              <p>
                <span>{getTranslation("Please contact developers at")} </span>
                <a href="https://t.me/lingvodoc_support" target="_blank" rel="noreferrer">
                  {getTranslation("Support@Telegram")}
                </a>
                <span> {getTranslation("or at")} </span>
                <a href="https://github.com/ispras/lingvodoc-react/issues">{getTranslation("Lingvodoc Github")}</a>
                <span>.</span>
              </p>
              <p> {error.message} </p>
            </Message>
          )}
          {data && !data.cognates_summary.triumph && !error && !cleanResult && (
            <Message negative>
              <Message.Header>{getTranslation("Request error")}</Message.Header>
              <p> {data.cognates_summary.message} </p>
            </Message>
          )}
          {data && data.cognates_summary.triumph && !error && !cleanResult && (
            <Message positive>
              <Message.Header>
                {getTranslation("Computation is going. Please see the sidebar with tasks.")}
              </Message.Header>
              <p />
            </Message>
          )}
        </Segment>
      )}
    </div>
  );
});

ListCognates.contextType = TranslationContext;

export default ListCognates;
