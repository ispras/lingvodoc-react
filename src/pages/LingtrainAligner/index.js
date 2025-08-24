import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

const Redirect = connect(state => state.user)(({user}) => {
  useEffect(() => {
    window.location.href = "http://83.149.198.223/user/" + user.login;
  }, []);

  return <h5>Redirecting...</h5>;
})

export default Redirect;

/*
const HtmlRenderer = connect(state => state.user)(({user}) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHtml = async () => {
      try {
        const response = await fetch("10.100.194.95:8080");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        setHtmlContent(text);
      } catch (e) {
        setError(e);
        console.error("Failed to fetch HTML:", e);
      }
    };

    fetchHtml();
  }, []);

  if (error) {
    return <div>Error loading HTML: {error.message}</div>;
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
})

export default HtmlRenderer;
*/
