import React, { useContext, useState, useRef, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Dropdown, Icon, Loader, Message, Modal, Segment, Tab } from "semantic-ui-react";

import TranslationContext from "Layout/TranslationContext";

import "./styles.scss";

/*
 * Endpoints used:
 *   GET  /health           -> { status: "ok" }
 *   POST /transcribe       -> multipart { file } -> { text, duration_seconds, processing_sec }
 */

const ASR_BASE_URL = window.ASR_SERVICE_URL || "http://127.0.0.1:8000";

const HEALTH_POLL_MS = 4000;

const ACCEPTED_EXTENSIONS = ["wav", "mp3", "ogg", "flac", "webm"];
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.map(e => `.${e}`).join(",");

const AsrModal = ({ onClose }) => {
  const getTranslation = useContext(TranslationContext);

  const [serviceUp, setServiceUp] = useState(null); // null = checking, bool after first response
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [result, setResult] = useState(null); // { text, duration_seconds, ... }
  const [sentNotice, setSentNotice] = useState(null);

  const fileInputRef = useRef(null);
  const recorderRef = useRef(null); // MediaRecorder
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const pollHealth = useCallback(async () => {
    try {
      const resp = await fetch(`${ASR_BASE_URL}/health`, { method: "GET" });
      setServiceUp(resp.ok);
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
      if (timerRef.current) clearInterval(timerRef.current);
      if (recorderRef.current && recorderRef.current.state === "recording") {
        try { recorderRef.current.stop(); } catch (e) { /* noop */ }
      }
    };
  }, []);

  const resetResult = () => {
    setResult(null);
    setErrorMessage(null);
    setSentNotice(null);
  };

  const onFilePicked = e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setErrorMessage(getTranslation("Please select an audio file in wav, mp3, ogg, flac or webm format."));
      setFile(null);
      return;
    }
    resetResult();
    setFile(f);
    e.target.value = ""; // allow re-picking the same file
  };

  const startRecording = async () => {
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      setErrorMessage(getTranslation("Audio recording is not supported in this browser."));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = ev => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const ext = rec.mimeType.includes("webm") ? "webm" : "ogg";
        const recorded = new File([blob], `recording.${ext}`, { type: rec.mimeType });
        resetResult();
        setFile(recorded);
        setRecording(false);
        setElapsedSec(0);
        clearInterval(timerRef.current);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsedSec(0);
      timerRef.current = setInterval(() => setElapsedSec(s => s + 1), 1000);
    } catch (err) {
      setErrorMessage(getTranslation("Microphone access denied or unavailable."));
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
  };

  const submit = async () => {
    if (!file) return;
    setSubmitting(true);
    setErrorMessage(null);
    setResult(null);
    setSentNotice(null);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name || "audio.wav");
      const resp = await fetch(`${ASR_BASE_URL}/transcribe`, { method: "POST", body: fd });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.text) {
        setErrorMessage(data.error || `${getTranslation("Transcription failed")} (HTTP ${resp.status})`);
        return;
      }
      setResult(data);
    } catch (e) {
      setErrorMessage(getTranslation("Could not reach the ASR service."));
    } finally {
      setSubmitting(false);
    }
  };

  const sendToLingvodoc = () => {
    /* The ASR service returns plain/formatted text; wiring into a Lingvodoc entity
     * requires a perspective target, so for now expose the plain text for copy and
     * show a notice. Kept as a stub for the future GraphQL upload. */
    if (result && result.text && navigator.clipboard) {
      navigator.clipboard.writeText(result.text).then(
        () => setSentNotice(getTranslation("Transcription copied to clipboard.")),
        () => setSentNotice(getTranslation("Copy failed — please select and copy the text manually."))
      );
    }
  };

  const formatElapsed = s => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  };

  const resultPanes = [
    {
      menuItem: getTranslation("Formatted transcription"),
      render: () => (
        <Tab.Pane>
          <pre className="asr-result-pre">{result ? result.text : ""}</pre>
        </Tab.Pane>
      )
    },
    {
      menuItem: getTranslation("Text only"),
      render: () => (
        <Tab.Pane>
          <pre className="asr-result-pre">{result ? result.plain_text : ""}</pre>
        </Tab.Pane>
      )
    }
  ];

  return (
    <Modal open dimmer closeIcon onClose={onClose} className="lingvo-modal2 asr-modal">
      <Modal.Header>{getTranslation("Speech recognition (Armenian)")}</Modal.Header>
      <Modal.Content>
        {serviceUp === null && (
          <Segment basic>
            <Loader active inline="centered" />
          </Segment>
        )}

        {serviceUp === false && (
          <Message warning>
            <Message.Header>{getTranslation("ASR service is unavailable")}</Message.Header>
            <p>
              {getTranslation("The Armenian speech recognition service is not responding at")}{" "}
              <code>{ASR_BASE_URL}</code>.{" "}
              {getTranslation(
                "Make sure the model archive is deployed (e.g. to ~/asr-hy-cpu) and gunicorn is running, then reload this dialog."
              )}
            </p>
          </Message>
        )}

        {serviceUp && (
          <div>
            <div className="asr-field-row">
              <input
                ref={fileInputRef}
                id="asr-file-input"
                type="file"
                accept={ACCEPT_ATTR}
                style={{ display: "none" }}
                onChange={onFilePicked}
              />
              <Button
                className="lingvo-button-violet"
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                {getTranslation("Select audio")}
              </Button>
              <span className="asr-file-name">
                {file ? file.name : getTranslation("wav, mp3, ogg, flac or webm")}
              </span>
            </div>

            <div className="asr-field-row">
              <span className="asr-or">{getTranslation("or")}</span>
              {!recording ? (
                <Button
                  className="lingvo-button-basic-black"
                  icon
                  labelPosition="left"
                  onClick={startRecording}
                >
                  <Icon name="microphone" />
                  {getTranslation("Record audio")}
                </Button>
              ) : (
                <Button
                  className="lingvo-button-redder"
                  icon
                  labelPosition="left"
                  onClick={stopRecording}
                >
                  <Icon name="stop" />
                  {`${getTranslation("Stop")} (${formatElapsed(elapsedSec)})`}
                </Button>
              )}
            </div>

            <div className="asr-field-row">
              <Button
                className="lingvo-button-greenest"
                disabled={!file || submitting || recording}
                loading={submitting}
                onClick={submit}
              >
                {getTranslation("Recognize")}
              </Button>
            </div>

            {errorMessage && (
              <Message negative compact>
                {errorMessage}
              </Message>
            )}

            {result && (
              <div>
                <div className="asr-result-meta">
                  {result.duration_seconds !== undefined && (
                    <span>
                      {getTranslation("Duration")}: {result.duration_seconds.toFixed
                        ? result.duration_seconds.toFixed(2)
                        : result.duration_seconds}{" "}
                      s
                    </span>
                  )}
                </div>
                <Tab panes={resultPanes} />
                <div className="asr-actions-row">
                  <Button
                    className="lingvo-button-violet"
                    disabled={!result.text}
                    onClick={sendToLingvodoc}
                  >
                    {getTranslation("Copy transcription")}
                  </Button>
                  {sentNotice && <span className="asr-sent-notice">{sentNotice}</span>}
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

AsrModal.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default AsrModal;
