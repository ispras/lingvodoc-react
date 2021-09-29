import React from 'react';
import { compose, withState, withHandlers, lifecycle } from 'recompose';
import PropTypes from 'prop-types';
import { Icon, Button } from 'semantic-ui-react';

import debounce from 'utils/debounce';
import smoothScroll from 'utils/smoothscroll';
import { getTranslation } from 'api/i18n';
import './styles.scss';

/* ----------- PROPS ----------- */
const classNames = {
  main: 'back-top-button',
  show: 'back-top-button_show'
};

/* ----------- ENHANCERS ----------- */
const addHandlers = withHandlers({
  onScroll: ({ setShow, show, scrollContainer }) => debounce(() => {
    const offset = scrollContainer.scrollTop;

    if (offset >= 160) {
      if (!show) {
        setShow(true);
      }
    } else if (show) {
      setShow(false);
    }
  }, 30),
  onClick: ({ scrollContainer }) => () => {
    smoothScroll(0, 500, null, scrollContainer);
  },
});

const addLifeCycle = lifecycle({
  componentDidMount() {
    const { scrollContainer, onScroll } = this.props;

    scrollContainer.addEventListener('scroll', onScroll);

    onScroll();
  },
  componentWillUnmount() {
    const { onScroll, scrollContainer } = this.props;

    scrollContainer.removeEventListener('scroll', onScroll);
  },
});

const enhance = compose(
  withState('show', 'setShow', false),
  addHandlers,
  addLifeCycle,
);

/* ----------- COMPONENT ----------- */
const BackTopButton = ({ show, onClick }) => (
  <Button
    /*color="blue"*/
    className={`${classNames.main} lingvo-button-violet ${show ? classNames.show : ''}`}
    onClick={onClick}
    aria-label="Вернуться наверх"
  >
    <Icon name="arrow up" />
    {getTranslation('Up')}
  </Button>
);

/* ----------- PROPS VALIDATION ----------- */
BackTopButton.propTypes = {
  scrollContainer: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  setShow: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default enhance(BackTopButton);
