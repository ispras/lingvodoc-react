import React, { useEffect, useState } from "react";
import { Button, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";

import { getTranslation } from "api/i18n";
import debounce from "utils/debounce";
import smoothScroll from "utils/smoothscroll";

import "./styles.scss";

const BackTopButton = ({ scrollContainer }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = debounce(() => {
      const offset = scrollContainer.scrollTop;
      if (offset >= 160) {
        if (!show) {
          setShow(true);
        }
      } else if (show) {
        setShow(false);
      }
    }, 30);
    scrollContainer.addEventListener("scroll", onScroll);
    onScroll();

    return () => scrollContainer.removeEventListener("scroll", onScroll);
  }, [scrollContainer, show]);

  return (
    <Button
      className={`back-top-button lingvo-button-lite-violet ${show ? "back-top-button_show" : ""}`}
      onClick={() => smoothScroll(0, 500, null, scrollContainer)}
      aria-label="Вернуться наверх"
    >
      <Icon name="arrow up" />
      {getTranslation("Up")}
    </Button>
  );
};

BackTopButton.propTypes = {
  scrollContainer: PropTypes.object.isRequired
};

export default BackTopButton;
