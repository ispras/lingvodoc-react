import React, { useContext, useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Dropdown, Icon, Loader, Message, Modal, Segment, TextArea } from "semantic-ui-react";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

/*
 * Endpoints used:
 *   GET  /health -> { status: "ready", device: "cuda" }
 *   GET  /voices -> { speakers: [{ id, name }] }
 *   POST /tts    -> JSON { text, speaker } -> audio/flac
 */

const TTS_BASE_URL = window.TTS_SERVICE_URL || "/tts";

const HEALTH_POLL_MS = 4000;
const MAX_TEXT_LENGTH = 10000;

const TtsModal = ({ onClose }) => {
  const getTranslation = useContext(TranslationContext);

  const [serviceUp, setServiceUp] = useState(null); // null = checking, bool after first response
  const [voices, setVoices] = useState([]);
  const [speaker, setSpeaker] = useState(null);
  const [text, setText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const audioUrlRef = useRef(null);

  const pollHealth = useCallback(async () => {
    try {
      const resp = await fetch(`${TTS_BASE_URL}/health`, { method: "GET" });
      setServiceUp(resp.ok);
      if (resp.ok) {
        const vresp = await fetch(`${TTS_BASE_URL}/voices`, { method: "GET" });
        if (vresp.ok) {
          const vdata = await vresp.json().catch(() => ({}));
          const speakers = Array.isArray(vdata.speakers) ? vdata.speakers : [];
          setVoices(speakers);
          setSpeaker(prev => (prev === null && speakers.length > 0 ? speakers[0].id : prev));
        }
      }
    } catch (e) {
      setServiceUp(false);
    }
  }, []);

  useEffect(() => {
    pollHealth();
    const t = setInterval(() => {
      pollHealth();
    }, HEALTH_POLL_MS);
    return () => clearInterval(t);
  }, [pollHealth]);

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const setAudio = blob => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;
    setAudioUrl(url);
  };

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const resp = await fetch(`${TTS_BASE_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), speaker })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map(d => d.msg).join("; ")
              : null;
        setErrorMessage(detail || `${getTranslation("Synthesis failed")} (HTTP ${resp.status})`);
        return;
      }
      const blob = await resp.blob();
      setAudio(blob);
    } catch (e) {
      setErrorMessage(getTranslation("Could not reach the TTS service") + ".");
    } finally {
      setSubmitting(false);
    }
  };

  const voiceOptions = voices.map(v => ({ key: v.id, value: v.id, text: v.name }));

  return (
    <Modal open dimmer closeIcon onClose={onClose} className="lingvo-modal2 tts-modal">
      <Modal.Header>{getTranslation("Speech synthesis (Armenian)")}</Modal.Header>
      <Modal.Content>
        {serviceUp === null && (
          <Segment basic>
            <Loader active inline="centered" />
          </Segment>
        )}

        {serviceUp === false && (
          <Message warning>
            <Message.Header>{getTranslation("TTS service is unavailable")}</Message.Header>
            <p>
              {getTranslation("The Armenian speech synthesis service is not responding at")}{" "}
              <code>{TTS_BASE_URL}</code>.{" "}
              {getTranslation("Make sure the tts-hy container is running and its healthcheck reports ready, then reload this dialog") + "."}
            </p>
          </Message>
        )}

        {serviceUp && (
          <div>
            <div className="tts-field-row">
              <span className="tts-field-label">{getTranslation("Voice")}</span>
              <Dropdown
                selection
                options={voiceOptions}
                value={speaker}
                onChange={(e, { value }) => setSpeaker(value)}
                disabled={voiceOptions.length === 0}
              />
            </div>

            <div className="tts-field-row">
              <TextArea
                className="tts-text-input"
                rows={5}
                maxLength={MAX_TEXT_LENGTH}
                placeholder={getTranslation("Enter Armenian text to synthesize") + "…"}
                value={text}
                onChange={e => setText(e.target.value)}
              />
            </div>
            <div className="tts-char-count">
              {text.length} / {MAX_TEXT_LENGTH}
            </div>

            <div className="tts-field-row">
              <Button
                className="lingvo-button-greenest"
                disabled={!text.trim() || submitting || speaker === null}
                loading={submitting}
                onClick={submit}
              >
                {getTranslation("Synthesize")}
              </Button>
            </div>

            {errorMessage && (
              <Message negative compact>
                {errorMessage}
              </Message>
            )}

            {audioUrl && (
              <div className="tts-result">
                <audio controls src={audioUrl} className="tts-audio" />
                <div className="tts-actions-row">
                  <a href={audioUrl} download="speech.flac">
                    <Button className="lingvo-button-violet" icon labelPosition="left">
                      <Icon name="download" />
                      {getTranslation("Download FLAC")}
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button className="lingvo-button-basic-black" onClick={onClose}>
          {getTranslation("Close")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

TtsModal.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default TtsModal;
