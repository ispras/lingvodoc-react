import React, { PureComponent, useContext } from "react";
import { Container, Menu } from "semantic-ui-react";
import { gql } from "@apollo/client";
import PropTypes from "prop-types";
import { compose, onlyUpdateForKeys, withHandlers, withState } from "recompose";

import TranslationContext from "Layout/TranslationContext";

import PerspectivePath from "../../pages/Perspective/PerspectivePath";

import PerspectiveView from "./PerspectiveView";

import "../../pages/Perspective/style.scss";

export const launchSoundAndMarkupMutation = gql`
  mutation launchSoundAndMarkup($perspectiveId: LingvodocID!, $publishedMode: String!) {
    sound_and_markup(perspective_id: $perspectiveId, published_mode: $publishedMode) {
      triumph
    }
  }
`;

const Counter = ({ entriesIds }) => ` (${entriesIds.length})`;

const MODES_translator = getTranslation => ({
  edit: {
    entitiesMode: "all",
    text: getTranslation("Edit")
  },
  view: {
    entitiesMode: "published",
    text: getTranslation("View published")
  },
  publish: {
    entitiesMode: "all",
    text: getTranslation("Publish")
  }
});

const handlers = compose(
  withState("value", "updateValue", props => props.filter),
  withHandlers({
    onChange(props) {
      return event => props.updateValue(event.target.value);
    },
    onSubmit(props) {
      return event => {
        event.preventDefault();
        props.submitFilter(props.value);
      };
    }
  })
);

const Filter = handlers(({ value, onChange, onSubmit }) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <div className="ui right aligned category search item">
      <form className="ui icon input" onSubmit={onSubmit}>
        <input type="text" placeholder={getTranslation("Filter")} value={value} onChange={onChange} />
        <button type="submit">
          <i className="search link icon" />
        </button>
      </form>
    </div>
  );
});

const ModeSelector = onlyUpdateForKeys(["mode", "filter"])(
  ({ mode, filter, submitFilter, toggleMode, id, entriesIds }) => {
    const getTranslation = useContext(TranslationContext);
    const MODES = MODES_translator(getTranslation);

    return (
      <Menu tabular>
        <Menu.Item active={mode === "view"} onClick={toggleMode("view")}>
          {MODES.view.text}
          <Counter id={id} mode={MODES.view.entitiesMode} entriesIds={entriesIds} />
        </Menu.Item>
        <Menu.Item active={mode === "edit"} onClick={toggleMode("edit")}>
          {MODES.edit.text}
          <Counter id={id} mode={MODES.edit.entitiesMode} entriesIds={entriesIds} />
        </Menu.Item>
        <Menu.Item active={mode === "publish"} onClick={toggleMode("publish")}>
          {MODES.publish.text}
          <Counter id={id} mode={MODES.publish.entitiesMode} entriesIds={entriesIds} />
        </Menu.Item>
        <Menu.Menu position="right">
          <Filter filter={filter} submitFilter={submitFilter} />
        </Menu.Menu>
      </Menu>
    );
  }
);

class Perspective extends PureComponent {
  constructor(props) {
    super();

    const { defaultMode } = props;

    this.state = {
      mode: defaultMode,
      page: 1
    };

    this.toggleMode = this.toggleMode.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  toggleMode(mode) {
    return () => {
      this.setState({
        mode
      });
    };
  }

  changePage(page) {
    return () => {
      this.setState({
        page
      });
    };
  }

  render() {
    const { perspective, entriesIds, submitFilter } = this.props;
    const { id, parent_id: parentId } = perspective.params;

    if (!id || !parentId) {
      return null;
    }

    const MODES = MODES_translator(this.context);

    const { mode, page } = this.state;
    const { entitiesMode } = MODES[mode];
    return (
      <Container fluid className="perspective search-perspective-view">
        <PerspectivePath id={id} dictionary_id={parentId} mode={mode} className="normal" />
        <ModeSelector
          mode={mode}
          id={id}
          entriesIds={entriesIds}
          filter={perspective.filter.value}
          submitFilter={submitFilter}
          toggleMode={this.toggleMode}
        />
        <PerspectiveView
          id={id}
          mode={mode}
          entitiesMode={entitiesMode}
          entriesIds={entriesIds}
          page={page}
          filter={perspective.filter.value}
          className="content"
          changePage={this.changePage}
        />
      </Container>
    );
  }
}

Perspective.contextType = TranslationContext;

Perspective.propTypes = {
  perspective: PropTypes.object.isRequired,
  defaultMode: PropTypes.string.isRequired,
  entriesIds: PropTypes.array.isRequired,
  submitFilter: PropTypes.func.isRequired
};

export default Perspective;
